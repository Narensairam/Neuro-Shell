import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { usePlantStore } from '../../store/plantStore';
import { Box as BoxIcon, X, Activity, Thermometer, Gauge, DatabaseIcon } from 'lucide-react';

/* ── COLOR PALETTES ───────────────────────────────────────────── */
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

// Pipe colors based on content type (mapped from edge data)
const PIPE_COLORS = {
  'Crude':         0x475569, // Slate
  'Heated Crude':  0xf97316, // Orange
  'Light Naphtha': 0xeab308, // Yellow
  'Heavy Naphtha': 0xd97706, // Amber
  'Kerosene':      0x06b6d4, // Cyan
  'Diesel':        0x3b82f6, // Blue
  'Residue':       0x1e293b, // Dark
  'default':       0x64748b,
};

/* ── SHARED GEOMETRY CACHE ──────────────────────────────────────── */
const geoCache = {};
function getCached(key, factory) {
  if (!geoCache[key]) geoCache[key] = factory();
  return geoCache[key];
}

/* ── MATERIAL FACTORY ───────────────────────────────────────────── */
function makeMat(color, opts = {}) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: opts.roughness ?? 0.2,
    metalness: opts.metalness ?? 0.85,
    ...opts,
  });
}

function makeSteelMat() {
  return makeMat(0x475569, { roughness: 0.1, metalness: 0.95 });
}

/* ── STRUCTURAL UTILITIES ───────────────────────────────────────── */

/**
 * Procedural Scaffolding Frame
 */
function createScaffolding(width, height, depth) {
  const group = new THREE.Group();
  const mat = makeSteelMat();
  const beamSize = 2;

  // Vertical corner posts
  const posts = [
    { x: -width/2, z: -depth/2 },
    { x:  width/2, z: -depth/2 },
    { x: -width/2, z:  depth/2 },
    { x:  width/2, z:  depth/2 },
  ];

  posts.forEach(p => {
    const post = new THREE.Mesh(
      getCached(`beam_v_${height}`, () => new THREE.BoxGeometry(beamSize, height, beamSize)),
      mat
    );
    post.position.set(p.x, height/2, p.z);
    group.add(post);
  });

  // Horizontal rings at different heights
  const levels = [height * 0.3, height * 0.6, height * 0.9];
  levels.forEach(y => {
    // Width beams
    [depth/2, -depth/2].forEach(z => {
      const b = new THREE.Mesh(getCached(`beam_h_w_${width}`, () => new THREE.BoxGeometry(width, beamSize, beamSize)), mat);
      b.position.set(0, y, z);
      group.add(b);
    });
    // Depth beams
    [width/2, -width/2].forEach(x => {
      const b = new THREE.Mesh(getCached(`beam_h_d_${depth}`, () => new THREE.BoxGeometry(beamSize, beamSize, depth)), mat);
      b.position.set(x, y, 0);
      group.add(b);
    });
  });

  // X-bracing (diagonal)
  const diag = new THREE.Mesh(getCached(`beam_diag_${width}_${height}`, () => new THREE.BoxGeometry(width * 1.4, beamSize * 0.5, beamSize * 0.5)), mat);
  diag.position.set(0, height/2, depth/2);
  diag.rotation.z = Math.atan2(height, width);
  group.add(diag);

  return group;
}

/* ── COMPONENT FACTORIES (HIGH DENSITY) ─────────────────────────── */

function createTank(status) {
  const group = new THREE.Group();
  const mat = makeMat(STATUS_COLORS[status] || STATUS_COLORS.offline);
  const scale = 2.4;

  const body = new THREE.Mesh(
    getCached('tank_body_hd', () => new THREE.CylinderGeometry(40, 40, 100, 32)),
    mat
  );
  body.position.y = 50;
  body.castShadow = true;
  group.add(body);

  const cap = new THREE.Mesh(
    getCached('tank_cap_hd', () => new THREE.SphereGeometry(40, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2)),
    mat
  );
  cap.position.y = 100;
  group.add(cap);

  // Ladder
  const ladderGroup = new THREE.Group();
  const ladderRailMat = makeSteelMat();
  for(let i=0; i<30; i++) {
    const rung = new THREE.Mesh(getCached('rung', () => new THREE.BoxGeometry(8, 0.5, 0.5)), ladderRailMat);
    rung.position.y = i * 3.5;
    ladderGroup.add(rung);
  }
  ladderGroup.position.set(41, 0, 0);
  group.add(ladderGroup);

  // Surround Scaffolding
  group.add(createScaffolding(90, 110, 90));

  group.scale.setScalar(scale);
  group.userData._boundingHeight = 110 * scale;
  return group;
}

