const express = require('express');
const app = express();

app.use(express.static('.'));

app.get('/api/events', (req, res) => {
  res.json([
    { title: "Photography Walk", date: "2026-06-10", location: "Nørreport", category: "Photography" },
    { title: "Painting Evening", date: "2026-06-14", location: "Vesterbro", category: "Art" },
    { title: "Jazz Jam Session", date: "2026-06-18", location: "Christianshavn", category: "Music" },
    { title: "Knitting Meetup", date: "2026-06-20", location: "Frederiksberg", category: "Crafts" },
    { title: "Running for Beginners", date: "2026-06-22", location: "Fælledparken", category: "Sport" }
  ]);
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));
