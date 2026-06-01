const express = require('express');
const app = express();

app.use(express.static('.'));

app.get('/api/events', (req, res) => {
  res.json([
    { title: "Photography Walk", date: "2026-07-10", location: "Nørreport", category: "Photography" },
    { title: "Painting Evening", date: "2026-07-14", location: "Vesterbro", category: "Art" },
    { title: "Jazz Jam Session", date: "2026-07-18", location: "Christianshavn", category: "Music" },
    { title: "Knitting Meetup", date: "2026-07-20", location: "Frederiksberg", category: "Crafts" },
    { title: "Running for Beginners", date: "2026-07-22", location: "Fælledparken", category: "Sport" }
  ]);
});
app.use(express.json());

app.post('/api/events', (req, res) => {
  const { title, date, location, category } = req.body;
  const newEvent = { title, date, location, category };
  res.json(newEvent);
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));
