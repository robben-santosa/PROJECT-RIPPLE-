// ============================================================
// RIPPLE — ripple.js
// SVG/Canvas Ripple Wave Animation Engine
// ============================================================

// Indonesia's approximate position on the world map (normalized 0-1)
export const INDONESIA_POS = { x: 0.76, y: 0.54 };

// ── Ripple Engine Class ──────────────────────────────────────
export class RippleEngine {
  constructor(svgEl) {
    this.svg   = svgEl;
    this.waves = [];
    this.running = false;
    this.frameId = null;
  }

  start() {
    if (this.running) return;
    this.running = true;
    this._loop();
  }

  stop() {
    this.running = false;
    cancelAnimationFrame(this.frameId);
  }

  // Emit a ripple wave from Indonesia
  // type: 'positive' | 'negative' | 'neutral'
  emit(type = 'neutral', label = '') {
    const W = this.svg.clientWidth  || window.innerWidth;
    const H = this.svg.clientHeight || window.innerHeight;
    const cx = INDONESIA_POS.x * W;
    const cy = INDONESIA_POS.y * H;
    const colors = {
      positive: { stroke: '#22c55e', fill: 'rgba(34,197,94,0.06)' },
      negative: { stroke: '#ef4444', fill: 'rgba(239,68,68,0.06)' },
      neutral:  { stroke: '#3b82f6', fill: 'rgba(59,130,246,0.06)' },
    };
    const col = colors[type] || colors.neutral;

    // Create multiple expanding rings
    const numRings = 4;
    for (let i = 0; i < numRings; i++) {
      setTimeout(() => this._createRing(cx, cy, col, i), i * 280);
    }

    // Dot pulse at origin
    this._createOriginPulse(cx, cy, col);

    // Label
    if (label) this._createLabel(cx, cy, label, col.stroke);
  }

  _createRing(cx, cy, col, index) {
    const ring = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    ring.setAttribute('cx', cx);
    ring.setAttribute('cy', cy);
    ring.setAttribute('r', 4);
    ring.setAttribute('fill', col.fill);
    ring.setAttribute('stroke', col.stroke);
    ring.setAttribute('stroke-width', 1.5 - index * 0.2);
    ring.setAttribute('stroke-opacity', 0.8);
    ring.setAttribute('fill-opacity', 0.4);
    this.svg.appendChild(ring);

    const maxR = Math.max(window.innerWidth, window.innerHeight) * 0.75;
    const duration = 2800;
    const start = performance.now();

    const wave = { el: ring, start, duration, maxR, cx, cy, done: false };
    this.waves.push(wave);
  }

  _createOriginPulse(cx, cy, col) {
    const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    dot.setAttribute('cx', cx);
    dot.setAttribute('cy', cy);
    dot.setAttribute('r', 6);
    dot.setAttribute('fill', col.stroke);
    dot.setAttribute('opacity', 0.9);
    this.svg.appendChild(dot);

    const start = performance.now();
    const pulseDur = 600;

    const pulse = {
      el: dot, start, duration: pulseDur, maxR: 14,
      cx, cy, done: false, isPulse: true,
    };
    this.waves.push(pulse);
  }

  _createLabel(cx, cy, text, color) {
    const lbl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    lbl.setAttribute('x', cx + 14);
    lbl.setAttribute('y', cy - 10);
    lbl.setAttribute('fill', color);
    lbl.setAttribute('font-size', '11');
    lbl.setAttribute('font-family', 'Plus Jakarta Sans, sans-serif');
    lbl.setAttribute('font-weight', '600');
    lbl.setAttribute('opacity', '0.9');
    lbl.textContent = text;
    this.svg.appendChild(lbl);

    setTimeout(() => { if (lbl.parentNode) lbl.parentNode.removeChild(lbl); }, 2500);
  }

  _loop() {
    if (!this.running) return;
    const now = performance.now();

    this.waves = this.waves.filter(wave => {
      const t = Math.min(1, (now - wave.start) / wave.duration);
      const eased = 1 - Math.pow(1 - t, 2); // ease-out quad

      if (wave.isPulse) {
        const r = 6 + eased * 8;
        const op = Math.max(0, 0.9 - t * 1.5);
        wave.el.setAttribute('r', r);
        wave.el.setAttribute('opacity', op);
      } else {
        const r = eased * wave.maxR;
        const op = Math.max(0, 0.75 - eased * 0.85);
        wave.el.setAttribute('r', r);
        wave.el.setAttribute('stroke-opacity', op);
        wave.el.setAttribute('fill-opacity', Math.max(0, 0.2 - eased * 0.25));
      }

      if (t >= 1) {
        if (wave.el.parentNode) wave.el.parentNode.removeChild(wave.el);
        return false;
      }
      return true;
    });

    this.frameId = requestAnimationFrame(() => this._loop());
  }

  // Ambient background ripples (initial ambiance)
  startAmbient() {
    const types = ['positive', 'negative', 'neutral'];
    const emitAmbient = () => {
      if (!this.running) return;
      const t = types[Math.floor(Math.random() * types.length)];
      this.emit(t);
      setTimeout(emitAmbient, 3000 + Math.random() * 4000);
    };
    setTimeout(emitAmbient, 1500);
  }

  destroy() {
    this.stop();
    while (this.svg.firstChild) this.svg.removeChild(this.svg.firstChild);
  }
}

// ── Global Ripple Map (D3-like SVG world ripples) ────────────
export class GlobalRippleMap {
  constructor(canvasEl) {
    this.canvas  = canvasEl;
    this.ctx     = canvasEl.getContext('2d');
    this.ripples = [];
    this.frameId = null;
    this.cities  = this._indonesianCities();
    this._resize();
    window.addEventListener('resize', () => this._resize());
  }

