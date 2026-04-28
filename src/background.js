/////////////////////////////////////////////
// THIS CODE IS PART OF THE LEAKHW PROJECT //
//    © LeakHW 2026 - GNU GPLv3 License    //
//                                         //
// Please do NOT claim this code as solely //
// your own code. All code here is part of //
//     the open-source LeakHW project.     //
//                                         //
//              background.js              //
//         Background Service Worker       //
/////////////////////////////////////////////

chrome.action.onClicked.addListener((tab) => {
    if (tab.id) {
        chrome.tabs.sendMessage(tab.id, { action: "open_leak_popup" }, (response) => {
            // If the script isn't loaded yet (e.g. on a chrome:// page), this might fail
            if (chrome.runtime.lastError) {
                console.log("Could not send message to tab: " + chrome.runtime.lastError.message);
            }
        });
    }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "open_leak_popup") {
        // Forward the message to the content script in the same tab
        if (sender.tab && sender.tab.id) {
            chrome.tabs.sendMessage(sender.tab.id, { action: "open_leak_popup" }, (response) => {
                sendResponse({ status: "forwarded", details: response });
            });
            return true; // Keep the message channel open for async response
        }
    }
});
