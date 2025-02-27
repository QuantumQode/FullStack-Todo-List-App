# CLAUDE.md - Development Guidelines

## Build & Test Commands
- **Client**: 
  - Start: `cd client && npm start`
  - Build: `cd client && npm run build`
  - Test: `cd client && npm test`
  - Single test: `cd client && npm test -- -t "testName"`
- **Server**: 
  - Start: `cd server && npm start`
  - Dev mode: `cd server && npm run dev`

## Code Style Guidelines
- **Imports**: Group imports by type (React, libraries, local)
- **Formatting**: Use consistent indentation (2 spaces)
- **Error Handling**: Try-catch with specific error messages in catch blocks
- **Naming**:
  - React components: PascalCase (e.g., `LoginForm`)
  - Variables/functions: camelCase (e.g., `handleSubmit`)
  - Constants: UPPER_SNAKE_CASE (e.g., `API_URL`)
- **File Structure**:
  - React components in `/client/src/pages` and `/client/src/components`
  - API routes in `/server/src/routes`
- **State Management**: Use React hooks (useState, useEffect) for component state
- **API Calls**: Use axios for HTTP requests
- **Comments**: Add comments for complex logic and function descriptions