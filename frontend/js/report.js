document.getElementById('reportForm').addEventListener('submit', async function (e) {
  e.preventDefault();
  const messageBox = document.getElementById('formMessage');
  messageBox.innerHTML = '';
  const payload = {
    reporter_name: document.getElementById('reporter_name').value,
    department: document.getElementById('department').value,
    contact_info: document.getElementById('contact_info').value,
    equipment_name: document.getElementById('equipment_name').value,
    location: document.getElementById('location').value,
    priority: document.getElementById('priority').value,
    issue_description: document.getElementById('issue_description').value
  };
  try {
    const res = await fetch(`${API_BASE_URL}/requests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) {
      messageBox.innerHTML = `<div class="message error">${data.error || 'Something went wrong.'}</div>`;
      return;
    }
    messageBox.innerHTML = `
      <div class="message success">
        Request submitted successfully!<br>
        Your reference code is: <strong>${data.request.reference_code}</strong><br>
        Save this code to track your request later.
      </div>`;
    document.getElementById('reportForm').reset();
  } catch (err) {
    console.error(err);
    messageBox.innerHTML = `<div class="message error">Could not connect to the server. Is the backend running?</div>`;
  }
});
