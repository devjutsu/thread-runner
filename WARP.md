# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Thread-runner is a TypeScript application for analyzing and posting on Threads (Meta's social media platform). It uses Playwright for web automation to scrape Threads content, PostgreSQL for data persistence, and provides both CLI and web server interfaces.

## Architecture

**Core Technologies:**
- **TypeScript**: Primary development language with strict type checking enabled
- **Playwright**: Browser automation for Threads interaction and content scraping
- **PostgreSQL**: Database backend with TypeORM as the ORM
- **Express.js**: Web server framework for API endpoints
- **Winston**: Structured logging
- **Docker Compose**: PostgreSQL database containerization

**Project Structure:**
- Root-level TypeScript files (`main.ts`, `test.ts`) contain web scraping scripts
- `dist/` directory for compiled JavaScript output
- `playwright/.auth/` contains authentication state for automated browser sessions
- Environment configuration via `.env` file
- Database runs in Docker container defined by `docker-compose.yml`

## Common Development Commands

### Building and Running
```bash
# Install dependencies
npm install

# Development mode with hot reload
npm run dev

# Build TypeScript to JavaScript
npm run build

# Run production build
npm start

# Run search script directly
npm run search
```

### Database Operations
```bash
# Start PostgreSQL database
npm run docker:up

# Stop database
npm run docker:down
```

### Code Quality
```bash
# Lint TypeScript code
npm run lint

# Format code with Prettier
npm run format
```

### Development Workflow
```bash
# Run main scraping script
npx ts-node main.ts

# Run test script
npx ts-node test.ts
```

## Key Configuration Files

- **tsconfig.json**: TypeScript configuration with ES2020 target, CommonJS modules, experimental decorators enabled for TypeORM
- **.env**: Environment variables including database credentials, Node environment, logging level
- **docker-compose.yml**: PostgreSQL 16 Alpine container setup with health checks
- **package.json**: Defines all npm scripts and dependencies

## Database Architecture

The application uses PostgreSQL with TypeORM for database operations:
- Database: `thread_runner_db`
- User: `thread_runner` 
- Port: 5432 (exposed from Docker container)
- Connection configured via environment variables in `.env`

## Browser Automation

Playwright configuration:
- Stores authentication state in `playwright/.auth/user.json`
- Runs in non-headless mode for development/debugging
- Configured with slow motion for better observation during development
- Targets Threads.net search and content extraction

## Development Notes

**Entry Points:**
- `main.ts`: Primary scraping script with sophisticated text matching and highlighting
- `test.ts`: Simplified scraping script for testing and development
- Server entry would be `dist/index.js` based on package.json main field

**Text Processing:**
The main script includes advanced Russian text processing with:
- Cyrillic normalization (ё → е)
- Fuzzy regex matching for social media text variations
- Colored terminal output using chalk for result highlighting

**Authentication:**
Browser sessions require pre-authenticated state stored in `playwright/.auth/user.json` for Threads access.

## Environment Requirements

- Node.js ≥20.0.0 
- TypeScript 5.x
- Docker for PostgreSQL database
- Playwright browsers installed (`npx playwright install`)

## Testing Single Functions

To test individual components:
```bash
# Run specific TypeScript file
npx ts-node path/to/file.ts

# Debug with TypeScript Node REPL
npx ts-node
```
