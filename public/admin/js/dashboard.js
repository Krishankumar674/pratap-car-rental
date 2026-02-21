// public/admin/js/dashboard.js

document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");

  // ✅ Redirect if not logged in
  if (!token) {
    alert("Session expired or not logged in.");
    window.location.href = "/admin/login.html";
    return;
  }

  try {
    const res = await fetch("/api/admin/dashboard", {
      headers: {
        Authorization: "Bearer " + token,
      },
    });

    const data = await res.json();
    console.log("📊 Dashboard Data:", data);

    if (!res.ok) {
      throw new Error(data.msg || "Failed to load data");
    }

    // ✅ Update dashboard cards
    document.getElementById("totalCars").innerText = data.totalCars || 0;
    document.getElementById("totalBookings").innerText = data.totalBookings || 0;
    document.getElementById("activeBookings").innerText = data.activeBookings || 0;
    document.getElementById("totalUsers").innerText = data.totalUsers || 0;

  } catch (error) {
    console.error("Dashboard error:", error);
    alert("⚠️ Could not load dashboard data. Check backend logs.");
  }
});

// ✅ Logout Function
function logout() {
  localStorage.removeItem("token");
  window.location.href = "/admin/login.html";
}
