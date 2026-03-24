// ============================================================
// RIPPLE — globe.js  (Rewritten: Photo-realistic Earth)
// Uses NASA/Three.js textures: day map, normal, specular,
// cloud layer, atmosphere glow, star field
// ============================================================

// Texture URLs (Three.js examples repo — reliable CDN)
const TEX = {
  earth:    'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_atmos_2048.jpg',
  normal:   'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_normal_2048.jpg',
  specular: 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_specular_2048.jpg',
  clouds:   'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_clouds_1024.png',
};

// ── GlobeRenderer ─────────────────────────────────────────
export class GlobeRenderer {
  constructor(canvas, opts = {}) {
    this.canvas     = canvas;
    this.size       = opts.size   || 400;
    this.health     = opts.health !== undefined ? opts.health : 50;
    this.autoRotate = opts.autoRotate !== false;
    this.interactive = opts.interactive || false;

    this._renderer  = null;
    this._scene     = null;
    this._camera    = null;
    this._earth     = null;
    this._clouds    = null;
    this._glow      = null;
    this._animId    = null;
    this._isPointer = false;
    this._phi       = Math.PI / 2;
    this._theta     = 0;
    this._dragging  = false;
    this._lastX     = 0;
    this._lastY     = 0;
  }

  async init() {
    if (!window.THREE) return;
    const THREE = window.THREE;
    const W = this.size, H = this.size;

    // Renderer
    this._renderer = new THREE.WebGLRenderer({ canvas: this.canvas, alpha: true, antialias: true });
    this._renderer.setSize(W, H);
    this._renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this._renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this._renderer.toneMappingExposure = 1.2;

    // Scene + camera
    this._scene  = new THREE.Scene();
    this._camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 100);
    this._camera.position.z = 2.5;

    // Load textures
    const loader = new THREE.TextureLoader();
    const load   = (url) => new Promise((res, rej) => loader.load(url, res, undefined, rej));

    let earthTex, normalTex, specTex, cloudTex;
    try {
      [earthTex, normalTex, specTex, cloudTex] = await Promise.all([
        load(TEX.earth), load(TEX.normal), load(TEX.specular), load(TEX.clouds),
      ]);
    } catch (_) {
      // Fallback: plain blue sphere
      this._buildFallback(THREE);
      this._startLoop(THREE);
      return;
    }

    // ── Earth sphere ──────────────────────────────────────
    const geo = new THREE.SphereGeometry(1, 64, 64);
    const mat = new THREE.MeshPhongMaterial({
      map:          earthTex,
      normalMap:    normalTex,
      specularMap:  specTex,
      specular:     new THREE.Color(0x4488aa),
      shininess:    18,
    });
    this._earth = new THREE.Mesh(geo, mat);
    this._earth.rotation.y = -0.3;
    this._scene.add(this._earth);

    // ── Cloud layer ───────────────────────────────────────
    const cloudGeo = new THREE.SphereGeometry(1.012, 64, 64);
    const cloudMat = new THREE.MeshPhongMaterial({
      map:         cloudTex,
      transparent: true,
      opacity:     0.38,
      depthWrite:  false,
    });
    this._clouds = new THREE.Mesh(cloudGeo, cloudMat);
    this._scene.add(this._clouds);

    // ── Atmosphere glow ───────────────────────────────────
    this._buildAtmosphere(THREE);

    // ── Lighting ──────────────────────────────────────────
    // Ambient
    const ambient = new THREE.AmbientLight(0x333333, 0.6);
    this._scene.add(ambient);

    // Key light (sun-like, from top-left)
    const sun = new THREE.DirectionalLight(0xffffff, 1.4);
    sun.position.set(5, 3, 5);
    this._scene.add(sun);

    // Subtle fill light from opposite side (night-side glow)
    const fill = new THREE.DirectionalLight(0x0033aa, 0.18);
    fill.position.set(-5, -1, -3);
    this._scene.add(fill);

    // ── Star field (only for larger globes) ───────────────
    if (this.size > 200) this._buildStars(THREE);

    // ── Interaction ───────────────────────────────────────
    if (this.interactive) this._bindDrag();

    // ── Apply health tint ─────────────────────────────────
    this._applyHealthTint(THREE);

