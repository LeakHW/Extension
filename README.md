# Leak
A universal homework helper extension for Seneca Learning and Sparx Learning.

## Project Structure
- `src/universal/`: Core universal components and tool manager.
- `src/universal/tools/`: Individual tools (Chatbot, Leak Menu, Math Helper, AI Assistant).
  - Each tool has its own folder containing `.js`, `.css`, and `.html` files.
- `src/sparx/`: Integration logic for Sparx Learning platforms.
- `src/seneca/`: Integration logic for Seneca Learning.

## Key Features
- **Universal Menu**: A centralized menu to toggle tools on/off for specific sites.
- **AI Chatbot**: Powered by Tye AI to assist with questions.
- **Modular Design**: Tools are decoupled and can be easily added or modified.

## Development
Tools use a dynamic HTML loading system. When adding a new tool:
1. Create a folder in `src/universal/tools/`.
2. Add `.js`, `.css`, and `.html` files.
3. Update `manifest.json` to include the new tool in content scripts and `web_accessible_resources`.
4. Register the tool in `tools.js`.
