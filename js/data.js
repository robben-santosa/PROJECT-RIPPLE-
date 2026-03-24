// ============================================================
// RIPPLE — data.js
// Simulation data, AI narrative engine, and global state
// ============================================================

// ── Global State ────────────────────────────────────────────
export const state = {
  onboarded: false,
  week: 1,
  totalScore: 0,      // –100 … +100
  layerScores: { mind: 0, soul: 0, social: 0, economic: 0, nature: 0 },
  dailyInputs: [],
  globeHealth: 50,    // 0 = dying, 100 = thriving
  rippleQueue: [],    // pending ripple animations
};

// ── Layer Config ────────────────────────────────────────────
export const LAYERS = [
  {
    id: 'mind',
    emoji: '🎓',
    label: 'PIKIRAN',
    sublabel: 'Pendidikan',
    color: '#6c63ff',
    colorAlt: '#a78bfa',
    description: 'Setiap jam belajar adalah batu fondasi peradaban.',
    ripplePositive: ['Literasi global naik', 'Indeks inovasi meningkat', 'Pelajar menginspirasi pelajar lain'],
    rippleNegative: ['Ketertinggalan teknologi', 'Potensi talenta terbuang', 'Gap pendidikan melebar'],
  },
  {
    id: 'soul',
    emoji: '💚',
    label: 'JIWA',
    sublabel: 'Kesehatan Mental',
    color: '#10b981',
    colorAlt: '#34d399',
    description: 'Kesehatan jiwamu adalah kesehatan masyarakat.',
    ripplePositive: ['Produktivitas komunitas naik', 'Kreativitas generasi tumbuh', 'Sistem kesehatan menguat'],
    rippleNegative: ['Burnout generasi menyebar', 'Sistem kesehatan terbebani', 'Produktivitas menurun'],
  },
  {
    id: 'social',
    emoji: '🤝',
    label: 'HUBUNGAN',
    sublabel: 'Sosial',
    color: '#f59e0b',
    colorAlt: '#fbbf24',
    description: 'Satu koneksi tulus bisa mengubah orbit hidup seseorang.',
    ripplePositive: ['Kohesi sosial menguat', 'Trust masyarakat tumbuh', 'Kolaborasi lintas generasi'],
    rippleNegative: ['Polarisasi sosial', 'Isolasi komunitas', 'Kepercayaan publik melemah'],
  },
  {
    id: 'economic',
    emoji: '💰',
    label: 'PILIHAN',
    sublabel: 'Ekonomi',
    color: '#ef4444',
    colorAlt: '#f87171',
    description: 'Setiap rupiah yang kamu keluarkan adalah suara untuk masa depan.',
    ripplePositive: ['UMKM lokal tumbuh', 'Ekosistem ekonomi sehat', 'Lapangan kerja terbuka'],
    rippleNegative: ['Modal mengalir ke luar negeri', 'UMKM gulung tikar', 'Ketimpangan ekonomi'],
  },
  {
    id: 'nature',
    emoji: '🌱',
    label: 'TAPAK',
    sublabel: 'Lingkungan',
    color: '#059669',
    colorAlt: '#34d399',
    description: 'Jejak kakimu di bumi hari ini adalah warisan untuk anak cucumu.',
    ripplePositive: ['Emisi karbon berkurang', 'Ekosistem pulih', 'Iklim lebih stabil'],
    rippleNegative: ['Karbon footprint naik', 'Ekosistem terdegradasi', 'Krisis iklim dipercepat'],
  },
];

