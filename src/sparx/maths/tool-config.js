/////////////////////////////////////////////
// THIS CODE IS PART OF THE LEAKHW PROJECT //
//    © LeakHW 2026 - GNU GPLv3 License    //
//                                         //
// Please do NOT claim this code as solely //
// your own code. All code here is part of //
//     the open-source LeakHW project.     //
//                                         //
//    tool-config.js • Sparx Maths         //
//        Maths Tool Configuration         //
/////////////////////////////////////////////

(function() {
    /**
     * SPARX MATHS TOOL CONFIGURATION
     * Defines which universal tools are enabled for this platform.
     */
    window.LeakConfig = {
        platform: 'Sparx Maths',
        menuTitle: 'Leak Maths Menu',
        tools: [
            {
                id: 'chatbot',
                label: 'AI Assistant',
                category: 'AI',
                description: 'Get help with your Maths homework using Tye AI.',
                config: {
                    title: 'Maths AI Assistant',
                    placeholder: 'How can I help with Maths?'
                }
            },
            {
                id: 'example',
                label: 'Example Tool',
                category: 'Templates',
                description: 'A template for creating new Leak tools.',
                config: {}
            },
            {
                id: 'data_collector',
                label: 'Data Collector',
                category: 'Automation',
                description: 'Collects question data for our database.',
                config: {}
            },
            {
                id: 'bookwork_helper',
                label: 'Bookwork Helper',
                category: 'Helpers',
                description: 'Keeps track of bookwork codes and answers.',
                config: {}
            },
            {
                id: 'text_selector',
                label: 'Text Selector',
                category: 'Helpers',
                description: 'Enable selection and copying on restricted elements.',
                config: {}
            },
            {
                id: 'dev_info',
                label: 'DOM Info (Debug)',
                category: 'Debug',
                description: 'Show info about hovered elements.',
                config: {},
                devOnly: true
            }
        ],
        injection: {
            selector: '[role="menu"]',
            targetText: 'Sign out',
            separatorSelector: '[role="separator"]',
            label: 'Leak',
            iconHtml: `
                <div style="display: flex; align-items: center; gap: 12px; width: 100%;">
                    <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="tint" style="width: 1em; height: 1em; color: #3182ce;" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
                        <path fill="currentColor" d="M192 32c0 0-144 192-144 320c0 79.5 64.5 144 144 144s144-64.5 144-144c0-128-144-320-144-320zm0 416c-53 0-96-43-96-96c0-85.3 96-224 96-224s96 138.7 96 224c0 53-43 96-96 96z"></path>
                    </svg>
                    <span style="flex: 1; text-align: left;">Leak</span>
                </div>
            `
        }
    };
})();
