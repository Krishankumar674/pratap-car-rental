// --- tiny helper
function apiFetch(path, opts = {}) {
  const token = localStorage.getItem("token");
  if (!token) {
    location.href = "/admin/login.html";
    return Promise.reject(new Error("No token"));
  }
  return fetch(path, {
    ...opts,
    headers: {
      ...(opts.headers || {}),
      Authorization: "Bearer " + token
    }
  });
}

document.getElementById("logoutBtn")?.addEventListener("click", () => {
  localStorage.removeItem("token");
  location.href = "/admin/login.html";
});

document.getElementById("yy").textContent = new Date().getFullYear();

// --- load everything
document.addEventListener("DOMContentLoaded", async () => {
  await Promise.all([loadKPIs(), loadRecent(), loadCharts(), loadActivity()]);
});

// KPIs
async function loadKPIs() {
  try {
    const r = await apiFetch("/api/admin/dashboard");
    const d = await r.json();
    document.getElementById("kpiCars").textContent = d.totalCars ?? 0;
    document.getElementById("kpiBookings").textContent = d.totalBookings ?? 0;
    document.getElementById("kpiActive").textContent = d.activeBookings ?? 0;
    document.getElementById("kpiUsers").textContent = d.totalUsers ?? 0;
  } catch (e) {
    console.error(e);
  }
}

// Recent bookings table
async function loadRecent() {
  const tbody = document.getElementById("recentBookings");
  try {
    const r = await apiFetch("/api/admin/bookings");
    const list = (await r.json()) || [];
    if (!list.length) {
      tbody.innerHTML = `<tr><td colspan="5" class="muted">No bookings yet</td></tr>`;
      return;
    }
    tbody.innerHTML = list
      .slice(0, 7)
      .map(b => {
        const range = `${fmt(b.startDate)} → ${fmt(b.endDate)}`;
        const statusClass = b.status === "Confirmed" ? "ok" : "warn";
        const user = b.userId?.name || b.name || "—";
        const car  = b.carId?.name || "—";
        return `<tr>
          <td>${b._id}</td>
          <td>${escapeHTML(user)}</td>
          <td>${escapeHTML(car)}</td>
          <td>${range}</td>
          <td><span class="badge ${statusClass}">${b.status || "Pending"}</span></td>
        </tr>`;
      })
      .join("");
  } catch (e) {
    console.error(e);
    tbody.innerHTML = `<tr><td colspan="5" class="muted">Failed to load</td></tr>`;
  }
}

// Charts
let bookingsChart, fleetChart;
async function loadCharts() {
  // bookings per month (derived from /api/admin/bookings)
  try {
    const r = await apiFetch("/api/admin/bookings");
    const list = (await r.json()) || [];

    const buckets = Array(12).fill(0);
    list.forEach(b => {
      const m = new Date(b.createdAt || b.startDate).getMonth();
      buckets[m] += 1;
    });

    const ctx1 = document.getElementById("bookingsChart");
    bookingsChart = new Chart(ctx1, {
      type: "line",
      data: {
        labels: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
        datasets: [{
          label: "Bookings",
          data: buckets,
          tension: .35,
          fill: true
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display:false } },
        scales: {
          y: { beginAtZero:true, grid:{ color:"#eef2f7" } },
          x: { grid:{ display:false } }
        }
      }
    });
  } catch (e) { console.error(e); }

  // fleet availability chart (Confirmed vs Others)
  try {
    const r = await apiFetch("/api/admin/cars");
    const cars = (await r.json()) || [];
    const total = cars.length;
    const r2 = await apiFetch("/api/admin/bookings");
    const bookings = (await r2.json()) || [];
    const active = bookings.filter(b => b.status === "Confirmed").length;

    const ctx2 = document.getElementById("fleetChart");
    fleetChart = new Chart(ctx2, {
      type: "doughnut",
      data: {
        labels: ["Active (Booked)", "Available"],
        datasets: [{
          data: [active, Math.max(total - active, 0)]
        }]
      },
      options: {
        plugins: { legend:{ position:"bottom" } },
        cutout: "62%"
      }
    });
  } catch (e) { console.error(e); }
}

// Activity (basic derived log)
async function loadActivity() {
  const log = document.getElementById("activityLog");
  try {
    const [rU, rB] = await Promise.all([
      apiFetch("/api/admin/users"),
      apiFetch("/api/admin/bookings")
    ]);
    const users = (await rU.json()) || [];
    const bookings = (await rB.json()) || [];

    const latestUser = users.at(-1);
    const latestBooking = bookings.at(-1);

    log.innerHTML = `
      ${latestUser ? `<li>👤 New user registered: <b>${escapeHTML(latestUser.name || latestUser.email)}</b></li>` : ""}
      ${latestBooking ? `<li>🧾 New booking by <b>${escapeHTML(latestBooking.name || latestBooking.userId?.name || "Customer")}</b></li>` : ""}
      <li>🛠 Admin dashboard refreshed at ${new Date().toLocaleTimeString()}</li>
    `;
  } catch (e) {
    console.error(e);
    log.innerHTML = `<li class="muted">Failed to load activity</li>`;
  }
}

// utils
function fmt(d){ try { return new Date(d).toLocaleDateString(); } catch { return "—"; } }
function escapeHTML(s){ return String(s ?? "").replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
