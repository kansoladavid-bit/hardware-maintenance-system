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

// holds the currently loaded requests so downloadExcel()/editRequest() can find them by id
let currentRequests = [];

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
  tbody.innerHTML = `<tr><td colspan="10">Loading...</td></tr>`;

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
    currentRequests = data;

    if (data.length === 0) {
      tbody.innerHTML = `<tr><td colspan="10">No requests found.</td></tr>`;
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
        <td>
          <textarea id="notes-${r.id}" rows="2" style="width:160px;font-size:12px;">${r.technician_notes || ''}</textarea>
          <button style="font-size:11px;padding:4px 8px;margin-top:4px;" onclick="saveNotes(${r.id})">Save Notes</button>
        </td>
        <td class="actions">
          <select onchange="updateStatus(${r.id}, this.value)">
            <option value="">Change status...</option>
            <option value="pending" ${r.status === 'pending' ? 'selected' : ''}>Pending</option>
            <option value="in_progress" ${r.status === 'in_progress' ? 'selected' : ''}>In Progress</option>
            <option value="resolved" ${r.status === 'resolved' ? 'selected' : ''}>Resolved</option>
          </select>
          <button style="font-size:11px;padding:4px 8px;margin-top:4px;background:#0d6efd;color:#fff;border:none;border-radius:4px;cursor:pointer;" onclick="editRequest(${r.id})">Edit</button>
          <button class="danger" onclick="deleteRequest(${r.id})">Delete</button>
          <button style="font-size:11px;padding:4px 8px;margin-top:4px;background:#1e7e34;color:#fff;border:none;border-radius:4px;cursor:pointer;" onclick="downloadExcel(${r.id})">Download Excel</button>
        </td>
      </tr>
    `).join('');
  } catch (err) {
    console.error(err);
    tbody.innerHTML = `<tr><td colspan="10">Could not connect to the server.</td></tr>`;
  }
}

async function editRequest(id) {
  const r = currentRequests.find(req => req.id === id);
  if (!r) {
    alert('Request not found.');
    return;
  }

  const reporter_name = prompt('Reporter name:', r.reporter_name);
  if (reporter_name === null) return; // cancelled

  const contact_info = prompt('Contact info:', r.contact_info || '');
  if (contact_info === null) return;

  const equipment_name = prompt('Equipment name:', r.equipment_name);
  if (equipment_name === null) return;

  const location = prompt('Location:', r.location);
  if (location === null) return;

  let priority = prompt('Priority (low / medium / high):', r.priority);
  if (priority === null) return;
  priority = priority.trim().toLowerCase();
  if (!['low', 'medium', 'high'].includes(priority)) {
    alert('Priority must be low, medium or high. Edit cancelled.');
    return;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/requests/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ reporter_name, contact_info, equipment_name, location, priority })
    });
    if (res.status === 401 || res.status === 403) return handleAuthError();
    if (!res.ok) {
      alert('Could not update request.');
      return;
    }
    alert('Request updated.');
    loadRequests();
  } catch (err) {
    console.error(err);
    alert('Could not update request.');
  }
}

function downloadExcel(id) {
  const r = currentRequests.find(req => req.id === id);
  if (!r) {
    alert('Request not found.');
    return;
  }

  const rows = [
    { Field: 'Reference Code', Value: r.reference_code },
    { Field: 'Reporter Name', Value: r.reporter_name },
    { Field: 'Contact Info', Value: r.contact_info || '-' },
    { Field: 'Equipment', Value: r.equipment_name },
    { Field: 'Location', Value: r.location },
    { Field: 'Priority', Value: r.priority },
    { Field: 'Status', Value: r.status.replace('_', ' ') },
    { Field: 'Date Submitted', Value: new Date(r.created_at).toLocaleString() },
    { Field: 'Technician Notes', Value: r.technician_notes || '-' }
  ];

  const worksheet = XLSX.utils.json_to_sheet(rows, { skipHeader: true });
  worksheet['!cols'] = [{ wch: 20 }, { wch: 40 }];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Request');

  XLSX.writeFile(workbook, `${r.reference_code}.xlsx`);
}

async function saveNotes(id) {
  const notes = document.getElementById(`notes-${id}`).value;
  try {
    const res = await fetch(`${API_BASE_URL}/requests/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ technician_notes: notes })
    });
    if (res.status === 401 || res.status === 403) return handleAuthError();
    alert('Notes saved.');
  } catch (err) {
    console.error(err);
    alert('Could not save notes.');
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