function createReactor(status) {
  const group = new THREE.Group();
  const mat = makeMat(STATUS_COLORS[status] || STATUS_COLORS.offline);
  const scale = 1.6;

  const column = new THREE.Mesh(
    getCached('reactor_body_hd', () => new THREE.CylinderGeometry(35, 35, 300, 24)),
    mat
  );
  column.position.y = 150;
  column.castShadow = true;
  group.add(column);

  // Multiple catwalks
  [80, 160, 240].forEach(y => {
    const plat = new THREE.Mesh(getCached('catwalk_torus', () => new THREE.TorusGeometry(50, 6, 4, 32)), makeMat(0x64748b));
    plat.rotation.x = Math.PI / 2;
    plat.position.y = y;
    group.add(plat);

    // Railing
    const rail = new THREE.Mesh(getCached('catwalk_rail', () => new THREE.TorusGeometry(50, 0.8, 8, 32)), makeSteelMat());
    rail.rotation.x = Math.PI / 2;
    rail.position.y = y + 10;
    group.add(rail);
  });

  // Tall scaffolding frame
  group.add(createScaffolding(110, 310, 110));

  group.scale.setScalar(scale);
  group.userData._boundingHeight = 310 * scale;
  return group;
}

function createHeater(status) {
  const group = new THREE.Group();
  const mat = makeMat(STATUS_COLORS[status] || STATUS_COLORS.offline);
  const scale = 2.0;

  const body = new THREE.Mesh(getCached('heater_box_hd', () => new THREE.BoxGeometry(70, 90, 70)), mat);
  body.position.y = 45;
  group.add(body);

  const stack = new THREE.Mesh(getCached('heater_cyl_hd', () => new THREE.CylinderGeometry(12, 14, 100, 16)), makeSteelMat());
  stack.position.y = 140;
  group.add(stack);

  // Cage around the heater
  group.add(createScaffolding(85, 95, 85));

  group.scale.setScalar(scale);
  group.userData._boundingHeight = 190 * scale;
  return group;
}

/**
 * Non-interactive filler unit to add density
 */
function createAmbientFiller() {
  const group = new THREE.Group();
  const mat = makeSteelMat();
  
  const base = new THREE.Mesh(getCached('ambient_box', () => new THREE.BoxGeometry(40, 60, 40)), mat);
  base.position.y = 30;
  group.add(base);

  const pipes = new THREE.Group();
  for(let i=0; i<3; i++) {
    const p = new THREE.Mesh(getCached('ambient_pipe', () => new THREE.CylinderGeometry(4, 4, 100, 8)), makeMat(0x334155));
    p.rotation.z = Math.PI / 2;
    p.position.set(0, 10 + i * 20, 0);
    pipes.add(p);
  }
  group.add(pipes);
  group.userData.isPlantObject = true;
  group.userData.isAmbient = true;
  return group;
}

/* ── UI HELPERS ─────────────────────────────────────────────────── */

function createCompactLabel(text, status, metadata = {}) {
  const div = document.createElement('div');
  div.style.cssText = `
    color: #fff;
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    font-weight: 700;
    background: rgba(15, 23, 42, 0.9);
    border-left: 3px solid ${STATUS_HEX[status] || '#475569'};
    border-radius: 4px;
    padding: 6px 10px;
    pointer-events: none;
    backdrop-filter: blur(8px);
    box-shadow: 0 4px 20px rgba(0,0,0,0.6);
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 80px;
  `;

  const header = document.createElement('div');
  header.style.cssText = 'font-size: 9px; opacity: 0.6; text-transform: uppercase; margin-bottom: 2px;';
  header.innerText = text;
  div.appendChild(header);

  // Small metrics grit
  const metrics = document.createElement('div');
  metrics.style.cssText = 'display: flex; gap: 8px;';
  
  if(metadata.temperature) metrics.innerHTML += `<span style="color:#fb923c">T:${metadata.temperature}°</span>`;
  if(metadata.pressure) metrics.innerHTML += `<span style="color:#38bdf8">P:${metadata.pressure}</span>`;
  
  div.appendChild(metrics);

  const label = new CSS2DObject(div);
  label.userData = { isLabel: true, isPlantObject: true };
  return label;
}

/* ── PIPING LOGIC ────────────────────────────────────────────────── */

