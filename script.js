fetch('/api/events')
  .then(res => res.json())
  .then(events => {
    const container = document.getElementById('events-container');
    events.forEach(event => {
      const card = document.createElement('div');
      card.className = 'event-card';
      card.innerHTML = `
        <div class="card-header">
          <h2>${event.title}</h2>
        </div>
        <div class="card-body">
          <p>📅 ${event.date}</p>
          <p>📍 ${event.location}</p>
          <span class="badge">🎨 ${event.category}</span>
        </div>
      `;
      container.appendChild(card);
    });
  });