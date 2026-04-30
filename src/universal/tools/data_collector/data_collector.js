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
     */
    
    if (window.Leak) {
        window.Leak.registerTool('data_collector', (isEnabled) => {
            if (!isEnabled) return;

            const clean = t => t.replace(/(Zoom|Watch video|Answer|Summary)/gi, "").replace(/\n{2,}/g, "\n").trim();
            
            const logData = (capturedAnswer = null) => {
                chrome.storage.local.get(['leak_setting_collect_data', 'leak_setting_collect_data_verbose'], (result) => {
                    const isCollectEnabled = result['leak_setting_collect_data'] !== undefined ? result['leak_setting_collect_data'] : true;
                    if (!isCollectEnabled) return;

                    const bodyText = document.body.innerText;
                    const bookMatch = bodyText.match(/Bookwork code:\s*(\S+)/);
                    const book = bookMatch ? bookMatch[1] : null;
                    
                    const calcMatch = bodyText.match(/Calculator (not allowed|allowed)/i);
                    const calc = calcMatch ? calcMatch[0] : null;
                    
                    // Find question text - usually the first element with a '?' that isn't a known noise word
                    const qElement = [...document.querySelectorAll('span, div, p')].find(e => 
                        e.innerText && 
                        e.innerText.includes('?') && 
                        e.innerText.length < 500 && // Avoid long texts
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

                        if (result['leak_setting_collect_data_verbose']) {
                            window.Leak.log('Detailed Log', data);
                        } else {
                            window.Leak.log('Captured Question Data', { bookwork: book, hasAnswer: !!capturedAnswer });
                        }
                    }
                });
            };

            // Capture logic for data collector (similar to bookwork helper)
            const captureCurrentAnswer = () => {
                const inputs = [...document.querySelectorAll('input._TextField_kz9c2_359, input[type="text"], input.ka-input-text')];
                const inputVals = inputs.map(i => i.value).filter(v => v !== "");
                
                const selected = [...document.querySelectorAll('[class*="Selected"], [aria-pressed="true"], [data-selected="true"]')];
                const selectedVals = selected.map(s => clean(s.textContent)).filter(v => v && v.length > 0 && !/Zoom|Watch|Answer|Summary/i.test(v));
                
                const slots = [...document.querySelectorAll('._InlineSlot_kz9c2_931, ._CardSlot_kz9c2_958')];
                const slotVals = slots.filter(s => !s.innerText.includes('-')).map(s => clean(s.textContent));

                return [...new Set([...inputVals, ...selectedVals, ...slotVals])].join(', ');
            };

            // Run on initial load and when the DOM changes
            let lastLog = "";
            let pendingAnswer = null;

            const observer = new MutationObserver(() => {
                const bookElement = [...document.querySelectorAll("*")].map(e => e.innerText).find(t => /^Bookwork code:\s*\S+/m.test(t));
                const bookMatch = bookElement ? bookElement.match(/Bookwork code:\s*(\S+)/) : null;
                const bookwork = bookMatch ? bookMatch[1] : null;

                if (bookwork && bookwork !== lastLog) {
                    lastLog = bookwork;
                    logData();
                }

                // If correct popover appears, log with answer
                const isCorrect = document.querySelector('[class*="_Correct_"]');
                if (isCorrect && pendingAnswer) {
                    logData(pendingAnswer);
                    pendingAnswer = null;
                }
            });

            // Intercept submit clicks
            document.body.addEventListener('click', (e) => {
                const submitBtn = e.target.closest('button._ButtonPrimary_f5gga_185');
                if (submitBtn && submitBtn.textContent.toLowerCase().includes('submit')) {
                    pendingAnswer = captureCurrentAnswer();
                }
            }, { capture: true });

            observer.observe(document.body, { childList: true, subtree: true });
            logData();
        });
    }
})();