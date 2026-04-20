// =============================================
//  CEK KELULUSAN SNBT - script.js

// =============================================

// Daftar subtes SNBT 2025 (sesuai resmi BPPP Kemdikbud)
const SUBTES = [
  // TPS
  { id: "penalaran_umum",    label: "Penalaran Umum",              grup: "tps" },
  { id: "ppu",               label: "Pengetahuan & Pemahaman Umum", grup: "tps" },
  { id: "kemampuan_membaca", label: "Kemampuan Membaca & Menulis",  grup: "tps" },
  { id: "pengetahuan_kuant", label: "Pengetahuan Kuantitatif",      grup: "tps" },
  // Literasi
  { id: "literasi_id",       label: "Literasi Bahasa Indonesia",    grup: "literasi" },
  { id: "literasi_en",       label: "Literasi Bahasa Inggris",      grup: "literasi" },
  // Penalaran Matematika
  { id: "penalaran_mat",     label: "Penalaran Matematika",         grup: "matematika" },
];

const BATAS_LULUS = 75;

let riwayatSesi    = [];
let storagePermanen = JSON.parse(localStorage.getItem("snbt_riwayat")) || [];
let isLightMode    = false;
let dataPeserta    = []; // menyimpan hasil sementara untuk disimpan ke storage

// =============================================
//  LOADING
// =============================================
window.addEventListener("load", () => {
  const loader = document.getElementById("loading-screen");
  setTimeout(() => loader.classList.add("loader-hidden"), 2000);
});

// =============================================
//  THEME TOGGLE
// =============================================
function toggleTheme() {
  isLightMode = !isLightMode;
  const icon  = document.getElementById("themeIcon");
  if (isLightMode) {
    document.body.classList.add("light-mode");
    icon.className = "fa-solid fa-moon";
  } else {
    document.body.classList.remove("light-mode");
    icon.className = "fa-solid fa-sun";
  }
  localStorage.setItem("snbt_theme", isLightMode ? "light" : "dark");
}

// Restore tema saat load
(function initTheme() {
  if (localStorage.getItem("snbt_theme") === "light") {
    isLightMode = true;
    document.body.classList.add("light-mode");
    window.addEventListener("DOMContentLoaded", () => {
      const icon = document.getElementById("themeIcon");
      if (icon) icon.className = "fa-solid fa-moon";
    });
  }
})();

// =============================================
//  NOTIFIKASI
// =============================================
function tampilkanNotif(pesan, tipe = "success") {
  const notif = document.getElementById("custom-notification");
  notif.textContent = pesan;
  notif.className = `notif-show notif-${tipe === "success" ? "success" : "error"}`;
  setTimeout(() => notif.classList.remove("notif-show"), 3000);
}

// =============================================
//  MODAL
// =============================================
const modal      = document.getElementById("customModal");
const confirmBtn = document.getElementById("confirmDeleteBtn");

function openModal() {
  if (storagePermanen.length === 0) {
    tampilkanNotif("Storage memang sudah kosong!", "error");
    return;
  }
  modal.classList.add("show");
}
function closeModal() {
  modal.classList.remove("show");
}
confirmBtn.onclick = function () {
  storagePermanen = [];
  localStorage.removeItem("snbt_riwayat");
  renderStorage();
  closeModal();
  tampilkanNotif("Storage telah dikosongkan!");
};

// =============================================
//  STORAGE PANEL
// =============================================
function toggleSavedPanel() {
  document.getElementById("savedPanel").classList.toggle("active");
  renderStorage();
}
function renderStorage() {
  const ul = document.getElementById("daftarSaved");
  if (storagePermanen.length === 0) {
    ul.innerHTML = "<li style='opacity:0.5;border:none;'>Storage Kosong</li>";
    return;
  }
  ul.innerHTML = [...storagePermanen].reverse()
    .map(item => `<li>${item}</li>`)
    .join("");
}

// =============================================
//  STEP 1 — BUAT FORM PESERTA
// =============================================
function buatFormPeserta() {
  const val = parseInt(document.getElementById("inputJumlah").value);

  if (isNaN(val) || val < 1) {
    tampilkanNotif("Masukkan jumlah peserta minimal 1!", "error");
    return;
  }
  if (val > 20) {
    tampilkanNotif("Maksimal 20 peserta sekaligus!", "error");
    return;
  }

  const container = document.getElementById("containerFormPeserta");
  container.innerHTML = "";

  for (let i = 1; i <= val; i++) {
    container.appendChild(buatCardPeserta(i));
  }

  document.getElementById("stepForm").classList.remove("hidden");
  document.getElementById("stepHasil").classList.add("hidden");

  // Scroll ke form
  setTimeout(() => {
    document.getElementById("stepForm").scrollIntoView({ behavior: "smooth", block: "start" });
  }, 100);
}

