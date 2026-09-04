document.getElementById('trackBtn').addEventListener('click', async function () {
  const refCode = document.getElementById('refCode').value.trim();
  const resultBox = document.getElementById('trackResult');
  resultBox.innerHTML = '';

  if (!refCode) {
    resultBox.innerHTML = `<div class="message error">Please enter a reference code.</div>`;
    return;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/requests/track/${encodeURIComponent(refCode)}`);
    const data = await res.json();

    if (!res.ok) {
      resultBox.innerHTML = `<div class="message error">${data.error || 'Request not found.'}</div>`;
      return;
    }

    resultBox.innerHTML = `
      <div class="message success">
        <strong>Equipment:</strong> ${data.equipment_name}<br>
        <strong>Location:</strong> ${data.location}<br>
        <strong>Priority:</strong> ${data.priority}<br>
        <strong>Status:</strong> <span class="badge ${data.status}">${data.status.replace('_',' ')}</span><br>
        <strong>Technician Notes:</strong> ${data.technician_notes || 'No notes yet.'}<br>
        <strong>Reported On:</strong> ${new Date(data.created_at).toLocaleString()}
      </div>`;
  } catch (err) {
    console.error(err);
    resultBox.innerHTML = `<div class="message error">Could not connect to the server. Is the backend running?</div>`;
  }
});
