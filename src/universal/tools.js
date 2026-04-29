/////////////////////////////////////////////
// THIS CODE IS PART OF THE LEAKHW PROJECT //
//    © LeakHW 2026 - GNU GPLv3 License    //
//                                         //
// Please do NOT claim this code as solely //
// your own code. All code here is part of //
//     the open-source LeakHW project.     //
//                                         //
//    tools.js • Universal Tool Manager    //
//        Centralized Tool Management      //
/////////////////////////////////////////////

(function() {
    /**
     * UNIVERSAL TOOL MANAGER
     * Manages registration, configuration, and enablement of universal tools.
     */
    if (window.Leak) return;

    const tools = {};
    const enabledTools = {};

    window.Leak = {
        /**
         * Register a new universal tool.
         * @param {string} id - Unique tool ID.
         * @param {function} toggleFn - Function to enable/disable the tool (passed a boolean).
         */
        registerTool: (id, toggleFn) => {
            tools[id] = toggleFn;
            // If already enabled by a platform script, check storage and init
            if (enabledTools[id]) {
                const hostname = window.location.hostname;
                const storageKey = `leak_tool_${id}_enabled_${hostname}`;
                chrome.storage.local.get([storageKey], (result) => {
                    // Default to false if not set, unless the platform config says otherwise?
                    // Let's default to false for now as requested (toggleable from UI)
                    const isEnabled = result[storageKey] || false;
                    toggleFn(isEnabled);
                });
            }
        },

        /**
         * Enable a tool with a specific configuration.
         * This makes it visible in the Leak Menu for this site.
         * @param {string} id - Tool ID.
         * @param {object} config - Tool configuration (label, description, etc).
         */
        enableTool: (id, config = {}) => {
            enabledTools[id] = config;
            // If already registered, check storage and init
            if (tools[id]) {
                const hostname = window.location.hostname;
                const storageKey = `leak_tool_${id}_enabled_${hostname}`;
                chrome.storage.local.get([storageKey], (result) => {
                    const isEnabled = result[storageKey] || false;
                    tools[id](isEnabled);
                });
            }
        },

        /**
         * Get all tools enabled for the current platform.
         * Used by Leak Menu to generate the UI.
         */
        getEnabledTools: () => {
            return Object.keys(enabledTools).map(id => ({
                id,
                ...enabledTools[id]
            }));
        },

        /**
         * Toggle a tool's state.
         * @param {string} id - Tool ID.
         * @param {boolean} state - New state.
         */
        toggleTool: (id, state) => {
            const hostname = window.location.hostname;
            const storageKey = `leak_tool_${id}_enabled_${hostname}`;
            const update = {};
            update[storageKey] = state;
            
            chrome.storage.local.set(update, () => {
                if (tools[id]) {
                    tools[id](state);
                }
            });
        },

        /**
         * Helper to inject buttons into dynamic menus.
         * @param {object} options - Injection options.
         */
        registerMenuInjection: (options) => {
            const { selector, targetText, iconHtml, label, onClick, separatorSelector } = options;

            const inject = () => {
                const menuList = document.querySelector(selector);
                if (!menuList || menuList.querySelector('.leak-injected-item')) return;

                // Broaden selector to find buttons, links, or role="menuitem"
                const buttons = Array.from(menuList.querySelectorAll('button, a, [role="menuitem"]'));
                const targetButton = buttons.find(btn => btn.textContent.includes(targetText));
                
                if (targetButton) {
                    const existingDivider = menuList.querySelector(separatorSelector);
                    
                    // Create Separator if requested
                    if (separatorSelector) {
                        const separator = document.createElement('hr');
                        separator.className = existingDivider ? existingDivider.className : '';
                        targetButton.parentNode.insertBefore(separator, targetButton.nextSibling);
                    }

                    // Create Leak Item
                    const leakButton = document.createElement('button');
                    leakButton.type = 'button';
                    leakButton.className = targetButton.className + ' leak-injected-item';
                    leakButton.innerHTML = iconHtml || `<span>${label}</span>`;

                    // Insert
                    if (separatorSelector) {
                        targetButton.nextSibling.parentNode.insertBefore(leakButton, targetButton.nextSibling.nextSibling);
                    } else {
                        targetButton.parentNode.insertBefore(leakButton, targetButton.nextSibling);
                    }

                    leakButton.addEventListener('click', onClick);
                }
            };

            const observer = new MutationObserver((mutations) => {
                for (const mutation of mutations) {
                    if (mutation.addedNodes.length > 0) inject();
                }
            });

            observer.observe(document.body, { childList: true, subtree: true });
            inject();
        }
    };
})();
