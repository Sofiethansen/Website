function toggleMenu() {
  document.getElementById('sidebar').classList.toggle('open');
  document.getElementById('overlay').classList.toggle('open');
}
function toggleForm() {
  const form = document.getElementById('create-form');
  form.style.display = form.style.display === 'block' ? 'none' : 'block';
}

function submitEvent() {
  const title = document.getElementById('input-title').value;
  const date = document.getElementById('input-date').value;
  const location = document.getElementById('input-location').value;
  const category = document.getElementById('input-category').value;

  if (!title || !date || !location || !category) {
    alert('Please fill in all fields!');
    return;
  }

  fetch('/api/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, date, location, category })
  })
  .then(res => res.json())
  .then(newEvent => {
    addEventCard(newEvent);
    toggleForm();
    document.getElementById('input-title').value = '';
    document.getElementById('input-date').value = '';
    document.getElementById('input-location').value = '';
    document.getElementById('input-category').value = '';
  });
}
function addEventCard(event) {
  const container = document.getElementById('events-container');
  const card = document.createElement('div');
  card.className = 'event-card';
  card.innerHTML = `
    <div class="card-header">
      <h2>${event.title}</h2>
    </div>
    <div class="card-body">
      <p><strong>Date:</strong> ${event.date.split('-').reverse().join('-')}</p>
      <p><strong>Location:</strong> ${event.location}</p>
      <span class="badge">🎨 ${event.category}</span>
    </div>
  `;
  container.appendChild(card);
}

fetch('/api/events')
  .then(res => res.json())
  .then(events => {
    events.forEach(event => addEventCard(event));
  });