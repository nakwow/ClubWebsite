// =====================================================================
// server.js
// ---------------------------------------------------------------------
// This is the file you run to start the whole app:  node server.js
//
// It does three jobs:
//   1. Serves the front-end files (HTML/CSS/JS) that live in /public
//   2. Handles LOGIN (checking username + password, remembering that
//      you're logged in using a "session cookie")
//   3. Handles the API routes the front-end JavaScript calls with
//      fetch(), e.g. GET /api/clubs, POST /api/events, etc.
//
// WHERE THINGS ARE KEPT:
//   - The actual club/event/user data lives in the SQLite database
//     (see db.js and the clubs.db file it creates).
//   - This file only contains the "traffic rules" - which URL does
//     what - it doesn't store any data itself.
// =====================================================================

const path = require('path');
const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const db = require('./db'); // our database connection from db.js

const app = express();
const PORT = 3000;

// Lets the server understand JSON sent from the front-end (fetch calls)
app.use(express.json());

// ---------------------------------------------------------------------
// SESSIONS (this is how the server "remembers" you're logged in)
// ---------------------------------------------------------------------
// When someone logs in successfully, we store their user id in
// req.session.userId. Express gives their browser a cookie so that on
// every future request, we know who they are without asking for the
// password again.
app.use(session({
  secret: 'lancaster-clubs-portal-secret-change-me', // used to sign the cookie
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 8 // stay logged in for 8 hours
  }
}));

// This is "middleware" - a checkpoint function we can put in front of
// any route that should ONLY work if the person is logged in.
function requireLogin(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'You must be logged in to do that.' });
  }
  next(); // they're logged in, let the request continue
}

// Serves everything inside /public directly, e.g. /index.css, /app.js
app.use(express.static(path.join(__dirname, 'public')));

// =====================================================================
// AUTH ROUTES
// =====================================================================

// Log in: front-end sends { username, password }
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  if (!user) {
    return res.status(401).json({ error: 'Incorrect username or password.' });
  }

  // bcrypt.compareSync checks the typed password against the stored
  // scrambled (hashed) one, without ever un-scrambling it.
  const passwordMatches = bcrypt.compareSync(password, user.password_hash);
  if (!passwordMatches) {
    return res.status(401).json({ error: 'Incorrect username or password.' });
  }

  // Success! Remember this user in the session.
  req.session.userId = user.id;

  res.json({
    id: user.id,
    fullName: user.full_name,
    role: user.role,
    college: user.college
  });
});

// Log out: clears the session
app.post('/api/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ ok: true });
  });
});

// Ask "am I logged in, and if so, who am I?" - the front-end calls this
// when the page first loads to decide whether to show the login screen.
app.get('/api/me', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Not logged in.' });
  }
  const user = db.prepare(
    'SELECT id, full_name, role, college FROM users WHERE id = ?'
  ).get(req.session.userId);
  res.json({ id: user.id, fullName: user.full_name, role: user.role, college: user.college });
});

// Update the logged-in user's profile settings
app.put('/api/me', requireLogin, (req, res) => {
  const { fullName, college } = req.body;
  db.prepare('UPDATE users SET full_name = ?, college = ? WHERE id = ?')
    .run(fullName, college, req.session.userId);
  res.json({ ok: true });
});

// =====================================================================
// CLUB ROUTES
// =====================================================================

// Anyone can VIEW the clubs (no requireLogin needed)
app.get('/api/clubs', (req, res) => {
  const clubs = db.prepare('SELECT * FROM clubs ORDER BY name').all();
  res.json(clubs);
});

// Only logged-in board members can REGISTER a new club
app.post('/api/clubs', requireLogin, (req, res) => {
  const { name, category, description } = req.body;
  if (!name) return res.status(400).json({ error: 'Club name is required.' });

  const result = db.prepare(`
    INSERT INTO clubs (name, category, members, description)
    VALUES (?, ?, 0, ?)
  `).run(name, category || 'General', description || '');

  const newClub = db.prepare('SELECT * FROM clubs WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(newClub);
});

// Only logged-in board members can DELETE a club
app.delete('/api/clubs/:id', requireLogin, (req, res) => {
  db.prepare('DELETE FROM clubs WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

// =====================================================================
// EVENT ROUTES
// =====================================================================

// Anyone can view events. We also join in the club name so the
// front-end doesn't have to look it up separately.
app.get('/api/events', (req, res) => {
  const events = db.prepare(`
    SELECT events.id, events.title, events.date, events.location,
           clubs.id AS clubId, clubs.name AS clubName
    FROM events
    JOIN clubs ON clubs.id = events.club_id
    ORDER BY events.date ASC
  `).all();
  res.json(events);
});

// Only logged-in board members can register a new event
app.post('/api/events', requireLogin, (req, res) => {
  const { title, clubId, date, location } = req.body;
  if (!title || !clubId || !date || !location) {
    return res.status(400).json({ error: 'Title, club, date, and location are all required.' });
  }

  const result = db.prepare(`
    INSERT INTO events (title, club_id, date, location)
    VALUES (?, ?, ?, ?)
  `).run(title, clubId, date, location);

  const newEvent = db.prepare(`
    SELECT events.id, events.title, events.date, events.location,
           clubs.id AS clubId, clubs.name AS clubName
    FROM events JOIN clubs ON clubs.id = events.club_id
    WHERE events.id = ?
  `).get(result.lastInsertRowid);

  res.status(201).json(newEvent);
});

// Only logged-in board members can delete an event
app.delete('/api/events/:id', requireLogin, (req, res) => {
  db.prepare('DELETE FROM events WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

// =====================================================================
// ANNOUNCEMENT ROUTES
// =====================================================================

app.get('/api/announcements', (req, res) => {
  const announcements = db.prepare('SELECT * FROM announcements ORDER BY date DESC').all();
  res.json(announcements);
});

app.post('/api/announcements', requireLogin, (req, res) => {
  const { title, club, body } = req.body;
  if (!title || !body) return res.status(400).json({ error: 'Title and body are required.' });

  const today = new Date().toISOString().slice(0, 10); // 'YYYY-MM-DD'
  const result = db.prepare(`
    INSERT INTO announcements (title, club, body, date)
    VALUES (?, ?, ?, ?)
  `).run(title, club || 'Students\' Union', body, today);

  const newAnnouncement = db.prepare('SELECT * FROM announcements WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(newAnnouncement);
});

// =====================================================================
// START THE SERVER
// =====================================================================
app.listen(PORT, () => {
  console.log(`Lancaster Clubs Portal running at http://localhost:${PORT}`);
});
