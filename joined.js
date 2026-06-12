//get the current logged in user from local storage
const currentUser = localStorage.getItem('currentUser');
//If no user is logged in, alert and redirect to the main page
if (!currentUser) {
  alert('Please log in to see your joined events!');
  window.location.href = '/';
}
//Fetch the events the user has joined from the server and display them
fetch('/api/users/' + currentUser + '/joined')
  .then(res => res.json())
  .then(events => {
    const container = document.getElementById('joined-events-container');
    //If the user has not joined any events, show a message
    if (events.length === 0) {
      container.innerHTML = '<p style="color:#639922; margin-top:20px;">You have not joined any events yet!</p>';
      return;
    }
    //For each joined event, create a card element and display the event details
    events.forEach(event => {
      const card = document.createElement('div');
      card.className = 'event-card';
      card.style.marginBottom = '16px';
      card.innerHTML = `
        <div class="card-header">
          <h2>${event.title}</h2>
        </div>
        <div class="card-body">
          <p> <strong>Date:</strong> ${event.date.split('-').reverse().join('-')}</p>
          <p> <strong>Location:</strong> ${event.location}</p>
          <span class="badge">🎨 ${event.category}</span>
          <button class="unjoin-btn" onclick="unjoinEvent(event, ${event.id}, this)">Leave Event</button>
        </div>
      `;
      //When the card header is clicked, navigate to the event detail page for that event
      card.querySelector('.card-header').onclick = () => window.location.href = '/event.html?id=' + event.id;
      container.appendChild(card);
    });
  });

function unjoinEvent(e, eventId, btn) {
  //Prevent the card header click from also firing when the button is clicked
  e.stopPropagation();
  if (confirm('Are you sure you want to leave this event?')) {
    //Send delete request to remove the user from the event's participants
    fetch('/api/events/' + eventId + '/join', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: currentUser })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        //If successful, remove the event card from the page
        btn.closest('.event-card').remove();
        //If there are no more joined events, show the message
        const container = document.getElementById('joined-events-container');
        if (container.children.length === 0) {
          container.innerHTML = '<p style="color:#639922; margin-top:20px;">You have not joined any events yet!</p>';
        }
      }
    });
  }
}