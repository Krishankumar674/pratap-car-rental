// public/adminlte/js/admin-api.js
function apiFetch(path, opts = {}) {
  const token = localStorage.getItem("token");
  const headers = opts.headers || {};
  headers["Content-Type"] = "application/json";
  if (token) headers["Authorization"] = "Bearer " + token;
  return fetch("https://localhost:5000/api" + path, { ...opts, headers }).then((r) => r.json());
}
