/////////////////////////////////////////////
// THIS CODE IS PART OF THE LEAKHW PROJECT //
//    © LeakHW 2026 - GNU GPLv3 License    //
//                                         //
// Please do NOT claim this code as solely //
// your own code. All code here is part of //
//     the open-source LeakHW project.     //
//                                         //
//    chatbot.js • Universal Chatbot       //
//        Universal AI Chatbot Code        //
/////////////////////////////////////////////

(function() {
    /**
     * UNIVERSAL AI CHATBOT HANDLER
     * This script handles the AI chatbot that appears in the bottom-right corner.
     */
    let currentConfig = {};

    const createChatbot = async (config) => {
        if (document.getElementById('leak-ai-chatbot-container')) return;
        currentConfig = config || {};

        const container = document.createElement('div');
        container.id = 'leak-ai-chatbot-container';
        container.className = 'leak-ai-chatbot-container';
        
        try {
            const response = await fetch(chrome.runtime.getURL('universal/tools/chatbot/chatbot.html'));
            const html = await response.text();
            container.innerHTML = html;
            
            // Update title and placeholder if provided
            const titleEl = container.querySelector('#leak-chatbot-title-text');
            if (titleEl && currentConfig.title) {
                titleEl.textContent = currentConfig.title;
            }
            const promptInputEl = container.querySelector('#leak-ai-chatbot-prompt');
            if (promptInputEl && currentConfig.placeholder) {
                promptInputEl.placeholder = currentConfig.placeholder;
            }
        } catch (error) {
            window.Leak.error('Failed to load chatbot HTML', error);
            return;
        }

        document.body.appendChild(container);

        // Add event listeners
        const closeBtn = container.querySelector('.leak-ai-chatbot-close');
        const sendBtn = container.querySelector('.leak-ai-chatbot-send');
        const tokenInput = container.querySelector('#leak-ai-chatbot-token');
        const promptInput = container.querySelector('#leak-ai-chatbot-prompt');
        const responseDiv = container.querySelector('.leak-ai-chatbot-response');
        const loadingDiv = container.querySelector('.leak-ai-chatbot-loading');

        closeBtn.addEventListener('click', () => {
            container.classList.remove('active');
            // Save state: disabled for this site using standard tool key
            const hostname = window.location.hostname;
            const storageKey = `leak_tool_chatbot_enabled_${hostname}`;
            const update = {};
            update[storageKey] = false;
            chrome.storage.local.set(update);
        });

        // Load saved token from storage
        chrome.storage.local.get(['leak_token'], (result) => {
            if (chrome.runtime.lastError) return;
            if (result.leak_token) {
                tokenInput.value = result.leak_token;
            }
        });

        // Sync with global storage if token changes elsewhere (e.g. settings menu)
        chrome.storage.onChanged.addListener((changes, area) => {
            if (area === 'local' && changes.leak_token) {
                tokenInput.value = changes.leak_token.newValue || '';
            }
        });

        sendBtn.addEventListener('click', async () => {
            const token = tokenInput.value.trim();
            const prompt = promptInput.value.trim();

            if (!token) {
                alert('Please enter your API token.');
                return;
            }
            if (!prompt) {
                alert('Please enter a question.');
                return;
            }

            // Save token for future use
            chrome.storage.local.set({ leak_token: token });

            // Get or generate session ID
            chrome.storage.local.get(['leak_session_id'], async (result) => {
                let sessionId = result.leak_session_id;
                if (!sessionId) {
                    sessionId = 'leak_' + Math.random().toString(36).substr(2, 9);
                    chrome.storage.local.set({ leak_session_id: sessionId });
                }

                // UI Update: Loading state
                sendBtn.disabled = true;
                loadingDiv.classList.add('active');
                responseDiv.classList.remove('active');
                responseDiv.textContent = '';

                try {
                    const response = await fetch('https://api.stufy.qzz.io/webhook/f9b818be-f507-436d-9af8-8ebd8270d049', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            prompt: prompt,
                            sessionid: sessionId,
                            token: token
                        })
                    });

                    if (!response.ok) {
                        throw new Error(`API returned ${response.status}`);
                    }

                    const responseText = await response.text();
                    let data;
                    try {
                        data = JSON.parse(responseText);
                    } catch (e) {
                        data = responseText;
                    }
                    
                    responseDiv.classList.add('active');
                    
                    if (typeof data === 'string') {
                        responseDiv.textContent = data;
                    } else if (data.output) {
                        responseDiv.textContent = data.output;
                    } else if (data.response) {
                        responseDiv.textContent = data.response;
                    } else if (data.message) {
                        responseDiv.textContent = data.message;
                    } else {
                        responseDiv.textContent = JSON.stringify(data, null, 2);
                    }
                } catch (error) {
                    responseDiv.classList.add('active');
                    responseDiv.textContent = 'Error: ' + error.message + '. Please check your token and connection.';
                } finally {
                    loadingDiv.classList.remove('active');
                    sendBtn.disabled = false;
                }
            });
        });
    };

    // Global function to toggle chatbot
    window.toggleLeakChatbot = async (enable) => {
        const container = document.getElementById('leak-ai-chatbot-container');
        if (enable) {
            if (!container) {
                await createChatbot(currentConfig);
            }
            const newContainer = document.getElementById('leak-ai-chatbot-container');
            if (newContainer) {
                newContainer.style.display = 'flex';
                setTimeout(() => newContainer.classList.add('active'), 10);
            }
            window.Leak.log('AI Chatbot enabled.');
        } else {
            if (container) {
                container.classList.remove('active');
                setTimeout(() => {
                    if (container && !container.classList.contains('active')) {
                        container.remove();
                    }
                }, 300);
            }
            window.Leak.log('AI Chatbot disabled.');
        }
    };

    // Register as tool
    if (window.Leak) {
        window.Leak.registerTool('chatbot', (isEnabled) => {
            window.toggleLeakChatbot(isEnabled);
        });
    }
})();
