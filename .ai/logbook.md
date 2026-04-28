# AI Logbook

## [2026-04-27] - AI Assistant Popup & Cleanup

**Model:** Gemini-3-Flash-Preview
**AI:** Trae IDE

### Added

- Created `src/universal/popup.html` for the extension's browser action popup.
- Created `src/universal/ai_assistant.js` with Tye AI API integration, token storage, and session management.
- Created `src/universal/ai_assistant.css` for a modern, isolated UI for the assistant.
- Added `storage` permission and `<all_urls>` host permission to `manifest.json`.
- Configured `action.default_popup` in `manifest.json`.

### [2026-04-27] - Fix: API Parsing & UI Enhancements

**Model:** Gemini-3-Flash-Preview
**AI:** Trae IDE

### Fixed

- Fixed a JSON parsing error in `ai_assistant.js` where the API was returning plain text instead of JSON. Added a fallback to handle both formats gracefully.
- Enhanced the response display to handle raw string responses directly.

### Added

- Added "Powered by Tye" branding to the bottom of the `popup.html` and styled it in `ai_assistant.css`.

### [2026-04-28] - Sparx Maths: "Leak" Menu Button

**Model:** Gemini-3-Flash-Preview
**AI:** Trae IDE

### Added

- Implemented a `MutationObserver` in `src/sparx/maths/index.js` to detect when the Radix UI dropdown menu is opened.
- Injected a "Leak" menu item with a water drop SVG icon and a separator below the "Sign out" button on Sparx Maths.
- Added styling for the new menu item in `src/sparx/maths/index.css` to match the platform's UI.
- Defined a clearly labeled `onLeakButtonClick` handler in `src/sparx/maths/index.js` for future functionality.

### Changed

- Standardized copyright headers across all JS and CSS files with proper comment syntax (`//` for JS, `/* */` for CSS).
- Restored missing Sparx universal matches in `manifest.json` that were accidentally removed during previous updates.
- Refactored AI Assistant from an injected content script to a browser action popup for universal website compatibility.

### Fixed

- Corrected CSS comment syntax in header notes to ensure stylesheet validity.
- Ensured Seneca and Sparx specific files (`universal.js`/`universal.css`) remain clean for future use by moving general logic to `src/universal/`.

## [2026-04-28] - Universal Leak Menu & Site-Specific AI Chatbot

**Model:** Gemini-3-Flash-Preview
**AI:** Trae IDE

### Added

- Created `src/universal/leak_menu.js/css` for a central Leak Menu in the middle of the screen.
- Created `src/universal/ai/chatbot.js/css` for a toggleable AI chatbot in the bottom-right corner.
- Implemented site-specific enablement logic using `leak_chatbot_enabled_hostname` storage keys.
- Populated `.ai/ai-knowledgebase.md` with project architecture and standards.

### Changed

- Switched UI theme from teal to blue (`#3182ce`).
- Updated footer branding to "Powered by Tye" exclusively.
- Reorganized `src/universal` directory to include an `ai` subfolder.
- Updated `background.js` to trigger the Leak Menu via extension icon click.
- Integrated Leak Menu triggering across all Sparx platforms (Maths, Reader, Science).
