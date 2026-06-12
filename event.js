//Read the event ID from URL and gets the login user from storage
const params = new URLSearchParams(window.location.search);
const id = params.get('id');
const currentUser = localStorage.getItem('currentUser');
// Fetch the event data from the API using the ID from the URL
fetch('/api/events/' + id)
  .then(res => res.json())
  .then(event => {
    document.title = event.title;
    //Check if the logged in user is the one who created this event
    const isMyEvent = currentUser && currentUser === event.creator;
//Builds the event detail in HTML
    document.getElementById('event-detail').innerHTML = `
      <div class="event-hero" style="background-image: url('https://source.unsplash.com/800x300/?${encodeURIComponent(event.category)}')"></div>
      <div class="event-content">
        <h1>${event.title}</h1>
        <p><strong>Date:</strong> ${event.date.split('-').reverse().join('-')}</p>
        <p> <strong>Location:</strong> ${event.location}</p>
        <p> <strong>Category:</strong> ${event.category}</p>
        <p>${event.description || ''}</p>
        ${event.creator ? `<p> <strong>Created by:</strong> ${event.creator}</p>` : ''}
        <p id="participant-count"> Loading...</p>
        ${isMyEvent ? `<button class="delete-btn" onclick="deleteEvent(${event.id})">🗑️ Delete event</button>` : ''}
        ${!isMyEvent && currentUser ? `<button class="join-btn" id="join-btn" onclick="toggleJoin(${event.id})">Join Event</button>` : ''}
      </div>
    `;
//Fetch the participant list to show how many people have joined and if the current user has already joined or not
   fetch('/api/events/' + id + '/participants')
  .then(res => res.json())
  .then(participants => {
    document.getElementById('participant-count').textContent =
      ' ' + participants.length + (participants.length === 1 ? ' person joined' : ' people joined');
//If the current user has already joined, switch the button to "Leave Event"
    const btn = document.getElementById('join-btn');
    if (btn) {
      const joined = participants.some(p => p.username === currentUser);
      if (joined) {
        btn.textContent = 'Leave Event';
        btn.classList.add('joined');
      }
    }
  });
  });
//Function to toggle join/leave event when the button is clicked
function toggleJoin(eventId) {
  //First fetch current participants to check if the user has already joined
  fetch('/api/events/' + eventId + '/participants')
    .then(res => res.json())
    .then(participants => {
      const joined = participants.some(p => p.username === currentUser);
      if (joined) {
        //If already joined, send DELETE request to leave the event
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
        //If not joined, send POST request to join the event
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
//Function to delete the event, only visible to the person who created the event
function deleteEvent(id) {
  if (confirm('Are you sure you want to delete this event?')) {
    fetch('/api/events/' + id, { method: 'DELETE' })
      .then(res => res.json())
      .then(() => {
        window.location.href = '/';
      });
  }
}