    // ── Start render loop ─────────────────────────────────
    this._startLoop(THREE);
  }

  _buildAtmosphere(THREE) {
    // Glow: back-face sphere, additive, transparent blue
    const glowGeo = new THREE.SphereGeometry(1.12, 32, 32);
    const glowMat = new THREE.ShaderMaterial({
      uniforms: {
        c: { value: 0.3 },
        p: { value: 6.0 },
        glowColor: { value: new THREE.Color(0x3399ff) },
      },
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float c;
        uniform float p;
        uniform vec3 glowColor;
        varying vec3 vNormal;
        void main() {
          float intensity = pow(c - dot(vNormal, vec3(0,0,1)), p);
          gl_FragColor = vec4(glowColor * intensity, intensity * 0.7);
        }
      `,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false,
    });
    this._glow = new THREE.Mesh(glowGeo, glowMat);
    this._scene.add(this._glow);
  }

  _buildStars(THREE) {
    const positions = [];
    for (let i = 0; i < 2000; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi   = Math.acos(2 * Math.random() - 1);
      const r     = 40 + Math.random() * 20;
      positions.push(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.sin(phi) * Math.sin(theta),
        r * Math.cos(phi)
      );
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    const mat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.15, sizeAttenuation: true });
    this._scene.add(new THREE.Points(geo, mat));
  }

  _buildFallback(THREE) {
    // Fallback: simple gradient sphere if textures fail
    const geo = new THREE.SphereGeometry(1, 32, 32);
    const mat = new THREE.MeshPhongMaterial({ color: 0x1a6b5a, emissive: 0x0a2a20, shininess: 20 });
    this._earth = new THREE.Mesh(geo, mat);
    this._scene.add(this._earth);
    const ambient = new THREE.AmbientLight(0xffffff, 0.5);
    const sun = new THREE.DirectionalLight(0xffffff, 1);
    sun.position.set(5, 3, 5);
    this._scene.add(ambient, sun);
    this._buildAtmosphere(THREE);
  }

  _applyHealthTint(THREE) {
    if (!this._glow) return;
    const h = this.health;
    let col;
    if (h > 70)      col = new THREE.Color(0x22aaff); // healthy: blue atmosphere
    else if (h > 40) col = new THREE.Color(0xff8800); // stressed: orange
    else             col = new THREE.Color(0xff3300); // critical: red

    this._glow.material.uniforms.glowColor.value = col;

    // Also subtly tint the earth if critical
    if (this._earth && this._earth.material.color !== undefined) {
      if (h <= 30) {
        this._earth.material.color.setHex(0xbb8866);
      }
    }
  }

  _startLoop(THREE) {
    const animate = () => {
      this._animId = requestAnimationFrame(animate);

      if (this.autoRotate && !this._dragging) {
        if (this._earth)  this._earth.rotation.y  += 0.0015;
        if (this._clouds) this._clouds.rotation.y += 0.0018;
        if (this._glow)   this._glow.rotation.y   += 0.0010;
      }

      if (this._clouds) this._clouds.rotation.x += 0.0003;

      this._renderer.render(this._scene, this._camera);
    };
    animate();
  }

  _bindDrag() {
    const c = this.canvas;
    let startX, startY, startTheta, startPhi;

    c.addEventListener('pointerdown', e => {
      this._dragging = true;
      startX = e.clientX;
      startY = e.clientY;
      startTheta = this._earth ? this._earth.rotation.y : 0;
      startPhi   = this._earth ? this._earth.rotation.x : 0;
      c.style.cursor = 'grabbing';
    });
    window.addEventListener('pointermove', e => {
      if (!this._dragging) return;
      const dx = (e.clientX - startX) / this.size;
      const dy = (e.clientY - startY) / this.size;
      if (this._earth) {
        this._earth.rotation.y  = startTheta + dx * 2.5;
        this._earth.rotation.x  = startPhi   + dy * 1.2;
        if (this._clouds) {
          this._clouds.rotation.y = this._earth.rotation.y + 0.02;
          this._clouds.rotation.x = this._earth.rotation.x + 0.01;
        }
      }
    });
    window.addEventListener('pointerup', () => {
      this._dragging = false;
      c.style.cursor = 'grab';
    });
    c.style.cursor = 'grab';
  }

  setHealth(h) {
    this.health = h;
    if (window.THREE) this._applyHealthTint(window.THREE);
  }

  pulse() {
    if (!this._earth) return;
    const orig = this._earth.scale.clone();
    const THREE = window.THREE;
    let t = 0;
    const id = setInterval(() => {
      t++;
      const s = 1 + 0.04 * Math.sin(t * 0.4);
      this._earth.scale.set(s, s, s);
      if (this._clouds) this._clouds.scale.set(s * 1.012, s * 1.012, s * 1.012);
      if (t > 30) { clearInterval(id); this._earth.scale.set(1, 1, 1); if (this._clouds) this._clouds.scale.set(1.012, 1.012, 1.012); }
    }, 40);
  }

  destroy() {
    if (this._animId) cancelAnimationFrame(this._animId);
  }
}

// ── MiniGlobe (nav) ───────────────────────────────────────
export class MiniGlobe {
  constructor(canvas, health = 50) {
    this.canvas = canvas;
    this.health = health;
    this._renderer = null;
    this._scene    = null;
    this._camera   = null;
    this._mesh     = null;
    this._animId   = null;
  }

  async init() {
    if (!window.THREE) return;
    const THREE = window.THREE;

    this._renderer = new THREE.WebGLRenderer({ canvas: this.canvas, alpha: true, antialias: true });
    this._renderer.setSize(32, 32);

    this._scene  = new THREE.Scene();
    this._camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    this._camera.position.z = 2.5;

    // Try to load quick texture
    const loader = new THREE.TextureLoader();
    let tex;
    try {
      tex = await new Promise((res, rej) => loader.load(TEX.earth, res, undefined, rej));
    } catch (_) { tex = null; }

    const geo = new THREE.SphereGeometry(1, 24, 24);
    const mat = tex
      ? new THREE.MeshPhongMaterial({ map: tex })
      : new THREE.MeshPhongMaterial({ color: 0x1a6b5a });

    this._mesh = new THREE.Mesh(geo, mat);
    this._scene.add(this._mesh);

    const ambient = new THREE.AmbientLight(0xffffff, 0.5);
    const sun = new THREE.DirectionalLight(0xffffff, 1.2);
    sun.position.set(5, 3, 5);
    this._scene.add(ambient, sun);

    this._animate();
  }

  _animate() {
    this._animId = requestAnimationFrame(() => this._animate());
    if (this._mesh) this._mesh.rotation.y += 0.012;
    this._renderer.render(this._scene, this._camera);
  }

  setHealth(h) { this.health = h; }

  destroy() { if (this._animId) cancelAnimationFrame(this._animId); }
}
