/**
 * ============================================================================
 * WEEBFOUR (WEB4!) - ADVANCED 3D GARMENT STUDIO ENGINE
 * Professional Three.js Garment Viewer & Dynamic UV Texture Compositor
 * Built for high-performance, photorealistic streetwear garment visualization.
 * ============================================================================
 */

class WeebGarmentViewer {
  constructor(options = {}) {
    this.container = typeof options.container === 'string' 
      ? document.querySelector(options.container) 
      : options.container;

    if (!this.container) {
      console.error("WeebGarmentViewer: Container element not found.");
      return;
    }

    this.onLoadStart = options.onLoadStart || (() => {});
    this.onLoadComplete = options.onLoadComplete || (() => {});
    this.onError = options.onError || (() => {});
    this.onAngleChange = options.onAngleChange || (() => {});

    // State
    this.currentProduct = null;
    this.currentColor = null;
    this.isAutoRotating = true;
    this.isUserInteracting = false;
    this.idleTimer = null;
    this.animationFrameId = null;
    this.cameraTween = null;
    this.currentAngle = 'front';
    this.isDisposed = false;

    // Three.js instances
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.garmentGroup = null;
    this.garmentMesh = null;
    this.garmentMaterial = null;
    this.shadowPlane = null;
    this.lights = {};

    // Texture cache
    this.textureCache = new Map();
    this.loadedImages = new Map();

    this.init();
  }

  // 1. Initial WebGL & Scene Setup
  init() {
    // Check WebGL support
    if (!this.checkWebGLSupport()) {
      this.onError(new Error("WebGL is not supported on this browser/hardware."));
      return;
    }

    const width = this.container.clientWidth || 600;
    const height = this.container.clientHeight || 600;

    // 1. Scene
    this.scene = new THREE.Scene();
    this.scene.background = null; // Transparent to blend with luxury glassmorphic background

    // 2. Camera
    this.camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 50);
    this.camera.position.set(0, 0, 3.2);

    // 3. WebGL Renderer with High-Fidelity Settings
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.18;
    if (THREE.sRGBEncoding) {
      this.renderer.outputEncoding = THREE.sRGBEncoding;
    }

    // Append to container
    this.container.innerHTML = '';
    this.container.appendChild(this.renderer.domElement);
    this.renderer.domElement.style.outline = 'none';
    this.renderer.domElement.style.touchAction = 'none';

    // 4. OrbitControls
    if (typeof THREE.OrbitControls !== 'undefined') {
      this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.05;
      this.controls.enablePan = false;
      this.controls.minDistance = 1.8;
      this.controls.maxDistance = 4.6;
      this.controls.minPolarAngle = Math.PI / 4; // Prevent looking directly from top
      this.controls.maxPolarAngle = Math.PI / 1.78; // Prevent looking under garment
      this.controls.autoRotate = true;
      this.controls.autoRotateSpeed = 1.1;
      this.controls.target.set(0, -0.05, 0);

      // User interaction listener to pause auto-rotation smoothly
      const onUserTouch = () => {
        this.isUserInteracting = true;
        this.controls.autoRotate = false;
        clearTimeout(this.idleTimer);
        this.idleTimer = setTimeout(() => {
          this.isUserInteracting = false;
          if (this.isAutoRotating) {
            this.controls.autoRotate = true;
          }
        }, 3500);
      };

      this.renderer.domElement.addEventListener('pointerdown', onUserTouch);
      this.renderer.domElement.addEventListener('wheel', onUserTouch, { passive: true });
      this.renderer.domElement.addEventListener('touchstart', onUserTouch, { passive: true });
    }

    // 5. Studio 3-Point Showroom Lighting
    this.setupStudioLighting();

    // 6. Contact Floor Shadow Plane
    this.setupContactShadow();

    // 7. Garment Root Group
    this.garmentGroup = new THREE.Group();
    this.scene.add(this.garmentGroup);

