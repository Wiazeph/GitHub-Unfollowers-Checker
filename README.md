# GitHub Unfollowers Checker

Find out who you follow on GitHub that doesn't follow you back. Enter a username, and the app fetches the account's followers and following lists and shows the difference.

![GitHub Unfollowers Checker](./thumbnail/GitHub-Unfollowers-Checker.png)

## Features

- **One input** — just type a GitHub username and hit Check.
- **Server-side proxy** — GitHub requests are made through a serverless function that holds the API token, so it stays off the client and you get the authenticated rate limit (5,000 req/h instead of 60).
- **Full pagination** — handles accounts with thousands of followers/following via the GitHub `Link` header.
- **Clear states** — loading skeletons, an empty prompt, a celebratory "everyone follows back" state, and friendly error toasts.
- **Copy usernames** with one click.

## Tech Stack

[React 19](https://react.dev/) · [TypeScript](https://www.typescriptlang.org/) · [Vite](https://vite.dev/) · [Tailwind CSS v4](https://tailwindcss.com/) · [TanStack Query](https://tanstack.com/query) · [sonner](https://sonner.emilkowal.ski/) · [lucide-react](https://lucide.dev/) · [Vercel Functions](https://vercel.com/docs/functions)

## Running Locally

This app uses a Vercel serverless function, so it runs with `vercel dev` (which serves both the Vite frontend and the `/api` route).

```bash
# 1. Clone and install
git clone https://github.com/Wiazeph/GitHub-Unfollowers-Checker.git
cd GitHub-Unfollowers-Checker
pnpm install

# 2. Add a GitHub token
cp .env.example .env.local
# then edit .env.local and set GITHUB_TOKEN
```

Create a token at [github.com/settings/tokens](https://github.com/settings/tokens). A fine-grained token with read-only public access is enough — no scopes are required for public follower data.

```bash
# 3. Start the dev server (frontend + API)
pnpm dev
```

> Prefer the UI only, without the API route? Use `pnpm dev:vite`.

## Deploying

Deploy to [Vercel](https://vercel.com/) and set the `GITHUB_TOKEN` environment variable in your project settings (Production, Preview, and Development). The `api/` directory is detected automatically.

## Scripts

| Command         | Description                          |
| --------------- | ------------------------------------ |
| `pnpm dev`      | Vite + serverless API (`vercel dev`) |
| `pnpm dev:vite` | Frontend only                        |
| `pnpm build`    | Type-check and build for production  |
| `pnpm preview`  | Preview the production build         |
| `pnpm lint`     | Run ESLint                           |
