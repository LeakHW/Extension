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

    const normalizeCategoryName = (value, fallback = 'General') => {
        const normalized = (value || fallback).trim();
        if (!normalized) return fallback;
        return normalized.charAt(0).toUpperCase() + normalized.slice(1).toLowerCase();
    };

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
            if (!chrome.runtime?.id) {
                throw new Error('Extension context invalidated.');
            }
            const response = await fetch(chrome.runtime.getURL('universal/tools/leak_menu/leak_menu.html'));
            const html = await response.text();
            container.innerHTML = html;
            
            // Update title if provided
            const titleEl = container.querySelector('#leak-menu-title-text');
            if (titleEl && currentConfig.title) {
                titleEl.textContent = currentConfig.title;
            }

            // Set version from manifest
            const versionEl = container.querySelector('#leak-version-number');
            if (versionEl) {
                versionEl.textContent = chrome.runtime.getManifest().version;
            }
        } catch (error) {
            console.error('Leak: Failed to load menu HTML', error);
            container.innerHTML = `
                <div class="leak-menu-content" style="padding: 20px; text-align: center;">
                    <h2 style="color: #e53e3e;">Leak Menu Error</h2>
                    <p>${error.message.includes('context invalidated') ? 'Extension was reloaded. Please refresh the page to continue.' : 'Failed to load menu template.'}</p>
                    <button class="leak-menu-close" style="margin-top: 10px; padding: 8px 16px; background: #3182ce; color: white; border: none; border-radius: 4px; cursor: pointer;">Close</button>
                </div>
            `;
        }

        document.body.appendChild(container);
        
        // If we had an error, we still need to be able to close the menu
        const closeBtn = container.querySelector('.leak-menu-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                window.hideLeakMenu();
            });
        }

        // Only proceed with full initialization if the menu loaded correctly
        if (container.querySelector('#leak-menu-tools-view')) {
            updateCategorySidebar('tools');

            // Add event listeners
            const footerToolsBtn = container.querySelector('#leak-footer-tools-btn');
            const footerProfilesBtn = container.querySelector('#leak-footer-profiles-btn');
            const footerSettingsBtn = container.querySelector('#leak-footer-settings-btn');

            const views = {
                tools: container.querySelector('#leak-menu-tools-view'),
                profiles: container.querySelector('#leak-menu-profiles-view'),
                settings: container.querySelector('#leak-menu-settings-view')
            };

            const switchView = (viewName) => {
                Object.keys(views).forEach(v => {
                    if (views[v]) views[v].style.display = 'none';
                });
                if (views[viewName]) {
                    views[viewName].style.display = 'grid';
                }

                // Update footer icon states
                [footerToolsBtn, footerProfilesBtn, footerSettingsBtn].forEach(btn => btn?.classList.remove('active'));
                if (viewName === 'tools') footerToolsBtn?.classList.add('active');
                if (viewName === 'profiles') footerProfilesBtn?.classList.add('active');
                if (viewName === 'settings') footerSettingsBtn?.classList.add('active');

                // Sidebar is visible for both tools and settings
                const sidebar = container.querySelector('#leak-menu-category-sidebar');
                if (sidebar) {
                    sidebar.style.display = (viewName === 'tools' || viewName === 'settings') ? 'flex' : 'none';
                }

                if (viewName === 'tools') {
                    updateCategorySidebar('tools');
                } else if (viewName === 'settings') {
                    updateCategorySidebar('settings');
                } else if (viewName === 'profiles') {
                    updateProfilesList();
                    container.querySelectorAll('.leak-sidebar-item').forEach(i => i.classList.remove('active'));
                }
            };

            footerToolsBtn?.addEventListener('click', () => switchView('tools'));
            footerProfilesBtn?.addEventListener('click', () => switchView('profiles'));
            footerSettingsBtn?.addEventListener('click', () => switchView('settings'));

            // Version click for dev mode
            let versionClicks = 0;
            container.addEventListener('click', (event) => {
                const versionNum = event.target.closest('#leak-version-number');
                if (!versionNum) return;

                versionClicks++;
                if (versionClicks >= 5) {
                    chrome.storage.local.get(['leak_dev_mode'], (res) => {
                        const nextState = !res['leak_dev_mode'];
                        chrome.storage.local.set({ leak_dev_mode: nextState }, () => {
                            window.Leak.log(`Developer mode ${nextState ? 'activated' : 'deactivated'}.`);
                            const settingsView = document.getElementById('leak-menu-settings-view');
                            if (settingsView && settingsView.style.display !== 'none') {
                                updateCategorySidebar('settings');
                            } else {
                                updateCategorySidebar('tools');
                            }
                            alert(`Developer mode ${nextState ? 'activated' : 'deactivated'}.`);
                        });
                    });
                    versionClicks = 0;
                }
            });

            // Initial view
            switchView('tools');
        }

        // Close on overlay click
        container.addEventListener('click', (e) => {
            if (e.target === container) {
                window.hideLeakMenu();
            }
        });
    };

    const updateCategorySidebar = (mode = 'tools') => {
        const sidebar = document.getElementById('leak-menu-category-sidebar');
        if (!sidebar || !window.Leak) return;

        sidebar.innerHTML = '';
        
        chrome.storage.local.get(['leak_dev_mode', 'leak_setting_show_experimental', 'leak_setting_show_example_tool'], (settings) => {
            const isDevMode = settings['leak_dev_mode'] || false;
            const showExperimental = settings['leak_setting_show_experimental'] || false;
            const showExample = settings['leak_setting_show_example_tool'] || false;

            const enabledTools = window.Leak.getEnabledTools();
            
            // Filter categories based on mode
            const availableCategories = new Set();

            if (mode === 'tools') {
                enabledTools.forEach(tool => {
                    if (tool.id === 'leak_menu') return;
                    if (tool.devOnly && !isDevMode) return;
                    if (tool.id === 'example' && !showExample) return;
                    if (tool.experimental && !showExperimental) return;
                    
                    // Normalize category to avoid duplicates like "General" and "general"
                    availableCategories.add(normalizeCategoryName(tool.category));
                });
            } else if (mode === 'settings') {
                availableCategories.add('General');
                availableCategories.add('Tokens');
                
                // Add tool-specific settings tabs
                enabledTools.forEach(tool => {
                    if (tool.settings && tool.settings.length > 0) {
                        const tabName = tool.settingsTab || tool.label || tool.id;
                        availableCategories.add(tabName);
                    }
                });

                if (isDevMode) {
                    availableCategories.add('Dev Tools');
                }
                availableCategories.add('About');
            }

            const categories = [...availableCategories].sort((a, b) => {
                if (mode === 'tools') {
                    const order = { 'AI': 1, 'Helpers': 2, 'General': 10, 'Experimental': 20, 'Developer': 30 };
                    const valA = order[a] || 5;
                    const valB = order[b] || 5;
                    if (valA !== valB) return valA - valB;
                } else {
                    const order = { 'General': 1, 'Tokens': 2 };
                    const valA = order[a] || 10;
                    const valB = order[b] || 10;
                    if (valA !== valB) return valA - valB;
                }
                return a.localeCompare(b);
            });

            categories.forEach((cat, index) => {
                const item = document.createElement('button');
                item.className = 'leak-sidebar-item';
                item.textContent = cat;
                item.addEventListener('click', () => {
                    sidebar.querySelectorAll('.leak-sidebar-item').forEach(i => i.classList.remove('active'));
                    item.classList.add('active');
                    
                    if (mode === 'tools') {
                        updateToolList(cat);
                    } else {
                        updateSettingsList(cat);
                    }
                });
                sidebar.appendChild(item);

                // Select first category by default
                if (index === 0) item.click();
            });
        });
    };

    const updateProfilesList = () => {
        const profilesList = document.getElementById('leak-menu-profiles-list');
        const config = window.LeakConfig;
        if (!profilesList || !config || !config.profiles) return;

        profilesList.innerHTML = '';
        const hostname = window.location.hostname;

        chrome.storage.local.get([`leak_profile_${hostname}`], (result) => {
            const currentProfile = result[`leak_profile_${hostname}`] || 'default';

            config.profiles.forEach(profile => {
                const item = document.createElement('div');
                item.className = `leak-setting-item ${currentProfile === profile.id ? 'active' : ''}`;
                item.style.padding = '16px';
                item.style.cursor = 'pointer';
                item.style.borderRadius = '12px';
                item.style.transition = 'all 0.2s';
                item.style.border = currentProfile === profile.id ? '2px solid #3182ce' : '1px solid #e2e8f0';
                item.style.background = currentProfile === profile.id ? '#ebf8ff' : '#f8fafc';

                item.innerHTML = `
                    <div class="leak-setting-info">
                        <span class="leak-setting-label" style="font-size: 15px;">${profile.label}</span>
                        <span class="leak-setting-desc">${profile.description}</span>
                    </div>
                    ${currentProfile === profile.id ? '<span style="color: #3182ce; font-weight: bold;">Active</span>' : ''}
                `;

                item.addEventListener('click', () => {
                    const update = {};
                    update[`leak_profile_${hostname}`] = profile.id;
                    chrome.storage.local.set(update, () => {
                        updateProfilesList();
                    });
                });

                profilesList.appendChild(item);
            });
        });
    };

    const updateToolList = (category) => {
        const toolList = document.getElementById('leak-menu-tool-list');
        if (!toolList || !window.Leak) return;

        chrome.storage.local.get(['leak_dev_mode', 'leak_setting_show_experimental', 'leak_setting_show_example_tool'], (settings) => {
            const isDevMode = settings['leak_dev_mode'] || false;
            const showExperimental = settings['leak_setting_show_experimental'] || false;
            const showExample = settings['leak_setting_show_example_tool'] || false;

            const enabledTools = window.Leak.getEnabledTools();
            toolList.innerHTML = '';

            const filteredTools = enabledTools.filter(tool => {
                if (tool.id === 'leak_menu') return false;
                
                // Dev-only filtering
                if (tool.devOnly && !isDevMode) return false;
                
                // Example tool specific toggle
                if (tool.id === 'example' && !showExample) return false;

                // Experimental filtering
                if (tool.experimental && !showExperimental) return false;

                const toolCat = normalizeCategoryName(tool.category);
                return toolCat === category;
            });

            filteredTools.forEach(tool => {
                const hostname = window.location.hostname;
                const storageKey = `leak_tool_${tool.id}_enabled_${hostname}`;
                
                chrome.storage.local.get([storageKey], (result) => {
                    const isEnabled = result[storageKey] || false;
                    
                    const btn = document.createElement('button');
                    btn.id = `leak-toggle-${tool.id}`;
                    btn.className = `leak-menu-tool-btn ${isEnabled ? 'enabled' : ''}`;
                    
                    // Use tool icon if provided, otherwise no icon (cleaner look)
                    const iconHtml = tool.icon ? `<div class="leak-tool-icon">${tool.icon}</div>` : '';
                    
                    btn.innerHTML = `
                        ${iconHtml}
                        <div class="leak-tool-label">${tool.label || tool.id}</div>
                    `;

                    toolList.appendChild(btn);

                    btn.addEventListener('click', () => {
                        const newState = !btn.classList.contains('enabled');
                        window.Leak.toggleTool(tool.id, newState);
                        btn.classList.toggle('enabled', newState);
                        if (tool.id === 'chatbot' && newState) window.hideLeakMenu();
                    });
                });
            });

            if (filteredTools.length === 0) {
                toolList.innerHTML = '<div class="leak-menu-section" style="grid-column: span 3; display: block;"><p>No tools in this category.</p></div>';
            }
        });
    };

    const updateSettingsList = (category = 'General') => {
        const settingsList = document.getElementById('leak-menu-settings-list');
        if (!settingsList) return;

        settingsList.innerHTML = '';

        if (category === 'Tokens') {
            updateTokensList();
            return;
        }

        if (category === 'About') {
            const aboutView = document.getElementById('leak-menu-about-view');
            if (aboutView) {
                settingsList.innerHTML = aboutView.innerHTML;
            }
            return;
        }

        if (category === 'Dev Tools') {
            updateDeveloperList();
            return;
        }

        const generalSettings = [
            {
                id: 'collect_data',
                label: 'Collect question data',
                description: 'Collect question data to help improve Leak.',
                default: true
            },
            {
                id: 'collect_data_verbose',
                label: 'Verbose Data Collection',
                description: 'Enable detailed logging of captured data parts (slots, inputs, etc.)',
                default: false
            },
            {
                id: 'auto_capture',
                label: 'Auto-Capture on Submit',
                description: 'Automatically capture answers when clicking submit.',
                default: true
            }
        ];

        let settingsToDisplay = [];

        if (category === 'General') {
            settingsToDisplay = generalSettings;
        } else {
            // Find tools that match this settings category
            const enabledTools = window.Leak.getEnabledTools();
            enabledTools.forEach(tool => {
                const toolTab = tool.settingsTab || tool.label || tool.id;
                if (toolTab === category && tool.settings) {
                    settingsToDisplay.push(...tool.settings);
                }
            });
        }

        settingsToDisplay.forEach(setting => {
            const item = document.createElement('div');
            item.className = 'leak-setting-item';
            
            const storageKey = setting.storageKey || `leak_setting_${setting.id}`;

            chrome.storage.local.get([storageKey], (result) => {
                const isEnabled = result[storageKey] !== undefined ? result[storageKey] : setting.default;
                
                item.innerHTML = `
                    <div class="leak-setting-info">
                        <span class="leak-setting-label">${setting.label}</span>
                        <span class="leak-setting-desc">${setting.description}</span>
                    </div>
                    <label class="leak-switch">
                        <input type="checkbox" id="leak-setting-input-${setting.id}" ${isEnabled ? 'checked' : ''}>
                        <span class="leak-slider"></span>
                    </label>
                `;

                settingsList.appendChild(item);

                const input = item.querySelector('input');
                input.addEventListener('change', () => {
                    const update = {};
                    update[storageKey] = input.checked;
                    chrome.storage.local.set(update);
                });
            });
        });

        if (settingsToDisplay.length === 0 && category !== 'Tokens') {
            settingsList.innerHTML = '<div class="leak-menu-section" style="grid-column: span 3; display: block;"><p>No settings in this category.</p></div>';
        }
    };

    const updateTokensList = () => {
        const settingsList = document.getElementById('leak-menu-settings-list');
        if (!settingsList) return;

        settingsList.innerHTML = '';

        const tokens = [
            {
                id: 'token',
                label: 'Assistant API Token',
                description: 'Your Tye AI API token for the AI Assistant.',
                placeholder: 'leak_...'
            },
            {
                id: 'ocr_token',
                label: 'OCR.space API Token',
                description: 'Your free API token from ocr.space for Maths OCR.',
                placeholder: 'K8...'
            }
        ];

        tokens.forEach(token => {
            const item = document.createElement('div');
            item.className = 'leak-setting-item';
            item.style.flexDirection = 'column';
            item.style.alignItems = 'flex-start';
            item.style.gap = '12px';
            
            chrome.storage.local.get([`leak_${token.id}`], (result) => {
                const value = result[`leak_${token.id}`] || '';
                
                item.innerHTML = `
                    <div class="leak-setting-info">
                        <span class="leak-setting-label">${token.label}</span>
                        <span class="leak-setting-desc">${token.description}</span>
                    </div>
                    <div style="display: flex; gap: 8px; width: 100%;">
                        <input type="password" id="leak-token-input-${token.id}" 
                            class="leak-menu-tool-btn" 
                            style="flex: 1; min-height: 40px; padding: 0 12px; cursor: text; text-align: left; background: white; border: 1px solid #e2e8f0;" 
                            placeholder="${token.placeholder}" 
                            value="${value}">
                        <button class="leak-menu-tool-btn leak-token-save" style="min-height: 40px; padding: 0 16px; width: auto;">Save</button>
                    </div>
                `;

                settingsList.appendChild(item);

                const input = item.querySelector('input');
                const saveBtn = item.querySelector('.leak-token-save');
                
                saveBtn.addEventListener('click', () => {
                    const newValue = input.value.trim();
                    const update = {};
                    update[`leak_${token.id}`] = newValue;
                    chrome.storage.local.set(update, () => {
                        saveBtn.textContent = 'Saved!';
                        saveBtn.style.background = '#48bb78';
                        saveBtn.style.color = 'white';
                        setTimeout(() => {
                            saveBtn.textContent = 'Save';
                            saveBtn.style.background = '';
                            saveBtn.style.color = '';
                        }, 2000);
                    });
                });
            });
        });
    };

    const updateDeveloperList = () => {
        const devList = document.getElementById('leak-menu-settings-list');
        if (!devList) return;

        devList.innerHTML = '';

        const devSettings = [
            {
                id: 'dev_mode',
                label: 'Developer Mode',
                description: 'Toggle developer mode visibility in sidebar.',
                type: 'toggle',
                storageKey: 'leak_dev_mode'
            },
            {
                id: 'debug_logging',
                label: 'Global Debug Logging',
                description: 'Enable verbose logging across all tools.',
                type: 'toggle',
                storageKey: 'leak_debug_logging'
            },
            {
                id: 'show_experimental',
                label: 'Experimental Tools',
                description: 'Toggle if experimental tools are shown in the Leak menu.',
                type: 'toggle',
                storageKey: 'leak_setting_show_experimental',
                action: () => { updateCategorySidebar('tools'); }
            },
            {
                id: 'show_example_tool',
                label: 'Show Example Tool',
                description: 'Toggle if the example template tool is shown in the Leak menu.',
                type: 'toggle',
                storageKey: 'leak_setting_show_example_tool',
                action: () => { updateCategorySidebar('tools'); }
            },
            {
                id: 'clear_storage',
                label: 'Clear All Leak Storage',
                description: 'Resets all settings and cached data.',
                type: 'button',
                action: () => {
                    if (confirm('Are you sure you want to clear all Leak storage?')) {
                        chrome.storage.local.clear(() => {
                            alert('Storage cleared. Please refresh.');
                            window.location.reload();
                        });
                    }
                }
            }
        ];

        devSettings.forEach(setting => {
            const item = document.createElement('div');
            item.className = 'leak-setting-item';

            if (setting.type === 'toggle') {
                chrome.storage.local.get([setting.storageKey], (result) => {
                    const isEnabled = result[setting.storageKey] || false;
                    item.innerHTML = `
                        <div class="leak-setting-info">
                            <span class="leak-setting-label">${setting.label}</span>
                            <span class="leak-setting-desc">${setting.description}</span>
                        </div>
                        <label class="leak-switch">
                            <input type="checkbox" id="leak-dev-input-${setting.id}" ${isEnabled ? 'checked' : ''}>
                            <span class="leak-slider"></span>
                        </label>
                    `;
                    devList.appendChild(item);

                    const input = item.querySelector('input');
                    input.addEventListener('change', () => {
                        const update = {};
                        update[setting.storageKey] = input.checked;
                        chrome.storage.local.set(update, () => {
                            if (setting.id === 'dev_mode' && !input.checked) {
                                // If turning off dev mode, refresh categories
                                updateCategorySidebar('settings');
                            }
                            if (setting.action) setting.action();
                        });
                    });
                });
            } else if (setting.type === 'button') {
                item.innerHTML = `
                    <div class="leak-setting-info">
                        <span class="leak-setting-label">${setting.label}</span>
                        <span class="leak-setting-desc">${setting.description}</span>
                    </div>
                    <button class="leak-menu-tool-btn" style="min-height: 40px; padding: 8px 16px;">Run</button>
                `;
                devList.appendChild(item);
                item.querySelector('button').addEventListener('click', setting.action);
            }
        });

        // Add registered dev-only tools
        const enabledTools = window.Leak.getEnabledTools();
        const devTools = enabledTools.filter(t => t.devOnly);

        if (devTools.length > 0) {
            const sectionTitle = document.createElement('div');
            sectionTitle.className = 'leak-menu-section-title';
            sectionTitle.style.marginTop = '20px';
            sectionTitle.textContent = 'Registered Dev Tools';
            devList.appendChild(sectionTitle);

            devTools.forEach(tool => {
                const item = document.createElement('div');
                item.className = 'leak-menu-tool-item';
                item.innerHTML = `
                    <div class="leak-menu-tool-info">
                        <div class="leak-menu-tool-name">${tool.label}</div>
                        <div class="leak-menu-tool-desc">${tool.description}</div>
                    </div>
                    <button class="leak-menu-tool-btn">Run</button>
                `;
                devList.appendChild(item);
                item.querySelector('button').addEventListener('click', () => {
                    if (window.Leak.tools[tool.id]) window.Leak.tools[tool.id](true);
                });
            });
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
