/////////////////////////////////////////////
// THIS CODE IS PART OF THE LEAKHW PROJECT //
//    © LeakHW 2026 - GNU GPLv3 License    //
//                                         //
// Please do NOT claim this code as solely //
// your own code. All code here is part of //
//     the open-source LeakHW project.     //
//                                         //
//         index.js • Seneca Auth          //
//          Main Seneca Auth Code          //
/////////////////////////////////////////////

(function() {
    /**
     * SENECA AUTH PLATFORM MANAGER
     * Manages tools and injection using the local tool-config.js.
     */
    
    if (window.Leak && window.LeakConfig) {
        // 1. Initialize Tools from Config
        window.Leak.enableTool('leak_menu', {
            title: window.LeakConfig.menuTitle
        });

        window.LeakConfig.tools.forEach(tool => {
            window.Leak.enableTool(tool.id, {
                label: tool.label,
                description: tool.description,
                ...tool.config
            });
        });

        // 2. Perform Platform Specific Injections
        if (window.LeakConfig.injection) {
            window.Leak.registerMenuInjection({
                ...window.LeakConfig.injection,
                onClick: () => {
                    if (window.showLeakMenu) window.showLeakMenu();
                }
            });
        }
    }
})();