function buatCardPeserta(no) {
  const card = document.createElement("div");
  card.className = "peserta-card";
  card.id = `peserta_${no}`;

  // Header grup subtes
  const tpsFields   = SUBTES.filter(s => s.grup === "tps");
  const litFields   = SUBTES.filter(s => s.grup === "literasi");
  const matFields   = SUBTES.filter(s => s.grup === "matematika");

  card.innerHTML = `
    <div class="peserta-header">
      <i class="fa-solid fa-user-graduate"></i> Peserta ${no}
    </div>

    <!-- Data diri -->
    <div class="form-row">
      <div class="form-group">
        <label>NISN</label>
        <input type="text" id="nisn_${no}" placeholder="Masukkan NISN" maxlength="10">
      </div>
      <div class="form-group">
        <label>Nama Lengkap</label>
        <input type="text" id="nama_${no}" placeholder="Masukkan nama">
      </div>
    </div>

    <!-- TPS -->
    <div class="subtes-title">
      <i class="fa-solid fa-brain"></i> Tes Potensi Skolastik (TPS)
    </div>
    <div class="nilai-grid">
      ${tpsFields.map(s => `
        <div class="form-group">
          <label>${s.label}</label>
          <input type="number" id="${s.id}_${no}" placeholder="0 – 100" min="0" max="100">
        </div>
      `).join("")}
    </div>

    <!-- Literasi -->
    <div class="subtes-title">
      <i class="fa-solid fa-book-open"></i> Tes Literasi
    </div>
    <div class="nilai-grid">
      ${litFields.map(s => `
        <div class="form-group">
          <label>${s.label}</label>
          <input type="number" id="${s.id}_${no}" placeholder="0 – 100" min="0" max="100">
        </div>
      `).join("")}
    </div>

    <!-- Penalaran Matematika -->
    <div class="subtes-title">
      <i class="fa-solid fa-calculator"></i> Penalaran Matematika
    </div>
    <div class="nilai-grid">
      ${matFields.map(s => `
        <div class="form-group">
          <label>${s.label}</label>
          <input type="number" id="${s.id}_${no}" placeholder="0 – 100" min="0" max="100">
        </div>
      `).join("")}
    </div>
  `;

  return card;
}

// =============================================
//  STEP 2 — CEK KELULUSAN
// =============================================
function cekKelulusan() {
  const jumlah = parseInt(document.getElementById("inputJumlah").value);
  if (isNaN(jumlah) || jumlah < 1) return;

  dataPeserta = [];
  let adaError = false;

  for (let i = 1; i <= jumlah; i++) {
    const nisn = document.getElementById(`nisn_${i}`).value.trim();
    const nama = document.getElementById(`nama_${i}`).value.trim();

    if (!nisn || !nama) {
      tampilkanNotif(`Peserta ${i}: NISN dan Nama wajib diisi!`, "error");
      adaError = true;
      break;
    }

    const nilaiList = [];
    let errorNilai  = false;

    for (const subtes of SUBTES) {
      const raw = document.getElementById(`${subtes.id}_${i}`).value;
      const val = parseFloat(raw);
      if (raw === "" || isNaN(val)) {
        tampilkanNotif(`Peserta ${i}: Semua nilai subtes wajib diisi!`, "error");
        errorNilai = true;
        break;
      }
      if (val < 0 || val > 100) {
        tampilkanNotif(`Peserta ${i}: Nilai harus antara 0 – 100!`, "error");
        errorNilai = true;
        break;
      }
      nilaiList.push({ ...subtes, nilai: val });
    }

    if (errorNilai) { adaError = true; break; }

    const rata = nilaiList.reduce((sum, s) => sum + s.nilai, 0) / nilaiList.length;

    // if-else sesuai permintaan
    let status;
    if (rata >= BATAS_LULUS) {
      status = "Lulus";
    } else {
      status = "Tidak Lulus";
    }

    dataPeserta.push({ nisn, nama, nilaiList, rata: parseFloat(rata.toFixed(2)), status });
  }

  if (adaError) return;

  // Tampilkan hasil
  tampilkanHasil();

  // Tambahkan ke riwayat sesi
  dataPeserta.forEach(p => {
    const teks = `${p.nama} (${p.nisn}) — Rata-rata: ${p.rata} → ${p.status}`;
    riwayatSesi.push({ teks, status: p.status });
  });
  updateRiwayatUI();

  // Efek suara
  const audio = document.getElementById("clickSound");
  if (audio) { audio.currentTime = 0; audio.play().catch(() => {}); }

  document.getElementById("stepHasil").classList.remove("hidden");
  setTimeout(() => {
    document.getElementById("stepHasil").scrollIntoView({ behavior: "smooth", block: "start" });
  }, 100);
}

