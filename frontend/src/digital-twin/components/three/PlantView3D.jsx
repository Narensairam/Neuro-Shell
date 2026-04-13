import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { usePlantStore } from '../../store/plantStore';
import { X, Activity, Thermometer, Gauge, DatabaseIcon, Zap, Droplets } from 'lucide-react';

/* ── STATUS COLORS ─────────────────────────────────────────────── */
const STATUS_COLORS = {
  online:   0x10b981,
  offline:  0x64748b,
  warning:  0xf59e0b,
  critical: 0xef4444,
};
const STATUS_HEX = {
  online:   '#10b981',
  offline:  '#64748b',
  warning:  '#f59e0b',
  critical: '#ef4444',
};
const PIPE_COLORS = {
  'Crude':         0x94a3b8,
  'Heated Crude':  0xfb923c,
  'Light Naphtha': 0xfacc15,
  'Heavy Naphtha': 0xfbbf24,
  'Kerosene':      0x67e8f9,
  'Diesel':        0x60a5fa,
  'Residue':       0x64748b,
  'default':       0x94a3b8,
};

/* ── STATIC PLANT DEFINITION ────────────────────────────────────── */
// This is independent of the Zustand store load timing
const PLANT_NODES = [
  { id: 'node-1',  label: 'Crude Storage Tank A',    type: 'tank',            x: -800,  z:   0, status: 'online',   temp: 25,  pressure: 14.7, capacity: 500000 },
  { id: 'node-2',  label: 'Main Feed Pump',           type: 'pump',            x: -400,  z:   0, status: 'online',   temp: 30,  pressure: 150, flowRate: 125000 },
  { id: 'node-3',  label: 'Pre-Heater Train',         type: 'heater',          x:    0,  z:   0, status: 'warning',  temp: 350, pressure: 145 },
  { id: 'node-4',  label: 'Atm. Distillation Column', type: 'reactor',         x:  500,  z:   0, status: 'online',   temp: 370, pressure: 25,  capacity: 150000 },
  { id: 'node-5',  label: 'Gas Turbine Generator',    type: 'generator',       x:  950,  z: -400, status: 'online',  temp: 480, pressure: 20,  flowRate: 25000 },
  { id: 'node-6',  label: 'Naphtha Storage Tank',     type: 'horizontal_tank', x:  950,  z: -150, status: 'online',  temp: 40,  pressure: 22,  capacity: 30000 },
  { id: 'node-7',  label: 'Kerosene Stripper',        type: 'separator',       x:  950,  z:  150, status: 'online',  temp: 200, pressure: 18,  capacity: 40000 },
  { id: 'node-8',  label: 'Diesel Stripper',          type: 'separator',       x:  950,  z:  400, status: 'critical',temp: 280, pressure: 15,  capacity: 45000 },
  { id: 'node-9',  label: 'Residue Pump',             type: 'pump',            x:  950,  z:  650, status: 'online',  temp: 340, pressure: 180, flowRate: 20000 },
  { id: 'node-10', label: 'Kerosene Storage',         type: 'horizontal_tank', x: 1400,  z:  150, status: 'online',  temp: 40,  pressure: 14.7, capacity: 100000 },
  { id: 'node-11', label: 'Diesel Storage',           type: 'horizontal_tank', x: 1400,  z:  400, status: 'offline', temp: 45,  pressure: 14.7, capacity: 150000 },
  { id: 'node-12', label: 'Bypass Valve A',           type: 'valve',           x: -200,  z: -250, status: 'offline', temp: 30,  pressure: 150 },
];
const PLANT_EDGES = [
  { from: 'node-1', to: 'node-2',  material: 'Crude',         animated: true },
  { from: 'node-2', to: 'node-3',  material: 'Crude',         animated: true },
  { from: 'node-3', to: 'node-4',  material: 'Heated Crude',  animated: true },
  { from: 'node-4', to: 'node-5',  material: 'Light Naphtha', animated: true },
  { from: 'node-4', to: 'node-6',  material: 'Heavy Naphtha', animated: true },
  { from: 'node-4', to: 'node-7',  material: 'Kerosene',      animated: true },
  { from: 'node-4', to: 'node-8',  material: 'Diesel',        animated: true },
  { from: 'node-4', to: 'node-9',  material: 'Residue',       animated: true },
  { from: 'node-7', to: 'node-10', material: 'Kerosene',      animated: true },
  { from: 'node-8', to: 'node-11', material: 'Diesel',        animated: false },
];

