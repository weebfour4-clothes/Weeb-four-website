/**
 * WEEBFOUR 3D CYBER-GRAIL ATELIER
 * Real-Time WebGL 3D Streetwear Experience Powered by Three.js
 * 
 * Features:
 * - High-poly procedural Cyber-Grail sneaker artifact with sculptural sole, carbon chassis, and cyber-laces
 * - Dual gyroscopic anti-gravity energy rings with dynamic counter-rotation
 * - Orbiting stardust particle nebula (450+ dynamic emissive nodes)
 * - Holographic cyber-pedestal with animated radial grid
 * - Silky smooth touch & mouse orbit controls with inertial damping
 * - Interactive View Modes: Solid PBR, Wireframe Matrix, Hologram Core
 * - Dynamic Colorway Switcher: Tokyo Crimson, Cyber Cyan, Neon Emerald, Synthwave Violet
 * - Explode / Disassemble 3D view with animated kinematics
 * - Turbo Pulse acceleration FX
 * - Battery & Performance Optimized: Clamped pixel ratios & IntersectionObserver pausing
 */

(function () {
  'use strict';

  let scene, camera, renderer, animationFrameId;
  let grailMasterGroup, soleGroup, chassisGroup, laceGroup, ring1, ring2, coreCrystal, particleSystem, pedestalGroup;
  let keyLight, pointLightAccent1, pointLightAccent2;
  let isDragging = false;
  let previousMousePosition = { x: 0, y: 0 };
  let targetRotation = { x: 0.15, y: -0.6 };
  let currentRotation = { x: 0.15, y: -0.6 };
  let rotationVelocity = { x: 0, y: 0.005 };
  let isExploded = false;
  let explodeProgress = 0; // 0 = assembled, 1 = exploded
  let isAutoOrbiting = true;
  let currentMode = 'solid'; // 'solid' | 'wireframe' | 'hologram'
  let currentColorway = 'crimson';
  let isSectionVisible = true;
  let fpsLastTime = performance.now();
  let frameCount = 0;

  // Colorway Palette Definitions
  const PALETTES = {
    crimson: {
      name: 'Tokyo Crimson',
      primary: 0xd6002f,
      primaryHex: '#d6002f',
      secondary: 0xff3355,
      secondaryHex: '#ff3355',
      glow: 0xff003b,
      chassis: 0x14151c,
      sole: 0x0c0d12,
      accent: 0xd6002f
    },
    cyan: {
      name: 'Cyber Cyan',
      primary: 0x00f2ff,
      primaryHex: '#00f2ff',
      secondary: 0x00aaff,
      secondaryHex: '#00aaff',
      glow: 0x00f2ff,
      chassis: 0x111620,
      sole: 0x0a0f14,
      accent: 0x00f2ff
    },
    emerald: {
      name: 'Neo Emerald',
      primary: 0x00ff88,
      primaryHex: '#00ff88',
      secondary: 0x00cc66,
      secondaryHex: '#00cc66',
      glow: 0x00ff88,
      chassis: 0x101a14,
      sole: 0x09120c,
      accent: 0x00ff88
    },
    violet: {
      name: 'Synthwave Violet',
      primary: 0xb026ff,
      primaryHex: '#b026ff',
      secondary: 0xd946ef,
      secondaryHex: '#d946ef',
      glow: 0xb026ff,
      chassis: 0x181224,
      sole: 0x0e0a16,
      accent: 0xb026ff
    }
  };

  // Cache materials for dynamic swapping
  const materials = {
    soleMat: null,
    soleAccentMat: null,
    chassisMat: null,
    chassisAccentMat: null,
    laceMat: null,
    ringMat1: null,
    ringMat2: null,
    crystalMat: null,
    particleMat: null,
    pedestalMat: null
  };

  function initGrail3D() {
    const canvas = document.getElementById('grail-3d-canvas');
    const container = document.getElementById('grail-3d-viewport');
    if (!canvas || !container || typeof THREE === 'undefined') {
      console.warn('Grail 3D canvas or THREE library not available.');
      return;
    }

    // 1. Scene Setup with Ambient Atmospheric Fog
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x090a0d, 0.035);

    // 2. Camera Setup
    const width = container.clientWidth || 600;
    const height = container.clientHeight || 450;
    camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    camera.position.set(0, 0.8, 5.0);

    // 3. WebGL Renderer
    renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    if (renderer.outputColorSpace) {
      renderer.outputColorSpace = THREE.SRGBColorSpace;
    } else if (renderer.outputEncoding) {
      renderer.outputEncoding = THREE.sRGBEncoding;
    }
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;

    // 4. Lighting System
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.65);
    scene.add(ambientLight);

    keyLight = new THREE.DirectionalLight(0xffffff, 1.4);
    keyLight.position.set(6, 10, 6);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xffffff, 0.8);
    rimLight.position.set(-6, 4, -4);
    scene.add(rimLight);

    pointLightAccent1 = new THREE.PointLight(PALETTES.crimson.primary, 3.8, 14);
    pointLightAccent1.position.set(-2.8, -0.6, 2.5);
    scene.add(pointLightAccent1);

    pointLightAccent2 = new THREE.PointLight(PALETTES.crimson.secondary, 2.6, 14);
    pointLightAccent2.position.set(2.8, 2.0, -2.0);
    scene.add(pointLightAccent2);

    // 5. Construct 3D Procedural Cyber-Grail
    buildCyberGrailModel();

    // 6. Build Orbiting Particle Nebula
    buildParticleNebula();

    // 7. Build Holographic Cyber-Pedestal
    buildPedestal();

    // 8. Setup Orbit Controls & Touch Interaction
    setupInteractions(container, canvas);

    // 9. Intersection Observer (Freeze render loop when offscreen)
    setupVisibilityObserver(container);

    // 10. Window Resize Handler
    window.addEventListener('resize', handleResize);

    // 11. Start Render Loop
    animate();
    console.log('WEEBFOUR 3D Cyber-Grail Atelier loaded successfully.');
  }

  // =========================================================================
  // MODEL GENERATION: HIGH-TECH CYBER STREETWEAR GRAIL
  // =========================================================================
  function buildCyberGrailModel() {
    grailMasterGroup = new THREE.Group();
    grailMasterGroup.position.set(0, -0.1, 0);

    const palette = PALETTES[currentColorway];

    // Master Materials
    materials.soleMat = new THREE.MeshStandardMaterial({
      color: palette.sole,
      roughness: 0.35,
      metalness: 0.5,
      flatShading: false
    });

    materials.soleAccentMat = new THREE.MeshStandardMaterial({
      color: palette.primary,
      emissive: palette.primary,
      emissiveIntensity: 0.85,
      roughness: 0.2,
      metalness: 0.7
    });

    materials.chassisMat = new THREE.MeshStandardMaterial({
      color: palette.chassis,
      roughness: 0.4,
      metalness: 0.6,
      flatShading: false
    });

    materials.chassisAccentMat = new THREE.MeshStandardMaterial({
      color: palette.primary,
      emissive: palette.primary,
      emissiveIntensity: 0.6,
      roughness: 0.25,
      metalness: 0.8
    });

    materials.laceMat = new THREE.MeshStandardMaterial({
      color: 0xefefef,
      roughness: 0.5,
      metalness: 0.2
    });

    materials.ringMat1 = new THREE.MeshStandardMaterial({
      color: palette.primary,
      emissive: palette.primary,
      emissiveIntensity: 1.0,
      wireframe: true,
      roughness: 0.1,
      metalness: 0.9
    });

    materials.ringMat2 = new THREE.MeshStandardMaterial({
      color: palette.secondary,
      emissive: palette.secondary,
      emissiveIntensity: 0.85,
      roughness: 0.2,
      metalness: 0.8
    });

    materials.crystalMat = new THREE.MeshStandardMaterial({
      color: palette.primary,
      emissive: palette.primary,
      emissiveIntensity: 1.4,
      roughness: 0.1,
      metalness: 0.9,
      wireframe: false
    });

    // -------------------------------------------------------------
    // PART A: SOLE UNIT (Aerodynamic Streetwear Outsole)
    // -------------------------------------------------------------
    soleGroup = new THREE.Group();

    // Main chunky outsole platform
    const soleShape = new THREE.Shape();
    soleShape.moveTo(-1.6, -0.4);
    soleShape.lineTo(1.6, -0.4);
    soleShape.quadraticCurveTo(1.9, -0.3, 1.8, 0.0);
    soleShape.quadraticCurveTo(1.5, 0.25, 1.1, 0.15);
    soleShape.quadraticCurveTo(0.2, -0.05, -0.4, 0.1);
    soleShape.quadraticCurveTo(-1.2, 0.35, -1.7, 0.15);
    soleShape.quadraticCurveTo(-1.85, -0.2, -1.6, -0.4);

    const extrudeSettings = {
      depth: 0.8,
      bevelEnabled: true,
      bevelSegments: 4,
      steps: 2,
      bevelSize: 0.08,
      bevelThickness: 0.08
    };

    const soleGeo = new THREE.ExtrudeGeometry(soleShape, extrudeSettings);
    soleGeo.center();
    const soleMesh = new THREE.Mesh(soleGeo, materials.soleMat);
    soleMesh.position.y = -0.65;
    soleGroup.add(soleMesh);

    // Glowing Neon Air Pods / Energy Chambers (Tread pods)
    for (let i = -3; i <= 3; i++) {
      const podGeo = new THREE.BoxGeometry(0.22, 0.12, 0.86);
      const podMesh = new THREE.Mesh(podGeo, materials.soleAccentMat);
      podMesh.position.set(i * 0.42, -0.72, 0);
      soleGroup.add(podMesh);
    }

    grailMasterGroup.add(soleGroup);

    // -------------------------------------------------------------
    // PART B: CHASSIS & UPPER (Japanese Cyberpunk Tailored Upper)
    // -------------------------------------------------------------
    chassisGroup = new THREE.Group();

    // Sculptural Main Body
    const bodyGeo = new THREE.CylinderGeometry(0.48, 0.75, 1.25, 8);
    bodyGeo.scale(1.8, 1.0, 0.95);
    const bodyMesh = new THREE.Mesh(bodyGeo, materials.chassisMat);
    bodyMesh.rotation.z = Math.PI / 14;
    bodyMesh.position.set(-0.15, 0.05, 0);
    chassisGroup.add(bodyMesh);

    // Toe Cap (Reinforced Armor Shell)
    const toeGeo = new THREE.SphereGeometry(0.55, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.5);
    toeGeo.scale(1.1, 0.7, 0.85);
    const toeMesh = new THREE.Mesh(toeGeo, materials.chassisAccentMat);
    toeMesh.position.set(1.15, -0.32, 0);
    chassisGroup.add(toeMesh);

    // High-Top Arch Collar & Heel Counter
    const heelGeo = new THREE.BoxGeometry(0.75, 1.15, 0.78);
    const heelMesh = new THREE.Mesh(heelGeo, materials.chassisMat);
    heelMesh.position.set(-1.05, 0.28, 0);
    heelMesh.rotation.z = -Math.PI / 18;
    chassisGroup.add(heelMesh);

    // Arch Spine / Cyber Wing Plate (The signature architectural element)
    const wingGeo = new THREE.TorusGeometry(0.85, 0.06, 8, 24, Math.PI * 0.9);
    const wingMesh = new THREE.Mesh(wingGeo, materials.chassisAccentMat);
    wingMesh.rotation.x = Math.PI / 2;
    wingMesh.rotation.y = Math.PI / 8;
    wingMesh.position.set(0.1, 0.1, 0);
    chassisGroup.add(wingMesh);

    grailMasterGroup.add(chassisGroup);

    // -------------------------------------------------------------
    // PART C: TECH-LACES & STRAPS
    // -------------------------------------------------------------
    laceGroup = new THREE.Group();

    for (let k = 0; k < 5; k++) {
      const laceCurve = new THREE.CubicBezierCurve3(
        new THREE.Vector3(-0.45 + k * 0.28, 0.15 + k * 0.08, -0.42),
        new THREE.Vector3(-0.35 + k * 0.28, 0.42 + k * 0.08, -0.2),
        new THREE.Vector3(-0.35 + k * 0.28, 0.42 + k * 0.08, 0.2),
        new THREE.Vector3(-0.45 + k * 0.28, 0.15 + k * 0.08, 0.42)
      );
      const laceGeo = new THREE.TubeGeometry(laceCurve, 12, 0.028, 6, false);
      const laceMesh = new THREE.Mesh(laceGeo, materials.laceMat);
      laceGroup.add(laceMesh);
    }

    // Technical Utility Buckle / Grailed Tag
    const buckleGeo = new THREE.BoxGeometry(0.24, 0.14, 0.6);
    const buckleMesh = new THREE.Mesh(buckleGeo, materials.chassisAccentMat);
    buckleMesh.position.set(-0.55, 0.7, 0);
    laceGroup.add(buckleMesh);

    grailMasterGroup.add(laceGroup);

    // -------------------------------------------------------------
    // PART D: DUAL GYROSCOPIC ANTI-GRAVITY RINGS
    // -------------------------------------------------------------
    const ringGeo1 = new THREE.TorusGeometry(1.75, 0.035, 12, 48);
    ring1 = new THREE.Mesh(ringGeo1, materials.ringMat1);
    ring1.rotation.x = Math.PI / 3;
    ring1.rotation.y = Math.PI / 6;
    grailMasterGroup.add(ring1);

    const ringGeo2 = new THREE.TorusGeometry(1.95, 0.025, 8, 48);
    ring2 = new THREE.Mesh(ringGeo2, materials.ringMat2);
    ring2.rotation.x = -Math.PI / 4;
    ring2.rotation.z = Math.PI / 4;
    grailMasterGroup.add(ring2);

    // -------------------------------------------------------------
    // PART E: FLOATING INTERNAL CORE CRYSTAL
    // -------------------------------------------------------------
    const crystalGeo = new THREE.OctahedronGeometry(0.26, 0);
    coreCrystal = new THREE.Mesh(crystalGeo, materials.crystalMat);
    coreCrystal.position.set(-0.1, -0.2, 0);
    grailMasterGroup.add(coreCrystal);

    scene.add(grailMasterGroup);
  }

  // =========================================================================
  // PARTICLE NEBULA (450+ EMISSIVE SWARM NODES)
  // =========================================================================
  function buildParticleNebula() {
    const particleCount = 450;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const scales = new Float32Array(particleCount);
    const palette = PALETTES[currentColorway];

    for (let i = 0; i < particleCount; i++) {
      // Cylindrical/spherical cloud around sneaker
      const radius = 1.6 + Math.random() * 2.2;
      const theta = Math.random() * Math.PI * 2;
      const y = (Math.random() - 0.5) * 3.2;

      positions[i * 3] = Math.cos(theta) * radius;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = Math.sin(theta) * radius;

      scales[i] = Math.random() * 0.05 + 0.02;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('scale', new THREE.BufferAttribute(scales, 1));

    materials.particleMat = new THREE.PointsMaterial({
      color: palette.glow,
      size: 0.05,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending
    });

    particleSystem = new THREE.Points(geometry, materials.particleMat);
    scene.add(particleSystem);
  }

  // =========================================================================
  // CYBER-PEDESTAL (ROTATING RADIAL GRID PLATFORM)
  // =========================================================================
  function buildPedestal() {
    pedestalGroup = new THREE.Group();
    pedestalGroup.position.set(0, -1.35, 0);

    const palette = PALETTES[currentColorway];

    // Grid Disc
    const discGeo = new THREE.CircleGeometry(2.4, 32);
    materials.pedestalMat = new THREE.MeshBasicMaterial({
      color: palette.primary,
      wireframe: true,
      transparent: true,
      opacity: 0.18
    });

    const discMesh = new THREE.Mesh(discGeo, materials.pedestalMat);
    discMesh.rotation.x = -Math.PI / 2;
    pedestalGroup.add(discMesh);

    // Glowing Inner Ring
    const innerRingGeo = new THREE.RingGeometry(1.2, 1.25, 32);
    const innerRingMat = new THREE.MeshBasicMaterial({
      color: palette.primary,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.4
    });
    const innerRing = new THREE.Mesh(innerRingGeo, innerRingMat);
    innerRing.rotation.x = -Math.PI / 2;
    innerRing.position.y = 0.01;
    pedestalGroup.add(innerRing);

    scene.add(pedestalGroup);
  }

  // =========================================================================
  // INTERACTION SYSTEM: DRAG & TOUCH ORBIT WITH INERTIAL DAMPING
  // =========================================================================
  function setupInteractions(container, canvas) {
    // Mouse events
    canvas.addEventListener('mousedown', (e) => {
      isDragging = true;
      isAutoOrbiting = false;
      previousMousePosition = { x: e.clientX, y: e.clientY };
      hideTouchHint();
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const deltaX = e.clientX - previousMousePosition.x;
      const deltaY = e.clientY - previousMousePosition.y;

      rotationVelocity.y = deltaX * 0.005;
      rotationVelocity.x = deltaY * 0.005;

      targetRotation.y += rotationVelocity.y;
      targetRotation.x = Math.max(-0.8, Math.min(0.8, targetRotation.x + rotationVelocity.x));

      previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        // Resume auto-orbit smoothly after delay
        setTimeout(() => {
          if (!isDragging) isAutoOrbiting = true;
        }, 3200);
      }
    });

    // Touch events for Mobile Phones
    canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        isDragging = true;
        isAutoOrbiting = false;
        previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        hideTouchHint();
      }
    }, { passive: true });

    canvas.addEventListener('touchmove', (e) => {
      if (!isDragging || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - previousMousePosition.x;
      const deltaY = e.touches[0].clientY - previousMousePosition.y;

      // Check if user is swiping horizontally on 3D canvas
      if (Math.abs(deltaX) > Math.abs(deltaY) + 2) {
        e.preventDefault(); // Prevent accidental mobile back gesture
      }

      rotationVelocity.y = deltaX * 0.006;
      rotationVelocity.x = deltaY * 0.006;

      targetRotation.y += rotationVelocity.y;
      targetRotation.x = Math.max(-0.7, Math.min(0.7, targetRotation.x + rotationVelocity.x));

      previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }, { passive: false });

    canvas.addEventListener('touchend', () => {
      isDragging = false;
      setTimeout(() => {
        if (!isDragging) isAutoOrbiting = true;
      }, 3200);
    });

    // Double-click/tap: Turbo Pulse
    canvas.addEventListener('dblclick', () => {
      window.triggerGrailTurboSpin();
    });
  }

  function hideTouchHint() {
    const hint = document.getElementById('grail-touch-hint');
    if (hint) {
      hint.style.opacity = '0';
      hint.style.pointerEvents = 'none';
    }
  }

  // =========================================================================
  // VIEW MODES & COLORWAY API (ACCESSIBLE GLOBALLY)
  // =========================================================================
  window.setGrailViewMode = function (mode) {
    currentMode = mode;
    const palette = PALETTES[currentColorway];

    // Update active UI pill
    document.querySelectorAll('.view-ctrl-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-view') === mode);
    });

    if (mode === 'solid') {
      materials.soleMat.wireframe = false;
      materials.chassisMat.wireframe = false;
      materials.soleAccentMat.wireframe = false;
      materials.chassisAccentMat.wireframe = false;
      materials.soleMat.opacity = 1.0;
      materials.soleMat.transparent = false;
      materials.chassisMat.opacity = 1.0;
      materials.chassisMat.transparent = false;
      materials.ringMat1.wireframe = true;
      materials.ringMat2.wireframe = false;
    } else if (mode === 'wireframe') {
      materials.soleMat.wireframe = true;
      materials.chassisMat.wireframe = true;
      materials.soleAccentMat.wireframe = true;
      materials.chassisAccentMat.wireframe = true;
      materials.soleMat.transparent = true;
      materials.soleMat.opacity = 0.85;
      materials.chassisMat.transparent = true;
      materials.chassisMat.opacity = 0.85;
    } else if (mode === 'hologram') {
      materials.soleMat.wireframe = true;
      materials.chassisMat.wireframe = true;
      materials.soleMat.transparent = true;
      materials.soleMat.opacity = 0.4;
      materials.chassisMat.transparent = true;
      materials.chassisMat.opacity = 0.45;
      materials.ringMat1.wireframe = true;
      materials.ringMat2.wireframe = true;
      materials.crystalMat.emissiveIntensity = 2.8;
    }

    if (window.showToast) {
      window.showToast(`3D VIEW: ${mode.toUpperCase()} MODE ACTIVE`, 'ri-eye-line');
    }
  };

  window.setGrailColorway = function (colorwayKey) {
    if (!PALETTES[colorwayKey]) return;
    currentColorway = colorwayKey;
    const palette = PALETTES[colorwayKey];

    // Update active UI button
    document.querySelectorAll('.colorway-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-color') === colorwayKey);
    });

    // Update 3D Materials
    materials.soleMat.color.setHex(palette.sole);
    materials.soleAccentMat.color.setHex(palette.primary);
    materials.soleAccentMat.emissive.setHex(palette.primary);

    materials.chassisMat.color.setHex(palette.chassis);
    materials.chassisAccentMat.color.setHex(palette.primary);
    materials.chassisAccentMat.emissive.setHex(palette.primary);

    materials.ringMat1.color.setHex(palette.primary);
    materials.ringMat1.emissive.setHex(palette.primary);

    materials.ringMat2.color.setHex(palette.secondary);
    materials.ringMat2.emissive.setHex(palette.secondary);

    materials.crystalMat.color.setHex(palette.primary);
    materials.crystalMat.emissive.setHex(palette.primary);

    materials.particleMat.color.setHex(palette.glow);
    if (materials.pedestalMat) {
      materials.pedestalMat.color.setHex(palette.primary);
    }

    // Update Point Lights
    pointLightAccent1.color.setHex(palette.primary);
    pointLightAccent2.color.setHex(palette.secondary);

    if (window.showToast) {
      window.showToast(`COLORWAY APPLIED: ${palette.name.toUpperCase()}`, 'ri-palette-line');
    }
  };

  window.toggleGrailExplode = function () {
    isExploded = !isExploded;
    const btnText = document.getElementById('explode-btn-text');
    const explodeBtn = document.getElementById('grail-explode-btn');

    if (btnText) {
      btnText.textContent = isExploded ? 'ASSEMBLE' : 'EXPLODE VIEW';
    }
    if (explodeBtn) {
      explodeBtn.classList.toggle('active', isExploded);
    }

    if (window.showToast) {
      window.showToast(isExploded ? '3D EXPLODED VIEW ACTIVATED' : '3D CHASSIS ASSEMBLED', 'ri-aspect-ratio-line');
    }
  };

  window.triggerGrailTurboSpin = function () {
    rotationVelocity.y = 0.08; // High spin impulse
    isAutoOrbiting = false;

    // Flash lights temporarily
    pointLightAccent1.intensity = 8.0;
    setTimeout(() => {
      pointLightAccent1.intensity = 3.8;
      isAutoOrbiting = true;
    }, 1400);

    if (window.showToast) {
      window.showToast('TURBO ROTATION IMPULSE ENGAGED', 'ri-flashlight-line');
    }
  };

  window.orderCustomGrail = function () {
    const palette = PALETTES[currentColorway];
    if (window.showToast) {
      window.showToast(`ARCHIVE ORDER: CYBER-GRAIL MK-IV (${palette.name})`, 'ri-shopping-bag-3-line');
    }
    // Smooth scroll down to drops catalog
    const shopEl = document.getElementById('shop');
    if (shopEl) {
      if (window.masterLenis) {
        window.masterLenis.scrollTo(shopEl);
      } else {
        shopEl.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  // =========================================================================
  // ANIMATION LOOP & KINEMATICS
  // =========================================================================
  function animate() {
    animationFrameId = requestAnimationFrame(animate);

    if (!isSectionVisible) return; // Save 100% GPU when offscreen

    const time = performance.now() * 0.001;

    // 1. Calculate FPS
    frameCount++;
    if (performance.now() - fpsLastTime >= 1000) {
      const fpsEl = document.getElementById('grail-fps-counter');
      if (fpsEl) fpsEl.textContent = `${frameCount} FPS`;
      frameCount = 0;
      fpsLastTime = performance.now();
    }

    // 2. Auto-Orbit Rotation & Inertia Damping
    if (isAutoOrbiting && !isDragging) {
      targetRotation.y += 0.005;
    }

    // Smooth Lerp Rotation
    currentRotation.y += (targetRotation.y - currentRotation.y) * 0.08;
    currentRotation.x += (targetRotation.x - currentRotation.x) * 0.08;

    if (grailMasterGroup) {
      grailMasterGroup.rotation.y = currentRotation.y;
      grailMasterGroup.rotation.x = currentRotation.x;

      // Subtle organic anti-gravity floating bob
      grailMasterGroup.position.y = Math.sin(time * 1.8) * 0.12;

      // Update HUD rotation telemetry readout
      const rotStat = document.getElementById('grail-rot-stat');
      if (rotStat) {
        const degX = Math.round((currentRotation.x * 180) / Math.PI) % 360;
        const degY = Math.round((currentRotation.y * 180) / Math.PI) % 360;
        rotStat.textContent = `X: ${degX}° | Y: ${degY}°`;
      }
    }

    // 3. Gyroscopic Dual Rings Animation
    if (ring1) ring1.rotation.z += 0.012;
    if (ring2) ring2.rotation.y -= 0.015;

    // 4. Core Crystal Levitation Pulse
    if (coreCrystal) {
      coreCrystal.rotation.x += 0.02;
      coreCrystal.rotation.y += 0.025;
      coreCrystal.scale.setScalar(1.0 + Math.sin(time * 4) * 0.15);
    }

    // 5. Explode Kinematics (Lerp progress)
    const targetProgress = isExploded ? 1.0 : 0.0;
    explodeProgress += (targetProgress - explodeProgress) * 0.08;

    if (soleGroup) {
      soleGroup.position.y = -explodeProgress * 0.65;
    }
    if (chassisGroup) {
      chassisGroup.position.y = explodeProgress * 0.45;
    }
    if (laceGroup) {
      laceGroup.position.z = explodeProgress * 0.4;
      laceGroup.position.y = explodeProgress * 0.55;
    }
    if (ring1) {
      ring1.scale.setScalar(1.0 + explodeProgress * 0.35);
    }
    if (ring2) {
      ring2.scale.setScalar(1.0 + explodeProgress * 0.45);
    }

    // 6. Orbiting Nebula Particles Rotation
    if (particleSystem) {
      particleSystem.rotation.y = time * 0.05;
      particleSystem.rotation.x = Math.sin(time * 0.03) * 0.1;
    }

    // 7. Pedestal Rotation
    if (pedestalGroup) {
      pedestalGroup.rotation.y = -time * 0.04;
    }

    renderer.render(scene, camera);
  }

  // =========================================================================
  // PERFORMANCE & VISIBILITY OBSERVER
  // =========================================================================
  function setupVisibilityObserver(container) {
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          isSectionVisible = entry.isIntersecting;
        });
      }, { threshold: 0.05 });

      observer.observe(container);
    }
  }

  function handleResize() {
    const container = document.getElementById('grail-3d-viewport');
    if (!container || !camera || !renderer) return;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 450;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  }

  // Self-initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGrail3D);
  } else {
    // If already loaded, give short tick for layout calculation
    setTimeout(initGrail3D, 200);
  }

})();
