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
        window.Leak.registerTool('bookwork_helper', (isEnabled) => {
            if (!isEnabled) return;

            const sessionData = {}; // Stores { bookwork: { question, answer, images } }
            let currentBookwork = null;
            let pendingSubmission = null;

            const clean = t => t.replace(/(Zoom|Watch video|Answer|Summary)/gi, "").replace(/\n{2,}/g, "\n").trim();

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

                window.Leak.debug('Starting answer capture...');

                // 1. Text Inputs (including readonly ones updated by keypads)
                // Refined based on example-answers.txt classes
                const inputs = [...document.querySelectorAll('input._TextField_kz9c2_359, input[type="text"], input[type="number"], input.ka-input-text')];
                const inputAnswers = inputs.map(i => ({
                    ref: i.getAttribute('data-ref') || i.name || i.id || 'unknown',
                    value: i.value
                })).filter(i => i.value !== "");

                // 2. Selected choices / Options
                const options = [...document.querySelectorAll('._Option_kz9c2_66, ._Choice_kz9c2_73, div[role="button"], button')];
                const selectedOptions = options.filter(opt => {
                    const isSelected = opt.classList.contains('_Selected_kz9c2_152') || 
                                     opt.querySelector('._Selected_kz9c2_152') ||
                                     opt.getAttribute('aria-pressed') === 'true' ||
                                     opt.getAttribute('data-selected') === 'true';
                    return isSelected;
                }).map(opt => ({
                    ref: opt.getAttribute('data-ref') || 'option',
                    value: clean(opt.textContent)
                }));

                // 3. Drag and Drop Slots / Tiles (Refined)
                const slots = [...document.querySelectorAll('._InlineSlot_kz9c2_931, ._CardSlot_kz9c2_958')];
                const slotAnswers = slots.map(slot => {
                    const isEmpty = slot.classList.contains('_CardContentEmpty_kz9c2_1062') || 
                                   slot.querySelector('._CardContentEmpty_kz9c2_1062') ||
                                   slot.textContent.trim() === '-';
                    return {
                        ref: slot.getAttribute('data-ref') || slot.getAttribute('data-slot') || 'slot',
                        value: isEmpty ? null : clean(slot.textContent),
                        isEmpty
                    };
                }).filter(s => !s.isEmpty);

                // Combine and format
                const allParts = [
                    ...inputAnswers.map(a => a.value),
                    ...selectedOptions.map(a => a.value),
                    ...slotAnswers.map(a => a.value)
                ];

                const finalAnswer = [...new Set(allParts)].filter(a => a && a.length > 0).join(', ');
                
                chrome.storage.local.get(['leak_setting_collect_data_verbose'], (result) => {
                    if (result['leak_setting_collect_data_verbose']) {
                        window.Leak.log(`Detailed Capture [${qData.bookwork}]:`, {
                            inputs: inputAnswers,
                            options: selectedOptions,
                            slots: slotAnswers,
                            final: finalAnswer
                        });
                    } else {
                        window.Leak.debug('Answer captured:', finalAnswer);
                    }
                });

                if (finalAnswer) {
                    return {
                        ...qData,
                        answer: finalAnswer,
                        parts: {
                            inputs: inputAnswers,
                            options: selectedOptions,
                            slots: slotAnswers
                        },
                        timestamp: new Date().toISOString()
                    };
                }
                return null;
            };

            const handleCorrectAnswer = (data) => {
                chrome.storage.local.get(['leak_setting_collect_data'], (result) => {
                    const isCollectEnabled = result['leak_setting_collect_data'] !== undefined ? result['leak_setting_collect_data'] : true;
                    if (!isCollectEnabled) {
                        window.Leak.log('Answer correct, but logging is disabled in settings.');
                        return;
                    }

                    sessionData[data.bookwork] = data;
                    window.Leak.log(`MATCHED Question & Answer [${data.bookwork}]`, data);
                    window.Leak.debug('Full Session Log:', sessionData);
                });
            };

            // Monitor for changes
            const observer = new MutationObserver(() => {
                // Check for new bookwork
                const qData = getQuestionData();
                if (qData && qData.bookwork !== currentBookwork) {
                    currentBookwork = qData.bookwork;
                    window.Leak.log(`New bookwork detected: ${currentBookwork}`);
                    pendingSubmission = null;
                }

                // Check for result popovers (Refined with dynamic class support)
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

            // Listen for Submit button click using CAPTURE phase to bypass Sparx stopPropagation
            document.body.addEventListener('click', (e) => {
                // Find the submit button using the class provided by user
                const submitBtn = e.target.closest('button._ButtonPrimary_f5gga_185');
                
                // Debug log every click on a button to help identify if we're hitting the right one
                if (e.target.closest('button')) {
                    const btn = e.target.closest('button');
                    window.Leak.debug('Click detected on button', {
                        text: btn.textContent,
                        classes: btn.className,
                        isSubmit: !!submitBtn
                    });
                }

                if (submitBtn && submitBtn.textContent.toLowerCase().includes('submit')) {
                    pendingSubmission = captureAnswer();
                    if (pendingSubmission) {
                        window.Leak.log('Answer captured, waiting for validation...', pendingSubmission.answer);
                    } else {
                        window.Leak.warn('Submit clicked but no answer could be captured.');
                    }
                }
            }, { capture: true });

            observer.observe(document.body, { childList: true, subtree: true });
            
            // Initial check
            const initialData = getQuestionData();
            if (initialData) {
                currentBookwork = initialData.bookwork;
                window.Leak.log(`Active. Monitoring [${currentBookwork}]`);
            } else {
                window.Leak.log('Active. Waiting for bookwork code...');
            }
        });
    }
})();