  _indonesianCities() {
    return [
      { name: 'Jakarta',   lat: -6.2,  lon: 106.8, size: 10 },
      { name: 'Surabaya',  lat: -7.3,  lon: 112.7, size:  7 },
      { name: 'Bandung',   lat: -6.9,  lon: 107.6, size:  6 },
      { name: 'Medan',     lat:  3.6,  lon:  98.7, size:  6 },
      { name: 'Makassar',  lat: -5.1,  lon: 119.4, size:  5 },
      { name: 'Bali',      lat: -8.4,  lon: 115.2, size:  5 },
      { name: 'Yogyakarta',lat: -7.8,  lon: 110.4, size:  4 },
    ];
  }

  _resize() {
    const parent = this.canvas.parentElement;
    if (!parent) return;
    this.W = parent.clientWidth;
    this.H = Math.round(this.W * 0.56);
    this.canvas.width  = this.W;
    this.canvas.height = this.H;
  }

  _latLonToXY(lat, lon) {
    // Simple equirectangular projection for SE Asia focus
    const x = ((lon + 180) / 360) * this.W;
    const y = ((90 - lat) / 180) * this.H;
    return { x, y };
  }

  addRipple(cityName, type = 'positive') {
    const city = this.cities.find(c => c.name === cityName) || this.cities[0];
    const pos  = this._latLonToXY(city.lat, city.lon);
    const colors = {
      positive: { r: 34,  g: 197, b: 94  },
      negative: { r: 239, g: 68,  b: 68  },
      neutral:  { r: 59,  g: 130, b: 246 },
    };
    const col = colors[type] || colors.neutral;
    this.ripples.push({ x: pos.x, y: pos.y, r: 2, maxR: 120, col, alpha: 1, start: Date.now() });
  }

  _drawWorldOutline() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.W, this.H);

    // Ocean bg
    const grad = ctx.createLinearGradient(0, 0, 0, this.H);
    grad.addColorStop(0, '#060d1a');
    grad.addColorStop(1, '#0a1520');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, this.W, this.H);

    // Grid lines
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = 0.5;
    for (let lon = -180; lon <= 180; lon += 30) {
      const x = ((lon + 180) / 360) * this.W;
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, this.H); ctx.stroke();
    }
    for (let lat = -90; lat <= 90; lat += 30) {
      const y = ((90 - lat) / 180) * this.H;
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(this.W, y); ctx.stroke();
    }

    // Land masses (simplified blobs)
    ctx.fillStyle = 'rgba(30,55,90,0.7)';
    const lands = [
      { x: 0.61, y: 0.28, rx: 0.23, ry: 0.22 }, // Asia
      { x: 0.53, y: 0.55, rx: 0.10, ry: 0.25 }, // Africa
      { x: 0.19, y: 0.33, rx: 0.12, ry: 0.28 }, // Americas
      { x: 0.22, y: 0.62, rx: 0.09, ry: 0.18 }, // S. America
      { x: 0.78, y: 0.65, rx: 0.09, ry: 0.09 }, // Australia
    ];
    lands.forEach(l => {
      ctx.beginPath();
      ctx.ellipse(l.x * this.W, l.y * this.H, l.rx * this.W, l.ry * this.H, 0, 0, Math.PI * 2);
      ctx.fill();
    });

    // Indonesia highlight
    const ipos = this._latLonToXY(-2, 118);
    ctx.fillStyle = 'rgba(108,99,255,0.35)';
    ctx.beginPath();
    ctx.ellipse(ipos.x, ipos.y, 28, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#6c63ff';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  _drawCities() {
    this.cities.forEach(city => {
      const pos = this._latLonToXY(city.lat, city.lon);
      const ctx = this.ctx;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, city.size * 0.5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(108,99,255,0.8)';
      ctx.fill();
      ctx.strokeStyle = 'rgba(165,140,255,0.6)';
      ctx.lineWidth = 1;
      ctx.stroke();

      if (city.size >= 7) {
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.font = '9px Plus Jakarta Sans';
        ctx.fillText(city.name, pos.x + 6, pos.y + 3);
      }
    });
  }

  _drawRipples() {
    const now = Date.now();
    this.ripples = this.ripples.filter(rp => {
      const age = (now - rp.start) / 2000;
      if (age >= 1) return false;
      const r = rp.r + age * rp.maxR;
      const alpha = Math.max(0, 1 - age);
      const { r: cr, g, b } = rp.col;
      this.ctx.beginPath();
      this.ctx.arc(rp.x, rp.y, r, 0, Math.PI * 2);
      this.ctx.strokeStyle = `rgba(${cr},${g},${b},${alpha * 0.7})`;
      this.ctx.lineWidth = 1.5;
      this.ctx.stroke();
      this.ctx.fillStyle = `rgba(${cr},${g},${b},${alpha * 0.05})`;
      this.ctx.fill();
      return true;
    });
  }

  start() {
    const loop = () => {
      this._drawWorldOutline();
      this._drawCities();
      this._drawRipples();
      this.frameId = requestAnimationFrame(loop);
    };
    loop();

    // Auto ripples
    const autoRipple = () => {
      const city = this.cities[Math.floor(Math.random() * this.cities.length)];
      const types = ['positive', 'positive', 'neutral', 'negative'];
      this.addRipple(city.name, types[Math.floor(Math.random() * types.length)]);
      setTimeout(autoRipple, 1200 + Math.random() * 2000);
    };
    setTimeout(autoRipple, 800);
  }

  destroy() {
    cancelAnimationFrame(this.frameId);
  }
}
