/**
 * THREE-SCENE.JS
 * WebGL / Three.js hero scene
 * Neural-network visualization representing the AI/ML theme of Deepak's portfolio
 * ─────────────────────────────────────────────────────────
 */

const ThreeScene = (() => {
  'use strict';

  /* ── private state ─────────────────────────────────── */
  let renderer, scene, camera;
  let geometricCore, neuralGroup, ambientParticles;
  let time = 0;
  let scrollY = 0;
  let rafId = null;

  // Smooth mouse
  let rawMX = 0, rawMY = 0;
  let smoothMX = 0, smoothMY = 0;

  // Neural network nodes & edges
  const nodeObjects = [];
  const edgeObjects = [];

  const isMobile = () => window.innerWidth < 768;

  /* ── renderer ──────────────────────────────────────── */
  const initRenderer = (canvas) => {
    renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: !isMobile(),
      powerPreference: 'high-performance'
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile() ? 1.5 : 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
  };

  /* ── scene & camera ────────────────────────────────── */
  const initScene = () => {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 7);
  };

  /* ── lighting ──────────────────────────────────────── */
  const addLighting = () => {
    scene.add(new THREE.AmbientLight(0xffffff, 0.05));

    const l1 = new THREE.PointLight(0x00f5ff, 3, 15);
    l1.position.set(4, 3, 4);
    scene.add(l1);

    const l2 = new THREE.PointLight(0x7c3aed, 2, 12);
    l2.position.set(-4, -3, 2);
    scene.add(l2);

    const l3 = new THREE.PointLight(0xec4899, 1, 10);
    l3.position.set(0, 4, -2);
    scene.add(l3);
  };

  /* ── geometric core ────────────────────────────────── */
  const createGeometricCore = () => {
    const group = new THREE.Group();

    // Outer wireframe icosahedron — cyan
    const outerMesh = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.5, 1),
      new THREE.MeshBasicMaterial({ color: 0x00f5ff, wireframe: true, transparent: true, opacity: 0.10 })
    );
    group.add(outerMesh);

    // Mid wireframe octahedron — violet
    const midMesh = new THREE.Mesh(
      new THREE.OctahedronGeometry(1.0, 0),
      new THREE.MeshBasicMaterial({ color: 0x7c3aed, wireframe: true, transparent: true, opacity: 0.18 })
    );
    group.add(midMesh);

    // Inner dodecahedron — pink
    const innerMesh = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.55, 0),
      new THREE.MeshBasicMaterial({ color: 0xec4899, wireframe: true, transparent: true, opacity: 0.22 })
    );
    group.add(innerMesh);

    // Orbital ring A
    const ringA = new THREE.Mesh(
      new THREE.TorusGeometry(2.2, 0.007, 6, 120),
      new THREE.MeshBasicMaterial({ color: 0x00f5ff, transparent: true, opacity: 0.18 })
    );
    ringA.rotation.x = Math.PI * 0.35;
    group.add(ringA);

    // Orbital ring B
    const ringB = new THREE.Mesh(
      new THREE.TorusGeometry(2.8, 0.005, 6, 120),
      new THREE.MeshBasicMaterial({ color: 0x7c3aed, transparent: true, opacity: 0.10 })
    );
    ringB.rotation.x = -Math.PI * 0.18;
    ringB.rotation.y = Math.PI * 0.25;
    group.add(ringB);

    // Orbital ring C
    const ringC = new THREE.Mesh(
      new THREE.TorusGeometry(3.4, 0.004, 6, 120),
      new THREE.MeshBasicMaterial({ color: 0xec4899, transparent: true, opacity: 0.07 })
    );
    ringC.rotation.x = Math.PI * 0.6;
    ringC.rotation.z = Math.PI * 0.1;
    group.add(ringC);

    group.userData = { outerMesh, midMesh, innerMesh, ringA, ringB, ringC };
    geometricCore = group;
    scene.add(group);
  };

  /* ── neural network ────────────────────────────────── */
  const createNeuralNet = () => {
    const group = new THREE.Group();
    const nodeCount = isMobile() ? 18 : 36;
    const nodeGeo = new THREE.SphereGeometry(0.055, 8, 8);

    for (let i = 0; i < nodeCount; i++) {
      // Distribute nodes on a sphere surface
      const phi = Math.acos(1 - 2 * (i + 0.5) / nodeCount);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i; // golden angle
      const r = 1.8 + Math.random() * 1.4;

      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);

      const isViolet = Math.random() > 0.5;
      const nodeMat = new THREE.MeshBasicMaterial({
        color: isViolet ? 0x7c3aed : 0x00f5ff,
        transparent: true,
        opacity: 0.7
      });
      const node = new THREE.Mesh(nodeGeo, nodeMat);
      node.position.set(x, y, z);
      node.userData = {
        orig: new THREE.Vector3(x, y, z),
        speed: 0.001 + Math.random() * 0.002,
        phase: Math.random() * Math.PI * 2,
        pulseSpeed: 1 + Math.random() * 2,
        pulsePhase: Math.random() * Math.PI * 2,
        radius: 0.1 + Math.random() * 0.1
      };
      nodeObjects.push(node);
      group.add(node);
    }

    // Connect nearby nodes
    const edgeMat = new THREE.LineBasicMaterial({ color: 0x00f5ff, transparent: true, opacity: 0.08 });
    for (let i = 0; i < nodeObjects.length; i++) {
      for (let j = i + 1; j < nodeObjects.length; j++) {
        const d = nodeObjects[i].position.distanceTo(nodeObjects[j].position);
        if (d < 2.2) {
          const geo = new THREE.BufferGeometry().setFromPoints([
            nodeObjects[i].position.clone(),
            nodeObjects[j].position.clone()
          ]);
          const line = new THREE.Line(geo, edgeMat.clone());
          const maxOpacity = 0.04 + (1 - d / 2.2) * 0.14;
          edgeObjects.push({ line, nA: nodeObjects[i], nB: nodeObjects[j], maxOpacity });
          group.add(line);
        }
      }
    }

    neuralGroup = group;
    scene.add(group);
  };

  /* ── ambient particle field ────────────────────────── */
  const createAmbientParticles = () => {
    const count = isMobile() ? 200 : 500;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 28;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 28;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 12 - 6;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));

    ambientParticles = new THREE.Points(geo, new THREE.PointsMaterial({
      color: 0x7c3aed,
      size: 0.025,
      transparent: true,
      opacity: 0.45,
      sizeAttenuation: true
    }));
    scene.add(ambientParticles);
  };

  /* ── animation loop ────────────────────────────────── */
  const animate = () => {
    rafId = requestAnimationFrame(animate);
    time += 0.008;

    // Smooth mouse follow
    smoothMX += (rawMX - smoothMX) * 0.04;
    smoothMY += (rawMY - smoothMY) * 0.04;

    /* ── neural nodes ── */
    nodeObjects.forEach(node => {
      const { orig, speed, phase, pulseSpeed, pulsePhase, radius } = node.userData;
      node.position.x = orig.x + Math.sin(time * speed + phase) * radius;
      node.position.y = orig.y + Math.cos(time * speed * 0.8 + phase) * radius;
      node.position.z = orig.z + Math.sin(time * speed * 0.5 + phase * 1.5) * (radius * 0.5);
      node.material.opacity = 0.35 + 0.45 * (0.5 + 0.5 * Math.sin(time * pulseSpeed + pulsePhase));
    });

    /* ── edges ── */
    edgeObjects.forEach(({ line, nA, nB, maxOpacity }) => {
      const attr = line.geometry.attributes.position;
      attr.setXYZ(0, nA.position.x, nA.position.y, nA.position.z);
      attr.setXYZ(1, nB.position.x, nB.position.y, nB.position.z);
      attr.needsUpdate = true;
      line.material.opacity = maxOpacity * (0.4 + 0.6 * (0.5 + 0.5 * Math.sin(time + nA.userData.phase)));
    });

    /* ── neural group rotation ── */
    neuralGroup.rotation.y = time * 0.04 + smoothMX * 0.25;
    neuralGroup.rotation.x = smoothMY * 0.18;

    /* ── geometric core ── */
    const { outerMesh, midMesh, innerMesh, ringA, ringB, ringC } = geometricCore.userData;
    geometricCore.rotation.y = time * 0.07;
    geometricCore.rotation.x = Math.sin(time * 0.025) * 0.15;
    outerMesh.rotation.y += 0.004;
    outerMesh.rotation.z += 0.002;
    midMesh.rotation.y -= 0.006;
    midMesh.rotation.x += 0.004;
    innerMesh.rotation.y += 0.01;
    innerMesh.rotation.z -= 0.006;
    ringA.rotation.z += 0.005;
    ringB.rotation.y -= 0.004;
    ringC.rotation.x += 0.003;

    /* ── camera parallax + scroll ── */
    camera.position.x += (smoothMX * 0.45 - camera.position.x) * 0.025;
    camera.position.y += (-smoothMY * 0.35 - camera.position.y) * 0.025;
    camera.position.z = 7 + scrollY * 0.002;
    neuralGroup.position.y = -(scrollY * 0.0008);
    camera.lookAt(scene.position);

    /* ── ambient particles ── */
    ambientParticles.rotation.y += 0.0004;
    ambientParticles.rotation.x += 0.0002;

    renderer.render(scene, camera);
  };

  /* ── resize ────────────────────────────────────────── */
  const onResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  };

  /* ── public API ────────────────────────────────────── */
  const init = (canvas) => {
    if (!canvas) return;
    initRenderer(canvas);
    initScene();
    addLighting();
    createGeometricCore();
    createNeuralNet();
    createAmbientParticles();

    document.addEventListener('mousemove', e => {
      rawMX = (e.clientX / window.innerWidth  - 0.5) * 2;
      rawMY = (e.clientY / window.innerHeight - 0.5) * 2;
    });
    window.addEventListener('scroll', () => { scrollY = window.scrollY; }, { passive: true });
    window.addEventListener('resize', onResize);

    animate();
  };

  const destroy = () => {
    if (rafId) cancelAnimationFrame(rafId);
    renderer?.dispose();
  };

  return { init, destroy };
})();
