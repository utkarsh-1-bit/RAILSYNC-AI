import { useEffect, useState } from 'react';
import { MapPin, Layers, Navigation } from 'lucide-react';
import { apiFetch } from '../api';
import type { Station } from '../api';

export default function StationsPage() {
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedZone, setSelectedZone] = useState('all');

  useEffect(() => {
    apiFetch<Station[]>('/stations/')
      .then(setStations)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const zones = ['all', ...new Set(stations.map((s) => s.zone))];
  const filtered = selectedZone === 'all' ? stations : stations.filter((s) => s.zone === selectedZone);

  return (
    <>
      <div className="page-title-section animate-in">
        <h1 className="page-title">Stations</h1>
        <p className="page-subtitle">Railway network nodes across India</p>
      </div>

      {/* Summary */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
        <div className="stat-card animate-in animate-in-delay-1">
          <div className="stat-card-header">
            <div className="stat-card-label">Total Stations</div>
            <div className="stat-card-icon violet"><MapPin /></div>
          </div>
          <div className="stat-card-value">{stations.length}</div>
        </div>
        <div className="stat-card animate-in animate-in-delay-2">
          <div className="stat-card-header">
            <div className="stat-card-label">Junctions</div>
            <div className="stat-card-icon blue"><Navigation /></div>
          </div>
          <div className="stat-card-value">{stations.filter((s) => s.is_junction).length}</div>
        </div>
        <div className="stat-card animate-in animate-in-delay-3">
          <div className="stat-card-header">
            <div className="stat-card-label">Zones</div>
            <div className="stat-card-icon green"><Layers /></div>
          </div>
          <div className="stat-card-value">{new Set(stations.map((s) => s.zone)).size}</div>
        </div>
      </div>

      {/* Zone filter */}
      <div className="flex gap-1 mb-2 animate-in" style={{ flexWrap: 'wrap' }}>
        {zones.map((z) => (
          <button
            key={z}
            className={`btn btn-sm ${selectedZone === z ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setSelectedZone(z)}
          >
            {z === 'all' ? 'All Zones' : z}
          </button>
        ))}
      </div>

      {/* Station grid */}
      <div className="animate-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
        {loading ? (
          <div className="empty-state">
            <div className="loader"><div className="loader-dot" /><div className="loader-dot" /><div className="loader-dot" /></div>
          </div>
        ) : filtered.map((station) => (
          <div className="panel" key={station.id} style={{ transition: 'all 0.2s' }}>
            <div className="flex items-center gap-1 mb-1">
              <div className="stat-card-icon violet" style={{ width: 32, height: 32 }}>
                <MapPin style={{ width: 16, height: 16 }} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{station.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{station.code}</div>
              </div>
              {station.is_junction && (
                <span className="badge badge-info" style={{ marginLeft: 'auto' }}>Junction</span>
              )}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.75rem' }}>
              <div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Zone</div>
                <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{station.zone}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Platforms</div>
                <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{station.platform_count}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Latitude</div>
                <div style={{ fontWeight: 500, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{station.latitude.toFixed(4)}°</div>
              </div>
              <div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Longitude</div>
                <div style={{ fontWeight: 500, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{station.longitude.toFixed(4)}°</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
