# Leak AI Knowledgebase

## Project Overview

Leak is a universal homework helper extension designed for Seneca Learning and Sparx Learning platforms. It aims to provide AI assistance and other tools in a unified interface.

## Core Architecture

- **Universal Components (`src/universal`)**: Components that run on all URLs.
  - **Universal Tool Manager (`tools.js`)**: Manages tool registration and state.
  - **Individual Tools (`src/universal/tools/`)**: Each tool resides in its own folder.
    - **Leak Menu (`leak_menu/`)**: The main control center, appearing in the middle of the screen. Features sidebar categories and footer navigation.
    - **AI Chatbot (`chatbot/`)**: A toggleable assistant in the bottom-right corner.
    - **Scientific Calculator (`scientific_calculator/`)**: A draggable, fully functional scientific calculator with advanced math operations.
    - **Text Selector (`text_selector/`)**: A universal helper that forces elements to be selectable and enables copying on restricted sites.
    - **DOM Info (`dev_info/`)**: A developer tool that displays element metadata on hover.
    - **Data Collector (`data_collector/`)**: Collects Sparx Maths question data and images when enabled in settings.
    - **Bookwork Helper (`bookwork_helper/`)**: Automatically tracks bookwork codes and user-inputted answers on Sparx Maths.
    - **AI Assistant (`ai_assistant/`)**: Logic and UI for the extension assistant (popup).

- **UI Profile System**: A platform-wide theming engine managed by `tools.js`.
  - **Profiles**: Defined in site-specific `config.js` files.
  - **Stylesheets**: Profile-specific CSS files are injected dynamically based on user selection.
  - **Persistence**: Selections are saved per-hostname in `chrome.storage.local`.

## UI & Templating

- **Settings System**: A centralized settings view in the `leak_menu` with "Main" and "Optional Features" sections.
- **HTML Menus**: Tool menus and UI templates are stored in separate `.html` files within their respective tool folders.
- **Dynamic Loading**: Tools fetch their HTML templates using `chrome.runtime.getURL()` and `fetch()` at runtime.

## State Management

- **Site-Specific Settings**: Chatbot and other tools are enabled/disabled per hostname using keys like `leak_tool_ID_enabled_hostname.com`.
- **Cross-Tab Sync**: A global storage listener in `tools.js` keeps tool and profile states synchronized across all open browser tabs.

## AI Integration (Tye AI)

- **API**: Communicates with Tye AI via a POST webhook.
- **Session Tracking**: Uses `leak_session_id` (prefixed with `leak_`) to maintain context.
- **Authentication**: Users provide a Tye API token which is stored locally.

## Development Standards

- **Branding & Logging**: Centralized logging via `window.Leak.log/warn/error/debug` with a styled `[LEAK]` prefix and a teal gradient ASCII logo on startup.
- **Copyright Headers**: Every file must start with the official LeakHW copyright notice.
- **Isolation**: Use IIFEs for content scripts to prevent variable collisions.
- **Dynamic Injection**: Use `MutationObserver` to detect and inject buttons into dynamic menus (especially on Sparx and Seneca).

## File Organization

- `src/universal/`: Global logic and manager.
- `src/universal/tools/`: Individual tool folders.
- `src/sparx/`: Integration for Sparx Maths, Reader, and Science.
    - `maths/`: Enabled with `chatbot`, `scientific_calculator`, `text_selector`, `data_collector`, and `bookwork_helper`.
    - `config.js`: Defines tools and UI profiles for the platform.
- `src/seneca/`: Integration for Seneca Learning.
  - Uses `config.js` for app and auth modules.
  - Injects the Leak Menu button into the settings menu.
- `src/background.js`: Handles extension icon clicks, message passing, and menu triggering.
