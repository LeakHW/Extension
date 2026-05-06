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
            // Get token and text from storage to be sure
            const result = await new Promise((resolve, reject) => {
                chrome.storage.local.get(['leak_token', 'leak_session_id', 'leak_reader_book_text'], (res) => {
                    if (chrome.runtime.lastError) reject(chrome.runtime.lastError);
                    else resolve(res);
                });
            });
            
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

            // Exactly as requested: "The text for a book is: [text]. [question] [options]. Not in story means that it is not in the text or none of the options are correct."
            const prompt = `The text for a book is: ${currentBookText}. ${questionText} ${options.join(', ')}. Not in story means that it is not in the text or none of the options are correct.`;

            const response = await fetch('http://141.147.118.157:5678/webhook/f9b818be-f507-436d-9af8-8ebd8270d049', {
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
            const optionButtons = Array.from(btn.closest('.sr_2ebbff73')?.querySelectorAll('button') || []);
            
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
                alert('AI Response: ' + answer);
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

    const injectSolveButton = () => {
        // Look for question containers
        const questions = document.querySelectorAll('.sr_2ebbff73');
        
        questions.forEach(q => {
            if (q.querySelector('.leak-autosolve-btn')) return;

            const questionHeader = q.querySelector('h2');
            const questionText = questionHeader ? questionHeader.innerText.trim() : "";
            
            // Filter out the "Ready to answer?" button and any other non-option buttons
            const optionButtons = Array.from(q.querySelectorAll('button')).filter(b => {
                const text = b.textContent.trim();
                return text && text !== "Ready to answer? Click here first." && !b.classList.contains('leak-autosolve-btn');
            });
            const options = optionButtons.map(b => b.innerText.trim());

            if (options.length > 0) {
                const solveBtn = document.createElement('button');
                solveBtn.className = 'leak-autosolve-btn';
                solveBtn.textContent = 'Solve';
                solveBtn.style.cssText = `
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
                    display: block;
                    width: fit-content;
                `;
                
                solveBtn.addEventListener('mouseover', () => {
                    solveBtn.style.background = '#38a169';
                    solveBtn.style.transform = 'translateY(-1px)';
                    solveBtn.style.boxShadow = '0 4px 6px rgba(0,0,0,0.15)';
                });
                solveBtn.addEventListener('mouseout', () => {
                    solveBtn.style.background = '#48bb78';
                    solveBtn.style.transform = 'translateY(0)';
                    solveBtn.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                });

                solveBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    solveQuestion(solveBtn, questionText, options);
                });

                // Inject before the options container (sr_d2d95999)
                const optionsContainer = q.querySelector('.sr_d2d95999');
                if (optionsContainer) {
                    optionsContainer.parentNode.insertBefore(solveBtn, optionsContainer);
                } else {
                    // Fallback: inject after the question header
                    const header = q.querySelector('.sr_b44b098a');
                    if (header) {
                        header.parentNode.insertBefore(solveBtn, header.nextSibling);
                    } else {
                        q.prepend(solveBtn);
                    }
                }
            }
        });
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
