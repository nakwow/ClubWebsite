// =====================================================================
// db.js
// ---------------------------------------------------------------------
// This file is in charge of the DATABASE for the whole app.
//
// We are using "better-sqlite3", which stores everything in a single
// file called "clubs.db" that will appear in this folder the first
// time you run the app. You do NOT need to install MySQL, Postgres,
// or any separate database program - SQLite lives inside a normal file.
//
// This file does two jobs:
//   1. Opens (or creates) clubs.db
//   2. Creates the tables we need, if they don't already exist
//   3. Adds some starter ("seed") data so the app isn't empty the
//      first time you open it
//
// Every other file in the project (server.js) asks THIS file for
// the database connection, so this is the ONLY place that talks
// directly to clubs.db.
// =====================================================================

const path = require('path');
const bcrypt = require('bcryptjs');
const Database = require('better-sqlite3');

// This creates the file "clubs.db" in the project folder if it does not
// exist yet, and opens it if it does. Everything the app saves (clubs,
// events, announcements, user logins) lives inside this one file.
const dbPath = path.join(__dirname, 'clubs.db');
const db = new Database(dbPath);

// Turns on a safety setting that helps prevent the database from getting
// confused if two people use the app at the same time. Standard practice,
// you don't need to change this.
db.pragma('journal_mode = WAL');

// SQLite does not enforce foreign keys (the club_id link between events
// and clubs) unless we explicitly turn it on. With this on, deleting a
// club automatically deletes its events too (see "ON DELETE CASCADE"
// below), so you never end up with an event pointing at a club that no
// longer exists.
db.pragma('foreign_keys = ON');

// ---------------------------------------------------------------------
// TABLE CREATION
// "CREATE TABLE IF NOT EXISTS" means: only create it the first time.
// If the tables already exist (because you've run the app before),
// this does nothing and your data is safe.
// ---------------------------------------------------------------------

db.exec(`
  -- USERS table: holds login accounts for school board / society staff.
  -- Passwords are NEVER stored as plain text - only a scrambled
  -- ("hashed") version is stored, in the password_hash column.
  CREATE TABLE IF NOT EXISTS users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    username      TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name     TEXT NOT NULL,
    role          TEXT NOT NULL DEFAULT 'Board Member',
    college       TEXT NOT NULL DEFAULT 'Lancaster University'
  );

  -- CLUBS table: every society/club that the school board manages.
  CREATE TABLE IF NOT EXISTS clubs (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT NOT NULL,
    category    TEXT NOT NULL DEFAULT 'General',
    members     INTEGER NOT NULL DEFAULT 0,
    description TEXT NOT NULL DEFAULT ''
  );

  -- EVENTS table: things clubs are running. Linked to a club through
  -- club_id (a "foreign key" - it just means "this number refers to
  -- the id column of the clubs table above").
  CREATE TABLE IF NOT EXISTS events (
    id       INTEGER PRIMARY KEY AUTOINCREMENT,
    title    TEXT NOT NULL,
    club_id  INTEGER NOT NULL,
    date     TEXT NOT NULL,   -- stored as 'YYYY-MM-DD'
    location TEXT NOT NULL,
    FOREIGN KEY (club_id) REFERENCES clubs (id) ON DELETE CASCADE
  );

  -- ANNOUNCEMENTS table: notices posted by the board.
  CREATE TABLE IF NOT EXISTS announcements (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    title      TEXT NOT NULL,
    club       TEXT NOT NULL DEFAULT 'Students'' Union',
    body       TEXT NOT NULL,
    date       TEXT NOT NULL
  );
`);

// ---------------------------------------------------------------------
// SEED DATA
// This only runs the very first time, so we check "is the table
// empty?" before adding anything. That way running the app again
// later won't duplicate the starter data.
// ---------------------------------------------------------------------

function seedIfEmpty() {
  const userCount = db.prepare('SELECT COUNT(*) AS n FROM users').get().n;
  if (userCount === 0) {
    // Create one starter login account for a school board member.
    // IMPORTANT: change this password after your first login!
    // Username: admin   Password: lancaster123
    const hash = bcrypt.hashSync('lancaster123', 10);
    db.prepare(`
      INSERT INTO users (username, password_hash, full_name, role, college)
      VALUES (?, ?, ?, ?, ?)
    `).run('admin', hash, 'Nana Kwow', 'Students\' SRC member', 'Lancaster University');
  }

  const clubCount = db.prepare('SELECT COUNT(*) AS n FROM clubs').get().n;
  if (clubCount === 0) {
    const insertClub = db.prepare(`
      INSERT INTO clubs (name, category, members, description)
      VALUES (?, ?, ?, ?)
    `);
    const starterClubs = [
      
    ];
    for (const club of starterClubs) insertClub.run(...club);
  }

  const eventCount = db.prepare('SELECT COUNT(*) AS n FROM events').get().n;
  if (eventCount === 0) {
    const insertEvent = db.prepare(`
      INSERT INTO events (title, club_id, date, location)
      VALUES (?, ?, ?, ?)
    `);
    
  }

  const announcementCount = db.prepare('SELECT COUNT(*) AS n FROM announcements').get().n;
  if (announcementCount === 0) {
    const insertAnnouncement = db.prepare(`
      INSERT INTO announcements (title, club, body, date)
      VALUES (?, ?, ?, ?)
    `);
    insertAnnouncement.run(
      
    );
    insertAnnouncement.run(
      
    );
  }
}

seedIfEmpty();

// Other files (server.js) will do: const db = require('./db');
// and then use db.prepare(...) to run their own SQL queries.
module.exports = db;
