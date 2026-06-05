# Unfollowers Checker

See who you follow that doesn't follow you back — across **GitHub**, **Bluesky**, and **Instagram**, in one place. Pick a platform, enter a handle, and get the list of accounts you follow who don't follow you back. Sign in to clean it up with one click.

![Unfollowers Checker](./thumbnail/GitHub-Unfollowers-Checker.png)

## Platforms

| Platform | View non-followers | Unfollow | How it works |
| --- | :---: | :---: | --- |
| **GitHub** | ✅ | ✅ | Public API, no sign-in needed to view any user. Sign in with GitHub to bulk-unfollow your own list. |
| **Bluesky** | ✅ | ✅ | Public AT Protocol API to view any handle. Sign in with Bluesky to bulk-unfollow your own list. |
| **Instagram** | ✅ | ✅ | A browser bookmarklet that runs in your own session — Instagram has no public follower API, so nothing touches our servers. |

> Twitter/X, LinkedIn, and Instagram's official APIs don't allow a free, frictionless follower-list lookup, so they're out of scope (Instagram is supported via the bookmarklet instead).

## How it works

- **GitHub & Bluesky** — paste a handle (a bare name, an `@handle`, or even a full profile URL all work). The app fetches the account's followers and following lists and shows the difference. Reading is unauthenticated and free; signing in is only needed to unfollow on your own account.
- **Instagram** — drag the provided bookmarklet to your bookmarks bar and run it on instagram.com. It scans the people you follow using your own session and never sends data to any server.

## Privacy & security

- Public follower data is read through serverless functions that hold the API credentials, so tokens never reach the browser.
- Sign-in tokens are kept server-side (GitHub: signed http-only cookie; Bluesky: stored server-side, only the account id rides in the cookie).
- The Instagram tool runs entirely client-side in your own browser — your session and data stay with you.
- Bulk unfollowing affects only your own account, and only after an explicit confirmation.
