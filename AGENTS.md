# AGENTS.md

## Build/Lint/Test Commands

- Build: `npm run local` (for local development)
- Lint: `npm run prettier` (formats code with Prettier)
- Test: `npm run test` (runs all tests)
- Test with coverage: `npm run test:coverage` (runs tests with coverage)
- Single test: `cross-env ENV=test mocha test/<test-file>.test.js`

## Code Style Guidelines

- **Imports**: Use relative imports for internal modules
- **Formatting**: Follow Prettier config (single quotes, trailing commas, 80 char width)
- **Types**: Use JSDoc for type annotations
- **Naming**: Use camelCase for variables/functions, PascalCase for classes
- **Error Handling**: Use try-catch blocks with proper error logging
- **Security**: Never expose sensitive information in logs or responses

## Prettier Config

- `semi`: true
- `trailingComma`: "all"
- `singleQuote`: true
- `printWidth`: 80
- `tabWidth`: 2
- `useTabs`: false
- `bracketSpacing`: true
- `arrowParens`: "always"
- `endOfLine`: "lf"

## Additional Notes

- No Cursor or Copilot rules found in the repository
- Follow the guidelines in README.md for environment variables and deployment
