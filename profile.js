const currentUser = localStorage.getItem('currentUser');

if (!currentUser) {
  alert('Please log in first!');
  window.location.href = '/';
}

document.getElementById('profile-page-initial').textContent = currentUser[0].toUpperCase();
document.getElementById('profile-page-username').textContent = currentUser;
document.getElementById('edit-username').value = currentUser;

fetch('/api/users/' + currentUser)
  .then(res => res.json())
  .then(user => {
    if (user.email) document.getElementById('edit-email').value = user.email;
    if (user.phone) document.getElementById('edit-phone').value = user.phone;
  });

function saveProfile() {
  const newUsername = document.getElementById('edit-username').value;
  const email = document.getElementById('edit-email').value;
  const phone = document.getElementById('edit-phone').value;

  fetch('/api/users/' + currentUser, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ newUsername, email, phone })
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      localStorage.setItem('currentUser', newUsername);
      document.getElementById('profile-page-username').textContent = newUsername;
      document.getElementById('profile-page-initial').textContent = newUsername[0].toUpperCase();
      document.getElementById('profile-msg').textContent = 'Profile updated!';
    } else {
      document.getElementById('profile-msg').style.color = 'red';
      document.getElementById('profile-msg').textContent = data.message;
    }
  });
}