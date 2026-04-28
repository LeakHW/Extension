/////////////////////////////////////////////
// THIS CODE IS PART OF THE LEAKHW PROJECT //
//    © LeakHW 2026 - GNU GPLv3 License    //
//                                         //
// Please do NOT claim this code as solely //
// your own code. All code here is part of //
//     the open-source LeakHW project.     //
//                                         //
//         index.js • Sparx Science         //
//          Main Sparx Science Code         //
/////////////////////////////////////////////

(function() {
    /**
     * LEAK BUTTON CLICK HANDLER
     * This function is triggered when the "Leak" button in the Sparx Science menu is clicked.
     */
    const onLeakButtonClick = () => {
        if (typeof window.showLeakMenu === 'function') {
            window.showLeakMenu();
        } else {
            console.error('Leak Menu function not found.');
        }
    };

    const injectLeakButton = () => {
        // Find the Sparx Science menu list (Chakra UI)
        const menuList = document.querySelector('.chakra-menu__menu-list');
        if (!menuList || menuList.querySelector('.leak-menu-item')) return;

        // Find the Sign out button
        const buttons = Array.from(menuList.querySelectorAll('button[role="menuitem"]'));
        const signOutButton = buttons.find(btn => btn.textContent.includes('Sign out'));
        
        if (signOutButton) {
            // Find existing separator to copy classes
            const existingDivider = menuList.querySelector('.chakra-menu__divider');
            
            // Create Separator
            const separator = document.createElement('hr');
            separator.setAttribute('aria-orientation', 'horizontal');
            separator.className = existingDivider ? existingDivider.className : 'chakra-menu__divider css-12vdn2q';

            // Create Leak Item
            const leakButton = document.createElement('button');
            leakButton.type = 'button';
            leakButton.setAttribute('role', 'menuitem');
            leakButton.className = signOutButton.className + ' leak-menu-item';
            
            // Water Drop SVG + Text
            const iconHtml = `
                <span class="chakra-menu__icon-wrapper css-1qi09nz">
                    <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="tint" class="svg-inline--fa fa-tint fa-fw chakra-menu__icon" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" style="width: 1em;">
                        <path fill="currentColor" d="M192 512c44.18 0 80-35.82 80-80s-80-160-80-160s-80 115.82-80 160s35.82 80 80 80zm0-512C85.96 0 0 149.33 0 256c0 70.69 57.31 128 128 128s128-57.31 128-128c0-106.67-85.96-256-192-256z" transform="scale(0.8) translate(50, 50)"></path>
                        <path fill="currentColor" d="M192 32c0 0-144 192-144 320c0 79.5 64.5 144 144 144s144-64.5 144-144c0-128-144-320-144-320zm0 416c-53 0-96-43-96-96c0-85.3 96-224 96-224s96 138.7 96 224c0 53-43 96-96 96z"></path>
                    </svg>
                </span>
                <span style="pointer-events: none; flex: 1 1 0%;">Leak</span>
            `;
            
            leakButton.innerHTML = iconHtml;

            // Insert after Sign out
            signOutButton.parentNode.insertBefore(separator, signOutButton.nextSibling);
            separator.parentNode.insertBefore(leakButton, separator.nextSibling);

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
