import React, { useState } from 'react';
import { Map, Train, AlertTriangle, Crosshair, Navigation, Activity } from 'lucide-react';

export default function MapPage() {
  const [activeLayer, setActiveLayer] = useState<'ALL' | 'TRAINS' | 'BLOCKS'>('ALL');
  const [trackingActive, setTrackingActive] = useState(false);

  return (
    <div className="panel glass-panel" style={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
      <div className="panel-header">
        <h2 className="panel-title">
          <Map className="mr-2 text-accent" /> Live Network Map (Delhi NCR Sector)
        </h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            className={`btn btn-sm ${activeLayer === 'ALL' || activeLayer === 'TRAINS' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveLayer(activeLayer === 'TRAINS' ? 'ALL' : 'TRAINS')}
          >
            <Train size={14} /> Trains {activeLayer === 'TRAINS' ? '(Active)' : ''}
          </button>
          <button
            className={`btn btn-sm ${activeLayer === 'ALL' || activeLayer === 'BLOCKS' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveLayer(activeLayer === 'BLOCKS' ? 'ALL' : 'BLOCKS')}
          >
            <AlertTriangle size={14} /> Blocks {activeLayer === 'BLOCKS' ? '(Active)' : ''}
          </button>
          <button
            className={`btn btn-sm ${trackingActive ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setTrackingActive(!trackingActive)}
            style={trackingActive ? { background: 'var(--success)', borderColor: 'var(--success)', color: 'white' } : {}}
          >
            {trackingActive ? <Activity size={14} className="spin-icon" /> : <Crosshair size={14} />}
            {trackingActive ? 'Tracking Live...' : 'Track'}
          </button>
        </div>
      </div>
      <div style={{ flex: 1, borderRadius: '12px', overflow: 'hidden', position: 'relative', border: '1px solid rgba(255,255,255,0.1)' }}>
        {/* Mock Live Tracking Map using OSM */}
        <iframe
          width="100%"
          height="100%"
          frameBorder="0"
          scrolling="no"
          marginHeight={0}
          marginWidth={0}
          src="https://www.openstreetmap.org/export/embed.html?bbox=76.9%2C28.4%2C77.4%2C28.9&amp;layer=mapnik&amp;marker=28.63%2C77.15"
          style={{ filter: `invert(90%) hue-rotate(180deg) contrast(110%) brightness(95%) ${activeLayer === 'BLOCKS' ? 'sepia(50%)' : ''}` }}
        ></iframe>

        {/* Floating Data Overlay depending on layer */}
        {(activeLayer === 'TRAINS' || trackingActive) && (
          <div style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            background: 'rgba(10, 15, 30, 0.8)',
            backdropFilter: 'blur(8px)',
            padding: '1rem',
            borderRadius: '8px',
            border: '1px solid var(--accent)',
            color: 'white',
            fontSize: '0.85rem',
            maxWidth: '250px'
          }}>
            <h4 style={{ margin: '0 0 10px 0', color: 'var(--accent)' }}>Live Tracking</h4>
            <div style={{ marginBottom: '8px' }}><strong>Rajdhani 12951</strong> - 105 km/h<br /><span style={{ color: 'var(--success)' }}>On Time</span></div>
            <div style={{ marginBottom: '8px' }}><strong>Shatabdi 12002</strong> - 110 km/h<br /><span style={{ color: 'var(--success)' }}>On Time</span></div>
            <div><strong>Freight G-890</strong> - 60 km/h<br /><span style={{ color: 'var(--warning)' }}>Diverted</span></div>
          </div>
        )}

        {(activeLayer === 'BLOCKS') && (
          <div style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            background: 'rgba(10, 15, 30, 0.9)',
            backdropFilter: 'blur(8px)',
            padding: '1rem',
            borderRadius: '8px',
            border: '1px solid var(--danger)',
            color: 'white',
            fontSize: '0.85rem',
            maxWidth: '250px'
          }}>
            <h4 style={{ margin: '0 0 10px 0', color: 'var(--danger)' }}>Active Blocks</h4>
            <div style={{ marginBottom: '8px' }}><strong>Engineering (SMMS)</strong><br />Track welding near NDLS</div>
            <div style={{ marginBottom: '8px' }}><strong>S&T (TMS)</strong><br />Signal interlocking at GZB</div>
          </div>
        )}

        {/* Floating Legend */}
        <div style={{
          position: 'absolute',
          bottom: '20px',
          right: '20px',
          background: 'rgba(10, 15, 30, 0.8)',
          backdropFilter: 'blur(8px)',
          padding: '1rem',
          borderRadius: '8px',
          border: '1px solid rgba(255,255,255,0.1)',
          color: 'white',
          fontSize: '0.85rem'
        }}>
          <h4 style={{ margin: '0 0 10px 0' }}>Legend</h4>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--success)' }}></span> Active Train
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--danger)' }}></span> Maintenance Block
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--accent)' }}></span> Major Junction
          </div>
        </div>
      </div>
    </div>
  );
}