// =============================================
//  TAMPILKAN HASIL
// =============================================
function tampilkanHasil() {
  const container = document.getElementById("containerHasil");
  container.innerHTML = "";

  dataPeserta.forEach((p, idx) => {
    const isLulus = p.status === "Lulus";
    const div = document.createElement("div");
    div.className = `hasil-peserta ${isLulus ? "lulus" : "tidak-lulus"} fade-in`;
    div.style.animationDelay = `${idx * 0.08}s`;

    div.innerHTML = `
      <div class="hasil-top">
        <div class="hasil-nama-nisn">
          <h3>${p.nama}</h3>
          <span>NISN: ${p.nisn}</span>
        </div>
        <div class="badge-status ${isLulus ? "lulus" : "tidak-lulus"}">
          <i class="fa-solid ${isLulus ? "fa-circle-check" : "fa-circle-xmark"}"></i>
          ${p.status.toUpperCase()}
        </div>
      </div>

      <div class="nilai-detail">
        ${p.nilaiList.map(s => `
          <div class="nilai-item">
            <span class="label-subtes">${s.label}</span>
            <span class="angka-nilai ${s.nilai >= BATAS_LULUS ? "ok" : "kurang"}">${s.nilai}</span>
          </div>
        `).join("")}
      </div>

      <div class="rata-rata-row">
        <span class="label-rata"><i class="fa-solid fa-calculator"></i> Nilai Rata-rata</span>
        <span class="nilai-rata ${isLulus ? "lulus" : "tidak-lulus"}">${p.rata}</span>
      </div>
    `;

    container.appendChild(div);
  });
}

// =============================================
//  RIWAYAT SESI
// =============================================
function updateRiwayatUI() {
  const ul = document.getElementById("daftarRiwayat");
  ul.innerHTML = [...riwayatSesi].reverse().map(r => {
    const icon    = r.status === "Lulus"
      ? `<i class="fa-solid fa-check"></i>`
      : `<i class="fa-solid fa-xmark"></i>`;
    return `<li><span>${r.teks}</span>${icon}</li>`;
  }).join("");
}

function hapusRiwayat() {
  riwayatSesi = [];
  updateRiwayatUI();
  tampilkanNotif("Riwayat sesi dihapus!", "success");
}

// =============================================
//  SIMPAN KE STORAGE
// =============================================
function simpanKeStorage() {
  if (riwayatSesi.length === 0) {
    tampilkanNotif("Belum ada riwayat baru!", "error");
    return;
  }
  const teksArr = riwayatSesi.map(r => r.teks);
  storagePermanen = [...storagePermanen, ...teksArr];
  localStorage.setItem("snbt_riwayat", JSON.stringify(storagePermanen));
  riwayatSesi = [];
  updateRiwayatUI();
  renderStorage();
  tampilkanNotif("Berhasil disimpan ke storage!");
}

// =============================================
//  RESET SEMUA
// =============================================
function resetSemua() {
  document.getElementById("inputJumlah").value = "";
  document.getElementById("stepForm").classList.add("hidden");
  document.getElementById("stepHasil").classList.add("hidden");
  document.getElementById("containerFormPeserta").innerHTML = "";
  document.getElementById("containerHasil").innerHTML = "";
  riwayatSesi = [];
  updateRiwayatUI();
  dataPeserta = [];
  window.scrollTo({ top: 0, behavior: "smooth" });
  tampilkanNotif("Form direset!", "success");
}

// =============================================
//  INISIALISASI
// =============================================
renderStorage();