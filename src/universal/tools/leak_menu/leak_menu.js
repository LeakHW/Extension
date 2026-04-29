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
    let currentConfig = {};

    const createLeakMenu = async (config) => {
        if (document.getElementById('leak-universal-menu-container')) {
            updateToolList();
            return;
        }
        currentConfig = config || {};

        const container = document.createElement('div');
        container.id = 'leak-universal-menu-container';
        container.className = 'leak-menu-overlay';
        
        try {
            const response = await fetch(chrome.runtime.getURL('universal/tools/leak_menu/leak_menu.html'));
            const html = await response.text();
            container.innerHTML = html;
            
            // Update title if provided
            const titleEl = container.querySelector('#leak-menu-title-text');
            if (titleEl && currentConfig.title) {
                titleEl.textContent = currentConfig.title;
            }
        } catch (error) {
            console.error('Leak: Failed to load menu HTML', error);
            container.innerHTML = `<div class="leak-menu-content"><p>Error loading menu.</p></div>`;
        }

        document.body.appendChild(container);
        updateToolList();

        // Add event listeners
        const closeBtn = container.querySelector('.leak-menu-close');

        closeBtn.addEventListener('click', () => {
            window.hideLeakMenu();
        });

        // Close on overlay click
        container.addEventListener('click', (e) => {
            if (e.target === container) {
                window.hideLeakMenu();
            }
        });
    };

    const updateToolList = () => {
        const toolList = document.getElementById('leak-menu-tool-list');
        if (!toolList || !window.Leak) return;

        const enabledTools = window.Leak.getEnabledTools();
        toolList.innerHTML = '';

        enabledTools.forEach(tool => {
            // Special case: leak_menu itself doesn't need a toggle in its own menu
            if (tool.id === 'leak_menu') return;

            const hostname = window.location.hostname;
            const storageKey = `leak_tool_${tool.id}_enabled_${hostname}`;
            
            chrome.storage.local.get([storageKey], (result) => {
                const isEnabled = result[storageKey] || false;
                
                const btn = document.createElement('button');
                btn.id = `leak-toggle-${tool.id}`;
                btn.className = `leak-menu-tool-btn ${isEnabled ? 'enabled' : ''}`;
                btn.textContent = tool.label || tool.id;

                toolList.appendChild(btn);

                btn.addEventListener('click', () => {
                    const newState = !btn.classList.contains('enabled');
                    window.Leak.toggleTool(tool.id, newState);
                    
                    // Update UI
                    btn.classList.toggle('enabled', newState);
                    
                    // Close menu if it's the chatbot being enabled for better UX
                    if (tool.id === 'chatbot' && newState) {
                        window.hideLeakMenu();
                    }
                });
            });
        });

        if (enabledTools.length <= 1) { // only leak_menu or nothing
            toolList.innerHTML = '<div class="leak-menu-section"><p>No tools enabled for this site.</p></div>';
        }
    };

    // Global functions to show/hide menu
    window.showLeakMenu = async () => {
        await createLeakMenu(currentConfig);
        const container = document.getElementById('leak-universal-menu-container');
        if (container) {
            container.style.display = 'flex';
            setTimeout(() => container.classList.add('active'), 10);
        }
    };

    window.hideLeakMenu = () => {
        const container = document.getElementById('leak-universal-menu-container');
        if (container) {
            container.classList.remove('active');
            setTimeout(() => container.style.display = 'none', 300);
        }
    };

    // Register as tool
    if (window.Leak) {
        window.Leak.registerTool('leak_menu', (state) => {
            // The menu itself is always "registered" but its visibility is handled globally
        });
    }

    // Listen for messages from background script
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === "open_leak_popup") {
            window.showLeakMenu();
            sendResponse({status: "menu_opened"});
        }
    });
})();