function createPipeDetailed(start, end, materialType, isAnimated) {
  const group = new THREE.Group();
  group.userData = { isPlantObject: true, isPipe: true };

  // Layered elevation for pipe crossing
  const elevationOffset = (Math.random() - 0.5) * 40;
  const midY = Math.max(start.y, end.y) + 60 + elevationOffset;

  const points = [
    start.clone(),
    new THREE.Vector3(start.x, midY, start.z),
    new THREE.Vector3(end.x, midY, end.z),
    end.clone(),
  ];
  const curve = new THREE.CatmullRomCurve3(points);

  const pipeColor = PIPE_COLORS[materialType] || PIPE_COLORS.default;
  const pipeMat = makeMat(pipeColor, { roughness: 0.1, metalness: 0.9 });

  const pipeGeo = new THREE.TubeGeometry(curve, 64, 5, 12, false);
  const pipe = new THREE.Mesh(pipeGeo, pipeMat);
  pipe.castShadow = true;
  group.add(pipe);

  // Glow beads for flow
  if (isAnimated) {
    const beadGeo = new THREE.SphereGeometry(4, 8, 8);
    const beadMat = new THREE.MeshStandardMaterial({ color: pipeColor, emissive: pipeColor, emissiveIntensity: 3 });
    for(let i=0; i<4; i++) {
      const b = new THREE.Mesh(beadGeo, beadMat);
      b.userData = { isFlowBead: true, curve, offset: i/4 };
      group.add(b);
    }
  }

  return group;
}