/* ── MATERIAL FACTORY ───────────────────────────────────────────── */
function makeMat(color, opts = {}) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: opts.roughness ?? 0.55,
    metalness: opts.metalness ?? 0.3,
    ...opts,
  });
}
function makeSteelMat() {
  return makeMat(0x64748b, { roughness: 0.4, metalness: 0.6 });
}

/* ── GEOMETRY CACHE ─────────────────────────────────────────────── */
const geoCache = {};
function geo(key, factory) {
  if (!geoCache[key]) geoCache[key] = factory();
  return geoCache[key];
}

/* ── COMPONENT BUILDERS ─────────────────────────────────────────── */

function createTank(color) {
  const g = new THREE.Group();
  const mat = makeMat(color);
  const body = new THREE.Mesh(geo('tank_body', () => new THREE.CylinderGeometry(40, 40, 100, 32)), mat);
  body.position.y = 50; body.castShadow = true; body.receiveShadow = true; g.add(body);
  const cap = new THREE.Mesh(geo('tank_cap', () => new THREE.SphereGeometry(40, 32, 16, 0, Math.PI*2, 0, Math.PI/2)), mat);
  cap.position.y = 100; g.add(cap);
  // Ladder strip
  const ladder = new THREE.Mesh(geo('tank_ladder', () => new THREE.BoxGeometry(4, 100, 2)), makeSteelMat());
  ladder.position.set(42, 50, 0); g.add(ladder);
  g.scale.setScalar(2.2);
  g.userData._boundingHeight = 100 * 2.2;
  return g;
}

function createHorizontalTank(color) {
  const g = new THREE.Group();
  const mat = makeMat(color);
  const body = new THREE.Mesh(geo('hz_body', () => new THREE.CylinderGeometry(28, 28, 140, 32)), mat);
  body.rotation.z = Math.PI / 2; body.position.y = 35; body.castShadow = true; g.add(body);
  const capGeo = geo('hz_cap', () => new THREE.SphereGeometry(28, 32, 16, 0, Math.PI*2, 0, Math.PI/2));
  const cap1 = new THREE.Mesh(capGeo, mat); cap1.rotation.z = Math.PI/2; cap1.position.set(70, 35, 0); g.add(cap1);
  const cap2 = new THREE.Mesh(capGeo, mat); cap2.rotation.z = -Math.PI/2; cap2.position.set(-70, 35, 0); g.add(cap2);
  const supGeo = geo('hz_sup', () => new THREE.BoxGeometry(12, 28, 42));
  [-42, 42].forEach(x => { const s = new THREE.Mesh(supGeo, makeSteelMat()); s.position.set(x, 14, 0); g.add(s); });
  g.scale.setScalar(1.8);
  g.userData._boundingHeight = 63 * 1.8;
  return g;
}

function createPump(color) {
  const g = new THREE.Group();
  const mat = makeMat(color);
  const base = new THREE.Mesh(geo('pump_base', () => new THREE.BoxGeometry(90, 8, 55)), makeSteelMat());
  base.position.y = 4; g.add(base);
  const motor = new THREE.Mesh(geo('pump_motor', () => new THREE.CylinderGeometry(16, 16, 44, 16)), makeMat(0x1e293b, { roughness:0.7, metalness:0.1 }));
  motor.rotation.z = Math.PI/2; motor.position.set(-22, 26, 0); motor.castShadow = true; g.add(motor);
  const pumpHousing = new THREE.Mesh(geo('pump_housing', () => new THREE.CylinderGeometry(20, 20, 24, 24)), mat);
  pumpHousing.rotation.x = Math.PI/2; pumpHousing.position.set(14, 24, 0); pumpHousing.castShadow = true; g.add(pumpHousing);
  const pipeUp = new THREE.Mesh(geo('pump_pipe', () => new THREE.CylinderGeometry(7, 7, 32, 12)), mat);
  pipeUp.position.set(14, 48, 0); g.add(pipeUp);
  g.scale.setScalar(1.6);
  g.userData._boundingHeight = 60 * 1.6;
  return g;
}

