let authMode = 'login';
let currentUser = null;

function openLoginModal() {
  authMode = 'login';
  document.getElementById('modal-title').textContent = 'Login';
  document.getElementById('auth-modal').classList.add('open');
  document.getElementById('modal-overlay').classList.add('open');
  toggleMenu();
}


function closeModal() {
  document.getElementById('auth-modal').classList.remove('open');
  document.getElementById('modal-overlay').classList.remove('open');
}

function switchMode() {
  if (authMode === 'login') {
    authMode = 'signup';
    document.getElementById('modal-title').textContent = 'Sign up';
  } else {
    authMode = 'login';
    document.getElementById('modal-title').textContent = 'Login';
  }
}

function submitAuth() {
  const username = document.getElementById('auth-username').value;
  const password = document.getElementById('auth-password').value;
  const url = authMode === 'login' ? '/api/login' : '/api/signup';

  fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      closeModal();
      showProfile(data.username);
    } else {
      document.getElementById('auth-error').textContent = data.message;
    }
  });
}

function showProfile(username) {
    currentUser = username;
    localStorage.setItem('currentUser', username);
  document.getElementById('profile-icon').style.display = 'flex';
  document.getElementById('profile-initial').textContent = username[0].toUpperCase();
  document.getElementById('profile-username').textContent = username;
}

function toggleProfileMenu() {
  const menu = document.getElementById('profile-menu');
  menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
}

function logout() {
    currentUser = null;
  localStorage.removeItem('currentUser');
  document.getElementById('profile-icon').style.display = 'none';
  document.getElementById('profile-menu').style.display = 'none';
}

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
  const description = document.getElementById('input-description').value;

  if (!title || !date || !location || !category) {
    alert('Please fill in all fields!');
    return;
  }

  fetch('/api/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, date, location, category, description, creator: currentUser })
  })
  .then(res => res.json())
  .then(newEvent => {
    addEventCard(newEvent);
    toggleForm();
    document.getElementById('input-title').value = '';
    document.getElementById('input-date').value = '';
    document.getElementById('input-location').value = '';
    document.getElementById('input-category').value = '';
    document.getElementById('input-description').value = '';
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
      <p><strong>Description:</strong> ${event.description}</p>
      <span class="badge"> ${event.category}</span>
      ${event.creator ? `<p style="font-size:12px; color:#639922; margin-top:8px;"> Created by ${event.creator}</p>` : ''}
    </div>
  `;
  card.onclick = () => window.location.href = '/event.html?id=' + event.id;
  container.appendChild(card);
}

fetch('/api/events')
  .then(res => res.json())
  .then(events => {
    events.forEach(event => addEventCard(event));
  });
  const savedUser = localStorage.getItem('currentUser');
if (savedUser) {
  showProfile(savedUser);
}