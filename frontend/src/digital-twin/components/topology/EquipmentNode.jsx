import '@xyflow/react/dist/style.css';
import React from 'react';
import { Handle, Position } from '@xyflow/react';
import {
  Database,
  Activity,
  GitCommit,
  Settings,
  Hexagon,
  ThermometerSun,
  Filter
} from 'lucide-react';

const statusColors = {
  online: 'border-emerald-500 bg-emerald-500/10 text-emerald-400',
  offline: 'border-slate-500 bg-slate-500/10 text-slate-400',
  warning: 'border-amber-500 bg-amber-500/10 text-amber-400',
  critical: 'border-red-500 bg-red-500/10 text-red-400'
};

const statusGlow = {
  online: 'shadow-[0_0_10px_rgba(16,185,129,0.2)]',
  offline: '',
  warning: 'shadow-[0_0_10px_rgba(245,158,11,0.3)]',
  critical: 'shadow-[0_0_15px_rgba(239,68,68,0.4)] animate-pulse'
};

const getIcon = (type) => {
  switch (type) {
    case 'tank':
      return <Database size={16} />;
    case 'pump':
      return <Settings size={16} />;
    case 'valve':
      return <GitCommit size={16} />;
    case 'reactor':
      return <Hexagon size={16} />;
    case 'heater':
      return <ThermometerSun size={16} />;
    case 'separator':
      return <Filter size={16} />;
    case 'pipeline':
      return <Activity size={16} />;
    default:
      return <Database size={16} />;
  }
};

export function EquipmentNode({ data, selected }) {
  const { type, label, metadata } = data;
  const statusClass = statusColors[metadata.status] || statusColors.offline;
  const glowClass = statusGlow[metadata.status] || '';

  return (
    <div
      className={`
      relative px-4 py-3 min-w-[150px] rounded-lg border-2 backdrop-blur-md transition-all duration-200
      ${statusClass} ${glowClass}
      ${selected ? 'ring-2 ring-cyan-500 ring-offset-2 ring-offset-slate-900 scale-105' : ''}
    `}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-slate-400 border-2 border-slate-900"
      />

      <div className="flex items-center gap-3">
        <div className="p-1.5 rounded-md bg-slate-900/50">{getIcon(type)}</div>
        <div className="flex flex-col">
          <span className="text-xs font-bold text-slate-200 truncate max-w-[120px]">
            {label}
          </span>
          <span className="text-[10px] uppercase tracking-wider opacity-80">
            {type}
          </span>
        </div>
      </div>

      {/* Mini status indicator */}
      <div
        className="absolute -top-1.5 -right-1.5 w-3 h-3 rounded-full border-2 border-slate-900"
        style={{
          backgroundColor: `var(--plant-${metadata.status})`
        }}
      />

      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-slate-400 border-2 border-slate-900"
      />
    </div>
  );
}
