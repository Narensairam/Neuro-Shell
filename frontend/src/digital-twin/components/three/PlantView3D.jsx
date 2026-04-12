import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { usePlantStore } from '../../store/plantStore';

const STATUS_COLORS = {
  online: 0x10b981,
  offline: 0x64748b,
  warning: 0xf59e0b,
  critical: 0xef4444
};

export function PlantView3D() {
  const mountRef = useRef(null);
  const { nodes, edges } = usePlantStore();
  const sceneRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current) return;
    
    // Setup
    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;
    
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020617); // slate-950
    scene.fog = new THREE.FogExp2(0x020617, 0.001);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 2000);
    camera.position.set(500, 400, 800);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.05; // Don't go below ground

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(200, 600, 300);
    dirLight.castShadow = true;
    dirLight.shadow.camera.top = 1000;
    dirLight.shadow.camera.bottom = -1000;
    dirLight.shadow.camera.left = -1000;
    dirLight.shadow.camera.right = 1000;
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(0x06b6d4, 1.5, 1500);
    pointLight.position.set(0, 200, 0);
    scene.add(pointLight);

    // Helpers
    const axesHelper = new THREE.AxesHelper( 500 );
    scene.add( axesHelper );

    // Ground
    const gridHelper = new THREE.GridHelper(2000, 40, 0x1e293b, 0x0f172a);
    scene.add(gridHelper);

    const groundGeo = new THREE.PlaneGeometry(2000, 2000);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.8,
      metalness: 0.2
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // Render loop
    let animationFrameId;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Resize handler
    const handleResize = () => {
      if (!mountRef.current || !camera || !renderer) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      if (w === 0 || h === 0) return;
      
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(() => handleResize());
    resizeObserver.observe(mountRef.current);
    
    // Initial resize to ensure correct canvas sizing, wait a frame for layout
    setTimeout(handleResize, 10);

    return () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(animationFrameId);
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Update nodes when data changes
  useEffect(() => {
    if (!sceneRef.current) return;
    const scene = sceneRef.current;

    // Clean up old objects
    const objectsToRemove = [];
    scene.traverse((child) => {
      if (child.userData.isPlantObject) {
        objectsToRemove.push(child);
      }
    });
    objectsToRemove.forEach((obj) => scene.remove(obj));

    // Create materials
    const getMaterial = (status) => {
      const color = STATUS_COLORS[status] || STATUS_COLORS.offline;
      return new THREE.MeshStandardMaterial({
        color,
        roughness: 0.3,
        metalness: 0.7
      });
    };

    const nodePositions = new Map();

    // Add nodes
    nodes.forEach((node) => {
      const { type, metadata } = node.data;
      let geometry;
      let yOffset = 0;

      switch (type) {
        case 'tank':
          geometry = new THREE.CylinderGeometry(30, 30, 80, 32);
          yOffset = 40;
          break;
        case 'reactor':
          geometry = new THREE.CylinderGeometry(20, 20, 120, 16);
          yOffset = 60;
          break;
        case 'heater':
          geometry = new THREE.BoxGeometry(40, 60, 40);
          yOffset = 30;
          break;
        case 'pump':
        case 'valve':
        case 'separator':
          geometry = new THREE.SphereGeometry(20, 32, 16);
          yOffset = 20;
          break;
        default:
          geometry = new THREE.BoxGeometry(30, 30, 30);
          yOffset = 15;
      }

      const material = getMaterial(metadata.status);
      const mesh = new THREE.Mesh(geometry, material);

      // Map 2D coordinates to 3D space (center around 0,0)
      const x = node.position.x - 600;
      const z = node.position.y - 250;

      mesh.position.set(x, yOffset, z);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.userData = {
        isPlantObject: true,
        id: node.id
      };

      nodePositions.set(node.id, new THREE.Vector3(x, yOffset, z));
      scene.add(mesh);
    });

    // Add edges (pipelines)
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x475569,
      linewidth: 2
    });

    edges.forEach((edge) => {
      const start = nodePositions.get(edge.source);
      const end = nodePositions.get(edge.target);

      if (start && end) {
        const points = [];
        points.push(start);
        // Add a point to make it look like a pipe network (right angles)
        points.push(new THREE.Vector3(end.x, start.y, start.z));
        points.push(end);

        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(geometry, lineMat);
        line.userData = { isPlantObject: true };
        scene.add(line);
      }
    });
  }, [nodes, edges]);

  return (
    <div className="w-full h-full relative">
      <div ref={mountRef} className="w-full h-full" />
      <div className="absolute top-4 left-4 bg-slate-900/80 p-2 rounded-md border border-slate-800 backdrop-blur-sm text-xs text-slate-400 pointer-events-none">
        3D View • Left Click to Rotate • Right Click to Pan • Scroll to Zoom
      </div>
      <div className="absolute bottom-4 left-4 bg-slate-900/80 p-2 rounded-md border border-slate-800 backdrop-blur-sm text-xs text-emerald-400 pointer-events-none">
        Debug Info: Nodes in state = {nodes.length} | Edges in state = {edges.length} | 
        Scene children = {sceneRef.current?.children.length || 0}
      </div>
    </div>
  );
}
