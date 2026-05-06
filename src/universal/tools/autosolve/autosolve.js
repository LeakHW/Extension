/////////////////////////////////////////////
// THIS CODE IS PART OF THE LEAKHW PROJECT //
//    © LeakHW 2026 - GNU GPLv3 License    //
//                                         //
// Please do NOT claim this code as solely //
// your own code. All code here is part of //
//     the open-source LeakHW project.     //
//                                         //
//    autosolve.js • Sparx Reader Tool     //
//       Autosolve Tool for Reader         //
/////////////////////////////////////////////

(function() {
    /**
     * AUTOSOLVE TOOL
     * Automatically solves Sparx Reader questions using AI.
     */
    let bookText = "";
    let logTimeout = null;

    // Load initial text from storage
    chrome.storage.local.get(['leak_reader_book_text'], (result) => {
        if (chrome.runtime.lastError) return;
        if (result.leak_reader_book_text) {
            bookText = result.leak_reader_book_text;
        }
    });

    const logBookText = () => {
        // Debounce logging to avoid excessive storage calls
        if (logTimeout) clearTimeout(logTimeout);
        logTimeout = setTimeout(() => {
            const content = document.querySelector('.read-content');
            if (content) {
                const text = content.innerText.trim();
                // Avoid logging if empty or already logged
                // We use a more precise check to avoid partial matches blocking new text
                if (text && !bookText.split('\n\n').includes(text)) {
                    bookText += (bookText ? "\n\n" : "") + text;
                    chrome.storage.local.set({ leak_reader_book_text: bookText });
                    window.Leak.debug('Logged book text updated.');
                }
            }
        }, 1000);
    };

    const solveQuestion = async (btn, questionText, options) => {
        const originalText = btn.textContent;
        btn.textContent = 'Solving...';
        btn.disabled = true;

        try {
            // Check for images in Sparx Maths
            let ocrText = "";
            const questionContainer = btn.closest('._QuestionContainer_ypayp_1');
            
            // Get token and text from storage to be sure
            const result = await new Promise((resolve, reject) => {
                chrome.storage.local.get(['leak_token', 'leak_session_id', 'leak_reader_book_text', 'leak_ocr_token', 'leak_autosolve_ocr_enabled'], (res) => {
                    if (chrome.runtime.lastError) reject(chrome.runtime.lastError);
                    else resolve(res);
                });
            });

            if (questionContainer) {
                const images = Array.from(questionContainer.querySelectorAll('img._Image_12bns_72'));
                const ocrEnabled = result.leak_autosolve_ocr_enabled !== false;

                if (images.length > 0 && ocrEnabled) {
                    btn.textContent = 'OCRing...';
                    const ocrToken = result.leak_ocr_token || 'K81298813588957'; // Fallback to demo key
                    const ocrResults = await Promise.all(images.map(async (img) => {
                        try {
                            const imageUrl = img.src;
                            const response = await fetch(`https://api.ocr.space/parse/imageurl?apikey=${ocrToken}&url=${encodeURIComponent(imageUrl)}`);
                            const data = await response.json();
                            if (data && data.ParsedResults && data.ParsedResults[0]) {
                                return data.ParsedResults[0].ParsedText;
                            }
                        } catch (e) {
                            window.Leak.error('OCR failed for image', e);
                        }
                        return "";
                    }));
                    ocrText = ocrResults.filter(t => t).join('\n');
                    if (ocrText) {
                        window.Leak.debug('OCR Text found:', ocrText);
                        btn.textContent = 'Solving...';
                    }
                }
            }
            
            const token = result.leak_token;
            let sessionId = result.leak_session_id;
            const currentBookText = result.leak_reader_book_text || bookText;

            if (!token) {
                alert('Please set your Tye API token in the AI Assistant first.');
                btn.textContent = originalText;
                btn.disabled = false;
                return;
            }

            if (!sessionId) {
                sessionId = 'leak_' + Math.random().toString(36).substr(2, 9);
                chrome.storage.local.set({ leak_session_id: sessionId });
            }

            let prompt = "";
            const isMaths = !!questionContainer;

            if (isMaths) {
                // Grab the actual HTML content to preserve LaTeX/formatting for the AI
                const questionContent = questionContainer.querySelector('._Question_12bns_5')?.innerHTML || questionText;
                prompt = `Solve this maths question. Question Content (HTML): ${questionContent}. ${ocrText ? "Text from images in question: " + ocrText : ""} ${options && options.length > 0 ? "Options: " + options.join(', ') : ""}`;
            } else {
                // Exactly as requested: "The text for a book is: [text]. [question] [options]. Not in story means that it is not in the text or none of the options are correct."
                prompt = `The text for a book is: ${currentBookText}. ${questionText} ${options.join(', ')}. Not in story means that it is not in the text or none of the options are correct.`;
            }

            const response = await fetch('https://api.stufy.qzz.io/webhook/f9b818be-f507-436d-9af8-8ebd8270d049', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    prompt: prompt,
                    sessionid: sessionId,
                    token: token
                })
            });

            if (!response.ok) throw new Error(`API error: ${response.status}`);

            const responseText = await response.text();
            let data;
            try {
                data = JSON.parse(responseText);
            } catch (e) {
                data = { output: responseText };
            }

            const answer = data.output || data.response || data.message || responseText;
            
            window.Leak.log('Autosolve Answer:', answer);
            
            // Highlight the best option
            const lowerAnswer = answer.toLowerCase();
            const optionButtons = Array.from(btn.closest('.sr_2ebbff73, ._QuestionContainer_ypayp_1')?.querySelectorAll('button') || []);
            
            let found = false;
            optionButtons.forEach(optBtn => {
                const optText = optBtn.textContent.toLowerCase();
                // Check if the answer contains the option text or vice versa
                if (optText.length > 0 && (lowerAnswer.includes(optText) || optText.includes(lowerAnswer))) {
                    optBtn.style.border = '3px solid #48bb78';
                    optBtn.style.boxShadow = '0 0 10px rgba(72, 187, 120, 0.5)';
                    found = true;
                }
            });

            if (found) {
                btn.textContent = 'Solved!';
                setTimeout(() => {
                    btn.textContent = originalText;
                }, 2000);
            } else {
                // For maths, show a popup/alert with the answer if not a simple multiple choice
                if (isMaths) {
                    showMathsResult(answer);
                } else {
                    alert('AI Response: ' + answer);
                }
                btn.textContent = originalText;
            }

        } catch (error) {
            window.Leak.error('Autosolve failed:', error);
            alert('Autosolve error: ' + error.message);
            btn.textContent = originalText;
        } finally {
            btn.disabled = false;
        }
    };

    const showMathsResult = (answer) => {
        const popup = document.createElement('div');
        popup.className = 'leak-maths-result-popup';
        popup.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: white;
            color: #2d3748;
            padding: 20px;
            border-radius: 12px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.2);
            z-index: 10000;
            max-width: 400px;
            border-left: 5px solid #48bb78;
            font-family: sans-serif;
            animation: leak-slide-in 0.3s ease-out;
        `;

        popup.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <strong style="color: #48bb78;">AI Answer</strong>
                <button class="leak-close-popup" style="background: none; border: none; cursor: pointer; font-size: 20px; color: #a0aec0;">&times;</button>
            </div>
            <div style="line-height: 1.5; white-space: pre-wrap;">${answer}</div>
        `;

        document.body.appendChild(popup);

        const style = document.createElement('style');
        style.textContent = `
            @keyframes leak-slide-in {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);

        popup.querySelector('.leak-close-popup').onclick = () => popup.remove();
        setTimeout(() => { if (popup.parentNode) popup.remove(); }, 15000);
    };

    const injectSolveButton = () => {
        // Look for Sparx Reader questions
        const readerQuestions = document.querySelectorAll('.sr_2ebbff73');
        readerQuestions.forEach(q => {
            if (q.querySelector('.leak-autosolve-btn')) return;

            const questionHeader = q.querySelector('h2');
            const questionText = questionHeader ? questionHeader.innerText.trim() : "";
            
            const optionButtons = Array.from(q.querySelectorAll('button')).filter(b => {
                const text = b.textContent.trim();
                return text && text !== "Ready to answer? Click here first." && !b.classList.contains('leak-autosolve-btn');
            });
            const options = optionButtons.map(b => b.innerText.trim());

            if (options.length > 0) {
                createAndInjectButton(q, questionText, options, '.sr_d2d95999');
            }
        });

        // Look for Sparx Maths questions
        const mathsQuestions = document.querySelectorAll('._QuestionContainer_ypayp_1');
        mathsQuestions.forEach(q => {
            if (q.querySelector('.leak-autosolve-btn')) return;

            // Extract question text from _Question_12bns_5 or _QuestionWrapper_ypayp_46
            const questionEl = q.querySelector('._Question_12bns_5');
            const questionText = questionEl ? questionEl.innerText.trim() : "";

            // For maths, the "Answer" button is in the BottomBar
            const bottomBar = document.getElementById('BottomBar');
            if (bottomBar && !bottomBar.querySelector('.leak-autosolve-btn')) {
                const answerBtn = bottomBar.querySelector('._ButtonPrimary_k5hjc_185');
                if (answerBtn) {
                    const solveBtn = createButton('Solve', () => solveQuestion(solveBtn, questionText, []));
                    solveBtn.style.marginRight = '10px';
                    solveBtn.style.marginBottom = '0'; // Bottom bar layout
                    answerBtn.parentNode.insertBefore(solveBtn, answerBtn);
                }
            }
        });
    };

    const createButton = (text, onClick) => {
        const btn = document.createElement('button');
        btn.className = 'leak-autosolve-btn';
        btn.textContent = text;
        btn.style.cssText = `
            background: #48bb78;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 8px;
            font-weight: bold;
            cursor: pointer;
            margin-bottom: 15px;
            transition: all 0.2s;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            display: inline-block;
            width: fit-content;
        `;
        
        btn.addEventListener('mouseover', () => {
            btn.style.background = '#38a169';
            btn.style.transform = 'translateY(-1px)';
            btn.style.boxShadow = '0 4px 6px rgba(0,0,0,0.15)';
        });
        btn.addEventListener('mouseout', () => {
            btn.style.background = '#48bb78';
            btn.style.transform = 'translateY(0)';
            btn.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
        });

        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            onClick();
        });
        return btn;
    };

    const createAndInjectButton = (container, questionText, options, optionsSelector) => {
        const solveBtn = createButton('Solve', () => solveQuestion(solveBtn, questionText, options));
        
        const optionsContainer = container.querySelector(optionsSelector);
        if (optionsContainer) {
            optionsContainer.parentNode.insertBefore(solveBtn, optionsContainer);
        } else {
            const header = container.querySelector('.sr_b44b098a');
            if (header) {
                header.parentNode.insertBefore(solveBtn, header.nextSibling);
            } else {
                container.prepend(solveBtn);
            }
        }
    };

    if (window.Leak) {
        window.Leak.registerTool('autosolve', (isEnabled) => {
            if (isEnabled) {
                window.Leak.log('Autosolve enabled.');
                
                // Start observing for text and questions
                const observer = new MutationObserver(() => {
                    logBookText();
                    injectSolveButton();
                });

                observer.observe(document.body, { childList: true, subtree: true });
                
                // Initial check
                logBookText();
                injectSolveButton();

                // Store observer to disconnect later if needed
                window.Leak._autosolveObserver = observer;
            } else {
                window.Leak.log('Autosolve disabled.');
                if (window.Leak._autosolveObserver) {
                    window.Leak._autosolveObserver.disconnect();
                    delete window.Leak._autosolveObserver;
                }
                document.querySelectorAll('.leak-autosolve-btn').forEach(btn => btn.remove());
            }
        });
    }
})();
