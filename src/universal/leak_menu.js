/////////////////////////////////////////////
// THIS CODE IS PART OF THE LEAKHW PROJECT //
//    © LeakHW 2026 - GNU GPLv3 License    //
//                                         //
// Please do NOT claim this code as solely //
// your own code. All code here is part of //
//     the open-source LeakHW project.     //
//                                         //
//    leak_menu.js • Universal Menu        //
//        Universal Leak Main Menu         //
/////////////////////////////////////////////

(function() {
    /**
     * UNIVERSAL LEAK MENU
     * This is the main menu for Leak, appearing in the center of the screen.
     */

    const createLeakMenu = () => {
        if (document.getElementById('leak-universal-menu-container')) return;

        const container = document.createElement('div');
        container.id = 'leak-universal-menu-container';
        container.className = 'leak-menu-overlay';
        
        container.innerHTML = `
            <div class="leak-menu-content">
                <div class="leak-menu-header">
                    <div class="leak-menu-title">
                        <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="tint" class="leak-menu-logo" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
                            <path fill="currentColor" d="M192 32c0 0-144 192-144 320c0 79.5 64.5 144 144 144s144-64.5 144-144c0-128-144-320-144-320zm0 416c-53 0-96-43-96-96c0-85.3 96-224 96-224s96 138.7 96 224c0 53-43 96-96 96z"></path>
                        </svg>
                        Leak Menu
                    </div>
                    <button class="leak-menu-close">&times;</button>
                </div>
                <div class="leak-menu-body">
                    <div class="leak-menu-section">
                        <h3>AI Assistant</h3>
                        <p>Get help with your homework using Tye AI.</p>
                        <button id="leak-toggle-ai" class="leak-menu-button">Enable AI Chatbot</button>
                    </div>
                    <div class="leak-menu-section">
                        <h3>Settings</h3>
                        <p>More features coming soon...</p>
                    </div>
                </div>
                <div class="leak-menu-footer">
                    Powered by Tye
                </div>
            </div>
        `;

        document.body.appendChild(container);

        // Add event listeners
        const closeBtn = container.querySelector('.leak-menu-close');
        const toggleAiBtn = container.querySelector('#leak-toggle-ai');

        closeBtn.addEventListener('click', () => {
            window.hideLeakMenu();
        });

        // Close on overlay click
        container.addEventListener('click', (e) => {
            if (e.target === container) {
                window.hideLeakMenu();
            }
        });

        // Toggle AI Chatbot
        toggleAiBtn.addEventListener('click', () => {
            const hostname = window.location.hostname;
            const storageKey = `leak_chatbot_enabled_${hostname}`;
            
            chrome.storage.local.get([storageKey], (result) => {
                const newState = !result[storageKey];
                const update = {};
                update[storageKey] = newState;
                
                chrome.storage.local.set(update, () => {
                    updateAiButtonState(newState);
                    if (window.toggleLeakChatbot) {
                        window.toggleLeakChatbot(newState);
                    }
                    if (newState) {
                        window.hideLeakMenu();
                    }
                });
            });
        });

        // Initial button state
        const hostname = window.location.hostname;
        const storageKey = `leak_chatbot_enabled_${hostname}`;
        chrome.storage.local.get([storageKey], (result) => {
            updateAiButtonState(result[storageKey]);
        });
    };

    const updateAiButtonState = (enabled) => {
        const toggleAiBtn = document.getElementById('leak-toggle-ai');
        if (!toggleAiBtn) return;
        
        if (enabled) {
            toggleAiBtn.textContent = 'Disable AI Chatbot';
            toggleAiBtn.classList.add('enabled');
        } else {
            toggleAiBtn.textContent = 'Enable AI Chatbot';
            toggleAiBtn.classList.remove('enabled');
        }
    };

    // Global functions to show/hide menu
    window.showLeakMenu = () => {
        createLeakMenu();
        const container = document.getElementById('leak-universal-menu-container');
        container.style.display = 'flex';
        setTimeout(() => container.classList.add('active'), 10);
    };

    window.hideLeakMenu = () => {
        const container = document.getElementById('leak-universal-menu-container');
        if (container) {
            container.classList.remove('active');
            setTimeout(() => container.style.display = 'none', 300);
        }
    };

    // Listen for messages from background script
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === "open_leak_popup") {
            window.showLeakMenu();
            sendResponse({status: "menu_opened"});
        }
    });
})();
