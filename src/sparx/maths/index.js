/////////////////////////////////////////////
// THIS CODE IS PART OF THE LEAKHW PROJECT //
//    © LeakHW 2026 - GNU GPLv3 License    //
//                                         //
// Please do NOT claim this code as solely //
// your own code. All code here is part of //
//     the open-source LeakHW project.     //
//                                         //
//         index.js • Sparx Maths          //
//          Main Sparx Maths Code          //
/////////////////////////////////////////////

(function() {
    /**
     * LEAK BUTTON CLICK HANDLER
     * This function is triggered when the "Leak" button in the Sparx Maths menu is clicked.
     */
    const onLeakButtonClick = () => {
        if (typeof window.showLeakMenu === 'function') {
            window.showLeakMenu();
        } else {
            console.error('Leak Menu function not found.');
        }
    };

    const injectLeakButton = () => {
        // Find the Radix menu content
        const menus = document.querySelectorAll('[role="menu"]');
        
        menus.forEach(menu => {
            // Check if we already injected into this menu
            if (menu.querySelector('.leak-menu-item')) return;

            // Find all menu items
            const items = Array.from(menu.querySelectorAll('[role="menuitem"]'));
            
            // Find the "Sign out" button
            const signOutItem = items.find(item => item.textContent.includes('Sign out'));
            
            if (signOutItem) {
                // Get classes from the Sign out item and its parent if it's wrapped in a link
                const signOutClasses = signOutItem.className;
                const iconSpanClasses = signOutItem.querySelector('span')?.className || '';
                const separatorClasses = menu.querySelector('[role="separator"]')?.className || '';

                // Create Separator
                const separator = document.createElement('div');
                separator.setAttribute('role', 'separator');
                separator.setAttribute('aria-orientation', 'horizontal');
                separator.className = separatorClasses;

                // Create Leak Item
                const leakItem = document.createElement('div');
                leakItem.setAttribute('role', 'menuitem');
                leakItem.setAttribute('tabindex', '-1');
                leakItem.setAttribute('data-orientation', 'vertical');
                leakItem.className = signOutClasses + ' leak-menu-item';
                
                // Water Drop SVG (using a clean path)
                const waterDropSvg = `
                    <span class="${iconSpanClasses}">
                        <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="tint" class="svg-inline--fa fa-tint fa-fw" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" style="width: 1em;">
                            <path fill="currentColor" d="M192 512c44.18 0 80-35.82 80-80s-80-160-80-160s-80 115.82-80 160s35.82 80 80 80zm0-512C85.96 0 0 149.33 0 256c0 70.69 57.31 128 128 128s128-57.31 128-128c0-106.67-85.96-256-192-256z" transform="scale(0.8) translate(50, 50)"></path>
                            <path fill="currentColor" d="M192 32c0 0-144 192-144 320c0 79.5 64.5 144 144 144s144-64.5 144-144c0-128-144-320-144-320zm0 416c-53 0-96-43-96-96c0-85.3 96-224 96-224s96 138.7 96 224c0 53-43 96-96 96z"></path>
                        </svg>
                    </span>
                    Leak
                `;
                
                leakItem.innerHTML = waterDropSvg;
                
                // Insert after Sign out
                // If Sign out is inside a link, we insert after the link
                const insertAfter = signOutItem.parentElement.tagName === 'A' ? signOutItem.parentElement : signOutItem;
                
                insertAfter.parentNode.insertBefore(separator, insertAfter.nextSibling);
                separator.parentNode.insertBefore(leakItem, separator.nextSibling);

                // Attach the clear click handler defined above
                leakItem.addEventListener('click', onLeakButtonClick);
            }
        });
    };

    // Observe body for changes to catch the dynamic Radix menu
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