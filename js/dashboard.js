/* ================= STORAGE ================= */
let bins = JSON.parse(localStorage.getItem("bins")) || [];
let history = JSON.parse(localStorage.getItem("history")) || [];

const ALERT_LEVEL = 85;
const HISTORY_EXPIRY_DAYS = 3;

/* ================= MAP ================= */
let map, markers = [];

document.addEventListener("DOMContentLoaded", () => {
  map = L.map("map").setView([20.5937, 78.9629], 5);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png")
    .addTo(map);

  cleanupHistory();
  localStorage.setItem("history", JSON.stringify(history));
});

/* ================= UI ================= */
function hideAll() {
  ["levelsSection","alertsSection","historySection"]
    .forEach(id => document.getElementById(id).style.display = "none");
  document.getElementById("mapContainer").style.display = "none";
}

function clearMarkers() {
  markers.forEach(m => map.removeLayer(m));
  markers = [];
}

function closeModal() {
  document.querySelectorAll(".modal")
    .forEach(m => m.style.display = "none");
}

/* ================= BIN ACTIONS ================= */
function openAddBin() {
  hideAll(); closeModal();
  document.getElementById("addModal").style.display = "flex";
}

function openDeleteBin() {
  hideAll(); closeModal();
  document.getElementById("deleteModal").style.display = "flex";
}

function addBin() {
  bins.push({
    id: binId.value,
    lat: parseFloat(lat.value),
    lon: parseFloat(lon.value)
  });
  localStorage.setItem("bins", JSON.stringify(bins));
  closeModal();
  alert("Bin Added");
}

function deleteBin() {
  bins = bins.filter(b => b.id !== deleteId.value);
  localStorage.setItem("bins", JSON.stringify(bins));
  closeModal();
  alert("Bin Deleted");
}

/* ================= LEVELS ================= */
function showLevels() {
  hideAll(); clearMarkers();

  levelsList.innerHTML = "";
  bins.forEach(bin => {
    const level = randomLevel();
    levelsList.innerHTML +=
      `<div class="card">🗑️ ${bin.id} → ${level}%</div>`;
    addMarker(bin, level);
  });

  levelsSection.style.display = "block";
  showMap();
}

/* ================= ALERTS ================= */
function showAlerts() {
  hideAll(); clearMarkers();
  alertsList.innerHTML = "";

  bins.forEach(bin => {
    const level = randomLevel();
    if (level >= ALERT_LEVEL) {
      alertsList.innerHTML +=
        `<div class="card">🚨 ${bin.id} → ${level}%</div>`;
      addMarker(bin, level);
      saveHistory(bin.id, level);
    }
  });

  alertsSection.style.display = "block";
  showMap();
}

/* ================= HISTORY ================= */
function showHistory() {
  hideAll();
  cleanupHistory();

  historyList.innerHTML = "";
  history.forEach(h => {
    historyList.innerHTML +=
      `<div class="card">
        🗑️ ${h.binId} → ${h.level}%<br>
        📅 ${h.time}
      </div>`;
  });

  historySection.style.display = "block";
}

/* ================= MAP ================= */
function showMap() {
  document.getElementById("mapContainer").style.display = "block";
  setTimeout(() => map.invalidateSize(), 200);
}

function addMarker(bin, level) {
  let color = level >= ALERT_LEVEL ? "red" :
              level >= 60 ? "orange" : "green";

  const icon = L.divIcon({
    html: `<div style="
      background:${color};
      width:18px;height:18px;
      border-radius:50%;
      border:2px solid white"></div>`
  });

  const marker = L.marker([bin.lat, bin.lon], { icon })
    .addTo(map)
    .bindPopup(`<b>${bin.id}</b><br>Level: ${level}%`);

  markers.push(marker);
}

/* ================= HISTORY LOGIC ================= */
function saveHistory(binId, level) {
  history.push({
    binId,
    level,
    timestamp: Date.now(),
    time: new Date().toLocaleString()
  });
  cleanupHistory();
  localStorage.setItem("history", JSON.stringify(history));
}

function cleanupHistory() {
  const now = Date.now();
  const expiry = HISTORY_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
  history = history.filter(h => now - h.timestamp <= expiry);
}

/* ================= TEMP DATA ================= */
function randomLevel() {
  return Math.floor(Math.random() * 100);
}
