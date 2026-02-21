// ✅ Dynamic Navbar Auth Handler
function updateNavbar() {
  const token = localStorage.getItem("token");
  const authLinks = document.querySelectorAll(".auth-link");
  const logoutLink = document.querySelector(".logout-link");

  if (token) {
    // ✅ User is logged in → Hide Login/Signup, Show Logout
    authLinks.forEach(link => link.classList.add("d-none"));
    logoutLink.classList.remove("d-none");
  } else {
    // 🚫 User is logged out → Show Login/Signup, Hide Logout
    authLinks.forEach(link => link.classList.remove("d-none"));
    logoutLink.classList.add("d-none");
  }
}

// ✅ Logout Functionality
document.getElementById("logoutBtn")?.addEventListener("click", () => {
  localStorage.removeItem("token");
  alert("You have been logged out!");
  updateNavbar();
  window.location.href = "index.html";
});

// ✅ Run on every page load
updateNavbar();
