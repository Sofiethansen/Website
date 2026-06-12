const express = require('express');
const Database = require('better-sqlite3');
const app = express();
//Serve static files from the current directory and parse JSON request bodies
app.use(express.static('.'));
//Parse JSON request bodies for API endpoints
app.use(express.json());
//Initialize the SQLite database and create tables if they don't exist
const db = new Database('database.db');
//Create the "events" table to store event information
db.exec(`
  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    date TEXT,
    location TEXT,
    category TEXT,
    description TEXT,
    creator TEXT
  )
`);
//Create the "users" table to store user information
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
  )
`);
//If the "events" table is empty, insert some sample events to populate the page
const count = db.prepare('SELECT COUNT(*) as count FROM events').get();
if (count.count === 0) {
  const insert = db.prepare('INSERT INTO events (title, date, location, category, description, creator) VALUES (?, ?, ?, ?, ?, ?)');
  insert.run('Photography Walk', '2026-07-05', 'Nørreport', 'Photography', '', '');
  insert.run('Painting Evening', '2026-07-09', 'Vesterbro', 'Art', '', '');
  insert.run('Jazz Jam Session', '2026-07-13', 'Christianshavn', 'Music', '', '');
  insert.run('Knitting Meetup', '2026-07-18', 'Frederiksberg', 'Crafts', '','');
  insert.run('Running for Beginners', '2026-07-22', 'Fælledparken', 'Sport', '', '');
}
//GET /api/events endpoint to fetch all events with their participant count
app.get('/api/events', (req, res) => {
  const events = db.prepare(`
    SELECT events.*, COUNT(participants.id) as participant_count 
    FROM events 
    LEFT JOIN participants ON events.id = participants.event_id
    GROUP BY events.id
  `).all();
  res.json(events);
});
//POST /api/events endpoint to create a new event with the provided data
app.post('/api/events', (req, res) => {
  const { title, date, location, category, description, creator } = req.body;
  const stmt = db.prepare('INSERT INTO events (title, date, location, category, description, creator) VALUES (?, ?, ?, ?, ?, ?)');
  const result = stmt.run(title, date, location, category, description, creator);
  const newEvent = { id: result.lastInsertRowid, title, date, location, category, description, creator };
  res.json(newEvent);
});
//POST /api/signup register a new user -  fails if username is already taken
app.post('/api/signup', (req, res) => {
  const { username, password } = req.body;
  try {
    const stmt = db.prepare('INSERT INTO users (username, password) VALUES (?, ?)');
    const result = stmt.run(username, password);
    res.json({ success: true, username });
  } catch (err) {
    //If the error is due to a UNIQUE constraint violation, it means the username is already taken
    res.json({ success: false, message: 'Username already taken!' });
  }
});
//POST /api/login check if the provided username and password match a user in the database
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE username = ? AND password = ?').get(username, password);
  if (user) {
    res.json({ success: true, username: user.username });
  } else {
    res.json({ success: false, message: 'Wrong username or password!' });
  }
});
//GET /api/events/:id to fetch details of a specific event by its ID
app.get('/api/events/:id', (req, res) => {
  const event = db.prepare('SELECT * FROM events WHERE id = ?').get(req.params.id);
  res.json(event);
});
//DELETE /api/events/:id to delete an event by its ID
app.delete('/api/events/:id', (req, res) => {
  db.prepare('DELETE FROM events WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});
//Create the "participants" table to store which users have joined which events, with a UNIQUE constraint to prevent duplicate entries
db.exec(`
  CREATE TABLE IF NOT EXISTS participants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id INTEGER,
    username TEXT,
    UNIQUE(event_id, username)
  )
`);
//POST /api/events/:id/join to add a participant to an event, fails if the user has already joined
app.post('/api/events/:id/join', (req, res) => {
  const { username } = req.body;
  try {
    db.prepare('INSERT INTO participants (event_id, username) VALUES (?, ?)').run(req.params.id, username);
    res.json({ success: true });
  } catch {
    //If the UNIQUE constraint is violated, it means the user has already joined this event
    res.json({ success: false, message: 'Already joined!' });
  }
});
//GET /api/events/:id/participants to fetch the list of participants for a specific event
app.get('/api/events/:id/participants', (req, res) => {
  const participants = db.prepare('SELECT username FROM participants WHERE event_id = ?').all(req.params.id);
  res.json(participants);
});
//GET /api/users/:username/joined - return all events a user has joined
app.get('/api/users/:username/joined', (req, res) => {
  const events = db.prepare(`
    SELECT events.* FROM events
    JOIN participants ON events.id = participants.event_id
    WHERE participants.username = ?
  `).all(req.params.username);
  res.json(events);
});
//DELETE /api/events/:id/join to remove a participant from an event
app.delete('/api/events/:id/join', (req, res) => {
  const { username } = req.body;
  db.prepare('DELETE FROM participants WHERE event_id = ? AND username = ?').run(req.params.id, username);
  res.json({ success: true });
});
//Extend the "users" table to include email and phone number fields for the profile page
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    email TEXT,
    phone TEXT
  )
`);
//GET /api/users/:username fetch a user's profile (excluding password)
app.get('/api/users/:username', (req, res) => {
  try {
    const user = db.prepare('SELECT username, email, phone FROM users WHERE username = ?').get(req.params.username);
    res.json(user || {});
  } catch (err) {
    console.error(err);
    res.json({});
  }
});
//PUT /api/users/:username update a user's username, email and phonenumber
app.put('/api/users/:username', (req, res) => {
  const { newUsername, email, phone } = req.body;
  try {
    db.prepare('UPDATE users SET username = ?, email = ?, phone = ? WHERE username = ?').run(newUsername, email, phone, req.params.username);
    res.json({ success: true });
  } catch (err) {
    if (newUsername !== req.params.username) {
      res.json({ success: false, message: 'Username already taken!' });
    } else {
      res.json({ success: false, message: 'Something went wrong!' });
    }
  }
});
//Run the server
app.listen(3000, () => console.log('Server running on http://localhost:3000'));