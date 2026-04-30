/////////////////////////////////////////////
// THIS CODE IS PART OF THE LEAKHW PROJECT //
//    © LeakHW 2026 - GNU GPLv3 License    //
//                                         //
// Please do NOT claim this code as solely //
// your own code. All code here is part of //
//     the open-source LeakHW project.     //
//                                         //
//    tool-config.js • Seneca Auth         //
//       Auth Tool Configuration           //
/////////////////////////////////////////////

(function() {
    /**
     * SENECA AUTH TOOL CONFIGURATION
     * Defines which universal tools are enabled for this platform.
     */
    window.LeakConfig = {
        platform: 'Seneca Auth',
        menuTitle: 'Leak Seneca Auth',
        tools: [
            {
                id: 'chatbot',
                label: 'AI Assistant',
                category: 'AI',
                description: 'Get help with your Seneca course using Tye AI.',
                config: {
                    title: 'Seneca AI Assistant',
                    placeholder: 'How can I help with your Seneca course?'
                }
            }
        ],
        injection: {
            selector: 'div[role="menu"], #session-settings-popup',
            targetText: 'Dark mode',
            label: 'Leak',
            iconHtml: `
                <div class="sc-dkrFOg hJmloq">
                    <div class="sc-dkrFOg eYzEKe">
                        <div class="sc-dkrFOg byVwXk">
                            <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="tint" style="width: 20px; height: 20px; color: #3182ce;" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
                                <path fill="currentColor" d="M192 32c0 0-144 192-144 320c0 79.5 64.5 144 144 144s144-64.5 144-144c0-128-144-320-144-320zm0 416c-53 0-96-43-96-96c0-85.3 96-224 96-224s96 138.7 96 224c0 53-43 96-96 96z"></path>
                            </svg>
                        </div>
                        <div class="sc-dkrFOg byVwXk">
                            <div class="sc-dkrFOg fnOHDr">
                                <div class="sc-dkrFOg byVwXk">
                                    <span font-size="16px" font-weight="bold" color="#3182ce" class="sc-jrcTuL hBVDSS">Leak Menu</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `
        }
    };
})();