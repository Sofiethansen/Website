const params = new URLSearchParams(window.location.search);
const id = params.get('id');

fetch('/api/events/' + id)
  .then(res => res.json())
  .then(event => {
    document.title = event.title;
    document.getElementById('event-detail').innerHTML = `
      <h1>${event.title}</h1>
      <p>📅 <strong>Date:</strong> ${event.date.split('-').reverse().join('-')}</p>
      <p>📍 <strong>Location:</strong> ${event.location}</p>
      <p>🎨 <strong>Category:</strong> ${event.category}</p>
      <p>${event.description || ''}</p>
      ${event.creator ? `<p>👤 <strong>Created by:</strong> ${event.creator}</p>` : ''}
    `;
  });