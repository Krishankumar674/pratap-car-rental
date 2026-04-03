document.addEventListener("DOMContentLoaded", loadCars);

async function loadCars() {
  try {
    const cars = await apiFetch("/admin/cars");
    const tbody = document.getElementById("cars-body");

    if (!cars.length) {
      tbody.innerHTML = "<tr><td colspan='6'>No cars available</td></tr>";
      return;
    }

    tbody.innerHTML = cars.map(car => `
      <tr>
        <td>${car.name}</td>
        <td>${car.brand}</td>
        <td>${car.seats}</td>
        <td>₹${car.pricePerDay}</td>
        <td><img src="https://localhost:5000/${car.image}" width="100" style="border-radius:5px"/></td>
        <td><button class="btn btn-danger btn-sm" onclick="deleteCar('${car._id}')">🗑️ Delete</button></td>
      </tr>
    `).join('');
  } catch (err) {
    console.error("Error loading cars:", err);
  }
}

async function addCar() {
  const name = document.getElementById("carName").value;
  const brand = document.getElementById("carBrand").value;
  const seats = document.getElementById("carSeats").value;
  const pricePerDay = document.getElementById("carPrice").value;
  const image = document.getElementById("carImage").value;

  if (!name || !brand || !seats || !pricePerDay || !image) {
    alert("⚠️ All fields required!");
    return;
  }

  try {
    const res = await apiFetch("/admin/cars", {
      method: "POST",
      body: JSON.stringify({ name, brand, seats, pricePerDay, image }),
    });

    if (res._id) {
      document.getElementById("msg").innerText = "✅ Car added successfully!";
      loadCars();
    } else {
      alert(res.msg || "Failed to add car");
    }
  } catch (err) {
    console.error("Error adding car:", err);
  }
}

async function deleteCar(id) {
  if (!confirm("Are you sure you want to delete this car?")) return;
  try {
    const res = await apiFetch(`/admin/cars/${id}`, { method: "DELETE" });
    alert(res.msg || "Car deleted");
    loadCars();
  } catch (err) {
    console.error("Error deleting car:", err);
  }
}