// ── Question Sets per Layer ──────────────────────────────────
export const DAILY_QUESTIONS = {
  mind: [
    { id: 'study_hours', label: 'Belajar berapa jam hari ini?', type: 'slider', min: 0, max: 12, step: 0.5, unit: 'jam', scoreMap: v => (v - 3) * 8 },
    { id: 'topic_depth', label: 'Seberapa dalam kamu memahami materi?', type: 'choice', options: ['Tidak paham 😔', 'Sedikit mengerti 🤔', 'Cukup paham 📖', 'Sangat menguasai 🚀'], scoreMap: i => [-20, 0, 15, 30][i] },
    { id: 'new_skill', label: 'Belajar skill baru hari ini?', type: 'toggle', scoreMap: v => v ? 20 : 0 },
  ],
  soul: [
    { id: 'sleep_hours', label: 'Tidur berapa jam semalam?', type: 'slider', min: 0, max: 12, step: 0.5, unit: 'jam', scoreMap: v => v >= 7 ? 25 : (v >= 5 ? 5 : -15) },
    { id: 'stress_level', label: 'Stress level hari ini?', type: 'slider', min: 0, max: 10, step: 1, unit: '/10', scoreMap: v => Math.round((5 - v) * 4) },
    { id: 'exercise', label: 'Olahraga atau gerak aktif hari ini?', type: 'toggle', scoreMap: v => v ? 20 : -5 },
  ],
  social: [
    { id: 'helped', label: 'Bantu teman atau orang lain hari ini?', type: 'toggle', scoreMap: v => v ? 25 : 0 },
    { id: 'conflict', label: 'Ada konflik yang belum terselesaikan?', type: 'toggle', scoreMap: v => v ? -20 : 5 },
    { id: 'quality_convo', label: 'Punya percakapan bermakna hari ini?', type: 'toggle', scoreMap: v => v ? 20 : 0 },
  ],
  economic: [
    { id: 'local_spend', label: 'Belanja di warung/UMKM lokal hari ini?', type: 'toggle', scoreMap: v => v ? 25 : -10 },
    { id: 'impulsive_buy', label: 'Beli sesuatu karena impuls, bukan kebutuhan?', type: 'toggle', scoreMap: v => v ? -15 : 10 },
    { id: 'save_money', label: 'Menabung atau investasi hari ini?', type: 'toggle', scoreMap: v => v ? 20 : 0 },
  ],
  nature: [
    { id: 'transport', label: 'Transportasi utama hari ini?', type: 'choice', options: ['Mobil pribadi 🚗', 'Ojek/Grab 🛵', 'Kendaraan umum 🚌', 'Jalan kaki / Sepeda 🚶'], scoreMap: i => [-20, -5, 10, 30][i] },
    { id: 'plastic', label: 'Pakai plastik sekali pakai hari ini?', type: 'toggle', scoreMap: v => v ? -15 : 15 },
    { id: 'food_choice', label: 'Makan makanan nabati/lokal hari ini?', type: 'toggle', scoreMap: v => v ? 20 : 0 },
  ],
};

// ── Onboarding Questions ────────────────────────────────────
export const ONBOARDING_QUESTIONS = [
  {
    id: 'name', label: 'Siapa namamu?', type: 'text',
    placeholder: 'Masukkan namamu...', hint: 'Nama ini akan muncul di Globe-mu.',
  },
  {
    id: 'city', label: 'Kamu tinggal di kota mana di Indonesia?', type: 'choice',
    options: ['Jakarta', 'Surabaya', 'Bandung', 'Medan', 'Makassar', 'Yogyakarta', 'Denpasar', 'Palembang', 'Kota lain'],
  },
  {
    id: 'grade', label: 'Kamu pelajar kelas / tingkat apa?', type: 'choice',
    options: ['SMP', 'SMA / SMK', 'Mahasiswa S1', 'Mahasiswa S2+', 'Lainnya'],
  },
  {
    id: 'biggest_concern', label: 'Masalah terbesar yang kamu pedulikan?', type: 'choice',
    options: ['🌍 Perubahan Iklim', '📚 Kualitas Pendidikan', '💸 Kesenjangan Ekonomi', '🧠 Kesehatan Mental', '🤝 Perpecahan Sosial'],
  },
  {
    id: 'daily_dream', label: 'Satu kata yang menggambarkan dunia impianmu?', type: 'text',
    placeholder: 'Damai, hijau, adil, maju...', hint: 'Kata ini akan jadi misi Globe-mu.',
  },
];

