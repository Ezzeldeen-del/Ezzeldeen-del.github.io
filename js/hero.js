/* ============================================================
   Hero centerpiece — "the lead router"
   Leads (particles) stream in from source nodes on the left,
   pass through a rotating wireframe core (the AI classification
   layer), get scored (lime = hot) and are routed out to agent
   nodes on the right. Persists behind the page as a background
   and reacts to scroll + pointer.
   Exposes window.HERO.setScroll({ hero, fade }).
   ============================================================ */
(function () {
  var canvas = document.getElementById('gl-canvas');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!canvas || typeof THREE === 'undefined') {
    document.documentElement.classList.add('no-gl');
    return;
  }

  var renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch (e) {
    document.documentElement.classList.add('no-gl');
    return;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  camera.position.set(0, 0, 17);

  var net = new THREE.Group();
  scene.add(net);

  var ACCENT = new THREE.Color('#d7ff3d');
  var WHITE = new THREE.Color('#ffffff');
  var DIM = new THREE.Color('#6f6f6f');

  /* soft radial sprite used for nodes and particles */
  function makeGlow(size) {
    var c = document.createElement('canvas');
    c.width = c.height = size;
    var ctx = c.getContext('2d');
    var g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.25, 'rgba(255,255,255,0.8)');
    g.addColorStop(0.6, 'rgba(255,255,255,0.15)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    var t = new THREE.CanvasTexture(c);
    t.minFilter = THREE.LinearFilter;
    return t;
  }
  var glowTex = makeGlow(128);

  /* ---------- nodes ---------- */
  var SRC_N = 7, DST_N = 4, CORE_R = 1.7;
  var sources = [], targets = [];
  var i;
  for (i = 0; i < SRC_N; i++) {
    var y = (i / (SRC_N - 1) - 0.5) * 5.4;
    sources.push(new THREE.Vector3(-7.4 + Math.abs(y) * 0.22, y, (Math.random() - 0.5) * 2.4));
  }
  for (i = 0; i < DST_N; i++) {
    var y2 = (i / (DST_N - 1) - 0.5) * 4.4;
    targets.push(new THREE.Vector3(7.2 - Math.abs(y2) * 0.18, y2, (Math.random() - 0.5) * 1.8));
  }

  /* ---------- curves (routes) ---------- */
  var inCurves = sources.map(function (p) {
    return new THREE.CubicBezierCurve3(
      p.clone(),
      new THREE.Vector3(p.x + 3.2, p.y, p.z),
      new THREE.Vector3(-CORE_R - 1.6, 0, 0),
      new THREE.Vector3(-CORE_R, 0, 0)
    );
  });
  var outCurves = targets.map(function (p) {
    return new THREE.CubicBezierCurve3(
      new THREE.Vector3(CORE_R, 0, 0),
      new THREE.Vector3(CORE_R + 1.6, 0, 0),
      new THREE.Vector3(p.x - 3.2, p.y, p.z),
      p.clone()
    );
  });

  var materials = []; /* [material, baseOpacity] for global fading */
  function track(m, base) { m.transparent = true; m.opacity = base; materials.push([m, base]); return m; }

  var routeMat = track(new THREE.LineBasicMaterial({ color: 0xffffff }), 0.13);
  var routeMatHot = track(new THREE.LineBasicMaterial({ color: ACCENT }), 0.16);
  inCurves.forEach(function (c) {
    net.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(c.getPoints(64)), routeMat));
  });
  outCurves.forEach(function (c) {
    net.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(c.getPoints(64)), routeMatHot));
  });

  /* ---------- node sprites ---------- */
  function addNode(pos, color, scale, opacity) {
    var m = track(new THREE.SpriteMaterial({ map: glowTex, color: color, depthWrite: false, blending: THREE.AdditiveBlending }), opacity);
    var s = new THREE.Sprite(m);
    s.position.copy(pos);
    s.scale.setScalar(scale);
    net.add(s);
    return s;
  }
  sources.forEach(function (p) { addNode(p, WHITE, 0.42, 0.85); });
  targets.forEach(function (p) { addNode(p, ACCENT, 0.55, 0.95); });

  /* thin rings around agent nodes */
  var ringMat = track(new THREE.LineBasicMaterial({ color: ACCENT }), 0.45);
  targets.forEach(function (p) {
    var ring = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(new THREE.EllipseCurve(0, 0, 0.32, 0.32, 0, Math.PI * 2, false, 0).getPoints(40)), ringMat);
    ring.position.copy(p);
    net.add(ring);
  });

  /* ---------- core ---------- */
  var coreGroup = new THREE.Group();
  net.add(coreGroup);
  var shell = new THREE.Mesh(
    new THREE.IcosahedronGeometry(CORE_R - 0.06, 1),
    track(new THREE.MeshBasicMaterial({ color: 0x000000 }), 0.6)
  );
  var outer = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(CORE_R, 1)),
    track(new THREE.LineBasicMaterial({ color: 0xffffff }), 0.42)
  );
  var inner = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(0.85, 0)),
    track(new THREE.LineBasicMaterial({ color: ACCENT }), 0.95)
  );
  /* shell darkens routes behind the core but must not hide the inner lattice */
  shell.material.depthWrite = false;
  shell.renderOrder = 0; inner.renderOrder = 1; outer.renderOrder = 2;
  coreGroup.add(shell, outer, inner);
  var coreGlow = addNode(new THREE.Vector3(0, 0, 0), ACCENT, 5.6, 0.2);
  coreGroup.add(coreGlow);

  /* ---------- particles ---------- */
  var P = 200;
  var positions = new Float32Array(P * 3);
  var colors = new Float32Array(P * 3);
  var parts = [];
  function reset(p, stage) {
    p.stage = stage;
    p.t = stage === 0 ? Math.random() * 0.2 : 0;
    p.speed = 0.0032 + Math.random() * 0.0042;
    if (stage === 0) {
      p.curve = inCurves[(Math.random() * inCurves.length) | 0];
      p.hot = Math.random() < 0.62;
      p.color = WHITE.clone().multiplyScalar(0.75);
    } else {
      p.curve = outCurves[(Math.random() * outCurves.length) | 0];
      p.color = p.hot ? ACCENT : DIM;
      p.speed *= 1.35;
    }
  }
  var tmp = new THREE.Vector3();
  for (i = 0; i < P; i++) {
    var p = {};
    reset(p, Math.random() < 0.55 ? 0 : 1);
    p.t = Math.random();
    parts.push(p);
  }
  var pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  pGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  var pMat = track(new THREE.PointsMaterial({
    size: 0.2, map: glowTex, vertexColors: true, depthWrite: false,
    blending: THREE.AdditiveBlending, sizeAttenuation: true
  }), 1);
  net.add(new THREE.Points(pGeo, pMat));

  function stepParticles(dt) {
    var k = dt / 16.67;
    for (var j = 0; j < P; j++) {
      var q = parts[j];
      q.t += q.speed * k;
      if (q.t >= 1) {
        reset(q, q.stage === 0 ? 1 : 0);
      }
      q.curve.getPoint(q.t, tmp);
      /* slight jitter so streams look like traffic rather than a single line */
      var w = Math.sin(q.t * 9 + j) * 0.06;
      positions[j * 3] = tmp.x;
      positions[j * 3 + 1] = tmp.y + w;
      positions[j * 3 + 2] = tmp.z + w * 0.5;
      colors[j * 3] = q.color.r;
      colors[j * 3 + 1] = q.color.g;
      colors[j * 3 + 2] = q.color.b;
    }
    pGeo.attributes.position.needsUpdate = true;
    pGeo.attributes.color.needsUpdate = true;
  }

  /* ---------- state ---------- */
  var state = { hero: 0, fade: 1 };
  var pointer = { x: 0, y: 0 }, rot = { x: 0, y: 0 };
  var portrait = false;

  window.HERO = {
    setScroll: function (s) {
      if (typeof s.hero === 'number') state.hero = s.hero;
      if (typeof s.fade === 'number') state.fade = s.fade;
    }
  };

  window.addEventListener('pointermove', function (e) {
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
  }, { passive: true });

  function resize() {
    var w = window.innerWidth, h = window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    portrait = w / h < 0.85;
    /* the network is ~15 units long; the camera shows ~11.7 units vertically.
       Landscape: shrink with narrow aspect ratios. Portrait: it runs vertically
       and should take about half the screen height above the headline. */
    var s = portrait ? 0.4 : Math.max(0.6, Math.min(1, (w / h) / 1.45));
    net.scale.setScalar(s);
  }
  window.addEventListener('resize', resize);
  resize();

  /* ---------- loop ---------- */
  var last = performance.now();
  var hidden = false;
  var cleared = false;
  document.addEventListener('visibilitychange', function () { hidden = document.hidden; if (!hidden) { last = performance.now(); frame(last); } });

  function frame(now) {
    if (hidden) return;
    var dt = Math.min(48, now - last);
    last = now;
    if (reduce) dt = 0; /* reduced motion: static composition, still responds to scroll */
    var k = dt / 16.67;

    /* core rotation */
    coreGroup.rotation.y += 0.004 * k;
    coreGroup.rotation.x += 0.0012 * k;
    inner.rotation.y -= 0.007 * k;
    inner.rotation.z += 0.003 * k;

    /* pointer parallax, eased */
    var tx = -pointer.y * 0.12, ty = pointer.x * 0.22;
    rot.x += (tx - rot.x) * 0.04;
    rot.y += (ty - rot.y) * 0.04;
    net.rotation.x = rot.x;
    net.rotation.y = rot.y;
    /* on portrait screens the flow runs top-to-bottom */
    var tz = portrait ? -Math.PI / 2 : 0;
    net.rotation.z += (tz - net.rotation.z) * 0.08;

    /* scroll: drift up + fade as the hero leaves */
    var hp = state.hero;
    /* sits slightly above centre so the headline has room underneath */
    net.position.y = (portrait ? 1.9 : 1.0) + hp * 3.2;
    net.position.x = portrait ? 0 : hp * 1.6;
    var fade = state.fade;
    for (var m = 0; m < materials.length; m++) {
      materials[m][0].opacity = materials[m][1] * fade;
    }

    stepParticles(dt);
    if (fade > 0.001) renderer.render(scene, camera);
    else if (!cleared) { renderer.clear(); cleared = true; }
    if (fade > 0.001) cleared = false;
    requestAnimationFrame(frame);
  }
  stepParticles(0);
  requestAnimationFrame(frame);
})();
