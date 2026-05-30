const express = require('express');
const app = express();

app.use(express.static('.'));

app.get('/api/events', (req, res) => {
  res.json([{ title: "Test event", date: "2026-06-01", location: "Copenhagen" }]);
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));