function createHeater(color) {
  const g = new THREE.Group();
  const mat = makeMat(color);
  const body = new THREE.Mesh(geo('heater_body', () => new THREE.BoxGeometry(80, 100, 70)), mat);
  body.position.y = 50; body.castShadow = true; g.add(body);
  const stack = new THREE.Mesh(geo('heater_stack', () => new THREE.CylinderGeometry(12, 16, 110, 16)), makeSteelMat());
  stack.position.y = 155; g.add(stack);
  // glow ring at top of stack
  const glowMat = new THREE.MeshStandardMaterial({ color: 0xfb923c, emissive: 0xfb923c, emissiveIntensity: 2 });
  const glowRing = new THREE.Mesh(geo('heater_glow', () => new THREE.TorusGeometry(14, 3, 8, 24)), glowMat);
  glowRing.rotation.x = Math.PI/2; glowRing.position.y = 210; g.add(glowRing);
  g.scale.setScalar(1.9);
  g.userData._boundingHeight = 210 * 1.9;
  return g;
}

function createReactor(color) {
  const g = new THREE.Group();
  const mat = makeMat(color);
  const column = new THREE.Mesh(geo('reactor_col', () => new THREE.CylinderGeometry(36, 36, 320, 24)), mat);
  column.position.y = 160; column.castShadow = true; g.add(column);
  // Catwalk rings
  [80, 160, 240].forEach(y => {
    const ring = new THREE.Mesh(geo('catwalk', () => new THREE.TorusGeometry(52, 5, 4, 32)), makeMat(0x475569));
    ring.rotation.x = Math.PI/2; ring.position.y = y; g.add(ring);
  });
  // Nozzles
  [-100, 0, 100].forEach(y => {
    const nozzle = new THREE.Mesh(geo('reactor_nozzle', () => new THREE.CylinderGeometry(6, 6, 40, 8)), makeSteelMat());
    nozzle.rotation.z = Math.PI/2; nozzle.position.set(60, 160 + y, 0); g.add(nozzle);
  });
  g.scale.setScalar(1.6);
  g.userData._boundingHeight = 320 * 1.6;
  return g;
}

function createGenerator(color) {
  const g = new THREE.Group();
  const mat = makeMat(color);
  const body = new THREE.Mesh(geo('gen_body', () => new THREE.BoxGeometry(110, 65, 65)), makeSteelMat());
  body.position.y = 32; body.castShadow = true; g.add(body);
  // Glowing status stripe
  const stripeMat = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.8 });
  const stripe = new THREE.Mesh(geo('gen_stripe', () => new THREE.BoxGeometry(112, 6, 67)), stripeMat);
  stripe.position.y = 44; g.add(stripe);
  const exhaust = new THREE.Mesh(geo('gen_exhaust', () => new THREE.CylinderGeometry(9, 9, 50, 16)), mat);
  exhaust.position.set(38, 90, 0); g.add(exhaust);
  // Heat shimmer cap
  const shimmer = new THREE.Mesh(geo('gen_shimmer', () => new THREE.CylinderGeometry(12, 9, 8, 16)), makeMat(0x0f172a));
  shimmer.position.set(38, 118, 0); g.add(shimmer);
  g.scale.setScalar(2.0);
  g.userData._boundingHeight = 120 * 2.0;
  return g;
}

function createSeparator(color) {
  const g = new THREE.Group();
  const mat = makeMat(color);
  const body = new THREE.Mesh(geo('sep_body', () => new THREE.CylinderGeometry(26, 26, 130, 32)), mat);
  body.position.y = 75; body.castShadow = true; g.add(body);
  const topCap = new THREE.Mesh(geo('sep_tcap', () => new THREE.SphereGeometry(26, 32, 16, 0, Math.PI*2, 0, Math.PI/2)), mat);
  topCap.position.y = 140; g.add(topCap);
  const botCap = new THREE.Mesh(geo('sep_bcap', () => new THREE.SphereGeometry(26, 32, 16, 0, Math.PI*2, 0, Math.PI/2)), mat);
  botCap.rotation.z = Math.PI; botCap.position.y = 10; g.add(botCap);
  [50, 90, 130].forEach(y => {
    const ring = new THREE.Mesh(geo('sep_ring', () => new THREE.TorusGeometry(28, 2.5, 8, 32)), makeSteelMat());
    ring.rotation.x = Math.PI/2; ring.position.y = y; g.add(ring);
  });
  g.scale.setScalar(1.8);
  g.userData._boundingHeight = 160 * 1.8;
  return g;
}