// ── AI Mirror Narrative Engine ───────────────────────────────
export function generateMirrorNarrative(layerId, score, userName) {
  const layer = LAYERS.find(l => l.id === layerId);
  const name = userName || 'Kamu';
  const positive = score >= 0;

  const narratives = {
    mind: positive
      ? `Jika 10 juta pelajar Indonesia belajar seperti ${name} hari ini, **indeks inovasi Indonesia di 2050 akan melonjak ke peringkat 15 dunia** — melampaui Thailand dan Vietnam. Paten teknologi buatan Indonesia akan mulai terlihat di pasar global.`
      : `Jika tren ini berlanjut, **gap literasi digital Indonesia akan melebar 23%** dalam satu dekade. Potensi talenta yang terbuang setara kerugian ekonomi Rp 4.200 triliun per tahun.`,
    soul: positive
      ? `Generasi yang tumbuh dengan kesehatan mental seperti ${name} akan **membangun sistem kesehatan yang 40% lebih efisien**. Tingkat burnout nasional akan turun dan GDP per kapita akan naik karena produktivitas meningkat.`
      : `Generasi dengan tekanan mental seperti ini akan **membebani sistem kesehatan Indonesia sebesar Rp 800 miliar per tahun**. Kreativitas dan inovasi akan tersumbat selama 15 tahun ke depan.`,
    social: positive
      ? `Masyarakat yang dibangun dari koneksi seperti ${name} akan menciptakan **social trust index tertinggi di Asia Tenggara pada 2045**. Korupsi turun, kolaborasi antar daerah meningkat, dan polarisasi sosial berkurang 60%.`
      : `Isolasi sosial yang menyebar akan **melemahkan modal sosial Indonesia senilai 2,1% GDP**. Polarisasi akan mempersulit pengambilan keputusan kolektif selama generasi ini aktif.`,
    economic: positive
      ? `Jika pelajar Indonesia berbelanja seperti ${name}, **UMKM lokal akan tumbuh 18% per tahun** dan uang beredar dalam ekosistem Indonesia sendiri. Ketergantungan pada impor akan turun signifikan pada 2035.`
      : `Setiap rupiah yang keluar ke platform global mengalirkan **kapital senilai Rp 2.400 triliun ke luar negeri setiap tahun**. UMKM lokal kehilangan pangsa pasar dan lapangan kerja berkurang.`,
    nature: positive
      ? `Pilihan transportasi dan konsumsi ${name} setara **menyelamatkan 0,003 ton CO₂ hari ini**. Jika direplikasi 50 juta pelajar, Indonesia akan memenuhi target karbon 2030 empat tahun lebih awal.`
      : `Jejak karbon ini berkontribusi pada **percepatan kenaikan suhu sebesar 0.0000008°C per hari**. Kecil — tapi dikali 300 juta orang selama 50 tahun, hasilnya adalah krisis yang nyata.`,
  };

  return narratives[layerId] || 'Setiap pilihanmu membentuk dunia yang lebih baik.';
}

// ── City Feature Generator ───────────────────────────────────
export function generateCityFeatures(scores) {
  const features = [];
  if (scores.mind > 10) features.push({ icon: '🏛️', label: 'Universitas Megah', desc: 'Pusat inovasi dan riset kelas dunia' });
  if (scores.mind < -10) features.push({ icon: '📉', label: 'Pusat Belajar Tutup', desc: 'Kurangnya minat belajar melemahkan infrastruktur pendidikan' });
  if (scores.soul > 10) features.push({ icon: '🌿', label: 'Taman Meditasi Publik', desc: 'Ruang rehat mental tersedia di setiap sudut kota' });
  if (scores.soul < -10) features.push({ icon: '🏥', label: 'Klinik Mental Overload', desc: 'Sistem kesehatan jiwa kelebihan kapasitas' });
  if (scores.social > 10) features.push({ icon: '🤝', label: 'Alun-alun Komunitas', desc: 'Ruang publik ramai penuh kegiatan bersama' });
  if (scores.social < -10) features.push({ icon: '🔒', label: 'Kota Terisolasi', desc: 'Masyarakat individual, minim interaksi bermakna' });
  if (scores.economic > 10) features.push({ icon: '🏪', label: 'Pasar Lokal Ramai', desc: 'UMKM tumbuh subur, ekonomi sirkular berjalan' });
  if (scores.economic < -10) features.push({ icon: '🏬', label: 'Mall Asing Dominan', desc: 'Kapital mengalir ke luar, bisnis lokal tersisih' });
  if (scores.nature > 10) features.push({ icon: '☀️', label: 'Energi Terbarukan', desc: 'Panel surya dan turbin angin di seluruh kota' });
  if (scores.nature < -10) features.push({ icon: '🌫️', label: 'Polusi Kronis', desc: 'Kota berkabut, sungai tercemar, suhu meningkat' });
  if (features.length === 0) features.push({ icon: '🌆', label: 'Kota Seimbang', desc: 'Sedang dalam proses menemukan jalannya sendiri' });
  return features;
}