/* ════════════════════════════════════════════════════════════════ */
/* ── MAIN COMPONENT ─────────────────────────────────────────────── */
/* ════════════════════════════════════════════════════════════════ */
export function PlantView3D() {
  const mountRef = useRef(null);
  const { nodes, edges, setSelectedNode, selectedNodeId } = usePlantStore();
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);
  const labelRendererRef = useRef(null);
  const clockRef = useRef(new THREE.Clock());
  const meshMapRef = useRef(new Map());
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2());

  const [infoPanelData, setInfoPanelData] = useState(null);

  const handleCanvasClick = useCallback((e) => {
    if (!mountRef.current || !cameraRef.current || !sceneRef.current) return;
    const rect = mountRef.current.getBoundingClientRect();
    mouseRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouseRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
    const intersects = raycasterRef.current.intersectObjects(sceneRef.current.children, true);

    let clickedNodeId = null;
    for (const hit of intersects) {
      let obj = hit.object;
      while (obj) {
        if (obj.userData?.nodeId) { clickedNodeId = obj.userData.nodeId; break; }
        obj = obj.parent;
      }
      if (clickedNodeId) break;
    }

    if (clickedNodeId) {
      setSelectedNode(clickedNodeId);
      const node = nodes.find(n => n.id === clickedNodeId);
      if (node) setInfoPanelData({ ...node.data, id: node.id, ...node.data.metadata });
    } else {
      setSelectedNode(null);
      setInfoPanelData(null);
    }
  }, [nodes, setSelectedNode]);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020617);
    scene.fog = new THREE.FogExp2(0x0a1120, 0.0003);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(40, width / height, 1, 10000);
    camera.position.set(600, 400, 800);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, logarithmicDepthBuffer: true });
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.4;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const labelRenderer = new CSS2DRenderer();
    labelRenderer.setSize(width, height);
    labelRenderer.domElement.style.position = 'absolute';
    labelRenderer.domElement.style.top = '0';
    labelRenderer.domElement.style.pointerEvents = 'none';
    mountRef.current.appendChild(labelRenderer.domElement);
    labelRendererRef.current = labelRenderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2.1;
    controlsRef.current = controls;

    /* ── DENSE INDUSTRIAL LIGHTING ────────────────────────────── */
    scene.add(new THREE.AmbientLight(0x1e293b, 0.4));
    
    // Golden Hour Sun
    const sun = new THREE.DirectionalLight(0xffedd5, 2.5);
    sun.position.set(2000, 1200, 1000);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    scene.add(sun);

    // Deep blue fill from opposite side
    const fill = new THREE.DirectionalLight(0x1e1b4b, 1.2);
    fill.position.set(-800, 500, -800);
    scene.add(fill);

    // Warm base foundation
    const platform = new THREE.Mesh(
      new THREE.BoxGeometry(10000, 40, 10000),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.8, metalness: 0.1 })
    );
    platform.position.y = -21;
    platform.receiveShadow = true;
    scene.add(platform);

    const grid = new THREE.GridHelper(10000, 80, 0x1e293b, 0x0f172a);
    grid.material.opacity = 0.2;
    grid.material.transparent = true;
    scene.add(grid);

    let frameId;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const elapsed = clockRef.current.getElapsedTime();
      scene.traverse(c => {
        if (c.userData?.isFlowBead) {
          const t = (c.userData.offset + elapsed * 0.1) % 1;
          c.position.copy(c.userData.curve.getPointAt(t));
        }
      });
      controls.update();
      renderer.render(scene, camera);
      labelRenderer.render(scene, camera);
    };
    animate();

    return () => { cancelAnimationFrame(frameId); renderer.dispose(); };
  }, []);

  useEffect(() => {
    if (!sceneRef.current) return;
    const scene = sceneRef.current;
    
    // Cleanup
    const toRemove = [];
    scene.traverse(c => { if (c.userData?.isPlantObject) toRemove.push(c); });
    toRemove.forEach(o => o.parent && o.parent.remove(o));
    meshMapRef.current.clear();

    const nodePositions = new Map();

    nodes.forEach(node => {
      if (!node.data || !node.position) return;
      let equip;
      const { type } = node.data;

      if(type === 'reactor') equip = createReactor(node.data.metadata?.status);
      else if(type === 'heater') equip = createHeater(node.data.metadata?.status);
      else equip = createTank(node.data.metadata?.status);

      equip.userData.nodeId = node.id;
      equip.traverse(c => c.userData.nodeId = node.id);

      const x = (node.position.x - 600) * 3.5;
      const z = (node.position.y - 250) * 3.5;
      equip.position.set(x, 0, z);
      scene.add(equip);
      meshMapRef.current.set(node.id, equip);

      const h = equip.userData._boundingHeight || 150;
      nodePositions.set(node.id, new THREE.Vector3(x, h * 0.5, z));

      // Compact Lables
      const label = createCompactLabel(node.data.label, node.data.metadata?.status, node.data.metadata);
      label.position.set(0, h + 40, 0);
      equip.add(label);

      // Add "Filler" units near main equipment
      for(let i=0; i<2; i++) {
        const filler = createAmbientFiller();
        filler.position.set(x + (Math.random()-0.5)*200, 0, z + (Math.random()-0.5)*200);
        filler.rotation.y = Math.random() * Math.PI;
        scene.add(filler);
      }
    });

    edges.forEach(edge => {
      const s = nodePositions.get(edge.source);
      const e = nodePositions.get(edge.target);
      if (s && e) {
        // Main pipe
        scene.add(createPipeDetailed(s, e, edge.data?.material, edge.animated));
        // Layered secondary pipes for density
        if(Math.random() > 0.5) {
          scene.add(createPipeDetailed(s, e, 'default', false));
        }
      }
    });

    if (nodes.length > 0 && controlsRef.current) {
      const b = new THREE.Box3();
      meshMapRef.current.forEach(g => b.expandByObject(g));
      const c = new THREE.Vector3();
      b.getCenter(c);
      controlsRef.current.target.copy(c);
      controlsRef.current.update();
    }
  }, [nodes, edges]);

  return (
    <div className="absolute inset-0 overflow-hidden bg-slate-950">
      <div ref={mountRef} className="w-full h-full" onClick={handleCanvasClick} />
      
      {/* Mini Legend HUD */}
      <div className="absolute bottom-8 right-8 bg-slate-900/40 backdrop-blur-md p-5 rounded-3xl border border-white/5 pointer-events-none">
        <div className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mb-3">Refinery Status</div>
        <div className="space-y-2">
          {Object.entries(STATUS_HEX).map(([k, c]) => (
            <div key={k} className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: c, boxShadow: `0 0 10px ${c}` }} />
              <span className="text-xs text-slate-300 font-bold capitalize">{k}</span>
            </div>
          ))}
        </div>
      </div>

      {infoPanelData && (
        <div className="absolute top-8 right-8 w-[380px] animate-in fade-in slide-in-from-right-10 duration-500">
           <div className="bg-slate-900/90 backdrop-blur-3xl border border-white/10 rounded-3xl shadow-2xl p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-white text-xl font-black tracking-tight">{infoPanelData.label}</h2>
                  <div className="text-slate-500 text-[9px] uppercase tracking-widest mt-1 font-bold">Production Unit • {infoPanelData.status}</div>
                </div>
                <button onClick={() => { setInfoPanelData(null); setSelectedNode(null); }} className="text-slate-400 hover:text-white"><X size={20}/></button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Temperature', val: `${infoPanelData.temperature}°C`, icon: Thermometer, color: 'text-orange-400' },
                  { label: 'Pressure', val: `${infoPanelData.pressure} PSI`, icon: Gauge, color: 'text-cyan-400' },
                  { label: 'Flow Rate', val: infoPanelData.flowRate?.toLocaleString(), icon: Activity, color: 'text-emerald-400' },
                  { label: 'Capacity', val: infoPanelData.capacity?.toLocaleString(), icon: DatabaseIcon, color: 'text-indigo-400' }
                ].map(s => s.val && (
                  <div key={s.label} className="bg-white/5 p-4 rounded-2xl border border-white/[0.03]">
                    <div className="flex items-center gap-2 text-slate-500 text-[8px] uppercase font-bold tracking-widest mb-1"><s.icon size={12} className={s.color} /> {s.label}</div>
                    <div className="text-white text-base font-bold tabular-nums">{s.val}</div>
                  </div>
                ))}
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
