//get the current logged in user from local storage
const currentUser = localStorage.getItem('currentUser');
//If no user is logged in, alert and redirect to the main page
if (!currentUser) {
  alert('Please log in first!');
  window.location.href = '/';
}
//Fetch the user's profile information from the server and display it on the page
document.getElementById('profile-page-initial').textContent = currentUser[0].toUpperCase();
//Due to errors, the code will not safe the changes
//Claude.ai were used to write the function, but it is not working as intended and will not update the profile information
document.getElementById('profile-page-username').textContent = currentUser;
document.getElementById('edit-username').value = currentUser;
//Fetch the user's email and phone number to pre-fill the edit form, if they exist
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
//Send a PUT request to update the user's profile information on the server
  fetch('/api/users/' + currentUser, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ newUsername, email, phone })
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      //If successful, update the displayed username and profile initial, and show a success message
      //Due to issues, it only display "Something went wrong"
      //Claude.ai were used to try fix the code, but no success yet
      localStorage.setItem('currentUser', newUsername);
      document.getElementById('profile-page-username').textContent = newUsername;
      document.getElementById('profile-page-initial').textContent = newUsername[0].toUpperCase();
      document.getElementById('profile-msg').textContent = 'Profile updated!';
    } else {
      //If there was an error (like username already taken), show the error message
      document.getElementById('profile-msg').style.color = 'red';
      document.getElementById('profile-msg').textContent = data.message;
    }
  });
}