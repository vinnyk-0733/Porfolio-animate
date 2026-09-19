# 3D portfolio

The Next.js application lives in `frontend`.

## Local setup

1. Run `cd frontend`, then `npm install`.
2. Copy `.env.example` to `.env.local`. Set `MONGODB_URI` and `MONGODB_DB` for your database.
3. For a new admin account, run `npm run db:password`. Enter and confirm a new admin password in the hidden prompt. It must contain at least 8 characters and at most 1024 UTF-8 bytes. For automation, supply `ADMIN_PASSWORD` through a protected process environment. An existing version 2 admin password continues to work; do not reset it just to resolve a missing signing secret.
4. Run `npm run dev` and open [localhost:3000](http://localhost:3000).

Keep `.env.local` private. Configure `MONGODB_URI` and `MONGODB_DB` separately in your hosting provider before deploying. Admin sign-in verifies the password saved in MongoDB. After successful verification, the server creates a private random session key in `admin_settings` if needed. It is shared by all hosting instances and survives restarts. The database user must be able to read and write this collection. Wrong passwords cannot create a key or enable editing.

`AUTH_SECRET` is optional. A configured value of at least 32 bytes takes precedence; otherwise the server uses the database key. To supply your own key, generate one with `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"`. Switching keys invalidates existing sessions, so sign in again after changing this setting. There is no built-in password or shared default key.

## Security migration

The previous version included exposed database credentials and a default admin password. Rotate the MongoDB user's credentials in your database provider, revoke the old credentials, and update your local and deployment environments. Removing a secret from source does not revoke it or remove it from Git history.

Legacy admin password records from before version 2 are intentionally rejected. Run `npm run db:password` with a new unique password to replace such a record with a version 2 PBKDF2-SHA512 hash. Do not reuse the former exposed default password.

Portfolio edits require an authenticated admin session. The `/api/seed` endpoint accepts authenticated `POST` requests only and replaces portfolio content with defaults; opening its URL with `GET` does not reset data. The local `npm run db:seed` script also replaces data and should only be used intentionally.

Run `npm run test:security` from `frontend` to check authentication and endpoint protection using an isolated database substitute. Run `npm run build` to verify the production build.
