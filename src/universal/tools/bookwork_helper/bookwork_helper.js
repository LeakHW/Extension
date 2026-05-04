/////////////////////////////////////////////
// THIS CODE IS PART OF THE LEAKHW PROJECT //
//    © LeakHW 2026 - GNU GPLv3 License    //
//                                         //
// Please do NOT claim this code as solely //
// your own code. All code here is part of //
//     the open-source LeakHW project.     //
//                                         //
//    bookwork_helper.js • Bookwork Helper //
//        Tracks Bookwork Answers          //
/////////////////////////////////////////////

(function() {
    /**
     * BOOKWORK HELPER TOOL
     * Tracks bookwork codes and user-inputted answers on Sparx Maths.
     */
    
    if (window.Leak) {
        let observer = null;
        let clickHandler = null;
        let sessionData = {};
        let currentBookwork = null;
        let pendingSubmission = null;
        let bookworkGui = null;

        const updateGui = (code) => {
            if (!bookworkGui) {
                bookworkGui = document.createElement('div');
                bookworkGui.className = 'leak-bookwork-gui hidden';
                bookworkGui.innerHTML = `
                    <svg class="icon" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                    <span>Bookwork: <span class="code">None</span></span>
                `;
                document.body.appendChild(bookworkGui);
            }

            const codeEl = bookworkGui.querySelector('.code');
            if (code) {
                codeEl.textContent = code;
                bookworkGui.classList.remove('hidden');
            } else {
                bookworkGui.classList.add('hidden');
            }
        };

        window.Leak.registerTool('bookwork_helper', (isEnabled) => {
            // Cleanup existing if any
            if (observer) {
                observer.disconnect();
                observer = null;
            }
            if (clickHandler) {
                document.body.removeEventListener('click', clickHandler, { capture: true });
                clickHandler = null;
            }
            if (bookworkGui) {
                bookworkGui.remove();
                bookworkGui = null;
            }

            if (!isEnabled) {
                window.Leak.log('Bookwork Helper disabled.');
                return;
            }

            const clean = t => t.replace(/(Zoom|Watch video|Answer|Summary|Bookwork code:)/gi, "").replace(/\n{2,}/g, "\n").trim();
            // ... (rest of helper functions remain inside or outside)
            
            // Re-initialize state
            sessionData = {};
            currentBookwork = null;
            pendingSubmission = null;
            updateGui(null);

            const getQuestionData = () => {
                const bodyText = document.body.innerText;
                const bookworkMatch = bodyText.match(/Bookwork code:\s*(\S+)/);
                const bookwork = bookworkMatch ? bookworkMatch[1] : null;

                if (!bookwork) return null;

                const qElement = [...document.querySelectorAll('span, div, p')].find(e => 
                    e.innerText && 
                    e.innerText.includes('?') && 
                    e.innerText.length < 500 &&
                    !/Bookwork code|Calculator|Summary|Answer|Watch video/i.test(e.innerText)
                );
                const qText = qElement ? qElement.innerText : "";
                const imgs = [...document.querySelectorAll("img")].map(i => i.src).filter(s => s && s.includes("cdn.sparx-learning"));

                return {
                    bookwork,
                    question: clean(qText),
                    images: imgs
                };
            };

            const captureAnswer = () => {
                const qData = getQuestionData();
                if (!qData) {
                    window.Leak.warn('Cannot capture answer - No question data found.');
                    return null;
                }

                window.Leak.debug('Starting exhaustive answer capture...');

                const parts = {
                    inputs: [],
                    options: [],
                    slots: []
                };

                // 1. Capture all text/numeric inputs
                const inputElements = document.querySelectorAll('input._TextField_kz9c2_359, input[type="text"], input[type="number"], input.ka-input-text');
                inputElements.forEach(input => {
                    if (input.value && input.value.trim() !== "") {
                        parts.inputs.push({
                            ref: input.getAttribute('data-ref') || input.name || 'input',
                            value: input.value.trim()
                        });
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
                        let text = opt.innerText || opt.textContent;
                        text = clean(text);
                        
                        const img = opt.querySelector('img');
                        if (!text && img) {
                            text = `[Image: ${img.src.split('/').pop()}]`;
                        }

                        if (text) {
                            parts.options.push({
                                ref: opt.getAttribute('data-ref') || 'option',
                                value: text
                            });
                        }
                    }
                });

                // 3. Capture filled slots (Drag & Drop)
                const allSlots = document.querySelectorAll('._InlineSlot_kz9c2_931, ._CardSlot_kz9c2_958');
                allSlots.forEach(slot => {
                    const isEmpty = slot.querySelector('._CardContentEmpty_kz9c2_1062') || 
                                   slot.innerText.trim() === '-' ||
                                   slot.classList.contains('_CardContentEmpty_kz9c2_1062');
                    
                    if (!isEmpty) {
                        let text = slot.innerText || slot.textContent;
                        text = clean(text);
                        
                        const img = slot.querySelector('img');
                        if ((!text || text === '-') && img) {
                            text = `[Image: ${img.src.split('/').pop()}]`;
                        }

                        if (text && text !== '-') {
                            parts.slots.push({
                                ref: slot.getAttribute('data-ref') || slot.getAttribute('data-slot') || 'slot',
                                value: text
                            });
                        }
                    }
                });

                const allValues = [
                    ...parts.inputs.map(p => p.value),
                    ...parts.options.map(p => p.value),
                    ...parts.slots.map(p => p.value)
                ];

                const finalAnswer = [...new Set(allValues)].filter(v => v && v.length > 0).join(', ');
                
                if (chrome.runtime?.id) {
                    try {
                        chrome.storage.local.get(['leak_setting_collect_data_verbose'], (result) => {
                            if (result?.leak_setting_collect_data_verbose) {
                                window.Leak.log(`Exhaustive Capture [${qData.bookwork}]:`, {
                                    parts,
                                    final: finalAnswer
                                });
                            } else {
                                window.Leak.debug('Answer captured:', finalAnswer);
                            }
                        });
                    } catch (e) {}
                }

                if (finalAnswer) {
                    return {
                        ...qData,
                        answer: finalAnswer,
                        parts: parts,
                        timestamp: new Date().toISOString()
                    };
                }
                return null;
            };

            const handleCorrectAnswer = (data) => {
                if (!chrome.runtime?.id) return;
                try {
                    chrome.storage.local.get(['leak_setting_collect_data'], (result) => {
                        const isCollectEnabled = result?.leak_setting_collect_data !== undefined ? result.leak_setting_collect_data : true;
                        if (!isCollectEnabled) {
                            window.Leak.log('Answer correct, but logging is disabled in settings.');
                            return;
                        }

                        sessionData[data.bookwork] = data;
                        window.Leak.log(`MATCHED Question & Answer [${data.bookwork}]`, data);
                        window.Leak.debug('Full Session Log:', sessionData);
                    });
                } catch (e) {}
            };

            // Monitor for changes
            observer = new MutationObserver(() => {
                // Check for new bookwork
                const qData = getQuestionData();
                if (qData) {
                    if (qData.bookwork !== currentBookwork) {
                        // Bookwork changed!
                        if (pendingSubmission && currentBookwork) {
                            window.Leak.log(`Bookwork changed from ${currentBookwork} to ${qData.bookwork}. Assuming previous answer was CORRECT.`);
                            handleCorrectAnswer(pendingSubmission);
                        }
                        
                        currentBookwork = qData.bookwork;
                        window.Leak.log(`New bookwork detected: ${currentBookwork}`);
                        updateGui(currentBookwork);
                        pendingSubmission = null;
                    }
                } else if (currentBookwork) {
                    // No bookwork found but we had one
                    currentBookwork = null;
                    updateGui(null);
                }

                // Check for result popovers
                const correctResult = document.querySelector('[class*="_Correct_"]');
                const incorrectResult = document.querySelector('[class*="_Incorrect_"]');

                if (correctResult) {
                    if (pendingSubmission) {
                        window.Leak.log('Validation result: CORRECT');
                        handleCorrectAnswer(pendingSubmission);
                        pendingSubmission = null;
                    }
                } else if (incorrectResult) {
                    if (pendingSubmission) {
                        window.Leak.log('Validation result: INCORRECT');
                        pendingSubmission = null;
                    }
                }
            });

            // Listen for Submit button click
            clickHandler = (e) => {
                const submitBtn = e.target.closest('button._ButtonPrimary_f5gga_185');
                if (submitBtn && submitBtn.textContent.toLowerCase().includes('submit')) {
                    pendingSubmission = captureAnswer();
                    if (pendingSubmission) {
                        window.Leak.log('Answer captured, waiting for validation (popover or transition)...', pendingSubmission.answer);
                    } else {
                        window.Leak.warn('Submit clicked but no answer could be captured.');
                    }
                }
            };

            document.body.addEventListener('click', clickHandler, { capture: true });
            observer.observe(document.body, { childList: true, subtree: true });
            
            // Initial check
            const initialData = getQuestionData();
            if (initialData) {
                currentBookwork = initialData.bookwork;
                window.Leak.log(`Active. Monitoring [${currentBookwork}]`);
                updateGui(currentBookwork);
            } else {
                window.Leak.log('Active. Waiting for bookwork code...');
            }
        });
    }
})();