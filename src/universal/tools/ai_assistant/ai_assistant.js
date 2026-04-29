/////////////////////////////////////////////
// THIS CODE IS PART OF THE LEAKHW PROJECT //
//    © LeakHW 2026 - GNU GPLv3 License    //
//                                         //
// Please do NOT claim this code as solely //
// your own code. All code here is part of //
//     the open-source LeakHW project.     //
//                                         //
//    ai_assistant.js • Universal AI       //
//        Universal AI Assistant Code      //
/////////////////////////////////////////////

document.addEventListener('DOMContentLoaded', () => {
    const sendBtn = document.querySelector('.leak-ai-send');
    const tokenInput = document.querySelector('#leak-ai-token');
    const promptInput = document.querySelector('#leak-ai-prompt');
    const responseDiv = document.querySelector('.leak-ai-response');
    const loadingDiv = document.querySelector('.leak-ai-loading');

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
                    // If not JSON, use the raw text
                    data = responseText;
                }
                
                // Display response
                responseDiv.classList.add('active');
                
                // Handle different possible response formats
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
});
