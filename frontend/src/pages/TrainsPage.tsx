import { useState, useMemo } from 'react';
import {
  Train as TrainIcon,
  Gauge,
  Users,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
} from 'lucide-react';
import { getTrainsFlat, type TrainFlat } from '../data/scheduleData';

const statusBadge = (status: string) => {
  switch (status) {
    case 'on_time':
      return <span className="badge badge-success"><span className="badge-dot" /> On Time</span>;
    case 'delayed':
      return <span className="badge badge-warning"><span className="badge-dot" /> Delayed</span>;
    case 'cancelled':
      return <span className="badge badge-danger"><span className="badge-dot" /> Cancelled</span>;
    default:
      return <span className="badge badge-neutral">{status}</span>;
  }
};

const priorityLabel = (p: number) => {
  const labels: Record<number, string> = { 1: 'Critical', 2: 'High', 3: 'Normal', 4: 'Low', 5: 'Minimal' };
  const colors: Record<number, string> = { 1: 'badge-danger', 2: 'badge-warning', 3: 'badge-info', 4: 'badge-neutral', 5: 'badge-neutral' };
  return <span className={`badge ${colors[p] || 'badge-neutral'}`}>{labels[p] || `P${p}`}</span>;
};

export default function TrainsPage() {
  const trains = useMemo(() => getTrainsFlat(), []);
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'all' ? trains : trains.filter((t) => t.status === filter);

  return (
    <>
      <div className="page-title-section animate-in">
        <h1 className="page-title">Train Fleet</h1>
        <p className="page-subtitle">Manage and monitor all trains in the network</p>
      </div>

      {/* Summary cards */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
        <div className="stat-card animate-in animate-in-delay-1">
          <div className="stat-card-header">
            <div className="stat-card-label">Total</div>
            <div className="stat-card-icon blue"><TrainIcon /></div>
          </div>
          <div className="stat-card-value">{trains.length}</div>
        </div>
        <div className="stat-card animate-in animate-in-delay-2">
          <div className="stat-card-header">
            <div className="stat-card-label">On Time</div>
            <div className="stat-card-icon green"><CheckCircle2 /></div>
          </div>
          <div className="stat-card-value">{trains.filter((t) => t.status === 'on_time').length}</div>
        </div>
        <div className="stat-card animate-in animate-in-delay-3">
          <div className="stat-card-header">
            <div className="stat-card-label">Delayed</div>
            <div className="stat-card-icon yellow"><AlertTriangle /></div>
          </div>
          <div className="stat-card-value">{trains.filter((t) => t.status === 'delayed').length}</div>
        </div>
        <div className="stat-card animate-in animate-in-delay-4">
          <div className="stat-card-header">
            <div className="stat-card-label">Cancelled</div>
            <div className="stat-card-icon red"><XCircle /></div>
          </div>
          <div className="stat-card-value">{trains.filter((t) => t.status === 'cancelled').length}</div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 mb-2 animate-in">
        {['all', 'on_time', 'delayed', 'cancelled'].map((f) => (
          <button
            key={f}
            className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? 'All' : f.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="panel animate-in">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <TrainIcon />
            <div className="empty-state-title">No trains found</div>
            <div className="empty-state-desc">No trains match the current filter</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Train No.</th>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Priority</th>
                  <th>Speed</th>
                  <th>Capacity</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((train) => (
                  <tr key={train.id}>
                    <td style={{ fontWeight: 700, color: 'var(--accent-light)' }}>{train.number}</td>
                    <td>{train.name}</td>
                    <td><span className="badge badge-info">{train.train_type}</span></td>
                    <td>{priorityLabel(train.priority)}</td>
                    <td>
                      <span className="flex items-center gap-1">
                        <Gauge style={{ width: 14, height: 14, color: 'var(--text-muted)' }} />
                        {train.max_speed_kmph} km/h
                      </span>
                    </td>
                    <td>
                      <span className="flex items-center gap-1">
                        <Users style={{ width: 14, height: 14, color: 'var(--text-muted)' }} />
                        {train.capacity.toLocaleString()}
                      </span>
                    </td>
                    <td>{statusBadge(train.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
