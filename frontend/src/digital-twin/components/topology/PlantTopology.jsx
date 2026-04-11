import React, { useCallback, useMemo } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  BackgroundVariant,
  Panel
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { usePlantStore } from '../../store/plantStore';
import { EquipmentNode } from './EquipmentNode';

export function PlantTopology() {
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    setSelectedNode,
    selectedNodeId
  } = usePlantStore();

  const nodeTypes = useMemo(
    () => ({
      equipment: EquipmentNode
    }),
    []
  );

  const onNodeClick = useCallback(
    (_, node) => {
      setSelectedNode(node.id);
    },
    [setSelectedNode]
  );

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, [setSelectedNode]);

  // Map selected state to nodes
  const nodesWithSelection = useMemo(() => {
    return nodes.map((n) => ({
      ...n,
      selected: n.id === selectedNodeId
    }));
  }, [nodes, selectedNodeId]);

  return (
    <div className="w-full h-full bg-slate-950 relative">
      <ReactFlow
        nodes={nodesWithSelection}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        fitView
        className="dark"
        minZoom={0.2}
        maxZoom={2}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={2}
          color="#334155"
        />
        <Controls className="bg-slate-900 border-slate-800 fill-slate-300" />
        <MiniMap
          nodeColor={(node) => {
            const status = node.data?.metadata?.status;
            switch (status) {
              case 'online':
                return '#10b981';
              case 'warning':
                return '#f59e0b';
              case 'critical':
                return '#ef4444';
              default:
                return '#64748b';
            }
          }}
          maskColor="rgba(15, 23, 42, 0.7)"
          className="bg-slate-900 border-slate-800"
        />
        <Panel
          position="top-left"
          className="bg-slate-900/80 p-2 rounded-md border border-slate-800 backdrop-blur-sm text-xs text-slate-400"
        >
          Interactive 2D Topology • Drag to pan • Scroll to zoom
        </Panel>
      </ReactFlow>
    </div>
  );
}