function createValve(color) {
  const g = new THREE.Group();
  const mat = makeMat(color);
  const body = new THREE.Mesh(geo('valve_body', () => new THREE.CylinderGeometry(16, 16, 32, 16)), mat);
  body.rotation.z = Math.PI/2; body.position.y = 16; body.castShadow = true; g.add(body);
  const stem = new THREE.Mesh(geo('valve_stem', () => new THREE.CylinderGeometry(4, 4, 28, 8)), makeSteelMat());
  stem.position.y = 38; g.add(stem);
  const wheel = new THREE.Mesh(geo('valve_wheel', () => new THREE.TorusGeometry(14, 2.5, 8, 24)), mat);
  wheel.rotation.x = Math.PI/2; wheel.position.y = 52; g.add(wheel);
  g.scale.setScalar(1.2);
  g.userData._boundingHeight = 60 * 1.2;
  return g;
}

function buildEquipment(node) {
  const color = STATUS_COLORS[node.status] || STATUS_COLORS.offline;
  switch (node.type) {
    case 'tank':            return createTank(color);
    case 'horizontal_tank': return createHorizontalTank(color);
    case 'pump':            return createPump(color);
    case 'heater':          return createHeater(color);
    case 'reactor':         return createReactor(color);
    case 'generator':       return createGenerator(color);
    case 'separator':       return createSeparator(color);
    case 'valve':           return createValve(color);
    default:                return createTank(color);
  }
}

/* ── PIPE BUILDER ───────────────────────────────────────────────── */
function buildPipe(startPos, endPos, material, animated, flowBeads) {
  const group = new THREE.Group();
  const elevation = Math.max(startPos.y, endPos.y) + 80;
  const pts = [
    startPos.clone(),
    new THREE.Vector3(startPos.x, elevation, startPos.z),
    new THREE.Vector3(endPos.x, elevation, endPos.z),
    endPos.clone(),
  ];
  const curve = new THREE.CatmullRomCurve3(pts);
  const pipeColor = PIPE_COLORS[material] || PIPE_COLORS.default;
  const pipeMesh = new THREE.Mesh(
    new THREE.TubeGeometry(curve, 60, 5, 8, false),
    makeMat(pipeColor, { roughness: 0.3, metalness: 0.6 })
  );
  pipeMesh.castShadow = true;
  group.add(pipeMesh);
  if (animated) {
    const beadMat = new THREE.MeshStandardMaterial({ color: pipeColor, emissive: pipeColor, emissiveIntensity: 3 });
    for (let i = 0; i < 5; i++) {
      const bead = new THREE.Mesh(geo('flow_bead', () => new THREE.SphereGeometry(5, 8, 8)), beadMat);
      bead.userData = { isFlowBead: true, curve, offset: i / 5 };
      flowBeads.push(bead);
      group.add(bead);
    }
  }
  return group;
}

/* ── CSS2D LABEL ────────────────────────────────────────────────── */
function buildLabel(node) {
  const div = document.createElement('div');
  const borderColor = STATUS_HEX[node.status] || STATUS_HEX.offline;
  div.style.cssText = `
    color: #e2e8f0;
    font-family: 'JetBrains Mono', 'Courier New', monospace;
    font-size: 9px;
    font-weight: 700;
    background: rgba(2, 6, 23, 0.92);
    border-left: 3px solid ${borderColor};
    border-radius: 4px;
    padding: 5px 9px;
    pointer-events: none;
    white-space: nowrap;
    box-shadow: 0 2px 12px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.05);
    display: flex;
    flex-direction: column;
    gap: 3px;
    letter-spacing: 0.05em;
  `;
  const title = document.createElement('div');
  title.style.cssText = 'font-size: 8px; text-transform: uppercase; opacity: 0.55; letter-spacing: 0.1em;';
  title.textContent = node.label;
  div.appendChild(title);
  const metrics = document.createElement('div');
  metrics.style.cssText = 'display: flex; gap: 8px;';
  if (node.temp != null)     metrics.innerHTML += `<span style="color:#fb923c">T:${node.temp}°</span>`;
  if (node.pressure != null) metrics.innerHTML += `<span style="color:#38bdf8">P:${node.pressure}</span>`;
  div.appendChild(metrics);
  const obj = new CSS2DObject(div);
  obj.userData.isLabel = true;
  return obj;
}

