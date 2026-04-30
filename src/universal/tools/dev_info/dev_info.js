(function() {
    /**
     * DEV INFO TOOL
     * Displays information about hovered elements when enabled.
     */
    
    if (window.Leak) {
        let overlay = null;
        let isEnabled = false;

        const onMouseMove = (e) => {
            if (!isEnabled) return;
            const target = e.target;
            if (!target || target === overlay) return;

            if (!overlay) {
                overlay = document.createElement('div');
                overlay.id = 'leak-dev-info-overlay';
                document.body.appendChild(overlay);
            }

            const classes = Array.from(target.classList).join(' .');
            overlay.innerHTML = `
                <div class="leak-dev-info-tag">&lt;${target.tagName.toLowerCase()}&gt;</div>
                <div class="leak-dev-info-classes">${classes ? '.' + classes : 'no classes'}</div>
                <div class="leak-dev-info-size">${target.offsetWidth}x${target.offsetHeight}</div>
            `;

            overlay.style.left = `${e.clientX + 10}px`;
            overlay.style.top = `${e.clientY + 10}px`;
            overlay.style.display = 'block';
        };

        const onMouseOut = () => {
            if (overlay) overlay.style.display = 'none';
        };

        window.Leak.registerTool('dev_info', (state) => {
            isEnabled = state;
            if (isEnabled) {
                window.Leak.log('DOM Info enabled - Hover over elements to see details.');
                document.addEventListener('mousemove', onMouseMove);
                document.addEventListener('mouseout', onMouseOut);
            } else {
                window.Leak.log('DOM Info disabled.');
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseout', onMouseOut);
                if (overlay) {
                    overlay.remove();
                    overlay = null;
                }
            }
        });
    }
})();
