const token = localStorage.getItem('hms_token');
const username = localStorage.getItem('hms_username');

if (!token) {
  window.location.href = 'login.html';
}

document.getElementById('welcomeUser').textContent = `Logged in as: ${username || 'Admin'}`;

document.getElementById('logoutLink').addEventListener('click', function (e) {
  e.preventDefault();
  localStorage.removeItem('hms_token');
  localStorage.removeItem('hms_username');
  window.location.href = 'login.html';
});
async function loadStats() {
  try {
    const res = await fetch(`${API_BASE_URL}/requests/stats`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.status === 401 || res.status === 403) return handleAuthError();
    const data = await res.json();
    document.getElementById('statTotal').textContent = data.total;
    document.getElementById('statPending').textContent = data.pending;
    document.getElementById('statInProgress').textContent = data.in_progress;
    document.getElementById('statResolved').textContent = data.resolved;
  } catch (err) {
    console.error(err);
  }
}
async function loadRequests() {
  const tbody = document.getElementById('requestsTableBody');
  tbody.innerHTML = `<tr><td colspan="9">Loading...</td></tr>`;

  const status = document.getElementById('filterStatus').value;
  const priority = document.getElementById('filterPriority').value;
  const search = document.getElementById('filterSearch').value;

  const params = new URLSearchParams();
  if (status) params.append('status', status);
  if (priority) params.append('priority', priority);
  if (search) params.append('search', search);

  try {
    const res = await fetch(`${API_BASE_URL}/requests?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.status === 401 || res.status === 403) return handleAuthError();

    const data = await res.json();

    if (data.length === 0) {
      tbody.innerHTML = `<tr><td colspan="9">No requests found.</td></tr>`;
      return;
    }
    tbody.innerHTML = data.map(r => `
      <tr>
        <td>${r.reference_code}</td>
        <td>${r.reporter_name}</td>
        <td>${r.contact_info || '-'}</td>
        <td>${r.equipment_name}</td>
        <td>${r.location}</td>
        <td style="text-transform:capitalize;">${r.priority}</td>
        <td><span class="badge ${r.status}">${r.status.replace('_',' ')}</span></td>
        <td>${new Date(r.created_at).toLocaleDateString()}</td>
        <td class="actions">
          <select onchange="updateStatus(${r.id}, this.value)">
            <option value="">Change status...</option>
            <option value="pending" ${r.status === 'pending' ? 'selected' : ''}>Pending</option>
            <option value="in_progress" ${r.status === 'in_progress' ? 'selected' : ''}>In Progress</option>
            <option value="resolved" ${r.status === 'resolved' ? 'selected' : ''}>Resolved</option>
          </select>
          <button class="danger" onclick="deleteRequest(${r.id})">Delete</button>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    console.error(err);
    tbody.innerHTML = `<tr><td colspan="9">Could not connect to the server.</td></tr>`;
  }
}
async function updateStatus(id, status) {
  if (!status) return;
  try {
    const res = await fetch(`${API_BASE_URL}/requests/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ status })
    });
    if (res.status === 401 || res.status === 403) return handleAuthError();
    loadRequests();
    loadStats();
  } catch (err) {
    console.error(err);
    alert('Could not update status.');
  }
}

async function deleteRequest(id) {
  if (!confirm('Are you sure you want to delete this request?')) return;
  try {
    const res = await fetch(`${API_BASE_URL}/requests/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.status === 401 || res.status === 403) return handleAuthError();
    loadRequests();
    loadStats();
  } catch (err) {
    console.error(err);
    alert('Could not delete request.');
  }
}

function handleAuthError() {
  alert('Your session has expired. Please login again.');
  localStorage.removeItem('hms_token');
  window.location.href = 'login.html';
}

document.getElementById('applyFilters').addEventListener('click', loadRequests);

loadStats();
loadRequests();
