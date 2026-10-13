# WriteSpace

WriteSpace is a local-first blogging demo built as a static single-page application. Visitors can explore the landing page and register; writers can create, read, edit, and delete their own posts; the built-in administrator can manage all posts and accounts. Posts, accounts, and sessions are stored in the current browser's localStorage.

## Requirements

- Node.js 20 or newer
- npm

## Install and run

```bash
cd frontend
npm install
npm run dev
```

Open the Vite URL printed in the terminal. The built-in demo administrator is `admin` / `admin`.

## Tests and production build

```bash
cd frontend
npm test
npm run build
npm run e2e
```

The Vitest suite covers local identity, post operations, account management, route guards, and page behavior. Playwright runs the browser journeys against a Vite server started by its configuration.

## Deployment

The project builds to `frontend/dist`. The root `vercel.json` provides the required SPA rewrite so direct client-side routes resolve to `index.html`.

## Demo-only security and data limits

This application intentionally has no backend, API, or database. Data is isolated to one browser profile and is not synchronized across devices or users. Registered passwords are stored in plain text in localStorage, and the built-in administrator uses a fixed demo credential. Do not use real passwords, sensitive information, or treat this as production authentication or shared publishing infrastructure. Clearing browser storage removes the local accounts, posts, and session.
