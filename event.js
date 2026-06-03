const params = new URLSearchParams(window.location.search);
const id = params.get('id');
const currentUser = localStorage.getItem('currentUser');

fetch('/api/events/' + id)
  .then(res => res.json())
  .then(event => {
    document.title = event.title;
    const isMyEvent = currentUser && currentUser === event.creator;

    document.getElementById('event-detail').innerHTML = `
      <div class="event-hero" style="background-image: url('https://source.unsplash.com/800x300/?${encodeURIComponent(event.category)}')"></div>
      <div class="event-content">
        <h1>${event.title}</h1>
        <p>📅 <strong>Date:</strong> ${event.date.split('-').reverse().join('-')}</p>
        <p>📍 <strong>Location:</strong> ${event.location}</p>
        <p>🎨 <strong>Category:</strong> ${event.category}</p>
        <p>${event.description || ''}</p>
        ${event.creator ? `<p>👤 <strong>Created by:</strong> ${event.creator}</p>` : ''}
        ${isMyEvent ? `<button class="delete-btn" onclick="deleteEvent(${event.id})">🗑️ Delete event</button>` : ''}
        ${!isMyEvent && currentUser ? `<button class="join-btn" id="join-btn" onclick="toggleJoin(${event.id})">Join Event</button>` : ''}
      </div>
    `;

    if (!isMyEvent && currentUser) {
      fetch('/api/events/' + id + '/participants')
        .then(res => res.json())
        .then(participants => {
          const joined = participants.some(p => p.username === currentUser);
          const btn = document.getElementById('join-btn');
          if (btn && joined) {
            btn.textContent = 'Leave Event';
            btn.classList.add('joined');
          }
        });
    }
  });

function toggleJoin(eventId) {
  fetch('/api/events/' + eventId + '/participants')
    .then(res => res.json())
    .then(participants => {
      const joined = participants.some(p => p.username === currentUser);
      if (joined) {
        fetch('/api/events/' + eventId + '/join', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: currentUser })
        })
        .then(res => res.json())
        .then(() => {
          const btn = document.getElementById('join-btn');
          btn.textContent = 'Join Event';
          btn.classList.remove('joined');
        });
      } else {
        fetch('/api/events/' + eventId + '/join', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: currentUser })
        })
        .then(res => res.json())
        .then(() => {
          const btn = document.getElementById('join-btn');
          btn.textContent = 'Leave Event';
          btn.classList.add('joined');
        });
      }
    });
}

function deleteEvent(id) {
  if (confirm('Are you sure you want to delete this event?')) {
    fetch('/api/events/' + id, { method: 'DELETE' })
      .then(res => res.json())
      .then(() => {
        window.location.href = '/';
      });
  }
}