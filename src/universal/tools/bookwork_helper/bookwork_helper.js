/////////////////////////////////////////////
// THIS CODE IS PART OF THE LEAKHW PROJECT //
//    © LeakHW 2026 - GNU GPLv3 License    //
//                                         //
// Please do NOT claim this code as solely //
// your own code. All code here is part of //
//     the open-source LeakHW project.     //
//                                         //
//    bookwork_helper.js • Bookwork Skipper//
//        Auto-skips Bookwork Checks       //
/////////////////////////////////////////////

(function() {
    /**
     * BOOKWORK SKIPPER TOOL
     * Automatically skips bookwork checks on Sparx Maths.
     * WARNING: This will result in 0% bookwork check accuracy.
     */
    
    if (window.Leak) {
        let observer = null;

        const skipBookworkCheck = () => {
            // Look for the bookwork check dialog
            const dialog = document.querySelector('div[role="dialog"][data-state="open"]');
            if (!dialog) return false;

            // Check if it's actually a bookwork check by looking for the title
            const title = dialog.querySelector('h2');
            if (!title || !title.textContent.includes('Bookwork check')) return false;

            window.Leak.debug('Bookwork check detected, attempting to skip...');

            // Click "I didn't write this down" button
            const didntWriteBtn = Array.from(dialog.querySelectorAll('button')).find(btn => {
                const content = btn.querySelector('._Content_k5hjc_361');
                return content && content.textContent.includes("I didn't write this down");
            });

            if (didntWriteBtn) {
                window.Leak.debug('Clicking "I didn\'t write this down" button...');
                didntWriteBtn.click();
                
                // Wait a bit then click "Next question"
                setTimeout(() => {
                    const nextBtn = Array.from(document.querySelectorAll('button')).find(btn => {
                        const content = btn.querySelector('._Content_k5hjc_361');
                        return content && content.textContent.includes('Next question');
                    });
                    
                    if (nextBtn) {
                        window.Leak.debug('Clicking "Next question" button...');
                        nextBtn.click();
                        window.Leak.log('Bookwork check skipped successfully.');
                    } else {
                        window.Leak.warn('Could not find "Next question" button.');
                    }
                }, 500);
                
                return true;
            } else {
                window.Leak.warn('Could not find "I didn\'t write this down" button.');
                return false;
            }
        };

        window.Leak.registerTool('bookwork_helper', (isEnabled) => {
            // Cleanup existing
            if (observer) {
                observer.disconnect();
                observer = null;
            }

            if (!isEnabled) {
                window.Leak.log('Bookwork Skipper disabled.');
                return;
            }

            // Show warning on first enable
            chrome.storage.local.get(['leak_bookwork_skipper_warning_shown'], (result) => {
                if (!result.leak_bookwork_skipper_warning_shown) {
                    const userConfirmed = confirm(
                        '⚠️ BOOKWORK SKIPPER WARNING ⚠️\n\n' +
                        'This tool does NOT remove bookwork checks.\n' +
                        'It automatically clicks "I didn\'t write this down" when a bookwork check appears.\n\n' +
                        'This will give you 0% bookwork check accuracy!\n\n' +
                        'Your teacher will be able to see that you are skipping all bookwork checks.\n\n' +
                        'Do you want to continue?'
                    );

                    if (!userConfirmed) {
                        // User declined, disable the tool
                        window.Leak.toggleTool('bookwork_helper', false);
                        return;
                    }

                    // Save that warning was shown
                    chrome.storage.local.set({ 'leak_bookwork_skipper_warning_shown': true });
                }

                // Start the observer
                window.Leak.log('Bookwork Skipper enabled. Bookwork checks will be automatically skipped.');

                observer = new MutationObserver(() => {
                    skipBookworkCheck();
                });

                observer.observe(document.body, { 
                    childList: true, 
                    subtree: true 
                });

                // Check immediately in case dialog is already open
                skipBookworkCheck();
            });
        });
    }
})();