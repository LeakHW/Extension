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

## [2026-04-30] - Leak Extension Overhaul & Debug Suite

**Model:** Gemini-3-Flash-Preview
**AI:** Trae IDE

### Added

- **New UI Framework**: Overhauled the Leak Menu with a taller layout, sidebar categories, and footer icon navigation.
- **Answer Capture Refinement**: Improved capture logic for Sparx Maths with support for slots, dynamic classes, and verbose logging.
- **Developer Suite**: Added "Dev Mode" activated by clicking the version number 10 times. Includes:
  - **DOM Info Tool**: Hover-based element inspector.
  - **Global Debug Logging**: Settings-controlled verbose output.
  - **Storage Management**: Button to clear all extension data.
- **Branding & Logging**: Centralized logging system with styled `[LEAK]` prefix and a teal gradient ASCII logo on startup.
- **Cross-Tab Sync**: Implemented a storage listener to keep tool states in sync across multiple browser tabs.
- **Text Selector Tool**: A universal helper that forces elements to be selectable and enables copying on restricted sites (Sparx, Seneca).

### Changed

- Reorganized settings into "Main" and "Optional Features" sections.
- Improved selector robustness in `data_collector` and `bookwork_helper` to avoid noise and handle dynamic hashes.
- Standardized tool registration to include categories (AI, Automation, Helpers, Debug).
- **Answer Capture Overhaul**: Completely rewrote the capture logic in `bookwork_helper` and `data_collector` to be exhaustive. It now captures from inputs, multi-choice buttons, and drag-and-drop slots, with support for image-based answers.
- **Logging Improvements**: Added "disabled" console messages for all tools and fixed asynchronous messaging errors in `background.js`.
- **CSP Fix**: Replaced `eval()` in the Scientific Calculator with a custom recursive descent math parser to comply with strict Content Security Policies on platforms like Sparx.
- **UI Refinements**: Hidden the sidebar when not in the Tools view and removed generic placeholder icons from tool buttons for a cleaner look.

- **UI Profiles System**: Introduced a new system for platform-wide themes and UI customizations.
  - Renamed `tool-config.js` to `config.js` across all platforms.
  - Added a 'Profiles' tab to the Leak Menu for easy theme switching.
  - Created an example 'Blue Background' profile for Sparx Maths.
  - Centralized profile injection logic in `universal/tools.js`.
- **Developer Documentation**: Restructured the documentation into a GitHub Wiki format within the `docs/` folder, featuring a Home page, dedicated guides for UI Profiles, Universal Tools, and Platform Setup, and a custom Sidebar and shared Footer.

### Fixed

- Fixed `ReferenceError` in `leak_menu.js` causing crashes when opening settings.
- Fixed storage key mismatch in `chatbot.js` that prevented state syncing with the menu.
- Audited and standardized `z-index` across all UI overlays (Menu: 10M, Chatbot: 9.9M).
- Fixed unstyled console messages by migrating all tools to `window.Leak.log/debug/warn/error`.
- Polished Leak Menu layout: reduced sidebar width, optimized tool grid for better space utilization, and added bottom spacing for better UX.

## [2026-05-01] - Scientific Calculator & Selection Tools

**Model:** Gemini-3-Flash-Preview
**AI:** Trae IDE

### Added

- **Scientific Calculator**: A draggable, fully functional scientific calculator with advanced math operations (trig, log, factorial, etc.) for complex homework.

### Changed
