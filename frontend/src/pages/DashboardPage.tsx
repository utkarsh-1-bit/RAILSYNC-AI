import { useEffect, useState, useRef, useCallback } from 'react';
import {
  Train,
  MapPin,
  CalendarClock,
  Clock,
  TrendingUp,
  CheckCircle2,
} from 'lucide-react';
import { apiFetch } from '../api';
import type { DashboardStats, NetworkGraph, NetworkNode, NetworkEdge } from '../api';
import { useBlockContext } from '../context/BlockContext';

/* ── Network Map Component (Canvas) ── */
function NetworkMap({ graph }: { graph: NetworkGraph | null }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredNode, setHoveredNode] = useState<NetworkNode | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const nodesPositions = useRef<Array<{ node: NetworkNode; x: number; y: number }>>([]);

  const drawMap = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || !graph || graph.nodes.length === 0) return;

    const rect = container.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const W = rect.width;
    const H = rect.height;
    const pad = 50;

    // Compute bounding box
    const lats = graph.nodes.map((n) => n.latitude);
    const lngs = graph.nodes.map((n) => n.longitude);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    const latRange = maxLat - minLat || 1;
    const lngRange = maxLng - minLng || 1;

    const project = (lat: number, lng: number) => ({
      x: pad + ((lng - minLng) / lngRange) * (W - 2 * pad),
      y: pad + ((maxLat - lat) / latRange) * (H - 2 * pad),
    });

    // Clear
    ctx.clearRect(0, 0, W, H);

    // Draw grid
    ctx.strokeStyle = 'rgba(100, 140, 255, 0.03)';
    ctx.lineWidth = 1;
    for (let i = 0; i < W; i += 40) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, H);
      ctx.stroke();
    }
    for (let i = 0; i < H; i += 40) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(W, i);
      ctx.stroke();
    }

    // Build ID lookup
    const nodeMap = new Map(graph.nodes.map((n) => [n.id, n]));

    // Draw edges
    graph.edges.forEach((edge: NetworkEdge) => {
      const from = nodeMap.get(edge.from_id);
      const to = nodeMap.get(edge.to_id);
      if (!from || !to) return;
      const pFrom = project(from.latitude, from.longitude);
      const pTo = project(to.latitude, to.longitude);

      ctx.beginPath();
      ctx.moveTo(pFrom.x, pFrom.y);
      ctx.lineTo(pTo.x, pTo.y);
      ctx.strokeStyle = 'rgba(79, 125, 249, 0.2)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Animated dash
      ctx.setLineDash([4, 8]);
      ctx.strokeStyle = 'rgba(79, 125, 249, 0.35)';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.setLineDash([]);
    });

    // Draw nodes and track positions
    const positions: typeof nodesPositions.current = [];
    graph.nodes.forEach((node: NetworkNode) => {
      const p = project(node.latitude, node.longitude);
      positions.push({ node, x: p.x, y: p.y });

      // Glow
      const glowGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 20);
      glowGrad.addColorStop(0, node.is_junction ? 'rgba(79, 125, 249, 0.3)' : 'rgba(167, 139, 250, 0.2)');
      glowGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 20, 0, Math.PI * 2);
      ctx.fill();

      // Node dot
      const r = node.is_junction ? 6 : 4;
      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      ctx.fillStyle = node.is_junction ? '#4f7df9' : '#a78bfa';
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Label
      ctx.font = '500 10px Inter, sans-serif';
      ctx.fillStyle = 'rgba(232, 236, 244, 0.7)';
      ctx.textAlign = 'center';
      ctx.fillText(node.code, p.x, p.y - 12);
    });

    nodesPositions.current = positions;
  }, [graph]);

  useEffect(() => {
    drawMap();
    window.addEventListener('resize', drawMap);
    return () => window.removeEventListener('resize', drawMap);
  }, [drawMap]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    setMousePos({ x: e.clientX, y: e.clientY });

    let found: NetworkNode | null = null;
    for (const { node, x, y } of nodesPositions.current) {
      const dist = Math.sqrt((mx - x) ** 2 + (my - y) ** 2);
      if (dist < 16) {
        found = node;
        break;
      }
    }
    setHoveredNode(found);
  };

  return (
    <div className="network-map-container" ref={containerRef}>
      <canvas
        className="network-map-canvas"
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoveredNode(null)}
      />
      {hoveredNode && (
        <div
          style={{
            position: 'fixed',
            left: mousePos.x + 12,
            top: mousePos.y - 40,
            background: 'rgba(12, 20, 40, 0.95)',
            border: '1px solid rgba(100, 140, 255, 0.2)',
            borderRadius: 8,
            padding: '0.5rem 0.75rem',
            fontSize: '0.78rem',
            color: '#e8ecf4',
            pointerEvents: 'none',
            zIndex: 999,
            backdropFilter: 'blur(8px)',
          }}
        >
          <strong>{hoveredNode.name}</strong> ({hoveredNode.code})
          <div style={{ color: '#7a8baa', fontSize: '0.7rem' }}>
            {hoveredNode.is_junction ? 'Junction' : 'Station'} • Zone: {hoveredNode.latitude.toFixed(2)}°N
          </div>
        </div>
      )}
      <div className="map-legend">
        <div className="map-legend-item">
          <div className="map-legend-dot" style={{ background: '#4f7df9' }} />
          Junction
        </div>
        <div className="map-legend-item">
          <div className="map-legend-dot" style={{ background: '#a78bfa' }} />
          Station
        </div>
        <div className="map-legend-item">
          <div className="map-legend-dot" style={{ background: 'rgba(79, 125, 249, 0.35)', width: 16, height: 3, borderRadius: 2 }} />
          Route
        </div>
      </div>
    </div>
  );
}

