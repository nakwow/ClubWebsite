# Lancaster University Clubs & Societies Portal

A small web app for a Students' Union / school board member to log in,
register clubs, and keep track of their events (dates + locations).

It's built with:
- **Node.js + Express** – the web server
- **SQLite** (via `better-sqlite3`) – the database, stored as one file (`clubs.db`)
- **express-session** + **bcryptjs** – login sessions and password security
- Plain HTML/CSS/JavaScript on the front end (no frameworks) so the code
  stays easy to read

Everything is written and commented for someone new to web development.
Every file starts with a comment block explaining what it's for and
**where data is kept**.

---

## 1. Install Node.js

You need Node.js installed on your computer (this includes `npm`, which
installs packages for you).

1. Go to https://nodejs.org
2. Download the **LTS** version for your operating system and install it
   like any normal program.
3. To check it worked, open a terminal (Command Prompt/PowerShell on
   Windows, Terminal on Mac) and type:
   ```
   node -v
   npm -v
   ```
   You should see version numbers, e.g. `v22.x.x` and `10.x.x`.

## 2. Get the project onto your computer

Unzip the project folder you downloaded (`lancaster-clubs-portal`)
somewhere easy to find, e.g. your Desktop.

## 3. Install the project's dependencies

In your terminal, move into the project folder and install the packages
listed in `package.json` (Express, better-sqlite3, etc.):

```
cd path/to/lancaster-clubs-portal
npm install
```

This creates a `node_modules` folder — that's normal, it's just where
npm keeps the packages. You don't need to open it.

> If `npm install` fails on `better-sqlite3` with an error mentioning a
> compiler, it usually means your computer is missing "build tools".
> - **Windows:** run `npm install --global windows-build-tools` in an
>   Administrator PowerShell, then try `npm install` again.
> - **Mac:** run `xcode-select --install`, then try again.
> - **Linux:** run `sudo apt-get install build-essential python3`, then
>   try again.

## 4. Start the server

Still inside the project folder, run:

```
npm start
```

You should see:

```
Lancaster Clubs Portal running at http://localhost:3000
```

The very first time you run this, a new file called `clubs.db` appears
in the project folder — this is your database. It's created
automatically and filled with some starter clubs/events so the app
isn't empty (see "Starter login" below).

## 5. Open the app

Open a web browser and go to:

```
http://localhost:3000
```

You'll land on the login page.

### Starter login

```
Username: admin
Password: lancaster123
```

**Change this password** once you're comfortable editing the code (see
"Changing the starter password" below) — it's only meant to get you
started.

## 6. Stopping the server

Go back to the terminal window where it's running and press `Ctrl + C`.

## 7. Using the app again later

You don't need to repeat steps 3-4 every time — just run `npm start`
from inside the project folder. Your data (clubs, events,
announcements, your login) is saved in `clubs.db` and will still be
there.

---

## Where everything is kept (a map of the project)

```
lancaster-clubs-portal/
├── server.js         <- Starts the web server & defines every URL/API route
├── db.js             <- Creates clubs.db and its tables, adds starter data
├── clubs.db          <- (created automatically) the actual database file
├── package.json      <- Lists which packages the project needs
└── public/            <- Everything sent to the browser
    ├── login.html     <- The login screen
    ├── index.html     <- The main dashboard page (skeleton only)
    ├── style.css       <- All the visual styling
    └── app.js          <- Front-end logic: fetches data from the server
                           and builds the pages, handles clicks & forms
```

**Rule of thumb:** if it's about *storing or checking* data (passwords,
clubs, events), it happens in `server.js`/`db.js` on the server. If
it's about *displaying* data or reacting to a click, it happens in
`public/app.js` in the browser. The browser never talks to the
database directly — it always goes through `server.js`'s API routes
(`/api/...`).

## How login works (in plain terms)

1. You type a username/password into `login.html` and hit "Log In".
2. The browser sends that to the server at `/api/login`.
3. The server looks up the username in the `users` table (inside
   `clubs.db`) and checks the password against the scrambled
   ("hashed") version stored there — the real password is never saved
   anywhere.
4. If it matches, the server remembers you're logged in using a
   "session cookie" your browser holds onto, so you don't have to log
   in again on every page.
5. Any action that changes data (registering a club/event, posting an
   announcement, deleting something) checks that cookie first. If
   you're not logged in, the server refuses.

## Adding a second login account

Board members can't currently sign up through the app itself (kept
simple on purpose). To add another account, open a terminal in the
project folder and run:

```
node
```

Then, inside the Node prompt that opens, paste this (edit the values
first):

```js
const db = require('./db');
const bcrypt = require('bcryptjs');
db.prepare(`
  INSERT INTO users (username, password_hash, full_name, role, college)
  VALUES (?, ?, ?, ?, ?)
`).run('jane', bcrypt.hashSync('choose-a-password', 10), 'Jane Smith', 'Board Member', 'Lancaster University');
```

Then type `.exit` to leave.

## Changing the starter password

Simplest way: log in as `admin` / `lancaster123`, then run the same
steps as above but with `UPDATE` instead of `INSERT`:

```js
const db = require('./db');
const bcrypt = require('bcryptjs');
db.prepare('UPDATE users SET password_hash = ? WHERE username = ?')
  .run(bcrypt.hashSync('your-new-password', 10), 'admin');
```

## Starting over with a blank database

Stop the server, delete `clubs.db` (and `clubs.db-shm` / `clubs.db-wal`
if present), and start the server again — a fresh one will be created
with the starter data.

## Notes on this being a "learning" project

A few things were kept deliberately simple so the code stays readable,
and you'd want to change them before using this for anything beyond a
class project or local testing:

- Sessions are stored in the server's memory, so everyone gets logged
  out if the server restarts.
- There's no "forgot password" or self-service sign-up flow.
- The session secret in `server.js` (`'lancaster-clubs-portal-secret-change-me'`)
  should be changed to something random if this is ever put online.
