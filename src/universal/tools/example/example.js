/////////////////////////////////////////////
// THIS CODE IS PART OF THE LEAKHW PROJECT //
//    © LeakHW 2026 - GNU GPLv3 License    //
//                                         //
// Please do NOT claim this code as solely //
// your own code. All code here is part of //
//     the open-source LeakHW project.     //
//                                         //
//    math_helper.js • Math Helper         //
//        Specialized Math Tools           //
/////////////////////////////////////////////

(function() {
    /**
     * MATH HELPER TOOL
     * Provides specialized UI for math-related platforms.
     */
    
    if (window.Leak) {
        window.Leak.registerTool('math_helper', async (isEnabled) => {
            let helper = document.getElementById('leak-math-helper');
            
            if (isEnabled) {
                if (!helper) {
                    try {
                        const response = await fetch(chrome.runtime.getURL('universal/tools/math_helper/math_helper.html'));
                        const html = await response.text();
                        const tempDiv = document.createElement('div');
                        tempDiv.innerHTML = html;
                        helper = tempDiv.firstElementChild;
                        document.body.appendChild(helper);
                    } catch (error) {
                        window.Leak.error('Failed to load Math Helper HTML', error);
                        return;
                    }
                } else {
                    helper.style.display = 'block';
                }
            } else {
                if (helper) helper.style.display = 'none';
            }
        });
    }
})();