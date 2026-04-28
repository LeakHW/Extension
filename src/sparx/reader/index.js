/////////////////////////////////////////////
// THIS CODE IS PART OF THE LEAKHW PROJECT //
//    © LeakHW 2026 - GNU GPLv3 License    //
//                                         //
// Please do NOT claim this code as solely //
// your own code. All code here is part of //
//     the open-source LeakHW project.     //
//                                         //
//         index.js • Sparx Reader         //
//          Main Sparx Reader Code         //
/////////////////////////////////////////////

(function() {
    /**
     * LEAK BUTTON CLICK HANDLER
     * This function is triggered when the "Leak" button in the Sparx Reader menu is clicked.
     */
    const onLeakButtonClick = () => {
        if (typeof window.showLeakMenu === 'function') {
            window.showLeakMenu();
        } else {
            console.error('Leak Menu function not found.');
        }
    };

    const injectLeakButton = () => {
        // Find the Sparx Reader menu list
        const menuList = document.querySelector('ul.sr_c1f4b1c2');
        if (!menuList || menuList.querySelector('.leak-menu-item')) return;

        // Find the Sign out button
        const signOutButton = menuList.querySelector('button[data-test-id="header-menu-logout"]');
        if (signOutButton) {
            const signOutLi = signOutButton.closest('li');
            if (!signOutLi) return;

            // Create Separator
            const separator = document.createElement('li');
            separator.className = 'sr_d5db5c32';

            // Create Leak Item
            const leakLi = document.createElement('li');
            leakLi.className = 'leak-menu-item';
            
            const leakButton = document.createElement('button');
            leakButton.type = 'button';
            // Copy classes from Sign out button
            leakButton.className = signOutButton.className;
            
            // Water Drop SVG + Text
            const iconHtml = `
                <div class="sr_a61fc449">
                    <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="tint" class="svg-inline--fa fa-tint fa-fw" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" style="width: 1em;">
                        <path fill="currentColor" d="M192 32c0 0-144 192-144 320c0 79.5 64.5 144 144 144s144-64.5 144-144c0-128-144-320-144-320zm0 416c-53 0-96-43-96-96c0-85.3 96-224 96-224s96 138.7 96 224c0 53-43 96-96 96z"></path>
                    </svg>
                </div>
                <div>Leak</div>
            `;
            
            leakButton.innerHTML = iconHtml;
            leakLi.appendChild(leakButton);

            // Insert after Sign out
            signOutLi.parentNode.insertBefore(separator, signOutLi.nextSibling);
            separator.parentNode.insertBefore(leakLi, separator.nextSibling);

            // Attach click handler
            leakButton.addEventListener('click', onLeakButtonClick);
        }
    };

    // Observe body for changes to catch the dynamic menu
    const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            if (mutation.addedNodes.length > 0) {
                injectLeakButton();
            }
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // Initial check
    injectLeakButton();
})();
