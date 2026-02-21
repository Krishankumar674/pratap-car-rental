// ✅ Helper to call API WITH TOKEN
function apiFetch(url, options = {}) {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Not logged in");
    window.location.href = "/admin/login.html";
    return;
  }

  return fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      "Authorization": "Bearer " + token
    }
  });
}

// ✅ Load cars on page load
document.addEventListener("DOMContentLoaded", () => {
  loadCars();

  // ✅ Search
  document.getElementById("searchCars").addEventListener("keyup", function () {
    const value = this.value.toLowerCase();
    const rows = document.querySelectorAll("#carTableBody tr");
    rows.forEach(row => {
      row.style.display = row.innerText.toLowerCase().includes(value) ? "" : "none";
    });
  });
});

async function loadCars() {
  const container = document.getElementById("carTableBody");
  container.innerHTML = "<tr><td colspan='6'>Loading...</td></tr>";

  try {
    const res = await apiFetch("/api/admin/cars");
    const cars = await res.json();

    container.innerHTML = cars.map(car => `
      <tr>
        <td><img src="/${car.image}" style="width:80px; border-radius:6px;"></td>
        <td>${car.name}</td>
        <td>${car.brand}</td>
        <td>${car.seats}</td>
        <td>₹${car.pricePerDay}</td>
        <td>
          <button class="btn btn-red" onclick="deleteCar('${car._id}')">Delete</button>
        </td>
      </tr>
    `).join("");

  } catch (err) {
    console.error(err);
    container.innerHTML = "<tr><td colspan='6'>Failed to load cars</td></tr>";
  }
}

// ✅ Add New Car
document.getElementById("addCarBtn").addEventListener("click", async () => {
  const name = document.getElementById("name").value;
  const brand = document.getElementById("brand").value;
  const seats = document.getElementById("seats").value;
  const pricePerDay = document.getElementById("price").value;
  const image = document.getElementById("image").files[0];

  if (!name || !brand || !seats || !pricePerDay || !image) {
    alert("All fields are required");
    return;
  }

  try {
    const formData = new FormData();
    formData.append("name", name);
    formData.append("brand", brand);
    formData.append("seats", seats);
    formData.append("pricePerDay", pricePerDay);
    formData.append("image", image);

    const res = await fetch("/api/admin/upload-car", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token")
      },
      body: formData
    });

    const data = await res.json();
    if (res.ok) {
      alert("✅ Car added successfully");
      loadCars();
      document.getElementById("addCarForm").reset();
      document.getElementById("preview").style.display = "none";
    } else {
      alert("❌ " + (data.msg || "Failed to add car"));
    }
  } catch (e) {
    console.error(e);
    alert("Server error");
  }
});

// ✅ Delete Car
async function deleteCar(id) {
  const ok = confirm("Delete this car?");
  if (!ok) return;

  const res = await apiFetch(`/api/admin/cars/${id}`, {
    method: "DELETE"
  });

  const data = await res.json();
  alert(data.msg);
  loadCars();
}
