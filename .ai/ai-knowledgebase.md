# Leak AI Knowledgebase

## Project Overview

Leak is a universal homework helper extension designed for Seneca Learning and Sparx Learning platforms. It aims to provide AI assistance and other tools in a unified interface.

## Core Architecture

- **Universal Components (`src/universal`)**: Components that run on all URLs.
  - **Universal Tool Manager (`tools.js`)**: Manages tool registration and state.
  - **Individual Tools (`src/universal/tools/`)**: Each tool resides in its own folder.
    - **Leak Menu (`leak_menu/`)**: The main control center, appearing in the middle of the screen. Triggered by the extension icon or "Leak" buttons on platforms.
    - **AI Chatbot (`chatbot/`)**: A toggleable assistant in the bottom-right corner.
    - **Math Helper (`math_helper/`)**: A specialized tool for math platforms.
    - **AI Assistant (`ai_assistant/`)**: Logic and UI for the extension assistant (popup).

## UI & Templating

- **HTML Menus**: Tool menus and UI templates are stored in separate `.html` files within their respective tool folders.
- **Dynamic Loading**: Tools fetch their HTML templates using `chrome.runtime.getURL()` and `fetch()` at runtime (for content script tools).
- **Web Accessible Resources**: All tool HTML files used in content scripts must be declared in `manifest.json` under `web_accessible_resources`.

## State Management

- **Site-Specific Settings**: Chatbot and other tools are enabled/disabled per hostname using keys like `leak_chatbot_enabled_hostname.com`.
- **Global Settings**: Tokens and session IDs are shared globally across sites via `chrome.storage.local`.

## AI Integration (Tye AI)

- **API**: Communicates with Tye AI via a POST webhook.
- **Session Tracking**: Uses `leak_session_id` (prefixed with `leak_`) to maintain context.
- **Authentication**: Users provide a Tye API token which is stored locally.

## Development Standards

- **Copyright Headers**: Every file must start with the official LeakHW copyright notice.
- **Isolation**: Use IIFEs for content scripts to prevent variable collisions.
- **Dynamic Injection**: Use `MutationObserver` to detect and inject buttons into dynamic menus (especially on Sparx).
- **UI Theme**: Blue primary theme (`#3182ce`) with "Powered by Tye" footer branding.

## File Organization

- `src/universal/`: Global logic and manager.
- `src/universal/tools/`: Individual tool folders.
  - `leak_menu/`: Main menu UI and logic.
  - `chatbot/`: AI Chatbot UI and logic.
  - `math_helper/`: specialized helper for maths.
  - `ai_assistant/`: Extension assistant UI (`ai_assistant.html`) and logic.
- `src/sparx/`: Integration for Sparx Maths, Reader, and Science.
- `src/seneca/`: Integration for Seneca Learning.
  - Injects the Leak Menu button into the settings menu (targeted via `div[role="menu"]`, anchored to "Dark mode").
- `src/background.js`: Handles extension icon clicks and message passing.
