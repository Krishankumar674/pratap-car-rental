function apiFetch(url, options = {}) {
  const token = localStorage.getItem("token");
  return fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: "Bearer " + token
    }
  });
}

document.addEventListener("DOMContentLoaded", loadBookings);

async function loadBookings() {
  const body = document.getElementById("bookingTableBody");

  try {
    const res = await apiFetch("/api/admin/bookings");
    const list = await res.json();

    window.allBookings = list; // keep for search
    renderBookings(list);
  } catch (err) {
    console.error(err);
    body.innerHTML = `<tr><td colspan="5">Failed to load bookings</td></tr>`;
  }
}

function renderBookings(list) {
  const body = document.getElementById("bookingTableBody");

  if (!list.length) {
    body.innerHTML = `<tr><td colspan="5">No bookings found</td></tr>`;
    return;
  }

  body.innerHTML = list
    .map((b) => {
      const user = b.userId?.name || b.name || "Unknown";
      const car = b.carId?.name || "Car removed";
      const date = `${new Date(b.startDate).toLocaleDateString()} → ${new Date(b.endDate).toLocaleDateString()}`;

      const badgeClass =
        b.status === "Confirmed"
          ? "badge ok"
          : b.status === "Cancelled"
          ? "badge bad"
          : "badge warn";

      return `
        <tr>
          <td>${user}</td>
          <td>${car}</td>
          <td>${date}</td>
          <td><span class="${badgeClass}">${b.status}</span></td>
          <td>
            <button class="btn small ok" onclick="updateStatus('${b._id}', 'Confirmed')">Confirm</button>
            <button class="btn small bad" onclick="updateStatus('${b._id}', 'Cancelled')">Cancel</button>
          </td>
        </tr>
      `;
    })
    .join("");
}

async function updateStatus(id, status) {
  const res = await apiFetch(`/api/admin/bookings/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status })
  });

  if (res.ok) {
    loadBookings();
  }
}

// ✅ Search
document.getElementById("searchBooking").addEventListener("input", (e) => {
  const q = e.target.value.toLowerCase();

  const filtered = window.allBookings.filter((b) => {
    const user = b.userId?.name || b.name || "";
    const car = b.carId?.name || "";
    return user.toLowerCase().includes(q) || car.toLowerCase().includes(q);
  });

  renderBookings(filtered);
});

// ✅ Logout
function logout() {
  localStorage.removeItem("token");
  location.href = "/admin/login.html";
}
