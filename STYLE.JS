// ================================
// RIPPLE — main.js
// ================================

// DATA BUTTERFLY EFFECT per kebiasaan
const habitData = {
  jalan: {
    chain: [
      { text: "Jalan kaki tiap hari",        sub: "Kebiasaan dimulai",              color: "green" },
      { text: "Tubuh lebih sehat & fit",      sub: "Stamina meningkat",              color: "green" },
      { text: "Fokus belajar meningkat",      sub: "Produktivitas naik 30%",         color: "green" },
      { text: "Nilai naik, beasiswa terbuka", sub: "Masa depan berubah",             color: "blue"  },
      { text: "Emisi karbon berkurang",       sub: "Setara tanam 12 pohon/tahun",    color: "blue"  },
      { text: "Satu titik di dunia menyala",  sub: "Gelombangmu dirasakan dunia",    color: "final" },
    ],
    score: 72
  },
  belajar: {
    chain: [
      { text: "Belajar 2 jam ekstra",         sub: "Konsistensi dimulai",            color: "blue"  },
      { text: "Pemahaman materi lebih dalam", sub: "Nilai ujian meningkat",          color: "blue"  },
      { text: "Kepercayaan diri naik",        sub: "Aktif di kelas",                 color: "green" },
      { text: "Peluang universitas terbaik",  sub: "Karir masa depan terbuka lebar", color: "green" },
      { text: "Inovasi baru tercipta",        sub: "Kontribusi ke masyarakat",       color: "blue"  },
      { text: "Indonesia makin cerdas",       sub: "Gelombangmu dirasakan dunia",    color: "final" },
    ],
    score: 85
  },
  nabung: {
    chain: [
      { text: "Nabung Rp5.000/hari",          sub: "Disiplin finansial dimulai",     color: "yellow" },
      { text: "Rp150.000/bulan terkumpul",    sub: "Konsisten tanpa terasa",         color: "yellow" },
      { text: "Pola pikir hemat terbentuk",   sub: "Kebiasaan seumur hidup",         color: "green"  },
      { text: "Modal usaha kecil tersedia",   sub: "UMKM lokal bisa tumbuh",         color: "green"  },
      { text: "Ekonomi lokal menguat",        sub: "Lapangan kerja bertambah",       color: "yellow" },
      { text: "Satu titik ekonomi menyala",   sub: "Gelombangmu dirasakan dunia",    color: "final"  },
    ],
    score: 65
  }
};

// FUNGSI: Render chain ke halaman
function renderChain(habitKey) {
  const chainContainer = document.getElementById('chainList');
  const data = habitData[habitKey];

  // Kosongkan dulu
  chainContainer.innerHTML = '';

  // Buat setiap item chain
  data.chain.forEach((item, index) => {
    const isLast = index === data.chain.length - 1;

    const chainItem = document.createElement('div');
    chainItem.className = 'chain-item';
    chainItem.style.animationDelay = `${index * 0.4}s`;

    chainItem.innerHTML = `
      <div class="chain-left">
        <div class="chain-dot ${item.color === 'final' ? 'yellow' : item.color}"></div>
        ${!isLast ? '<div class="chain-line"></div>' : ''}
      </div>
      <div class="chain-text ${item.color === 'final' ? 'final' : ''}">
        ${item.text}
        <small>${item.sub}</small>
      </div>
    `;

    chainContainer.appendChild(chainItem);
  });

  // Update earth score
  updateEarthScore(data.score);
}

// FUNGSI: Update earth score + warna
function updateEarthScore(score) {
  const scoreEl = document.getElementById('earthScore');
  const coreEl  = document.getElementById('earthCore');

  if (!scoreEl || !coreEl) return;

  scoreEl.textContent = score + '%';

  // Warna bumi berdasarkan score
  if (score >= 80) {
    coreEl.style.background = 'conic-gradient(#00ff87 0% 80%, #00d4ff 80% 95%, #1a3d2e 95% 100%)';
    scoreEl.style.color = '#00ff87';
  } else if (score >= 60) {
    coreEl.style.background = 'conic-gradient(#00ff87 0% 55%, #00d4ff 55% 80%, #1a3d2e 80% 100%)';
    scoreEl.style.color = '#00ff87';
  } else {
    coreEl.style.background = 'conic-gradient(#ffc800 0% 40%, #ff4444 40% 60%, #1a3d2e 60% 100%)';
    scoreEl.style.color = '#ffc800';
  }
}

// FUNGSI: Handle klik habit
function setupHabits() {
  const habits = document.querySelectorAll('.habit');

  habits.forEach(habit => {
    habit.addEventListener('click', () => {
      // Hapus active dari semua
      habits.forEach(h => h.classList.remove('active-habit'));

      // Tambah active ke yang diklik
      habit.classList.add('active-habit');

      // Render chain sesuai habit
      const key = habit.getAttribute('data-habit');
      renderChain(key);
    });
  });
}

// ================================
// JALANKAN SAAT HALAMAN SIAP
// ================================
document.addEventListener('DOMContentLoaded', () => {
  renderChain('jalan');  // Default: tampilkan chain jalan kaki
  setupHabits();         // Aktifkan interaksi klik
});
