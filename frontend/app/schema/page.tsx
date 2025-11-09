'use client';

import { useEffect, useState, useCallback } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  Handle,
  Position,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Node,
  Edge,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { motion } from 'framer-motion';
import Sidebar from '@/components/Sidebar';
import Navbar from '@/components/Navbar';
import { api } from '@/utils/api';
import { isAuthenticated } from '@/utils/auth';
import { useRouter } from 'next/navigation';

// Inject global styles for 3D spheres
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    .cisco-sphere {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      position: relative;
      background: radial-gradient(circle at 30% 30%, #ff6b6b, #c92a2a);
      box-shadow: 
        inset -15px -15px 40px rgba(0, 0, 0, 0.5),
        inset 6px 6px 20px rgba(255, 255, 255, 0.3),
        0 10px 30px rgba(201, 42, 42, 0.6),
        0 20px 60px rgba(0, 0, 0, 0.4);
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .cisco-sphere::before {
      content: "";
      position: absolute;
      top: 15%;
      left: 20%;
      width: 35%;
      height: 35%;
      background: radial-gradient(circle, rgba(255, 255, 255, 0.8), transparent 60%);
      border-radius: 50%;
      filter: blur(8px);
      pointer-events: none;
    }

    .cisco-sphere::after {
      content: "";
      position: absolute;
      bottom: -20%;
      left: 50%;
      transform: translateX(-50%);
      width: 80%;
      height: 30%;
      background: rgba(0, 0, 0, 0.4);
      border-radius: 50%;
      filter: blur(15px);
      pointer-events: none;
    }

    .cisco-sphere:hover {
      transform: translateY(-8px) scale(1.15);
      box-shadow: 
        inset -15px -15px 40px rgba(0, 0, 0, 0.5),
        inset 6px 6px 20px rgba(255, 255, 255, 0.4),
        0 15px 40px rgba(201, 42, 42, 0.8),
        0 25px 80px rgba(0, 0, 0, 0.5);
    }

    .sphere-label {
      position: absolute;
      top: calc(100% + 18px);
      left: 50%;
      transform: translateX(-50%);
      font-size: 13px;
      font-weight: 700;
      color: #e2e8f0;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      white-space: nowrap;
      text-shadow: 0 2px 8px rgba(0, 0, 0, 0.8);
    }

    .device-icon {
      font-size: 32px;
      font-weight: 700;
      color: rgba(255, 255, 255, 0.95);
      text-shadow: 0 2px 10px rgba(0, 0, 0, 0.8);
      pointer-events: none;
      z-index: 10;
    }

    .status-indicator {
      position: absolute;
      top: 5px;
      right: 5px;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      border: 3px solid #1e293b;
      z-index: 10;
    }

    .status-online {
      background: #22c55e;
      box-shadow: 0 0 20px rgba(34, 197, 94, 0.8);
    }

    .status-offline {
      background: #64748b;
      box-shadow: 0 0 20px rgba(100, 116, 139, 0.6);
    }

    .status-warning {
      background: #f59e0b;
      box-shadow: 0 0 20px rgba(245, 158, 11, 0.8);
    }

    .info-card {
      position: absolute;
      top: calc(100% + 60px);
      left: 50%;
      transform: translateX(-50%);
      width: 300px;
      background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 18px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8);
      z-index: 100;
      pointer-events: none;
    }

    .info-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 14px;
      padding-bottom: 14px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .info-title {
      font-size: 16px;
      font-weight: 700;
      color: #f1f5f9;
      margin-bottom: 4px;
    }

    .info-subtitle {
      font-size: 12px;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .info-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 0;
      font-size: 13px;
    }

    .info-label {
      color: #94a3b8;
      font-weight: 500;
    }

    .info-value {
      color: #f1f5f9;
      font-weight: 700;
    }

    .metric-bar {
      height: 8px;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 4px;
      overflow: hidden;
      margin-top: 6px;
    }

    .metric-fill {
      height: 100%;
      background: linear-gradient(90deg, #ef4444, #dc2626);
      border-radius: 4px;
      transition: width 0.5s ease;
    }

    @keyframes pulse-ring {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.5; transform: scale(1.05); }
    }

    .pulse {
      animation: pulse-ring 2s ease-in-out infinite;
    }
  `;
  document.head.appendChild(style);
}

const DEVICE_TYPES: Record<string, { label: string; abbreviation: string }> = {
  router: { label: 'Router', abbreviation: 'RTR' },
  switch: { label: 'Switch', abbreviation: 'SW' },
  server: { label: 'Server', abbreviation: 'SRV' },
  firewall: { label: 'Firewall', abbreviation: 'FW' },
  computer: { label: 'Computer', abbreviation: 'PC' },
  printer: { label: 'Printer', abbreviation: 'PRT' },
  default: { label: 'Device', abbreviation: 'DEV' },
};

export default function SchemaPage() {
  const router = useRouter();
  const [nodes, setNodes, onNodesChange] = useNodesState<Node[]>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge[]>([]);
  const [loading, setLoading] = useState(true);
  const [layoutType, setLayoutType] = useState<'force' | 'circular' | 'tree'>('force');

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }
    fetchDevices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (nodes.length > 0) {
      applyLayout(layoutType);
    }
  }, [layoutType]); // eslint-disable-line react-hooks/exhaustive-deps

  const onConnect = useCallback(
    (params: Connection) =>
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            animated: true,
            style: { stroke: '#475569', strokeWidth: 2 },
            type: 'smoothstep',
          },
          eds
        )
      ),
    [setEdges]
  );

  const applyLayout = (type: 'force' | 'circular' | 'tree') => {
    setNodes((nds) => {
      const updated = nds.map((node) => ({ ...node }));
      const nodeCount = updated.length || 1;

      updated.forEach((node, index) => {
        switch (type) {
          case 'force': {
            const angle = (index / nodeCount) * Math.PI * 2;
            const radius = 220 + Math.random() * 120;
            node.position = {
              x: 600 + radius * Math.cos(angle) + Math.random() * 80 - 40,
              y: 380 + radius * Math.sin(angle) + Math.random() * 80 - 40,
            };
            break;
          }
          case 'circular': {
            const circleAngle = (index / nodeCount) * Math.PI * 2;
            const circleRadius = 350;
            node.position = {
              x: 600 + circleRadius * Math.cos(circleAngle),
              y: 380 + circleRadius * Math.sin(circleAngle),
            };
            break;
          }
          case 'tree': {
            const level = Math.floor(index / 3);
            const posInLevel = index % 3;
            node.position = {
              x: 260 + posInLevel * 300,
              y: 80 + level * 230,
            };
            break;
          }
        }
      });

      return updated;
    });
  };

  const fetchDevices = async () => {
    try {
      setLoading(true);
      const res = await api.get('/devices');
      const devices = res.data || [];

      const generatedNodes: Node[] = devices.map((device: any, index: number) => {
        const deviceType = (device.type || 'default').toLowerCase();
        const typeConfig = DEVICE_TYPES[deviceType] || DEVICE_TYPES.default;

        return {
          id: device._id,
          type: 'deviceNode',
          position: { x: 100 + index * 200, y: 100 + (index % 3) * 200 },
          data: {
            id: device._id,
            name: device.name,
            ip: device.ip,
            type: device.type,
            status: device.status || 'online',
            typeConfig,
            lastSeen: device.lastSeen,
            metrics: device.metrics || { cpu: Math.floor(Math.random() * 100), memory: Math.floor(Math.random() * 100) },
            connections: device.connections || 0,
          },
        } as Node;
      });

      const generatedEdges: Edge[] = [];
      const routers = devices.filter((d: any) => (d.type || '').toLowerCase() === 'router');
      const switches = devices.filter((d: any) => (d.type || '').toLowerCase() === 'switch');
      const others = devices.filter((d: any) => !['router', 'switch'].includes((d.type || '').toLowerCase()));

      routers.forEach((router: any) => {
        switches.forEach((sw: any) => {
          generatedEdges.push({
            id: `e${router._id}-${sw._id}`,
            source: router._id,
            target: sw._id,
            animated: true,
            style: { stroke: '#475569', strokeWidth: 3 },
            type: 'smoothstep',
          });
        });
      });

      others.forEach((device: any, idx: number) => {
        const hub = switches[idx % switches.length] || routers[0];
        if (hub) {
          generatedEdges.push({
            id: `e${hub._id}-${device._id}`,
            source: hub._id,
            target: device._id,
            animated: true,
            style: { stroke: '#475569', strokeWidth: 2, opacity: 0.85 },
            type: 'smoothstep',
          });
        }
      });

      setNodes(generatedNodes);
      setEdges(generatedEdges);
    } catch (err) {
      console.error('fetchDevices err', err);
    } finally {
      setLoading(false);
    }
  };

  const DeviceNode = ({ data }: any) => {
    const [hovered, setHovered] = useState(false);
    const statusClass = `status-${data.status}`;
    const metricEntries = Object.entries(data.metrics || {});

    return (
      <div
        style={{ position: 'relative', width: 120, height: 180 }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <Handle
          type="target"
          position={Position.Top}
          style={{ background: '#475569', border: '2px solid #1e293b', width: 10, height: 10 }}
        />

        <motion.div
          className="cisco-sphere"
          animate={hovered ? { scale: 1.15, y: -8 } : { scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          <div className={`status-indicator ${statusClass}`} />
          <div className="device-icon">{data.typeConfig.abbreviation}</div>
        </motion.div>

        <div className="sphere-label">{data.name}</div>

        <Handle
          type="source"
          position={Position.Bottom}
          style={{ background: '#475569', border: '2px solid #1e293b', width: 10, height: 10 }}
        />

        {hovered && (
          <motion.div
            className="info-card"
            initial={{ opacity: 0, scale: 0.9, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="info-header">
              <div>
                <div className="info-title">{data.name}</div>
                <div className="info-subtitle">{data.typeConfig.label}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="info-value" style={{ fontSize: 12 }}>{data.ip}</div>
                <div className="info-subtitle">{data.status.toUpperCase()}</div>
              </div>
            </div>

            {metricEntries.map(([key, value]: [string, any]) => {
              const pct = Math.max(0, Math.min(100, Number(value)));
              return (
                <div key={key}>
                  <div className="info-row">
                    <span className="info-label" style={{ textTransform: 'capitalize' }}>{key} Usage</span>
                    <span className="info-value">{pct}%</span>
                  </div>
                  <div className="metric-bar">
                    <motion.div
                      className="metric-fill"
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>
              );
            })}

            <div className="info-row" style={{ borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: 10, paddingTop: 10 }}>
              <span className="info-label">Connections</span>
              <span className="info-value">{data.connections || 0}</span>
            </div>

            {data.lastSeen && (
              <div className="info-row" style={{ paddingTop: 4 }}>
                <span className="info-label">Last Seen</span>
                <span className="info-value" style={{ fontSize: 11 }}>{new Date(data.lastSeen).toLocaleString()}</span>
              </div>
            )}
          </motion.div>
        )}
      </div>
    );
  };

  const nodeTypes = { deviceNode: DeviceNode };

  const stats = {
    total: nodes.length,
    online: nodes.filter((n) => n.data?.status === 'online').length,
    offline: nodes.filter((n) => n.data?.status === 'offline').length,
    connections: edges.length,
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 items-center justify-center">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
          <div style={{ textAlign: 'center' }}>
            <div className="cisco-sphere pulse" style={{ margin: '0 auto' }}>
              <div className="device-icon">NET</div>
            </div>
            <div style={{ marginTop: 24, color: '#e2e8f0', fontSize: 18, fontWeight: 700 }}>Loading Network Topology...</div>
            <div style={{ marginTop: 6, color: '#94a3b8' }}>Fetching devices from backend</div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />

        <div className="flex-1 p-6 relative overflow-hidden">
          <div className="relative z-10 glass-effect rounded-2xl p-6 mb-6 border border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-red-400 via-orange-400 to-red-500 bg-clip-text text-transparent mb-2">
                    Network Topology
                  </h1>
                  <p className="text-slate-400 text-sm">Cisco Enterprise Architecture</p>
                </div>

                <div className="flex gap-4">
                  <div className="glass-effect px-4 py-2 rounded-xl border border-emerald-400/30">
                    <div style={{ fontSize: 28, fontWeight: 800, color: '#22c55e' }}>{stats.online}</div>
                    <div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase' }}>Online</div>
                  </div>
                  <div className="glass-effect px-4 py-2 rounded-xl border border-slate-400/30">
                    <div style={{ fontSize: 28, fontWeight: 800, color: '#64748b' }}>{stats.offline}</div>
                    <div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase' }}>Offline</div>
                  </div>
                  <div className="glass-effect px-4 py-2 rounded-xl border border-red-400/30">
                    <div style={{ fontSize: 28, fontWeight: 800, color: '#ef4444' }}>{stats.connections}</div>
                    <div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase' }}>Links</div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setLayoutType('force')}
                  className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${layoutType === 'force' ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg' : 'glass-effect text-slate-300'}`}>
                  Force
                </motion.button>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setLayoutType('circular')}
                  className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${layoutType === 'circular' ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg' : 'glass-effect text-slate-300'}`}>
                  Circular
                </motion.button>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setLayoutType('tree')}
                  className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${layoutType === 'tree' ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg' : 'glass-effect text-slate-300'}`}>
                  Tree
                </motion.button>
                <motion.button whileHover={{ scale: 1.05, rotate: 180 }} whileTap={{ scale: 0.95 }} onClick={fetchDevices}
                  className="glass-effect px-4 py-2.5 rounded-xl text-red-400 hover:text-red-300 transition-all">
                  ↻
                </motion.button>
              </div>
            </div>
          </div>

          <div className="flex gap-6 h-[calc(100%-140px)] relative z-10">
            <motion.div className="flex-1 glass-effect rounded-2xl overflow-hidden border border-white/10 shadow-2xl"
              initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}>
              <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                fitView
                style={{ background: 'transparent' }}
                defaultViewport={{ x: 0, y: 0, zoom: 0.7 }}
              >
                <Background gap={24} size={2} color="#1e293b" style={{ opacity: 0.5 }} />
                <MiniMap
                  nodeColor={(node) => {
                    const status = node.data?.status || 'online';
                    return status === 'online' ? '#22c55e' : status === 'offline' ? '#64748b' : '#f59e0b';
                  }}
                  nodeStrokeWidth={3}
                  maskColor="rgba(15,23,42,0.9)"
                  className="!bg-slate-950/90 !backdrop-blur-sm !border-2 !border-white/10 !rounded-xl !shadow-2xl"
                />
                <Controls className="!bg-slate-950/90 !backdrop-blur-sm !border-2 !border-white/10 !rounded-xl !shadow-2xl" />
              </ReactFlow>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}