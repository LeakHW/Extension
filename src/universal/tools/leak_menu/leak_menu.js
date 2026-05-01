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

            // Set version from manifest
            const versionEl = container.querySelector('#leak-version-number');
            if (versionEl) {
                versionEl.textContent = chrome.runtime.getManifest().version;
            }
        } catch (error) {
            window.Leak.error('Failed to load menu HTML', error);
            container.innerHTML = `<div class="leak-menu-content"><p>Error loading menu.</p></div>`;
        }

        document.body.appendChild(container);
        
        updateCategorySidebar();
        updateSettingsList();
        updateDeveloperList();

        // Add event listeners
        const closeBtn = container.querySelector('.leak-menu-close');
        const footerToolsBtn = container.querySelector('#leak-footer-tools-btn');
        const footerProfilesBtn = container.querySelector('#leak-footer-profiles-btn');
        const footerAboutBtn = container.querySelector('#leak-footer-about-btn');
        const footerSettingsBtn = container.querySelector('#leak-footer-settings-btn');
        const footerDevBtn = container.querySelector('#leak-footer-dev-btn');

        const views = {
            tools: container.querySelector('#leak-menu-tools-view'),
            profiles: container.querySelector('#leak-menu-profiles-view'),
            settings: container.querySelector('#leak-menu-settings-view'),
            about: container.querySelector('#leak-menu-about-view'),
            developer: container.querySelector('#leak-menu-developer-view')
        };

        const switchView = (viewName) => {
            Object.keys(views).forEach(v => {
                if (views[v]) views[v].style.display = 'none';
            });
            if (views[viewName]) {
                views[viewName].style.display = 'grid';
            }

            // Update footer icon states
            [footerToolsBtn, footerProfilesBtn, footerAboutBtn, footerSettingsBtn, footerDevBtn].forEach(btn => btn?.classList.remove('active'));
            if (viewName === 'tools') footerToolsBtn?.classList.add('active');
            if (viewName === 'profiles') footerProfilesBtn?.classList.add('active');
            if (viewName === 'about') footerAboutBtn?.classList.add('active');
            if (viewName === 'settings') footerSettingsBtn?.classList.add('active');
            if (viewName === 'developer') footerDevBtn?.classList.add('active');

            // Hide sidebar if not in tools view
            const sidebar = container.querySelector('#leak-menu-category-sidebar');
            if (sidebar) {
                sidebar.style.display = viewName === 'tools' ? 'flex' : 'none';
            }

            // If switching back to tools, ensure a category is selected
            if (viewName === 'tools') {
                const activeCat = container.querySelector('.leak-sidebar-item.active');
                if (!activeCat) {
                    const firstCat = container.querySelector('.leak-sidebar-item');
                    if (firstCat) firstCat.click();
                }
            } else if (viewName === 'profiles') {
                updateProfilesList();
            } else {
                // Clear active sidebar state when in settings/about
                container.querySelectorAll('.leak-sidebar-item').forEach(i => i.classList.remove('active'));
            }
        };

        closeBtn.addEventListener('click', () => {
            window.hideLeakMenu();
        });

        footerToolsBtn?.addEventListener('click', () => switchView('tools'));
        footerProfilesBtn?.addEventListener('click', () => switchView('profiles'));
        footerAboutBtn?.addEventListener('click', () => switchView('about'));
        footerSettingsBtn?.addEventListener('click', () => switchView('settings'));
        footerDevBtn?.addEventListener('click', () => switchView('developer'));

        // Version click for dev mode
        let versionClicks = 0;
        const versionNum = container.querySelector('#leak-version-number');
        if (versionNum) {
            versionNum.addEventListener('click', () => {
                versionClicks++;
                if (versionClicks >= 10) {
                    chrome.storage.local.get(['leak_dev_mode'], (res) => {
                        if (!res.leak_dev_mode) {
                            chrome.storage.local.set({ 'leak_dev_mode': true }, () => {
                                window.Leak.log('Developer mode activated!');
                                if (footerDevBtn) footerDevBtn.style.display = 'flex';
                                alert('Developer mode activated!');
                            });
                        }
                    });
                    versionClicks = 0;
                }
            });
        }

        // Check dev mode on load
        chrome.storage.local.get(['leak_dev_mode'], (result) => {
            if (result['leak_dev_mode']) {
                if (footerDevBtn) footerDevBtn.style.display = 'flex';
            }
        });

        // Close on overlay click
        container.addEventListener('click', (e) => {
            if (e.target === container) {
                window.hideLeakMenu();
            }
        });

        // Initial view
        switchView('tools');
    };

    const updateCategorySidebar = () => {
        const sidebar = document.getElementById('leak-menu-category-sidebar');
        if (!sidebar || !window.Leak) return;

        sidebar.innerHTML = '';
        
        chrome.storage.local.get(['leak_dev_mode', 'leak_setting_show_experimental', 'leak_setting_show_example_tool'], (settings) => {
            const isDevMode = settings['leak_dev_mode'] || false;
            const showExperimental = settings['leak_setting_show_experimental'] || false;
            const showExample = settings['leak_setting_show_example_tool'] || false;

            const enabledTools = window.Leak.getEnabledTools();
            
            // Filter categories based on settings
            const availableCategories = new Set();
            enabledTools.forEach(tool => {
                if (tool.id === 'leak_menu') return;
                
                // Hide dev-only tools if not in dev mode
                if (tool.devOnly && !isDevMode) return;
                
                // Special handling for Example Tool
                if (tool.id === 'example' && !showExample) return;

                // Special handling for Experimental tools
                if (tool.experimental && !showExperimental) return;

                availableCategories.add(tool.category || 'General');
            });

            const categories = [...availableCategories].sort((a, b) => {
                // Custom category order: AI first, then Helpers, then others, then Experimental, then Developer
                const order = {
                    'AI': 1,
                    'Helpers': 2,
                    'General': 10,
                    'Experimental': 20,
                    'Developer': 30
                };
                
                const valA = order[a] || 5;
                const valB = order[b] || 5;
                
                if (valA !== valB) return valA - valB;
                return a.localeCompare(b);
            });

            categories.forEach((cat, index) => {
                const item = document.createElement('button');
                item.className = 'leak-sidebar-item';
                item.textContent = cat;
                item.addEventListener('click', () => {
                    sidebar.querySelectorAll('.leak-sidebar-item').forEach(i => i.classList.remove('active'));
                    item.classList.add('active');
                    
                    const toolsView = document.getElementById('leak-menu-tools-view');
                    if (toolsView.style.display === 'none') {
                        const aboutBtn = document.getElementById('leak-footer-about-btn');
                        const settingsBtn = document.getElementById('leak-footer-settings-btn');
                        const devBtn = document.getElementById('leak-footer-dev-btn');
                        const profilesBtn = document.getElementById('leak-footer-profiles-btn');
                        [aboutBtn, settingsBtn, devBtn, profilesBtn].forEach(b => b?.classList.remove('active'));
                        
                        document.querySelectorAll('.leak-menu-body').forEach(v => v.style.display = 'none');
                        toolsView.style.display = 'grid';
                    }

                    updateToolList(cat);
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

                const toolCat = tool.category || 'General';
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

    const updateSettingsList = () => {
        const settingsList = document.getElementById('leak-menu-settings-list');
        if (!settingsList) return;

        settingsList.innerHTML = '';

        const settings = [
            {
                id: 'collect_data',
                label: 'Collect question data',
                description: 'Collect question data to help improve Leak.',
                default: true,
                section: 'Main'
            },
            {
                id: 'collect_data_verbose',
                label: 'Verbose Data Collection',
                description: 'Enable detailed logging of captured data parts (slots, inputs, etc.)',
                default: false,
                section: 'Optional Features'
            },
            {
                id: 'auto_capture',
                label: 'Auto-Capture on Submit',
                description: 'Automatically capture answers when clicking submit.',
                default: true,
                section: 'Optional Features'
            }
        ];

        let currentSection = '';

        settings.forEach(setting => {
            if (setting.section && setting.section !== currentSection) {
                currentSection = setting.section;
                const sectionTitle = document.createElement('div');
                sectionTitle.className = 'leak-menu-section-title';
                sectionTitle.style.marginTop = '16px';
                sectionTitle.style.fontSize = '14px';
                sectionTitle.style.color = '#718096';
                sectionTitle.textContent = currentSection;
                settingsList.appendChild(sectionTitle);
            }

            const item = document.createElement('div');
            item.className = 'leak-setting-item';
            
            chrome.storage.local.get([`leak_setting_${setting.id}`], (result) => {
                const isEnabled = result[`leak_setting_${setting.id}`] !== undefined ? result[`leak_setting_${setting.id}`] : setting.default;
                
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
                    update[`leak_setting_${setting.id}`] = input.checked;
                    chrome.storage.local.set(update);
                });
            });
        });
    };

    const updateDeveloperList = () => {
        const devList = document.getElementById('leak-menu-developer-list');
        if (!devList) return;

        devList.innerHTML = '';

        const devTools = [
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
                action: () => { updateCategorySidebar(); }
            },
            {
                id: 'show_example_tool',
                label: 'Show Example Tool',
                description: 'Toggle if the example template tool is shown in the Leak menu.',
                type: 'toggle',
                storageKey: 'leak_setting_show_example_tool',
                action: () => { updateCategorySidebar(); }
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

        devTools.forEach(tool => {
            const item = document.createElement('div');
            item.className = 'leak-setting-item';

            if (tool.type === 'toggle') {
                chrome.storage.local.get([tool.storageKey], (result) => {
                    const isEnabled = result[tool.storageKey] || false;
                    item.innerHTML = `
                        <div class="leak-setting-info">
                            <span class="leak-setting-label">${tool.label}</span>
                            <span class="leak-setting-desc">${tool.description}</span>
                        </div>
                        <label class="leak-switch">
                            <input type="checkbox" id="leak-dev-input-${tool.id}" ${isEnabled ? 'checked' : ''}>
                            <span class="leak-slider"></span>
                        </label>
                    `;
                    devList.appendChild(item);

                    const input = item.querySelector('input');
                    input.addEventListener('change', () => {
                        const update = {};
                        update[tool.storageKey] = input.checked;
                        chrome.storage.local.set(update, () => {
                            if (tool.id === 'dev_mode' && !input.checked) {
                                // Close dev view if it was active
                                document.getElementById('leak-footer-dev-btn').style.display = 'none';
                                document.getElementById('leak-footer-settings-btn').click();
                            }
                            // Run tool-specific action if it exists
                            if (tool.action) tool.action();
                        });
                    });
                });
            } else if (tool.type === 'button') {
                item.innerHTML = `
                    <div class="leak-setting-info">
                        <span class="leak-setting-label">${tool.label}</span>
                        <span class="leak-setting-desc">${tool.description}</span>
                    </div>
                    <button class="leak-menu-tool-btn" style="min-height: 40px; padding: 8px 16px;">Run</button>
                `;
                devList.appendChild(item);
                item.querySelector('button').addEventListener('click', tool.action);
            }
        });
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
