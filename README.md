# 3D portfolio

The Next.js application lives in `frontend`.

## Local setup

1. Run `cd frontend`, then `npm install`.
2. Copy `.env.example` to `.env.local`. Set `MONGODB_URI` and `MONGODB_DB` for your database.
3. Generate a unique random `AUTH_SECRET` of at least 32 characters, and save it in `.env.local`:

   ```sh
   node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
   ```

4. Run `npm run db:password`. Enter and confirm a new admin password in the hidden prompt. It must contain at least 16 characters and at most 1024 UTF-8 bytes. For automation, supply `ADMIN_PASSWORD` through a protected process environment; do not pass the password as a command argument or commit it to a file.
5. Run `npm run dev` and open [localhost:3000](http://localhost:3000).

Keep `.env.local` private. Configure the same environment variables separately in your hosting provider before deploying. Missing credentials disable admin authentication; there is no default password or signing secret.

## Security migration

The previous version included exposed database credentials and a default admin password. Rotate the MongoDB user's credentials in your database provider, revoke the old credentials, and update your local and deployment environments. Removing a secret from source does not revoke it or remove it from Git history.

Existing admin password records are intentionally rejected. Run `npm run db:password` with a new unique password to replace the old record with a version 2 PBKDF2-SHA512 hash. Do not reuse the previous password. Set a new `AUTH_SECRET` as well; changing it invalidates existing admin sessions.

Portfolio edits require an authenticated admin session. The `/api/seed` endpoint accepts authenticated `POST` requests only and replaces portfolio content with defaults; opening its URL with `GET` does not reset data. The local `npm run db:seed` script also replaces data and should only be used intentionally.

Run `npm run test:security` from `frontend` to check authentication and endpoint protection using an isolated database substitute. Run `npm run build` to verify the production build.
