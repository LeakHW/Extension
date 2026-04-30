(function() {
    /**
     * TEXT SELECTOR TOOL
     * Forces elements to be selectable even if they have user-select: none
     * and overrides copy prevention.
     */
    
    if (window.Leak) {
        let isEnabled = false;
        let styleElement = null;

        const CSS_OVERRIDE = `
            * {
                user-select: text !important;
                -webkit-user-select: text !important;
                -moz-user-select: text !important;
                -ms-user-select: text !important;
                cursor: auto !important;
            }
            ::selection {
                background: rgba(49, 130, 206, 0.3) !important;
                color: inherit !important;
            }
        `;

        const preventHandler = (e) => {
            if (isEnabled) {
                e.stopPropagation();
            }
        };

        window.Leak.registerTool('text_selector', (state) => {
            isEnabled = state;
            if (isEnabled) {
                window.Leak.log('Text Selector enabled - You can now select and copy restricted text.');
                
                // Add CSS overrides
                if (!styleElement) {
                    styleElement = document.createElement('style');
                    styleElement.id = 'leak-text-selector-style';
                    styleElement.textContent = CSS_OVERRIDE;
                    document.head.appendChild(styleElement);
                }

                // Override event listeners that block selection/copying
                document.addEventListener('copy', preventHandler, true);
                document.addEventListener('contextmenu', preventHandler, true);
                document.addEventListener('selectstart', preventHandler, true);
                document.addEventListener('mousedown', preventHandler, true);
            } else {
                window.Leak.log('Text Selector disabled.');
                
                if (styleElement) {
                    styleElement.remove();
                    styleElement = null;
                }

                document.removeEventListener('copy', preventHandler, true);
                document.removeEventListener('contextmenu', preventHandler, true);
                document.removeEventListener('selectstart', preventHandler, true);
                document.removeEventListener('mousedown', preventHandler, true);
            }
        });
    }
})();
