import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Train,
  MapPin,
  CalendarClock,
  Zap,
  Activity,
  ListTodo,
  Layers,
  Map,
  CheckSquare,
} from 'lucide-react';

export default function Sidebar() {
  return (
    <aside className="sidebar">
      {/* Brand */}
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon">
          <Train />
        </div>
        <div className="sidebar-brand-text">
          <div className="sidebar-brand-name">RAILSYNC AI</div>
          <div className="sidebar-brand-subtitle">Block Planning System</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <div className="sidebar-section-label">Overview</div>
        <NavLink to="/" end className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <LayoutDashboard /> Dashboard
        </NavLink>
        <NavLink to="/requests" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <ListTodo /> Block Requests
        </NavLink>

        <div className="sidebar-section-label">Core Operations</div>
        <NavLink to="/block-planning" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <Zap /> Block Planning <span className="sidebar-badge">AI</span>
        </NavLink>
        <NavLink to="/optimize" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <Activity /> Optimization Engine
        </NavLink>
        <NavLink to="/what-if" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <Layers /> What-If Simulation
        </NavLink>
        <NavLink to="/approvals" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <CheckSquare /> Approvals
        </NavLink>

        <div className="sidebar-section-label">Network & Assets</div>
        <NavLink to="/schedules" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <CalendarClock /> Timetable
        </NavLink>
        <NavLink to="/trains" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <Train /> Train Fleet
        </NavLink>
        <NavLink to="/stations" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <MapPin /> Stations
        </NavLink>
        <NavLink to="/map" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <Map /> Railway Map
        </NavLink>
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="sidebar-status">
          <div className="sidebar-status-dot" />
          <span>System Online</span>
          <Activity style={{ width: 14, height: 14, marginLeft: 'auto', opacity: 0.4 }} />
        </div>
        <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
          SIH26027 — Prototype v1.0
        </div>
      </div>
    </aside>
  );
}
