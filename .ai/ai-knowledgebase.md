# Leak AI Knowledgebase

## Project Overview

Leak is a universal homework helper extension designed for Seneca Learning and Sparx Learning platforms. It aims to provide AI assistance and other tools in a unified interface.

## Core Architecture

- **Universal Components (`src/universal`)**: Components that run on all URLs.
  - **Leak Menu (`leak_menu.js/css`)**: The main control center, appearing in the middle of the screen. Triggered by the extension icon or "Leak" buttons on platforms.
  - **AI Chatbot (`ai/chatbot.js/css`)**: A toggleable assistant in the bottom-right corner.
- **Platform Specifics**:
  - **Seneca (`src/seneca`)**: Dashboard and authentication specific logic.
  - **Sparx (`src/sparx`)**: Integration for Sparx Maths, Reader, and Science.

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

- `src/universal/`: Global logic.
- `src/universal/ai/`: AI-specific logic (chatbot, assistant).
- `src/sparx/`: Sparx-specific modules.
- `src/seneca/`: Seneca-specific modules.
- `src/background.js`: Handles extension icon clicks and message passing.
