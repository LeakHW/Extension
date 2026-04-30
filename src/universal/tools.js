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

    const LOG_STYLE = 'color: #3182ce; font-weight: bold;';
    const PREFIX_STYLE = 'background: #3182ce; color: white; padding: 2px 5px; border-radius: 3px; font-weight: bold;';

    window.Leak = {
        /**
         * Centralized logging for Leak.
         */
        log: (msg, ...args) => {
            console.log(`%cLEAK%c ${msg}`, PREFIX_STYLE, LOG_STYLE, ...args);
        },
        warn: (msg, ...args) => {
            console.warn(`%cLEAK%c ${msg}`, PREFIX_STYLE, 'color: #dd6b20; font-weight: bold;', ...args);
        },
        error: (msg, ...args) => {
            console.error(`%cLEAK%c ${msg}`, PREFIX_STYLE, 'color: #e53e3e; font-weight: bold;', ...args);
        },
        debug: (msg, ...args) => {
            chrome.storage.local.get(['leak_debug_logging'], (result) => {
                if (result.leak_debug_logging) {
                    console.debug(`%cLEAK DEBUG%c ${msg}`, 'background: #718096; color: white; padding: 2px 5px; border-radius: 3px; font-weight: bold;', 'color: #718096; font-style: italic;', ...args);
                }
            });
        },

        showLogo: () => {
            const logo = `
   ▄▄▄                           ▄▄▄▄▄▄▄                                           
  ▀██▀                          █▀██▀▀▀         █▄                                 
   ██                  ▄▄         ██           ▄██▄      ▄           ▀▀       ▄    
   ██      ▄█▀█▄ ▄▀▀█▄ ██ ▄█▀     ████  ▀██ ██▀ ██ ▄█▀█▄ ████▄ ▄██▀█ ██ ▄███▄ ████▄ 
   ██      ██▄█▀ ▄█▀██ ████       ██      ███   ██ ██▄█▀ ██ ██ ▀███▄ ██ ██ ██ ██ ██ 
  ████████▄▀█▄▄▄▄▀█▄██▄██ ▀█▄     ▀█████▄██ ██▄▄██▄▀█▄▄▄▄██ ▀██▄▄██▀▄██▄▀███▀▄██ ▀█ 
            `;
            
            const tealGradients = [
                'color: #008080;',
                'color: #008b8b;',
                'color: #009999;',
                'color: #00aaaa;',
                'color: #00bbbb;',
                'color: #00cccc;'
            ];

            const lines = logo.split('\n').filter(line => line.trim().length > 0);
            console.log('%cLeak HW Loaded', 'color: #3182ce; font-size: 20px; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.1);');
            lines.forEach((line, i) => {
                console.log(`%c${line}`, tealGradients[Math.min(i, tealGradients.length - 1)] + ' font-weight: bold; font-family: monospace;');
            });
        },

        /**
         * Register a new universal tool.
         * @param {string} id - Unique tool ID.
         * @param {function} toggleFn - Function to enable/disable the tool (passed a boolean).
         */
        registerTool: (id, toggleFn) => {
            window.Leak.debug(`Registering tool implementation: ${id}`);
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
            window.Leak.debug(`Enabling tool ${id}`, config);
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
            console.log(`Leak: Registering menu injection for ${options.selector}`);
            const { selector, targetText, iconHtml, label, onClick, separatorSelector } = options;

            const inject = () => {
                const menuList = document.querySelector(selector);
                if (!menuList) return;
                
                // Check if already injected
                if (menuList.querySelector('.leak-injected-item')) return;

                // Find the target button/item by text
                const items = Array.from(menuList.querySelectorAll('button, a, [role="menuitem"], span, div'));
                const targetItem = items.find(el => {
                    // Only match if the element has direct text content to avoid matching parents
                    const hasText = Array.from(el.childNodes).some(node => 
                        node.nodeType === Node.TEXT_NODE && 
                        node.textContent.toLowerCase().includes(targetText.toLowerCase())
                    );
                    return hasText;
                });

                // Find the actual button element (it might be the target itself or a parent)
                const targetButton = targetItem ? (targetItem.closest('button, a, [role="menuitem"]') || targetItem) : null;
                
                if (targetButton) {
                    // Create Leak Button
                    const leakButton = document.createElement('button');
                    leakButton.type = 'button';
                    // Replicate classes but remove specific ones that might cause issues
                    leakButton.className = targetButton.className.split(' ').filter(c => !c.includes('active')).join(' ') + ' leak-injected-item';
                    leakButton.innerHTML = iconHtml || `<span>${label}</span>`;
                    leakButton.style.cursor = 'pointer';

                    // Determine where to insert
                    // If the button is wrapped in a div (common in Seneca/React), wrap ours too
                    const wrapper = targetButton.parentElement;
                    const isDivWrapper = wrapper && wrapper.tagName === 'DIV' && wrapper !== menuList;

                    if (isDivWrapper) {
                        const newWrapper = document.createElement('div');
                        // Handle Seneca specifically if needed, otherwise copy wrapper class
                        newWrapper.className = wrapper.className + ' leak-injected-wrapper';
                        newWrapper.style.display = 'block';
                        newWrapper.style.width = '100%';
                        newWrapper.appendChild(leakButton);
                        wrapper.parentNode.insertBefore(newWrapper, wrapper.nextSibling);
                    } else {
                        targetButton.parentNode.insertBefore(leakButton, targetButton.nextSibling);
                    }

                    // Handle separator if requested
                    if (separatorSelector) {
                        const existingDivider = menuList.querySelector(separatorSelector);
                        const separator = document.createElement('div');
                        separator.className = existingDivider ? existingDivider.className : '';
                        if (!existingDivider) {
                            separator.style.height = '1px';
                            separator.style.background = 'rgba(255,255,255,0.1)';
                            separator.style.margin = '4px 0';
                        }
                        leakButton.parentNode.insertBefore(separator, leakButton);
                    }

                    leakButton.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onClick();
                    });
                }
            };

            const observer = new MutationObserver((mutations) => {
                inject();
            });

            observer.observe(document.body, { childList: true, subtree: true });
            inject(); // Initial check
        }
    };

    // Initialize cross-tab storage syncing
    chrome.storage.onChanged.addListener((changes, area) => {
        if (area === 'local') {
            const hostname = window.location.hostname;
            Object.keys(changes).forEach(key => {
                if (key.startsWith('leak_tool_') && key.endsWith(`_enabled_${hostname}`)) {
                    const toolId = key.replace('leak_tool_', '').replace(`_enabled_${hostname}`, '');
                    if (tools[toolId]) {
                        window.Leak.debug(`Storage sync: Toggling tool ${toolId} to ${changes[key].newValue}`);
                        tools[toolId](changes[key].newValue);
                    }
                }
            });
        }
    });
})();
