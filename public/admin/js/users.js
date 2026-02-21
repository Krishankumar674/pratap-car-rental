function apiFetch(url, opts = {}) {
  const token = localStorage.getItem("token");
  return fetch(url, {
    ...opts,
    headers: {
      ...(opts.headers || {}),
      Authorization: "Bearer " + token
    }
  });
}

document.addEventListener("DOMContentLoaded", loadUsers);

async function loadUsers() {
  const body = document.getElementById("userTableBody");

  try {
    const res = await apiFetch("/api/admin/users");
    const users = await res.json();

    window.allUsers = users;
    renderUsers(users);
  } catch (err) {
    console.error(err);
    body.innerHTML = `<tr><td colspan="3">Failed to load users</td></tr>`;
  }
}

function renderUsers(users) {
  const body = document.getElementById("userTableBody");

  if (!users.length) {
    body.innerHTML = `<tr><td colspan="3">No users found</td></tr>`;
    return;
  }

  body.innerHTML = users
    .map(
      (u) => `
      <tr>
        <td>${u.name || "-"}</td>
        <td>${u.email}</td>
        <td>${new Date(u.createdAt).toLocaleDateString()}</td>
      </tr>
      `
    )
    .join("");
}

// ✅ Search
document.getElementById("userSearch").addEventListener("input", (e) => {
  const q = e.target.value.toLowerCase();

  const filtered = window.allUsers.filter(
    (u) =>
      u.name?.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q)
  );

  renderUsers(filtered);
});

// ✅ Logout
function logout() {
  localStorage.removeItem("token");
  location.href = "/admin/login.html";
}
