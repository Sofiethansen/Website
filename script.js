//Track auth mode (login or signup) and the currently logged in user
let authMode = 'login';
let currentUser = null;

//Open the login modal and reset it to login mode
function openLoginModal() {
  authMode = 'login';
  document.getElementById('modal-title').textContent = 'Login';
  document.getElementById('auth-modal').classList.add('open');
  document.getElementById('modal-overlay').classList.add('open');
  toggleMenu();
}

//Close the login/signup modal by removing the 'open' class
function closeModal() {
  document.getElementById('auth-modal').classList.remove('open');
  document.getElementById('modal-overlay').classList.remove('open');
}
//Toggle between login and signup mode inside the modal
function switchMode() {
  if (authMode === 'login') {
    authMode = 'signup';
    document.getElementById('modal-title').textContent = 'Sign up';
  } else {
    authMode = 'login';
    document.getElementById('modal-title').textContent = 'Login';
  }
}
//Handle form submission for both login and signup
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
      //If login/signup successful, save the username and update the profile display
      showProfile(data.username);
    } else {
      document.getElementById('auth-error').textContent = data.message;
    }
  });
}
//Show the profile icon and store the logged-in user in localStorage
function showProfile(username) {
    currentUser = username;
    localStorage.setItem('currentUser', username);
  document.getElementById('profile-icon').style.display = 'inline-flex';
  //Update the profile menu with the user's initial and username
  document.getElementById('profile-initial').textContent = username[0].toUpperCase();
  document.getElementById('profile-username').textContent = username;
}
//Toggle the profile dropdown menu open or closed
function toggleProfileMenu() {
  const menu = document.getElementById('profile-menu');
  menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
}
//Clear the current user from memory and localStorage, and hide the profile icon
function logout() {
    currentUser = null;
  localStorage.removeItem('currentUser');
  document.getElementById('profile-icon').style.display = 'none';
  document.getElementById('profile-menu').style.display = 'none';
}
//Toggle the sidebar and its dark background overlay open or closed
function toggleMenu() {
  document.getElementById('sidebar').classList.toggle('open');
  document.getElementById('overlay').classList.toggle('open');
}
//Show or hide the create event form when the "Create Event" button is clicked
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
//Validate that all required fields are filled in before submitting
  if (!title || !date || !location || !category) {
    alert('Please fill in all fields!');
    return;
  }
//Send a POST request to the server to create a new event with the form data and the current user as the creator
  fetch('/api/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, date, location, category, description, creator: currentUser })
  })
  .then(res => res.json())
  .then(newEvent => {
    //If successful, add the new event to the page and reset the form
    addEventCard(newEvent);
    toggleForm();
    document.getElementById('input-title').value = '';
    document.getElementById('input-date').value = '';
    document.getElementById('input-location').value = '';
    document.getElementById('input-category').value = '';
    document.getElementById('input-description').value = '';
  });
}
//Build an event card into either "My Events" or "All Events"
function addEventCard(event) {
  const currentUser = localStorage.getItem('currentUser');
  //Check if the event belongs to the current user to determine which section to add it to and whether to show the delete button
  const isMyEvent = currentUser && event.creator === currentUser;
  const container = document.getElementById(isMyEvent ? 'my-events-container' : 'events-container');
  const card = document.createElement('div');
  card.className = 'event-card';
  card.innerHTML = `
    <div class="card-header">
      <h2>${event.title}</h2>
    </div>
    <div class="card-body">
      <p> <strong>Date:</strong> ${event.date.split('-').reverse().join('-')}</p>
      <p> <strong>Location:</strong> ${event.location}</p>
      <span class="badge"> ${event.category}</span>
      <p style="font-size:13px; color:#639922; margin-top:8px;"> ${event.participant_count} ${event.participant_count === 1 ? 'person' : 'people'} joined</p>
      ${event.creator ? `<p style="font-size:12px; color:#639922; margin-top:8px;">👤 Created by ${event.creator}</p>` : ''}
    </div>
  `;
  //When the card header is clicked, navigate to the event detail page for that event
  card.querySelector('.card-header').onclick = () => window.location.href = '/event.html?id=' + event.id;
  container.appendChild(card);
  }
//Fetch all events from the server when the page loads and display them
fetch('/api/events')
  .then(res => res.json())
  .then(events => {
    events.forEach(event => addEventCard(event));
  });
  //When the page loads, check if there is a logged-in user saved in localStorage and show their profile if so
  const savedUser = localStorage.getItem('currentUser');
if (savedUser) {
  showProfile(savedUser);
}
//Show the joined events panel in the sidebar
function showMyJoinedEvents() {
  const currentUser = localStorage.getItem('currentUser');
  if (!currentUser) {
    alert('log in to see your joined events!');
    return;
  }

  toggleMenu();

  const panel = document.getElementById('joined-events-panel');
  const container = document.getElementById('joined-events-container');
  panel.style.display = 'block';
  container.innerHTML = '<p>Loading...</p>';

  fetch('/api/users/' + currentUser + '/joined')
    .then(res => res.json())
    .then(events => {
      if (events.length === 0) {
        container.innerHTML = '<p style="color:#639922;">You have not joined any events yet!</p>';
        return;
      }
      container.innerHTML = '';
      events.forEach(event => {
        const card = document.createElement('div');
        card.className = 'event-card';
        card.style.marginBottom = '16px';
        card.innerHTML = `
          <div class="card-header">
            <h2>${event.title}</h2>
          </div>
          <div class="card-body">
            <p><strong>Date:</strong> ${event.date.split('-').reverse().join('-')}</p>
            <p><strong>Location:</strong> ${event.location}</p>
            <span class="badge">${event.category}</span>
          </div>
        `;
        card.onclick = () => window.location.href = '/event.html?id=' + event.id;
        container.appendChild(card);
      });
    });''
}
//Filter the "All Events" list by search text and/or category in real time
function filterEvents() {
  const search = document.getElementById('search-input').value.toLowerCase();
  const category = document.getElementById('category-filter').value.toLowerCase();
  const cards = document.querySelectorAll('#events-container .event-card');

  cards.forEach(card => {
    const title = card.querySelector('h2').textContent.toLowerCase();
    const badge = card.querySelector('.badge').textContent.toLowerCase();
    const matchesSearch = title.includes(search);
    const matchesCategory = category === '' || badge.includes(category);
    //Show the card if it matches both the search text and the selected category, otherwise hide it
    card.style.display = matchesSearch && matchesCategory ? 'block' : 'none';
  });
}