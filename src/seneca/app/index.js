/////////////////////////////////////////////
// THIS CODE IS PART OF THE LEAKHW PROJECT //
//    © LeakHW 2026 - GNU GPLv3 License    //
//                                         //
// Please do NOT claim this code as solely //
// your own code. All code here is part of //
//     the open-source LeakHW project.     //
//                                         //
//         index.js • Seneca App           //
//          Main Seneca App Code           //
/////////////////////////////////////////////

(function() {
    /**
     * SENECA APP PLATFORM MANAGER
     * Manages tools and injection for Seneca App.
     */
    
    // 1. Configure and Enable Tools
    if (window.Leak) {
        window.Leak.enableTool('leak_menu', {
            title: 'Leak Seneca Menu'
        });

        window.Leak.enableTool('chatbot', {
            label: 'AI Assistant',
            description: 'Get help with your Seneca course using Tye AI.',
            title: 'Seneca AI Assistant',
            placeholder: 'How can I help with your Seneca course?'
        });

        // 2. Platform Specific Injections
        window.Leak.registerMenuInjection({
            selector: 'div[role="menu"]',
            targetText: 'Dark mode',
            label: 'Leak',
            iconHtml: `
                <div style="display: flex; align-items: center; gap: 12px; padding: 0 4px;">
                    <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="tint" style="width: 20px; height: 20px; color: #3182ce; flex-shrink: 0;" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
                        <path fill="currentColor" d="M192 32c0 0-144 192-144 320c0 79.5 64.5 144 144 144s144-64.5 144-144c0-128-144-320-144-320zm0 416c-53 0-96-43-96-96c0-85.3 96-224 96-224s96 138.7 96 224c0 53-43 96-96 96z"></path>
                    </svg>
                    <span style="font-size: 16px; font-weight: bold; color: #3182ce;">Leak Menu</span>
                </div>
            `,
            onClick: () => {
                if (window.showLeakMenu) window.showLeakMenu();
            }
        });
    }
})();
