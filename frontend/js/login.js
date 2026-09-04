document.getElementById('loginForm').addEventListener('submit', async function (e) {
  e.preventDefault();

  const messageBox = document.getElementById('loginMessage');
  messageBox.innerHTML = '';

  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  try {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (!res.ok) {
      messageBox.innerHTML = `<div class="message error">${data.error || 'Login failed.'}</div>`;
      return;
    }

    // Save the token so the dashboard page can use it
    localStorage.setItem('hms_token', data.token);
    localStorage.setItem('hms_username', data.username);

    window.location.href = 'dashboard.html';
  } catch (err) {
    console.error(err);
    messageBox.innerHTML = `<div class="message error">Could not connect to the server. Is the backend running?</div>`;
  }
});
