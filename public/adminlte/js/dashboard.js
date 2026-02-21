// public/adminlte/js/dashboard.js
document.addEventListener("DOMContentLoaded", async () => {
  try {
    const bookings = await apiFetch("/admin/bookings");
    const tbody = document.getElementById("bookings-table-body");

    if (!bookings.length) {
      tbody.innerHTML = "<tr><td colspan='6'>No bookings yet</td></tr>";
      return;
    }

    tbody.innerHTML = bookings
      .map(
        (b) => `
        <tr>
          <td>${b._id}</td>
          <td>${b.userId?.name || b.name}</td>
          <td>${b.carId?.name || "—"}</td>
          <td>${new Date(b.startDate).toLocaleDateString()} → ${new Date(b.endDate).toLocaleDateString()}</td>
          <td id="status-${b._id}">${b.status}</td>
          <td>
            <button class="btn btn-success btn-sm" onclick="updateStatus('${b._id}','Confirmed')">Confirm</button>
            <button class="btn btn-danger btn-sm" onclick="updateStatus('${b._id}','Cancelled')">Cancel</button>
          </td>
        </tr>
      `
      )
      .join("");
  } catch (err) {
    console.error("Error loading dashboard:", err);
  }
});

async function updateStatus(id, status) {
  const res = await apiFetch(`/admin/bookings/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });

  if (res._id) {
    document.getElementById("status-" + id).innerText = res.status;
    alert("✅ Booking updated!");
  } else {
    alert("❌ Failed to update");
  }
}
