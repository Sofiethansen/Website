const express = require('express');
const Database = require('better-sqlite3');
const app = express();

app.use(express.static('.'));
app.use(express.json());

const db = new Database('database.db');

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
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
  )
`);
const count = db.prepare('SELECT COUNT(*) as count FROM events').get();
if (count.count === 0) {
  const insert = db.prepare('INSERT INTO events (title, date, location, category, description, creator) VALUES (?, ?, ?, ?, ?, ?)');
  insert.run('Photography Walk', '2026-07-05', 'Nørreport', 'Photography', '', '');
  insert.run('Painting Evening', '2026-07-09', 'Vesterbro', 'Art', '', '');
  insert.run('Jazz Jam Session', '2026-07-13', 'Christianshavn', 'Music', '', '');
  insert.run('Knitting Meetup', '2026-07-18', 'Frederiksberg', 'Crafts', '','');
  insert.run('Running for Beginners', '2026-07-22', 'Fælledparken', 'Sport', '', '');
}

app.get('/api/events', (req, res) => {
  const events = db.prepare('SELECT * FROM events').all();
  res.json(events);
});

app.post('/api/events', (req, res) => {
  const { title, date, location, category, description, creator } = req.body;
  const stmt = db.prepare('INSERT INTO events (title, date, location, category, description, creator) VALUES (?, ?, ?, ?, ?, ?)');
  const result = stmt.run(title, date, location, category, description, creator);
  const newEvent = { id: result.lastInsertRowid, title, date, location, category, description, creator };
  res.json(newEvent);
});
app.post('/api/signup', (req, res) => {
  const { username, password } = req.body;
  try {
    const stmt = db.prepare('INSERT INTO users (username, password) VALUES (?, ?)');
    const result = stmt.run(username, password);
    res.json({ success: true, username });
  } catch (err) {
    res.json({ success: false, message: 'Username already taken!' });
  }
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE username = ? AND password = ?').get(username, password);
  if (user) {
    res.json({ success: true, username: user.username });
  } else {
    res.json({ success: false, message: 'Wrong username or password!' });
  }
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));