# 3D portfolio

The Next.js application lives in `frontend`.

## Local setup

1. Run `cd frontend`, then `npm install`.
2. Copy `.env.example` to `.env.local`. Set `MONGODB_URI` and `MONGODB_DB` to the database holding your portfolio and saved edit password.
3. If a password has not been saved yet, run `npm run db:password` and enter it in the hidden prompt. Existing saved passwords continue to work.
4. Run `npm run dev` and open [localhost:3000](http://localhost:3000).

## Password-only edit mode

Click the lock button, enter the saved password, and edit. An incorrect password leaves editing disabled. There are no login accounts, role checks, session tokens, cookies, signing secrets, or additional authorization setup.

The server compares the password with the existing hash stored in MongoDB. The browser keeps your entered password only in memory while edit mode is enabled and sends it to this site's save endpoints over HTTPS. Exiting edit mode or refreshing clears it; navigation between portfolio pages keeps edit mode enabled. Passwords are not written to localStorage or sessionStorage.

All saves check the same password directly. Changing the saved password immediately stops saves that use the old password. The existing PBKDF2 password records are supported, including older records without a version field. `npm run db:password` changes the saved password; use a strong, unique one.

A database connection failure is reported separately from an incorrect password. If the deployed site cannot connect, check its `MONGODB_URI`, `MONGODB_DB`, and the database provider's network access settings. Your hosting environment must point to the same database where you saved the password. Redeploy after changing environment variables. No `AUTH_SECRET` is required or used.

Keep `.env.local` private. Replace any previously exposed database credentials in your provider and update the local and hosting environments.

The `/api/seed` endpoint accepts password-checked POST requests only. Opening its URL with GET cannot reset data. The local `npm run db:seed` script replaces portfolio data and should only be used intentionally.

Run `npm run test:security` from `frontend` to test password checks and save behavior without touching your real database. Run `npm run build` to verify the production build.
