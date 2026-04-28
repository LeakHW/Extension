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

    const createChatbot = () => {
        if (document.getElementById('leak-ai-chatbot-container')) return;

        const container = document.createElement('div');
        container.id = 'leak-ai-chatbot-container';
        container.className = 'leak-ai-chatbot-container';
        
        container.innerHTML = `
            <div class="leak-ai-chatbot-window">
                <div class="leak-ai-chatbot-header">
                    <span>Leak AI Chatbot</span>
                    <button class="leak-ai-chatbot-close">&times;</button>
                </div>
                <div class="leak-ai-chatbot-body">
                    <div class="leak-ai-chatbot-field">
                        <label for="leak-ai-chatbot-token">API Token</label>
                        <input type="password" id="leak-ai-chatbot-token" class="leak-ai-chatbot-input" placeholder="Paste your Tye token...">
                    </div>
                    <div class="leak-ai-chatbot-field">
                        <label for="leak-ai-chatbot-prompt">Your Question</label>
                        <textarea id="leak-ai-chatbot-prompt" class="leak-ai-chatbot-input leak-ai-chatbot-textarea" placeholder="How can I help you today?"></textarea>
                    </div>
                    <button class="leak-ai-chatbot-send">Ask AI</button>
                    <div class="leak-ai-chatbot-loading">
                        <div class="leak-ai-chatbot-spinner"></div>
                        <span>Consulting Tye AI...</span>
                    </div>
                    <div class="leak-ai-chatbot-response"></div>
                    <div class="leak-ai-chatbot-footer">
                        Powered by Tye
                    </div>
                </div>
            </div>
        `;

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
            // Save state: disabled for this site
            const hostname = window.location.hostname;
            const update = {};
            update[`leak_chatbot_enabled_${hostname}`] = false;
            chrome.storage.local.set(update);
        });

        // Load saved token from storage
        chrome.storage.local.get(['leak_token'], (result) => {
            if (result.leak_token) {
                tokenInput.value = result.leak_token;
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
                    const response = await fetch('http://141.147.118.157:5678/webhook/f9b818be-f507-436d-9af8-8ebd8270d049', {
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
    window.toggleLeakChatbot = (enable) => {
        createChatbot();
        const container = document.getElementById('leak-ai-chatbot-container');
        if (enable) {
            container.classList.add('active');
        } else {
            container.classList.remove('active');
        }
    };

    // Check saved state on load (site-specific)
    const hostname = window.location.hostname;
    chrome.storage.local.get([`leak_chatbot_enabled_${hostname}`], (result) => {
        if (result[`leak_chatbot_enabled_${hostname}`]) {
            window.toggleLeakChatbot(true);
        }
    });
})();
