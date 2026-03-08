/**
 * three-scene.js
 * "Neural Constellation" — Three.js hero scene
 *
 * Scene elements:
 *  • Layered neural network: 4 layers of nodes connected by edges
 *  • Data-flow particles travelling along each edge
 *  • Point-cloud halo of ambient dust
 *  • Custom glowing-point shader
 *  • Mouse-parallax camera with smooth damping
 *  • Scroll-based camera retreat
 */

'use strict';

const ThreeScene = (() => {

  /* ── renderer, scene, camera ──────────────────────── */
  let renderer, scene, camera;
  let time = 0;
  let scrollY = 0;

  /* smooth mouse */
  let rawX = 0, rawY = 0;
  let smoothX = 0, smoothY = 0;

  /* scene objects */
  let nodeGroup, edgeGroup, flowGroup, dustPoints;
  const flowParticles = [];

  const isMobile = () => window.innerWidth < 768;

  /* ═══════════════════════════════════════════════════
     CUSTOM SHADERS
     Glow-point shader — each point fades at its edge
     giving a soft, luminous feel instead of hard squares
     ═══════════════════════════════════════════════════ */
  const GLOW_VERT = `
    attribute float aSize;
    attribute vec3  aColor;
    varying   vec3  vColor;
    uniform   float uTime;

    void main() {
      vColor = aColor;
      vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
      gl_PointSize = aSize * (350.0 / -mvPos.z);
      gl_Position  = projectionMatrix * mvPos;
    }
  `;

  const GLOW_FRAG = `
    varying vec3 vColor;

    void main() {
      float d = length(gl_PointCoord - vec2(0.5));
      float a = 1.0 - smoothstep(0.18, 0.5, d);
      gl_FragColor = vec4(vColor, a * 0.85);
    }
  `;

  /* ═══════════════════════════════════════════════════
     INIT
     ═══════════════════════════════════════════════════ */
  const init = (canvas) => {
    if (!canvas) return;

    /* Renderer */
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: !isMobile() });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile() ? 1.5 : 2));
    renderer.setSize(window.innerWidth, window.innerHeight);

    /* Scene & camera */
    scene  = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0, 8);

    /* Build scene */
    buildNetwork();
    buildDust();

    /* Events */
    document.addEventListener('mousemove', e => {
      rawX = (e.clientX / window.innerWidth  - 0.5) * 2;
      rawY = (e.clientY / window.innerHeight - 0.5) * 2;
    });
    window.addEventListener('scroll', () => { scrollY = window.scrollY; }, { passive: true });
    window.addEventListener('resize', onResize);

    animate();
  };

  /* ═══════════════════════════════════════════════════
     NEURAL NETWORK
     4 layers; each layer is a ring of nodes in XY plane
     staggered along Z
     ═══════════════════════════════════════════════════ */
  const LAYERS = [
    { count: 5,  radius: 1.2, z: -2.2, color: new THREE.Color('#FF0033') },   // neon red
    { count: 9,  radius: 2.0, z: -0.8, color: new THREE.Color('#CC0022') },   // deep crimson
    { count: 9,  radius: 2.0, z:  0.8, color: new THREE.Color('#0055CC') },   // deep blue
    { count: 5,  radius: 1.2, z:  2.2, color: new THREE.Color('#0099FF') },   // electric blue
  ];

  let layerNodes = []; // array of arrays of THREE.Vector3

  const buildNetwork = () => {
    nodeGroup = new THREE.Group();
    edgeGroup = new THREE.Group();
    flowGroup = new THREE.Group();
    scene.add(nodeGroup, edgeGroup, flowGroup);

    // ── Build nodes using custom shader ───────────────
    LAYERS.forEach((layer, li) => {
      const nodesInLayer = [];
      for (let i = 0; i < layer.count; i++) {
        const angle  = (i / layer.count) * Math.PI * 2;
        const x = Math.cos(angle) * layer.radius;
        const y = Math.sin(angle) * layer.radius;
        const z = layer.z;
        nodesInLayer.push(new THREE.Vector3(x, y, z));

        // Visible sphere per node
        const mesh = new THREE.Mesh(
          new THREE.SphereGeometry(0.06, 10, 10),
          new THREE.MeshBasicMaterial({
            color: layer.color,
            transparent: true,
            opacity: 0.85
          })
        );
        mesh.position.set(x, y, z);
        nodeGroup.add(mesh);
      }
      layerNodes.push(nodesInLayer);
    });

    // ── Edges between consecutive layers ─────────────
    for (let li = 0; li < LAYERS.length - 1; li++) {
      const A = layerNodes[li];
      const B = layerNodes[li + 1];
      A.forEach(a => {
        B.forEach(b => {
          const geo = new THREE.BufferGeometry().setFromPoints([a, b]);
          const mat = new THREE.LineBasicMaterial({
            color: LAYERS[li].color.clone().lerp(LAYERS[li + 1].color, 0.5),
            transparent: true,
            opacity: 0.08
          });
          edgeGroup.add(new THREE.Line(geo, mat));

          // Spawn a flow particle for some edges (not all, for performance)
          if (Math.random() > 0.45) {
            spawnFlowParticle(a, b, LAYERS[li].color);
          }
        });
      });
    }
  };

  /* ── Flow particle: tiny sphere that slides A→B ──── */
  const spawnFlowParticle = (from, to, color) => {
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.025, 5, 5),
      new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.9
      })
    );
    mesh.userData = {
      from: from.clone(),
      to:   to.clone(),
      t:    Math.random(),        // start at random position on edge
      speed: 0.004 + Math.random() * 0.006
    };
    flowGroup.add(mesh);
    flowParticles.push(mesh);
  };

  /* ═══════════════════════════════════════════════════
     AMBIENT DUST — fine point cloud, back plane
     ═══════════════════════════════════════════════════ */
  const buildDust = () => {
    const count = isMobile() ? 300 : 700;
    const pos   = new Float32Array(count * 3);
    const sz    = new Float32Array(count);
    const col   = new Float32Array(count * 3);
    const palette = [
      new THREE.Color('#FF0033'),
      new THREE.Color('#CC0022'),
      new THREE.Color('#0099FF'),
      new THREE.Color('#FFFFFF'),
    ];

    for (let i = 0; i < count; i++) {
      pos[i*3]   = (Math.random() - 0.5) * 22;
      pos[i*3+1] = (Math.random() - 0.5) * 22;
      pos[i*3+2] = (Math.random() - 0.5) * 8 - 4;
      sz[i]      = 0.6 + Math.random() * 1.2;
      const c    = palette[Math.floor(Math.random() * palette.length)];
      col[i*3]   = c.r; col[i*3+1] = c.g; col[i*3+2] = c.b;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('aSize',    new THREE.BufferAttribute(sz,  1));
    geo.setAttribute('aColor',   new THREE.BufferAttribute(col, 3));

    dustPoints = new THREE.Points(geo, new THREE.ShaderMaterial({
      vertexShader:   GLOW_VERT,
      fragmentShader: GLOW_FRAG,
      transparent:    true,
      depthWrite:     false,
      uniforms: { uTime: { value: 0 } }
    }));
    scene.add(dustPoints);
  };

  /* ═══════════════════════════════════════════════════
     ANIMATION LOOP
     ═══════════════════════════════════════════════════ */
  const animate = () => {
    requestAnimationFrame(animate);
    time += 0.006;

    /* Mouse smooth follow */
    smoothX += (rawX - smoothX) * 0.035;
    smoothY += (rawY - smoothY) * 0.035;

    /* Rotate the whole network slowly */
    nodeGroup.rotation.y = time * 0.045 + smoothX * 0.22;
    nodeGroup.rotation.x = smoothY * 0.14;
    edgeGroup.rotation.copy(nodeGroup.rotation);
    flowGroup.rotation.copy(nodeGroup.rotation);

    /* Pulse node sizes (no per-frame array iteration; just group scale) */
    const pulse = 1 + Math.sin(time * 1.4) * 0.03;
    nodeGroup.scale.setScalar(pulse);

    /* Advance flow particles */
    flowParticles.forEach(p => {
      p.userData.t += p.userData.speed;
      if (p.userData.t > 1) p.userData.t = 0;
      p.position.lerpVectors(p.userData.from, p.userData.to, p.userData.t);
      p.material.opacity = 0.5 + Math.sin(p.userData.t * Math.PI) * 0.5;
    });

    /* Dust slow drift */
    dustPoints.rotation.y += 0.0003;

    /* Camera parallax + scroll retreat */
    camera.position.x += (smoothX * 0.55 - camera.position.x) * 0.03;
    camera.position.y += (-smoothY * 0.42 - camera.position.y) * 0.03;
    camera.position.z  = 8 + scrollY * 0.0025;
    camera.lookAt(scene.position);

    /* Dust shader time */
    dustPoints.material.uniforms.uTime.value = time;

    renderer.render(scene, camera);
  };

  /* ═══════════════════════════════════════════════════
     RESIZE
     ═══════════════════════════════════════════════════ */
  const onResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  };

  return { init };
})();