/* ════════════════════════════════════════════════════════════════ */
/* ── MAIN COMPONENT ─────────────────────────────────────────────── */
/* ════════════════════════════════════════════════════════════════ */
export function PlantView3D() {
  const mountRef      = useRef(null);
  const sceneRef      = useRef(null);
  const cameraRef     = useRef(null);
  const rendererRef   = useRef(null);
  const labelRendRef  = useRef(null);
  const controlsRef   = useRef(null);
  const frameIdRef    = useRef(null);
  const selRingRef    = useRef(null);
  const meshMapRef    = useRef(new Map()); // nodeId → Group
  const flowBeadsRef  = useRef([]);        // all animated beads
  const elapsedRef    = useRef(0);
  const lastTimeRef   = useRef(null);

  const { nodes: storeNodes, setSelectedNode } = usePlantStore();
  const [selectedId,    setSelectedId]    = useState(null);
  const [infoPanelData, setInfoPanelData] = useState(null);

  /* ── CLICK HANDLER ───────────────────────────────────────── */
  const raycaster = useRef(new THREE.Raycaster());
  const mouse     = useRef(new THREE.Vector2());

  const handleClick = useCallback((e) => {
    if (!mountRef.current || !cameraRef.current || !sceneRef.current) return;
    const rect = mountRef.current.getBoundingClientRect();
    mouse.current.x =  ((e.clientX - rect.left) / rect.width)  * 2 - 1;
    mouse.current.y = -((e.clientY - rect.top)  / rect.height) * 2 + 1;
    raycaster.current.setFromCamera(mouse.current, cameraRef.current);
    const hits = raycaster.current.intersectObjects(sceneRef.current.children, true);
    let nid = null;
    for (const hit of hits) {
      let o = hit.object;
      while (o) { if (o.userData?.plantNodeId) { nid = o.userData.plantNodeId; break; } o = o.parent; }
      if (nid) break;
    }
    if (nid) {
      setSelectedId(nid);
      setSelectedNode(nid);
      const nd = PLANT_NODES.find(n => n.id === nid);
      setInfoPanelData(nd || null);
    } else {
      setSelectedId(null);
      setSelectedNode(null);
      setInfoPanelData(null);
    }
  }, [setSelectedNode]);

  /* ── MOUNT / SCENE BUILD ─────────────────────────────────── */
  useEffect(() => {
    if (!mountRef.current) return;
    const el    = mountRef.current;
    const W     = el.clientWidth  || 800;
    const H     = el.clientHeight || 600;

    /* -- Renderer -- */
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(W, H);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type    = THREE.PCFSoftShadowMap;
    renderer.toneMapping       = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.4;
    el.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    /* -- CSS2D Renderer -- */
    const labelRenderer = new CSS2DRenderer();
    labelRenderer.setSize(W, H);
    labelRenderer.domElement.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;';
    el.appendChild(labelRenderer.domElement);
    labelRendRef.current = labelRenderer;

    /* -- Scene -- */
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020617);
    scene.fog = new THREE.FogExp2(0x020617, 0.00018);
    sceneRef.current = scene;

    /* -- Camera -- */
    const camera = new THREE.PerspectiveCamera(45, W / H, 10, 20000);
    camera.position.set(200, 900, 2200);
    cameraRef.current = camera;

    /* -- Controls -- */
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping  = true;
    controls.dampingFactor  = 0.06;
    controls.maxPolarAngle  = Math.PI / 2.05;
    controls.minDistance    = 200;
    controls.maxDistance    = 8000;
    controls.target.set(200, 100, 200);
    controls.update();
    controlsRef.current = controls;

    /* -- Lighting -- */
    scene.add(new THREE.AmbientLight(0xffffff, 1.2));
    const sun = new THREE.DirectionalLight(0xfff0e0, 3.0);
    sun.position.set(1500, 2000, 1500);
    sun.castShadow = true;
    sun.shadow.camera.near = 10;
    sun.shadow.camera.far  = 8000;
    sun.shadow.camera.left = sun.shadow.camera.bottom = -3000;
    sun.shadow.camera.right = sun.shadow.camera.top = 3000;
    sun.shadow.mapSize.set(2048, 2048);
    scene.add(sun);
    const fill = new THREE.DirectionalLight(0x6dd5fa, 1.2);
    fill.position.set(-1000, 600, -1000);
    scene.add(fill);
    const bounce = new THREE.HemisphereLight(0x334155, 0x0f172a, 0.8);
    scene.add(bounce);

    /* -- Ground -- */
    const ground = new THREE.Mesh(
      new THREE.BoxGeometry(12000, 30, 12000),
      new THREE.MeshStandardMaterial({ color: 0x0b1120, roughness: 0.9, metalness: 0.0 })
    );
    ground.position.y = -16;
    ground.receiveShadow = true;
    scene.add(ground);
    const grid = new THREE.GridHelper(12000, 100, 0x1e293b, 0x0f172a);
    grid.material.opacity = 0.25;
    grid.material.transparent = true;
    scene.add(grid);

    /* -- Selection Ring -- */
    const selRing = new THREE.Mesh(
      new THREE.TorusGeometry(50, 3, 8, 64),
      new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x38bdf8, emissiveIntensity: 2, transparent: true, opacity: 0.9 })
    );
    selRing.rotation.x = Math.PI / 2;
    selRing.position.y = 5;
    selRing.visible = false;
    scene.add(selRing);
    selRingRef.current = selRing;

    /* -- Build plant nodes -- */
    const posMap = new Map(); // nodeId → THREE.Vector3 (pipe connection point)
    const beads  = [];

    PLANT_NODES.forEach(nd => {
      const equip = buildEquipment(nd);
      equip.position.set(nd.x, 0, nd.z);
      equip.userData.plantNodeId = nd.id;
      equip.traverse(c => { c.userData.plantNodeId = nd.id; });
      scene.add(equip);
      meshMapRef.current.set(nd.id, equip);
      const h = equip.userData._boundingHeight || 200;
      posMap.set(nd.id, new THREE.Vector3(nd.x, h * 0.55, nd.z));
      const label = buildLabel(nd);
      label.position.y = h + 50;
      equip.add(label);
    });

    /* -- Build pipes -- */
    PLANT_EDGES.forEach(e => {
      const s = posMap.get(e.from);
      const t = posMap.get(e.to);
      if (s && t) {
        const pipeGrp = buildPipe(s, t, e.material, e.animated, beads);
        scene.add(pipeGrp);
      }
    });

    flowBeadsRef.current = beads;

    /* -- Animate -- */
    const animate = (ts) => {
      frameIdRef.current = requestAnimationFrame(animate);
      const dt = lastTimeRef.current === null ? 0 : (ts - lastTimeRef.current) / 1000;
      lastTimeRef.current = ts;
      elapsedRef.current += dt;
      const elapsed = elapsedRef.current;

      // Flow beads
      flowBeadsRef.current.forEach(b => {
        const t = (b.userData.offset + elapsed * 0.12) % 1;
        b.position.copy(b.userData.curve.getPointAt(t));
      });

      // Selection ring pulse
      if (selRingRef.current?.visible) {
        selRingRef.current.rotation.z -= 0.025;
        const s = selRingRef.current.userData.baseScale || 1;
        const pulse = 1 + Math.sin(elapsed * 5) * 0.04;
        selRingRef.current.scale.setScalar(s * pulse);
      }

      controls.update();
      renderer.render(scene, camera);
      labelRenderer.render(scene, camera);
    };
    animate(0);

    /* -- Resize -- */
    const onResize = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      labelRenderer.setSize(w, h);
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(el);

    /* -- Cleanup -- */
    return () => {
      cancelAnimationFrame(frameIdRef.current);
      ro.disconnect();
      renderer.dispose();
      el.removeChild(renderer.domElement);
      if (labelRenderer.domElement.parentNode === el)
        el.removeChild(labelRenderer.domElement);
      geoCache && Object.keys(geoCache).length; // keep cache alive intentionally
    };
  }, []); // only runs on mount

  /* ── SELECTION RING SYNC ─────────────────────────────────── */
  useEffect(() => {
    const ring  = selRingRef.current;
    const equip = meshMapRef.current.get(selectedId);
    if (!ring) return;
    if (equip) {
      ring.position.x = equip.position.x;
      ring.position.z = equip.position.z;
      const baseScale = Math.max(1, (equip.userData._boundingHeight || 200) / 100);
      ring.scale.setScalar(baseScale);
      ring.userData.baseScale = baseScale;
      ring.visible = true;
    } else {
      ring.visible = false;
    }
  }, [selectedId]);

  /* ── RENDER ──────────────────────────────────────────────── */
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', background: '#020617' }}>
      <div ref={mountRef} style={{ width: '100%', height: '100%', position: 'relative' }} onClick={handleClick} />

      {/* Legend */}
      <div style={{
        position: 'absolute', bottom: 24, right: 24,
        background: 'rgba(15,23,42,0.75)', backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 16, padding: '16px 20px', pointerEvents: 'none',
        fontFamily: "'JetBrains Mono', monospace",
      }}>
        <div style={{ fontSize: 9, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 10, fontWeight: 700 }}>Refinery Status</div>
        {Object.entries(STATUS_HEX).map(([k, c]) => (
          <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <div style={{ width: 9, height: 9, borderRadius: '50%', background: c, boxShadow: `0 0 8px ${c}` }} />
            <span style={{ fontSize: 11, color: '#cbd5e1', fontWeight: 700, textTransform: 'capitalize' }}>{k}</span>
          </div>
        ))}
      </div>

      {/* HUD hint */}
      <div style={{
        position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)',
        background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(8px)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 100, padding: '5px 16px',
        fontSize: 10, color: '#475569', fontFamily: 'monospace',
        pointerEvents: 'none', whiteSpace: 'nowrap',
        letterSpacing: '0.1em',
      }}>
        Drag to Orbit &nbsp;·&nbsp; Scroll to Zoom &nbsp;·&nbsp; Click to Inspect
      </div>

      {/* Info panel */}
      {infoPanelData && (
        <div style={{
          position: 'absolute', top: 24, right: 24, width: 340,
          background: 'rgba(15,23,42,0.92)', backdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 20, padding: 24,
          boxShadow: '0 24px 60px rgba(0,0,0,0.6)',
          fontFamily: "'JetBrains Mono', monospace",
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
            <div>
              <div style={{ color: '#f1f5f9', fontSize: 15, fontWeight: 800, letterSpacing: '-0.01em' }}>{infoPanelData.label}</div>
              <div style={{ color: STATUS_HEX[infoPanelData.status] || '#64748b', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.15em', marginTop: 4, fontWeight: 700 }}>
                {infoPanelData.type?.replace('_', ' ')} &nbsp;·&nbsp; {infoPanelData.status}
              </div>
            </div>
            <button
              onClick={() => { setInfoPanelData(null); setSelectedId(null); setSelectedNode(null); }}
              style={{ color: '#475569', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              <X size={18} />
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[
              { label: 'Temperature', val: infoPanelData.temp != null ? `${infoPanelData.temp}°C` : null,          icon: Thermometer, color: '#fb923c' },
              { label: 'Pressure',    val: infoPanelData.pressure != null ? `${infoPanelData.pressure} PSI` : null, icon: Gauge,        color: '#38bdf8' },
              { label: 'Flow Rate',   val: infoPanelData.flowRate != null ? infoPanelData.flowRate.toLocaleString() : null, icon: Activity, color: '#34d399' },
              { label: 'Capacity',    val: infoPanelData.capacity != null ? infoPanelData.capacity.toLocaleString() : null, icon: DatabaseIcon, color: '#818cf8' },
            ].filter(s => s.val).map(s => (
              <div key={s.label} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: '12px 14px', border: '1px solid rgba(255,255,255,0.04)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, color: '#475569', fontSize: 8, textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 700 }}>
                  <s.icon size={11} color={s.color} /> {s.label}
                </div>
                <div style={{ color: '#f1f5f9', fontSize: 15, fontWeight: 800 }}>{s.val}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
