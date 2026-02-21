// public/admin/js/admin-api.js

function apiFetch(path, opts = {}) {
  const token = localStorage.getItem("token");
  const headers = opts.headers || {};
  headers["Content-Type"] = "application/json";
  if (token) headers["Authorization"] = "Bearer " + token;

  return fetch("/api" + path, { ...opts, headers }).then((res) => res.json());
}

function logout() {
  localStorage.removeItem("token");
  window.location.href = "/admin/login.html";
}