// ── Butterfly Effect Chain ───────────────────────────────────
export const BUTTERFLY_CHAINS = {
  transport: {
    label: 'Ganti naik motor → jalan kaki setiap hari',
    steps: [
      { icon: '🚶', text: 'Tubuh lebih aktif bergerak' },
      { icon: '🧠', text: 'Fokus belajar meningkat 23%' },
      { icon: '📈', text: 'Nilai akademik naik' },
      { icon: '🎓', text: 'Peluang beasiswa terbuka' },
      { icon: '💼', text: 'Karir impian lebih mudah dicapai' },
      { icon: '👨‍👩‍👧', text: 'Ekonomi keluarga membaik' },
      { icon: '🏘️', text: 'Komunitas terangkat bersama' },
      { icon: '🌍', text: 'Satu titik Indonesia bersinar lebih terang' },
    ],
    carbonSaved: '365 kg CO₂/tahun',
    healthGain: '+12 tahun harapan hidup sehat',
  },
  localFood: {
    label: 'Ganti jajan online → beli di warung lokal',
    steps: [
      { icon: '🍛', text: 'Warung lokal mendapat pelanggan' },
      { icon: '💰', text: 'Pendapatan pemilik warung naik' },
      { icon: '👨‍🍳', text: 'Karyawan warung bisa gaji lebih baik' },
      { icon: '🏫', text: 'Anak pemilik warung bisa sekolah lagi' },
      { icon: '🔄', text: 'Uang berputar di ekonomi lokal' },
      { icon: '🌱', text: 'Petani lokal ikut diuntungkan' },
      { icon: '🇮🇩', text: 'Ketahanan pangan Indonesia meningkat' },
      { icon: '🌍', text: 'Ekosistem ekonomi ASEAN lebih sehat' },
    ],
    carbonSaved: '120 kg CO₂/tahun',
    healthGain: '+Rp 4,5 juta/tahun ke ekonomi lokal',
  },
  sleep: {
    label: 'Tidur 8 jam setiap malam',
    steps: [
      { icon: '😴', text: 'Otak memproses memori lebih baik' },
      { icon: '💡', text: 'Kreativitas dan problem-solving meningkat' },
      { icon: '😊', text: 'Mood stabil, konflik berkurang' },
      { icon: '🤝', text: 'Hubungan sosial lebih kuat' },
      { icon: '📚', text: 'Performa akademik meningkat' },
      { icon: '🏃', text: 'Imun tubuh lebih kuat' },
      { icon: '💼', text: 'Produktivitas jangka panjang 40% lebih tinggi' },
      { icon: '🌍', text: 'Masyarakat yang lebih sehat dan bahagia' },
    ],
    carbonSaved: '—',
    healthGain: '+7 tahun harapan hidup',
  },
};

// ── Utility ──────────────────────────────────────────────────
export function clamp(v, min, max) { return Math.min(max, Math.max(min, v)); }

export function globeColorFromHealth(h) {
  // h: 0–100
  if (h > 70) return { primary: '#22c55e', atmosphere: '#bbf7d0', land: '#15803d' };
  if (h > 40) return { primary: '#f59e0b', atmosphere: '#fde68a', land: '#92400e' };
  return { primary: '#ef4444', atmosphere: '#fecaca', land: '#7f1d1d' };
}

export function scoreToHealth(total) {
  // total clamps –100…+100 → health 0…100
  return clamp(Math.round((total + 100) / 2), 0, 100);
}
