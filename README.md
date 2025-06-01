# Monkey Sense

Practice your number sense skills!

https://monkeysense.me

---

# For Contributors

## Node.js setup

1. Install [Node.js](https://nodejs.org/en) (22+ is fine)
2. After cloning the repository, run `npm install`
3. Run `npm run dev` in the repo directory to start Next.js app \
    - For Windows users, ignore `'cp' is not recognized...`
    - Ignore other warnings when `cpfiles` copies files.
4. Run `npm run dev` in `backend/` to start WebSocket server for duels\

5. Update files in `backend/src/util` instead of `src/util` since they are copied over.

6. Only modify `backend/.env` files. Copy `.env.example` and rename to `.env`
    - For `AES_KEY` and `AES_IV`, run the given JavaScript snipplets. DM me for `CAPTCHA_SECRET_KEY`.

## PostgreSQL setup

Install [PostgreSQL 17](https://www.postgresql.org/download/)

Follow the [docs](https://www.postgresql.org/docs/current/tutorial-install.html) to set up a postgres user and familiarize with `psql`

1. Create a database by running `createdb -U <postgres-user> monkey-sense`
    - For example, `createdb -U postgres monkey-sense`
2. Inside the repo, run `psql -U <postgres-user> -d monkey-sense < db.sql`
    - For PS, run `Get-Content db.sql | psql -U <postgres-user> -d monkey-sense`