    // 8. Resize Observer
    this.resizeObserver = new ResizeObserver(() => this.handleResize());
    this.resizeObserver.observe(this.container);
    window.addEventListener('resize', () => this.handleResize());

    // 9. Start Render Loop
    this.animate();
  }

  checkWebGLSupport() {
    try {
      const canvas = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && 
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch (e) {
      return false;
    }
  }

  // 2. Studio Lighting Setup
  setupStudioLighting() {
    // Hemispheric ambient light (soft fill)
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x14161d, 0.55);
    this.scene.add(hemiLight);
    this.lights.hemi = hemiLight;

    // Key Light (warm studio spotlight from front-top-right)
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.35);
    keyLight.position.set(2.4, 3.2, 2.8);
    this.scene.add(keyLight);
    this.lights.key = keyLight;

    // Fill Light (soft cool rim from front-left)
    const fillLight = new THREE.DirectionalLight(0xd6e5ff, 0.75);
    fillLight.position.set(-2.8, 1.6, 2.2);
    this.scene.add(fillLight);
    this.lights.fill = fillLight;

    // Rim / Back Light (cyberpunk edge separation from behind)
    const backLight = new THREE.DirectionalLight(0xffe6db, 1.1);
    backLight.position.set(0, 3.0, -3.2);
    this.scene.add(backLight);
    this.lights.back = backLight;

    // Subtle bottom bounce
    const bounceLight = new THREE.DirectionalLight(0x2a3040, 0.35);
    bounceLight.position.set(0, -2.5, 0);
    this.scene.add(bounceLight);
    this.lights.bounce = bounceLight;
  }

  // 3. Contact Shadow Setup
  setupContactShadow() {
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 512;
    shadowCanvas.height = 512;
    const ctx = shadowCanvas.getContext('2d');

    const gradient = ctx.createRadialGradient(256, 256, 10, 256, 256, 240);
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0.65)');
    gradient.addColorStop(0.35, 'rgba(0, 0, 0, 0.35)');
    gradient.addColorStop(0.7, 'rgba(0, 0, 0, 0.12)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 512, 512);

    const shadowTexture = new THREE.CanvasTexture(shadowCanvas);
    const shadowGeo = new THREE.PlaneGeometry(2.4, 2.4);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTexture,
      transparent: true,
      opacity: 0.75,
      depthWrite: false
    });

    this.shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
    this.shadowPlane.rotation.x = -Math.PI / 2;
    this.shadowPlane.position.y = -1.22;
    this.scene.add(this.shadowPlane);
  }

  // 4. Procedural Streetwear Garment Model Builder
  buildGarmentGeometry(fitType = "boxy_oversized") {
    // Generate an authentic boxy oversized streetwear garment mesh with separated UV sections
    const group = new THREE.Group();

    // Material will be assigned by texture compositor
    const placeholderMat = new THREE.MeshStandardMaterial({
      color: 0x111215,
      roughness: 0.85,
      metalness: 0.05
    });

    // Dimensions for authentic boxy streetwear silhouette
    let chestWidth = 1.28;
    let chestHeight = 1.58;
    let torsoDepth = 0.36;
    let sleeveLength = 0.62;
    let sleeveRadius = 0.26;
    let collarRadius = 0.28;

    if (fitType === "acid_distressed_tee") {
      chestWidth = 1.24;
      torsoDepth = 0.34;
      sleeveLength = 0.60;
    } else if (fitType === "minimal_heavyweight") {
      chestWidth = 1.32;
      chestHeight = 1.62;
      torsoDepth = 0.38;
      sleeveLength = 0.65;
    }

    // --- A. Main Torso Mesh with Natural Fabric Drape ---
    // We create a custom cylinder/rounded box geometry with precision UV unwrap
    const torsoGeo = new THREE.CylinderGeometry(
      chestWidth * 0.48, // top shoulder width
      chestWidth * 0.52, // bottom hem flare
      chestHeight,       // height
      36,                // radial segments
      24,                // height segments
      false              // open ended
    );

    // Anatomical and drape deformation
    const pos = torsoGeo.attributes.position;
    const uvs = torsoGeo.attributes.uv;

    for (let i = 0; i < pos.count; i++) {
      let x = pos.getX(i);
      let y = pos.getY(i);
      let z = pos.getZ(i);

      // Squash cylinder into an organic elliptical torso cross-section
      z = z * (torsoDepth / (chestWidth * 0.5));

      // Chest curve (forward swell at upper chest, slight lower tuck)
      const normalizedY = (y + chestHeight / 2) / chestHeight; // 0 to 1
      if (normalizedY > 0.5 && z > 0) {
        z += Math.sin((normalizedY - 0.5) * Math.PI) * 0.06; // pectoral arch
      }

      // Dropped shoulder taper
      if (normalizedY > 0.82) {
        const shoulderSlope = (normalizedY - 0.82) / 0.18;
        x *= (1 - shoulderSlope * 0.08);
      }

      // Natural bottom hem gentle drape curve
      if (normalizedY < 0.15) {
        y -= Math.cos((x / chestWidth) * Math.PI) * 0.03;
      }

      pos.setXYZ(i, x, y, z);

      // --- Precise UV Remapping ---
      // UV X: 0 to 0.5 for Front side (z > 0), 0.5 to 1.0 for Back side (z <= 0)
      let u = 0;
      let v = normalizedY;

      if (z >= 0) {
        // Front Face: maps to UV rectangle [0.02, 0.02] to [0.48, 0.98]
        // Center x=0 maps to u=0.25
        const normX = (x / (chestWidth * 0.55)); // -1 to 1 approx
        u = 0.25 + normX * 0.22;
      } else {
        // Back Face: maps to UV rectangle [0.52, 0.02] to [0.98, 0.98]
        // Center x=0 maps to u=0.75
        const normX = (-x / (chestWidth * 0.55));
        u = 0.75 + normX * 0.22;
      }

      u = Math.max(0.001, Math.min(0.999, u));
      uvs.setXY(i, u, v);
    }

    torsoGeo.computeVertexNormals();
    const torsoMesh = new THREE.Mesh(torsoGeo, placeholderMat);
    torsoMesh.position.y = -0.05;
    group.add(torsoMesh);

    // --- B. Ribbed Crewneck Collar ---
    const collarGeo = new THREE.TorusGeometry(collarRadius, 0.045, 16, 36);
    collarGeo.rotateX(Math.PI / 2);
    // Slight forward angle tilt for human neck posture
    collarGeo.rotateX(0.12);
    const collarMesh = new THREE.Mesh(collarGeo, placeholderMat);
    collarMesh.position.set(0, chestHeight * 0.48 - 0.02, -0.01);
    group.add(collarMesh);

    // --- C. Left & Right Dropped Streetwear Sleeves ---
    const createSleeve = (isLeft) => {
      const sleeveGeo = new THREE.CylinderGeometry(
        sleeveRadius * 0.96, // cuff width
        sleeveRadius * 1.15, // shoulder armhole width
        sleeveLength,
        24,
        16,
        false
      );

      // Slight natural arm bend
      const sPos = sleeveGeo.attributes.position;
      const sUvs = sleeveGeo.attributes.uv;
      for (let j = 0; j < sPos.count; j++) {
        let sy = sPos.getY(j);
        let sx = sPos.getX(j);
        let sz = sPos.getZ(j);

        // Flatten slightly
        sz *= 0.85;
        sPos.setXYZ(j, sx, sy, sz);

        // Assign UV coordinates into sleeve space (lower margins)
        const ny = (sy + sleeveLength / 2) / sleeveLength;
        sUvs.setXY(j, (isLeft ? 0.05 : 0.95), ny);
      }
      sleeveGeo.computeVertexNormals();

      const sleeveMesh = new THREE.Mesh(sleeveGeo, placeholderMat);

      const sign = isLeft ? 1 : -1;
      sleeveMesh.position.set(
        sign * (chestWidth * 0.44 + sleeveLength * 0.32),
        chestHeight * 0.34,
        0
      );
      // Streetwear dropped shoulder angle (approx 34 degrees down, 6 degrees forward)
      sleeveMesh.rotation.z = -sign * (Math.PI / 5.2);
      sleeveMesh.rotation.y = sign * 0.08;

      return sleeveMesh;
    };

    const leftSleeve = createSleeve(true);
    const rightSleeve = createSleeve(false);
    group.add(leftSleeve);
    group.add(rightSleeve);

    // --- D. Hem Trim & Stitch Lip ---
    const hemGeo = new THREE.TorusGeometry(chestWidth * 0.515, 0.028, 12, 36);
    hemGeo.rotateX(Math.PI / 2);
    const hemMesh = new THREE.Mesh(hemGeo, placeholderMat);
    hemMesh.position.set(0, -chestHeight * 0.5 - 0.04, 0);
    group.add(hemMesh);

    return group;
  }

  // 5. Dynamic Texture Compositor (2048x2048 Master PBR Canvas)
  async bakeGarmentTexture(product, colorHex) {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 2048;
    const ctx = canvas.getContext('2d');

    // 1. Base Fabric Tone
    ctx.fillStyle = colorHex || '#0d0f12';
    ctx.fillRect(0, 0, 2048, 2048);

    // 2. High-Density Fabric Micro-Weave Simulation
    this.drawFabricWeave(ctx, 2048, 2048, colorHex);

    // 3. Load & Composite Front Product Artwork
    if (product.front_texture_url) {
      try {
        const frontImg = await this.loadImage(product.front_texture_url);
        if (frontImg) {
          // Front UV coordinates: center is at x = 2048 * 0.25 = 512, y = 2048 * 0.58 = 1188
          const placement = product.front_art_placement || { scale: 0.62, offsetY: 0.04, offsetX: 0 };
          const artSize = 850 * (placement.scale || 0.62);
          const centerX = 512 + (placement.offsetX || 0) * 800;
          const centerY = 900 - (placement.offsetY || 0) * 800;

          ctx.save();
          // Subtle blend mode for authentic garment ink absorption
          ctx.globalAlpha = 0.96;
          // Soft shadow under heavy puff print
          ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
          ctx.shadowBlur = 8;
          ctx.shadowOffsetY = 4;

          ctx.drawImage(
            frontImg,
            centerX - artSize / 2,
            centerY - artSize / 2,
            artSize,
            artSize
          );
          ctx.restore();
        }
      } catch (err) {
        console.warn("Could not load front artwork texture:", err);
      }
    }

    // 4. Load & Composite Back Product Artwork
    if (product.back_texture_url) {
      try {
        const backImg = await this.loadImage(product.back_texture_url);
        if (backImg) {
          // Back UV coordinates: center is at x = 2048 * 0.75 = 1536, y = 2048 * 0.58 = 1188
          const placement = product.back_art_placement || { scale: 0.70, offsetY: 0.02, offsetX: 0 };
          const artSize = 920 * (placement.scale || 0.70);
          const centerX = 1536 + (placement.offsetX || 0) * 800;
          const centerY = 880 - (placement.offsetY || 0) * 800;

          ctx.save();
          ctx.globalAlpha = 0.96;
          ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
          ctx.shadowBlur = 10;
          ctx.shadowOffsetY = 5;

          ctx.drawImage(
            backImg,
            centerX - artSize / 2,
            centerY - artSize / 2,
            artSize,
            artSize
          );
          ctx.restore();
        }
      } catch (err) {
        console.warn("Could not load back artwork texture:", err);
      }
    }

    // 5. Garment Seam & Collar Shadow Lines
    this.drawGarmentConstructionLines(ctx);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    if (THREE.sRGBEncoding) {
      texture.encoding = THREE.sRGBEncoding;
    }
    texture.anisotropy = Math.min(this.renderer.capabilities.getMaxAnisotropy() || 8, 8);
    texture.needsUpdate = true;

    return texture;
  }

  // Draw natural French Terry / Cotton weave noise into the texture
  drawFabricWeave(ctx, width, height, baseHex) {
    const isLightColor = this.isColorLight(baseHex);

    // Micro fiber noise pass
    const noiseCanvas = document.createElement('canvas');
    noiseCanvas.width = 128;
    noiseCanvas.height = 128;
    const nCtx = noiseCanvas.getContext('2d');
    const imgData = nCtx.createImageData(128, 128);
    const data = imgData.data;

    for (let i = 0; i < data.length; i += 4) {
      const v = Math.floor(Math.random() * 32);
      data[i] = v;
      data[i + 1] = v;
      data[i + 2] = v;
      data[i + 3] = isLightColor ? 18 : 26; // subtle opacity
    }
    nCtx.putImageData(imgData, 0, 0);

    ctx.save();
    ctx.globalCompositeOperation = isLightColor ? 'multiply' : 'screen';
    const pattern = ctx.createPattern(noiseCanvas, 'repeat');
    ctx.fillStyle = pattern;
    ctx.fillRect(0, 0, width, height);

    // Subtle diagonal twill weave lines
    ctx.globalAlpha = isLightColor ? 0.04 : 0.06;
    ctx.strokeStyle = isLightColor ? '#000000' : '#ffffff';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = -width; x < width * 2; x += 8) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x + height, height);
    }
    ctx.stroke();

    ctx.restore();
  }

  // Draw garment structural seams (rib collar lines, armhole curves, hem stitches)
  drawGarmentConstructionLines(ctx) {
    ctx.save();
    ctx.globalAlpha = 0.28;
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.65)';
    ctx.lineWidth = 4;
    ctx.setLineDash([8, 8]); // Double needle stitch look

    // Front armhole seam curves
    ctx.beginPath();
    ctx.arc(100, 400, 180, 0, Math.PI * 0.5);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(924, 400, 180, Math.PI * 0.5, Math.PI);
    ctx.stroke();

    // Back armhole seam curves
    ctx.beginPath();
    ctx.arc(1124, 400, 180, 0, Math.PI * 0.5);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(1948, 400, 180, Math.PI * 0.5, Math.PI);
    ctx.stroke();

    // Bottom double hem stitches
    ctx.beginPath();
    ctx.moveTo(0, 2010);
    ctx.lineTo(2048, 2010);
    ctx.moveTo(0, 2026);
    ctx.lineTo(2048, 2026);
    ctx.stroke();

    ctx.restore();
  }

  // Helper to test if a hex color is light or dark
  isColorLight(hex) {
    if (!hex) return false;
    const c = hex.replace('#', '');
    const r = parseInt(c.substr(0, 2), 16);
    const g = parseInt(c.substr(2, 2), 16);
    const b = parseInt(c.substr(4, 2), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 140;
  }

  // Image loader with memory cache
  loadImage(url) {
    if (this.loadedImages.has(url)) {
      return Promise.resolve(this.loadedImages.get(url));
    }
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        this.loadedImages.set(url, img);
        resolve(img);
      };
      img.onerror = () => {
        console.warn(`Failed to load image at: ${url}`);
        resolve(null);
      };
      img.src = url;
    });
  }

  // 6. Master Product Loader
  async loadProduct(product, colorId = null) {
    if (!product) return;

    this.onLoadStart();
    this.currentProduct = product;

    // Determine initial colorway
    let targetColor = null;
    if (product.available_colors && product.available_colors.length > 0) {
      if (colorId) {
        targetColor = product.available_colors.find(c => c.id === colorId);
      }
      if (!targetColor) {
        targetColor = product.available_colors.find(c => c.id === product.default_color_id) || product.available_colors[0];
      }
    } else {
      targetColor = { id: 'default', name: 'Original', hex: '#0e1014' };
    }
    this.currentColor = targetColor;

    try {
      // Clean previous garment mesh
      while (this.garmentGroup.children.length > 0) {
        const obj = this.garmentGroup.children[0];
        this.garmentGroup.remove(obj);
        if (obj.geometry) obj.geometry.dispose();
      }

      // Check if external GLB model is specified
      if (product.model_3d_url && typeof THREE.GLTFLoader !== 'undefined') {
        await this.loadExternalGLB(product.model_3d_url, product, targetColor);
      } else {
        // Build precision procedural streetwear model
        const fitType = product.garment_fit || 'boxy_oversized';
        const garmentMeshGroup = this.buildGarmentGeometry(fitType);

        // Bake dynamic texture
        const texture = await this.bakeGarmentTexture(product, targetColor.hex);

        // Create PBR Material
        this.garmentMaterial = new THREE.MeshStandardMaterial({
          map: texture,
          roughness: product.fabric_roughness || 0.85,
          metalness: 0.05,
          bumpMap: texture,
          bumpScale: 0.008,
          side: THREE.DoubleSide
        });

        // Apply material to all child meshes
        garmentMeshGroup.traverse(child => {
          if (child.isMesh) {
            child.material = this.garmentMaterial;
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        this.garmentGroup.add(garmentMeshGroup);
        this.garmentMesh = garmentMeshGroup;
      }

      // Initial Entrance Animation
      this.garmentGroup.scale.set(0.85, 0.85, 0.85);
      this.garmentGroup.position.y = -0.2;
      this.animateEntrance();

      this.onLoadComplete(product, targetColor);
    } catch (err) {
      console.error("WeebGarmentViewer Error loading product:", err);
      this.onError(err);
    }
  }

  // Load external GLTF/GLB if product has custom asset
  loadExternalGLB(url, product, targetColor) {
    return new Promise((resolve, reject) => {
      const loader = new THREE.GLTFLoader();
      loader.load(
        url,
        async (gltf) => {
          const model = gltf.scene;
          // Center and scale model to match studio bounds
          const box = new THREE.Box3().setFromObject(model);
          const center = box.getCenter(new THREE.Vector3());
          const size = box.getSize(new THREE.Vector3());

          const maxDim = Math.max(size.x, size.y, size.z);
          const scale = 1.8 / maxDim;
          model.scale.set(scale, scale, scale);
          model.position.sub(center.multiplyScalar(scale));

          // If product artwork needs dynamic baking on GLB UVs
          const texture = await this.bakeGarmentTexture(product, targetColor.hex);
          model.traverse(child => {
            if (child.isMesh) {
              child.material = new THREE.MeshStandardMaterial({
                map: texture,
                roughness: product.fabric_roughness || 0.85,
                metalness: 0.05
              });
            }
          });

          this.garmentGroup.add(model);
          this.garmentMesh = model;
          resolve();
        },
        undefined,
        (err) => {
          console.warn("External GLB failed to load, falling back to procedural garment mesh:", err);
          // Fallback to procedural mesh
          const fitType = product.garment_fit || 'boxy_oversized';
          const garmentMeshGroup = this.buildGarmentGeometry(fitType);
          this.garmentGroup.add(garmentMeshGroup);
          this.garmentMesh = garmentMeshGroup;
          resolve();
        }
      );
    });
  }

  // 7. Color Variant Switcher
  async setColorVariant(colorId) {
    if (!this.currentProduct || !this.currentProduct.available_colors) return;
    const colorObj = this.currentProduct.available_colors.find(c => c.id === colorId);
    if (!colorObj || colorObj === this.currentColor) return;

    this.currentColor = colorObj;

    // Show quick mini transition pulse
    if (this.garmentMaterial) {
      // Re-bake texture with new color
      const newTexture = await this.bakeGarmentTexture(this.currentProduct, colorObj.hex);
      this.garmentMaterial.map = newTexture;
      this.garmentMaterial.bumpMap = newTexture;
      this.garmentMaterial.needsUpdate = true;
    }
  }

  // 8. Camera Angle Presets & Smooth Interpolation
  viewAngle(preset) {
    this.currentAngle = preset;
    let targetPos = new THREE.Vector3();
    let targetLook = new THREE.Vector3(0, -0.05, 0);

    switch (preset) {
      case 'front':
        targetPos.set(0, 0, 3.2);
        break;
      case 'back':
        targetPos.set(0, 0, -3.2);
        break;
      case 'left':
        targetPos.set(-3.2, 0, 0);
        break;
      case 'right':
        targetPos.set(3.2, 0, 0);
        break;
      case 'angled':
        targetPos.set(2.2, 0.7, 2.3);
        break;
      default:
        targetPos.set(0, 0, 3.2);
    }

    // Stop auto-rotation during deliberate preset inspection
    if (this.controls) {
      this.controls.autoRotate = false;
      clearTimeout(this.idleTimer);
      this.idleTimer = setTimeout(() => {
        if (this.isAutoRotating && !this.isUserInteracting) {
          this.controls.autoRotate = true;
        }
      }, 5000);
    }

    this.tweenCamera(targetPos, targetLook);
    this.onAngleChange(preset);
  }

  tweenCamera(targetPosition, targetLookAt, duration = 650) {
    const startPosition = this.camera.position.clone();
    const startLookAt = this.controls ? this.controls.target.clone() : new THREE.Vector3(0, 0, 0);
    const startTime = performance.now();

    const updateTween = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Smooth cubic ease-out
      const ease = 1 - Math.pow(1 - progress, 3);

      this.camera.position.lerpVectors(startPosition, targetPosition, ease);
      if (this.controls) {
        this.controls.target.lerpVectors(startLookAt, targetLookAt, ease);
        this.controls.update();
      }

      if (progress < 1) {
        requestAnimationFrame(updateTween);
      }
    };

    requestAnimationFrame(updateTween);
  }

  // Entrance pop animation when loading a new product
  animateEntrance() {
    const startTime = performance.now();
    const duration = 600;

    const animateStep = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);

      const s = 0.85 + ease * 0.15;
      this.garmentGroup.scale.set(s, s, s);
      this.garmentGroup.position.y = -0.2 + ease * 0.2;

      if (progress < 1) {
        requestAnimationFrame(animateStep);
      }
    };
    requestAnimationFrame(animateStep);
  }

  // 9. Zoom and Interactive Controls
  zoomIn() {
    if (!this.controls) return;
    const dir = new THREE.Vector3();
    this.camera.getWorldDirection(dir);
    if (this.camera.position.length() > this.controls.minDistance + 0.3) {
      this.camera.position.addScaledVector(dir, 0.45);
      this.controls.update();
    }
  }

  zoomOut() {
    if (!this.controls) return;
    const dir = new THREE.Vector3();
    this.camera.getWorldDirection(dir);
    if (this.camera.position.length() < this.controls.maxDistance - 0.3) {
      this.camera.position.addScaledVector(dir, -0.45);
      this.controls.update();
    }
  }

  toggleAutoRotate() {
    this.isAutoRotating = !this.isAutoRotating;
    if (this.controls) {
      this.controls.autoRotate = this.isAutoRotating;
    }
    return this.isAutoRotating;
  }

  // 10. Window Resize Handler
  handleResize() {
    if (!this.container || !this.renderer || !this.camera || this.isDisposed) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    if (width === 0 || height === 0) return;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  // 11. Render Loop
  animate() {
    if (this.isDisposed) return;
    this.animationFrameId = requestAnimationFrame(() => this.animate());

    if (this.controls) {
      this.controls.update();
    }

    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }

  // 12. Cleanup & Disposal
  dispose() {
    this.isDisposed = true;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    if (this.renderer && this.renderer.domElement) {
      this.renderer.domElement.remove();
      this.renderer.dispose();
    }
    if (this.controls) {
      this.controls.dispose();
    }
    if (this.garmentMaterial) {
      this.garmentMaterial.dispose();
    }
  }
}

// Attach to window
if (typeof window !== 'undefined') {
  window.WeebGarmentViewer = WeebGarmentViewer;
}
