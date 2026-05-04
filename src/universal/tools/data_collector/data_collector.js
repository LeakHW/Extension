/////////////////////////////////////////////
// THIS CODE IS PART OF THE LEAKHW PROJECT //
//    © LeakHW 2026 - GNU GPLv3 License    //
//                                         //
// Please do NOT claim this code as solely //
// your own code. All code here is part of //
//     the open-source LeakHW project.     //
//                                         //
//    data_collector.js • Data Collector   //
//        Collects Question Data           //
/////////////////////////////////////////////

(function() {
    /**
     * DATA COLLECTOR TOOL
     * Collects question data on Sparx Maths if enabled in settings.
     * 
     * NOTE: This tool is heavily customized for Sparx Maths selectors.
     * If you are adding this to a new website, you MUST edit the selectors 
     * in logData() and captureCurrentAnswer() to suit your platform.
     */
    
    if (window.Leak) {
        let observer = null;
        let clickHandler = null;
        let lastLog = "";
        let pendingAnswer = null;

        window.Leak.registerTool('data_collector', (isEnabled) => {
            // Cleanup existing
            if (observer) {
                observer.disconnect();
                observer = null;
            }
            if (clickHandler) {
                document.body.removeEventListener('click', clickHandler, { capture: true });
                clickHandler = null;
            }

            if (!isEnabled) {
                window.Leak.log('Data Collector disabled.');
                return;
            }

            const clean = t => t.replace(/(Zoom|Watch video|Answer|Summary)/gi, "").replace(/\n{2,}/g, "\n").trim();
            // ... (rest of helper functions)
            
            // Reset state
            lastLog = "";
            pendingAnswer = null;

            const logData = (capturedAnswer = null) => {
                if (!chrome.runtime?.id) return;
                try {
                    chrome.storage.local.get(['leak_setting_collect_data', 'leak_setting_collect_data_verbose'], (result) => {
                        const isCollectEnabled = result?.leak_setting_collect_data !== undefined ? result.leak_setting_collect_data : true;
                        if (!isCollectEnabled) return;

                        const bodyText = document.body.innerText;
                        const bookMatch = bodyText.match(/Bookwork code:\s*(\S+)/);
                        const book = bookMatch ? bookMatch[1] : null;
                        
                        const calcMatch = bodyText.match(/Calculator (not allowed|allowed)/i);
                        const calc = calcMatch ? calcMatch[0] : null;
                        
                        const qElement = [...document.querySelectorAll('span, div, p')].find(e => 
                            e.innerText && 
                            e.innerText.includes('?') && 
                            e.innerText.length < 500 &&
                            !/Bookwork code|Calculator|Summary|Answer|Watch video/i.test(e.innerText)
                        );
                        const q = qElement ? qElement.innerText : "";
                        const imgs = [...document.querySelectorAll("img")].map(i => i.src).filter(s => s && s.includes("cdn.sparx-learning"));

                        if (q || book) {
                            const data = {
                                question: clean(q),
                                bookwork: book,
                                calculator: calc,
                                images: imgs,
                                answer: capturedAnswer,
                                timestamp: new Date().toISOString(),
                                url: window.location.href
                            };

                            if (result?.leak_setting_collect_data_verbose) {
                                window.Leak.log('Detailed Log', data);
                            } else {
                                window.Leak.log('Captured Question Data', { bookwork: book, hasAnswer: !!capturedAnswer, answer: capturedAnswer });
                            }
                        }
                    });
                } catch (e) {}
            };

            // Capture logic for data collector (refined based on examples)
            const captureCurrentAnswer = () => {
                const parts = {
                    inputs: [],
                    options: [],
                    slots: []
                };

                // 1. Capture all text/numeric inputs
                const inputElements = document.querySelectorAll('input._TextField_kz9c2_359, input[type="text"], input[type="number"], input.ka-input-text');
                inputElements.forEach(input => {
                    if (input.value && input.value.trim() !== "") {
                        parts.inputs.push(input.value.trim());
                    }
                });

                // 2. Capture selected options (Multiple choice, etc.)
                const allOptions = document.querySelectorAll('._Option_kz9c2_66, [role="button"], button[class*="_Option_"]');
                allOptions.forEach(opt => {
                    const isSelected = opt.classList.contains('_Selected_kz9c2_152') || 
                                     opt.getAttribute('aria-pressed') === 'true' ||
                                     opt.getAttribute('data-selected') === 'true' ||
                                     opt.className.includes('Selected');
                    
                    if (isSelected) {
                        let text = clean(opt.innerText || opt.textContent);
                        const img = opt.querySelector('img');
                        if (!text && img) {
                            text = `[Image: ${img.src.split('/').pop()}]`;
                        }
                        if (text) parts.options.push(text);
                    }
                });

                // 3. Capture filled slots (Drag & Drop)
                const allSlots = document.querySelectorAll('._InlineSlot_kz9c2_931, ._CardSlot_kz9c2_958');
                allSlots.forEach(slot => {
                    const isEmpty = slot.querySelector('._CardContentEmpty_kz9c2_1062') || 
                                   slot.innerText.trim() === '-' ||
                                   slot.classList.contains('_CardContentEmpty_kz9c2_1062');
                    
                    if (!isEmpty) {
                        let text = clean(slot.innerText || slot.textContent);
                        const img = slot.querySelector('img');
                        if ((!text || text === '-') && img) {
                            text = `[Image: ${img.src.split('/').pop()}]`;
                        }
                        if (text && text !== '-') parts.slots.push(text);
                    }
                });

                // Combine and remove duplicates
                return [...new Set([...parts.inputs, ...parts.options, ...parts.slots])].filter(v => v && v.length > 0).join(', ');
            };

            observer = new MutationObserver(() => {
                const bodyText = document.body.innerText;
                const bookMatch = bodyText.match(/Bookwork code:\s*(\S+)/);
                const bookwork = bookMatch ? bookMatch[1] : null;

                if (bookwork && bookwork !== lastLog) {
                    // Bookwork changed!
                    if (pendingAnswer && lastLog) {
                        window.Leak.log(`Transition detected (${lastLog} -> ${bookwork}). Logging previous answer.`);
                        logData(pendingAnswer);
                    }
                    
                    lastLog = bookwork;
                    logData();
                    pendingAnswer = null;
                }

                const isCorrect = document.querySelector('[class*="_Correct_"]');
                if (isCorrect && pendingAnswer) {
                    logData(pendingAnswer);
                    pendingAnswer = null;
                }
            });

            clickHandler = (e) => {
                const submitBtn = e.target.closest('button._ButtonPrimary_f5gga_185');
                if (submitBtn && submitBtn.textContent.toLowerCase().includes('submit')) {
                    pendingAnswer = captureCurrentAnswer();
                }
            };

            document.body.addEventListener('click', clickHandler, { capture: true });
            observer.observe(document.body, { childList: true, subtree: true });
            logData();
        });
    }
})();