/////////////////////////////////////////////
// THIS CODE IS PART OF THE LEAKHW PROJECT //
//    © LeakHW 2026 - GNU GPLv3 License    //
//                                         //
// Please do NOT claim this code as solely //
// your own code. All code here is part of //
//     the open-source LeakHW project.     //
//                                         //
//         index.js • Sparx Auth           //
//          Main Sparx Auth Code           //
/////////////////////////////////////////////

(function() {
    /**
     * SPARX AUTH PLATFORM MANAGER
     * Manages tools and injection for Sparx Auth pages.
     */
    
    // 1. Configure and Enable Tools
    if (window.Leak) {
        window.Leak.enableTool('leak_menu', {
            title: 'Leak Sparx Auth',
            aiDisabled: true // Disable AI on login/auth pages
        });
    }
})();