/* ── Bar Chart Component ── */
function BarChart({ data, colorMap }: { data: Record<string, number>; colorMap: Record<string, string> }) {
  const max = Math.max(...Object.values(data), 1);
  const colors = ['blue', 'green', 'yellow', 'violet', 'red', 'cyan'];

  return (
    <div className="bar-chart">
      {Object.entries(data).map(([label, value], i) => (
        <div className="bar-chart-item" key={label}>
          <div className="bar-chart-label">{label}</div>
          <div className="bar-chart-track">
            <div
              className={`bar-chart-fill ${colorMap[label] || colors[i % colors.length]}`}
              style={{ width: `${(value / max) * 100}%` }}
            >
              {value}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Dashboard Page ── */
export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [network, setNetwork] = useState<NetworkGraph | null>(null);
  const [loading, setLoading] = useState(true);
  
  const { tasks, optimizedBlocks } = useBlockContext();
  const pendingBlocks = tasks.filter(t => t.status === 'PENDING').length;
  const tasksBundled = tasks.filter(t => t.status === 'PLANNED').length;

  useEffect(() => {
    Promise.all([
      apiFetch<DashboardStats>('/dashboard/stats'),
      apiFetch<NetworkGraph>('/dashboard/network'),
    ])
      .then(([s, n]) => {
        setStats(s);
        setNetwork(n);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="empty-state" style={{ minHeight: '60vh' }}>
        <div className="loader">
          <div className="loader-dot" />
          <div className="loader-dot" />
          <div className="loader-dot" />
        </div>
        <div className="mt-2">Loading dashboard…</div>
      </div>
    );
  }

  const typeColors: Record<string, string> = {
    Rajdhani: 'blue',
    Shatabdi: 'green',
    Duronto: 'violet',
    Superfast: 'yellow',
    'Mail/Express': 'cyan',
  };

  const statusColors: Record<string, string> = {
    on_time: 'green',
    delayed: 'yellow',
    cancelled: 'red',
  };

  return (
    <>
      <div className="page-title-section animate-in">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">Real-time overview of the rail network</p>
      </div>

      {/* KPI Cards */}
      <div className="stats-grid">
        <div className="stat-card animate-in animate-in-delay-1">
          <div className="stat-card-header">
            <div className="stat-card-label">Active Trains</div>
            <div className="stat-card-icon blue"><Train /></div>
          </div>
          <div className="stat-card-value">{stats?.total_trains ?? '—'}</div>
          <div className="stat-card-change neutral">Fleet capacity</div>
        </div>

        <div className="stat-card animate-in animate-in-delay-2">
          <div className="stat-card-header">
            <div className="stat-card-label">Network Stations</div>
            <div className="stat-card-icon violet"><MapPin /></div>
          </div>
          <div className="stat-card-value">{stats?.total_stations ?? '—'}</div>
          <div className="stat-card-change neutral">Connected nodes</div>
        </div>

        <div className="stat-card animate-in animate-in-delay-3">
          <div className="stat-card-header">
            <div className="stat-card-label">Active Schedules</div>
            <div className="stat-card-icon green"><CalendarClock /></div>
          </div>
          <div className="stat-card-value">{stats?.active_schedules ?? '—'}</div>
          <div className="stat-card-change neutral">Today's runs</div>
        </div>

        <div className="stat-card animate-in animate-in-delay-4">
          <div className="stat-card-header">
            <div className="stat-card-label">On-Time Rate</div>
            <div className="stat-card-icon green"><CheckCircle2 /></div>
          </div>
          <div className="stat-card-value">{stats?.on_time_percentage ?? '—'}%</div>
          <div className="stat-card-change positive">
            <TrendingUp style={{ width: 12, height: 12 }} /> Performance
          </div>
        </div>
        
        <div className="stat-card animate-in animate-in-delay-2">
          <div className="stat-card-header">
            <div className="stat-card-label">Pending Requests</div>
            <div className="stat-card-icon red"><Clock /></div>
          </div>
          <div className="stat-card-value">{pendingBlocks}</div>
          <div className="stat-card-change neutral">Tasks to optimize</div>
        </div>

        <div className="stat-card animate-in animate-in-delay-3">
          <div className="stat-card-header">
            <div className="stat-card-label">AI Planned Blocks</div>
            <div className="stat-card-icon blue"><CheckCircle2 /></div>
          </div>
          <div className="stat-card-value">{optimizedBlocks.length}</div>
          <div className="stat-card-change positive">With {tasksBundled} tasks bundled</div>
        </div>

        <div className="stat-card animate-in animate-in-delay-1">
          <div className="stat-card-header">
            <div className="stat-card-label">Avg. Delay</div>
            <div className="stat-card-icon yellow"><Clock /></div>
          </div>
          <div className="stat-card-value">{stats?.avg_delay_minutes ?? '—'}<span style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: 400 }}> min</span></div>
          <div className="stat-card-change neutral">Across all schedules</div>
        </div>
      </div>

      {/* Network Map */}
      <div className="panel animate-in mb-2">
        <div className="panel-header">
          <div className="panel-title">
            <div className="panel-title-dot" />
            Railway Network Map
          </div>
        </div>
        <NetworkMap graph={network} />
      </div>

      {/* Charts Row */}
      <div className="grid-2 mt-2">
        <div className="panel animate-in">
          <div className="panel-header">
            <div className="panel-title">
              <div className="panel-title-dot" />
              Fleet by Type
            </div>
          </div>
          {stats?.trains_by_type && Object.keys(stats.trains_by_type).length > 0 ? (
            <BarChart data={stats.trains_by_type} colorMap={typeColors} />
          ) : (
            <div className="empty-state"><div className="empty-state-desc">No type data</div></div>
          )}
        </div>

        <div className="panel animate-in">
          <div className="panel-header">
            <div className="panel-title">
              <div className="panel-title-dot" />
              Train Status
            </div>
          </div>
          {stats?.trains_by_status && Object.keys(stats.trains_by_status).length > 0 ? (
            <BarChart data={stats.trains_by_status} colorMap={statusColors} />
          ) : (
            <div className="empty-state"><div className="empty-state-desc">No status data</div></div>
          )}
        </div>
      </div>
    </>
  );
}
