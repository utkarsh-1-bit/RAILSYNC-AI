import { useMemo } from 'react';
import {
  Train,
  MapPin,
  CalendarClock,
  Clock,
  TrendingUp,
  CheckCircle2,
  Zap,
  Shield,
  Layers,
  AlertTriangle,
  BarChart3,
  Target,
} from 'lucide-react';
import { useBlockContext } from '../context/BlockContext';
import { calculateDashboardMetrics } from '../utils/planningEngine';

export default function DashboardPage() {
  const { tasks, blocks, trainMovements, trains, timetable, optimizedPlan, stations } = useBlockContext();

  const metrics = useMemo(
    () => calculateDashboardMetrics(tasks, blocks, trainMovements),
    [tasks, blocks, trainMovements]
  );

  const onTimeTrains = trains.filter(t => t.status === 'on_time').length;
  const onTimeRate = trains.length > 0 ? Math.round((onTimeTrains / trains.length) * 100) : 0;
  const avgDelay = timetable.length > 0
    ? (timetable.reduce((s, t) => s + t.delayMinutes, 0) / timetable.length).toFixed(1)
    : '0';

  const trainsByType = trains.reduce<Record<string, number>>((acc, t) => {
    acc[t.type] = (acc[t.type] || 0) + 1;
    return acc;
  }, {});

  const trainsByStatus = trains.reduce<Record<string, number>>((acc, t) => {
    acc[t.status] = (acc[t.status] || 0) + 1;
    return acc;
  }, {});

  const tasksByDept = tasks.reduce<Record<string, number>>((acc, t) => {
    acc[t.department] = (acc[t.department] || 0) + 1;
    return acc;
  }, {});

  return (
    <>
      <div className="page-title-section animate-in">
        <h1 className="page-title">Dashboard</h1>
        <p className="page-subtitle">
          AI-Powered Block Planning Overview • <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Synthetic Demo Dataset</span>
        </p>
      </div>

      {/* KPI Cards - Row 1 */}
      <div className="stats-grid">
        <div className="stat-card animate-in animate-in-delay-1">
          <div className="stat-card-header">
            <div className="stat-card-label">Active Trains</div>
            <div className="stat-card-icon blue"><Train /></div>
          </div>
          <div className="stat-card-value">{trains.length}</div>
          <div className="stat-card-change neutral">Fleet capacity</div>
        </div>

        <div className="stat-card animate-in animate-in-delay-2">
          <div className="stat-card-header">
            <div className="stat-card-label">Network Stations</div>
            <div className="stat-card-icon violet"><MapPin /></div>
          </div>
          <div className="stat-card-value">{stations.length}</div>
          <div className="stat-card-change neutral">Connected nodes</div>
        </div>

        <div className="stat-card animate-in animate-in-delay-3">
          <div className="stat-card-header">
            <div className="stat-card-label">Timetable Entries</div>
            <div className="stat-card-icon green"><CalendarClock /></div>
          </div>
          <div className="stat-card-value">{timetable.length}</div>
          <div className="stat-card-change neutral">Active schedules</div>
        </div>

        <div className="stat-card animate-in animate-in-delay-4">
          <div className="stat-card-header">
            <div className="stat-card-label">On-Time Rate</div>
            <div className="stat-card-icon green"><CheckCircle2 /></div>
          </div>
          <div className="stat-card-value">{onTimeRate}%</div>
          <div className="stat-card-change positive">
            <TrendingUp style={{ width: 12, height: 12 }} /> {onTimeTrains}/{trains.length} trains
          </div>
        </div>
      </div>

      {/* KPI Cards - Row 2: Block Planning Metrics */}
      <div className="stats-grid">
        <div className="stat-card animate-in animate-in-delay-1">
          <div className="stat-card-header">
            <div className="stat-card-label">Pending Tasks</div>
            <div className="stat-card-icon red"><Clock /></div>
          </div>
          <div className="stat-card-value">{metrics.pendingTasks}</div>
          <div className="stat-card-change neutral">Awaiting planning</div>
        </div>

        <div className="stat-card animate-in animate-in-delay-2">
          <div className="stat-card-header">
            <div className="stat-card-label">AI Planned Blocks</div>
            <div className="stat-card-icon blue"><Zap /></div>
          </div>
          <div className="stat-card-value">{metrics.scheduledBlocks}</div>
          <div className="stat-card-change positive">{metrics.plannedTasks} tasks bundled</div>
        </div>

        <div className="stat-card animate-in animate-in-delay-3">
          <div className="stat-card-header">
            <div className="stat-card-label">Avg. Delay</div>
            <div className="stat-card-icon yellow"><Clock /></div>
          </div>
          <div className="stat-card-value">{avgDelay}<span style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: 400 }}> min</span></div>
          <div className="stat-card-change neutral">Across schedules</div>
        </div>

        <div className="stat-card animate-in animate-in-delay-4">
          <div className="stat-card-header">
            <div className="stat-card-label">Asset Availability</div>
            <div className="stat-card-icon green"><Shield /></div>
          </div>
          <div className="stat-card-value">{metrics.assetAvailability}%</div>
          <div className="stat-card-change neutral">Demo metric</div>
        </div>
      </div>

      {/* KPI Cards - Row 3: Advanced Block Planning KPIs */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
        <div className="stat-card animate-in animate-in-delay-1">
          <div className="stat-card-header">
            <div className="stat-card-label">Block Utilization</div>
            <div className="stat-card-icon blue"><BarChart3 /></div>
          </div>
          <div className="stat-card-value">{metrics.avgUtilization}%</div>
          <div className="stat-card-change neutral">Avg scheduled</div>
        </div>

        <div className="stat-card animate-in animate-in-delay-2">
          <div className="stat-card-header">
            <div className="stat-card-label">Cross-Dept Bundles</div>
            <div className="stat-card-icon violet"><Layers /></div>
          </div>
          <div className="stat-card-value">{metrics.crossDeptBundles}</div>
          <div className="stat-card-change neutral">Multi-dept blocks</div>
        </div>

        <div className="stat-card animate-in animate-in-delay-3">
          <div className="stat-card-header">
            <div className="stat-card-label">Conflicts Detected</div>
            <div className="stat-card-icon yellow"><AlertTriangle /></div>
          </div>
          <div className="stat-card-value">{metrics.totalConflicts}</div>
          <div className="stat-card-change neutral">Train conflicts</div>
        </div>

        <div className="stat-card animate-in animate-in-delay-4">
          <div className="stat-card-header">
            <div className="stat-card-label">Critical Covered</div>
            <div className="stat-card-icon green"><Target /></div>
          </div>
          <div className="stat-card-value">{metrics.criticalCovered}/{metrics.criticalTasks}</div>
          <div className="stat-card-change neutral">Critical tasks planned</div>
        </div>
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
          <BarChartViz data={trainsByType} />
        </div>

        <div className="panel animate-in">
          <div className="panel-header">
            <div className="panel-title">
              <div className="panel-title-dot" />
              Tasks by Department
            </div>
          </div>
          <BarChartViz data={tasksByDept} />
        </div>
      </div>

      <div className="grid-2 mt-2">
        <div className="panel animate-in">
          <div className="panel-header">
            <div className="panel-title">
              <div className="panel-title-dot" />
              Train Status
            </div>
          </div>
          <BarChartViz data={trainsByStatus} />
        </div>

        {/* System Pipeline */}
        <div className="panel animate-in">
          <div className="panel-header">
            <div className="panel-title">
              <div className="panel-title-dot" />
              AI Block Planning Pipeline
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.82rem' }}>
            {[
              'TMS + SMMS + TDMS + COA + Timetable',
              '→ Unified Data Layer',
              '→ Risk / Priority Analysis',
              '→ Maintenance Opportunity Radar',
              '→ Cross-Department Matching',
              '→ Block Constraint Checking',
              '→ Constraint Optimization Simulation',
              '→ Optimized Block Plan',
              '→ Human Review / Approval',
              '→ What-If / Emergency Replanning',
            ].map((step, i) => (
              <div key={i} style={{
                padding: '0.4rem 0.75rem',
                background: i === 6 ? 'var(--accent-subtle)' : 'rgba(255,255,255,0.02)',
                borderRadius: 'var(--radius-sm)',
                borderLeft: i === 6 ? '3px solid var(--accent)' : '3px solid var(--glass-border)',
                color: i === 0 ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontWeight: i === 6 ? 600 : 400,
              }}>
                {step}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

/* ── Simple Bar Chart ── */
function BarChartViz({ data }: { data: Record<string, number> }) {
  const max = Math.max(...Object.values(data), 1);
  const colors = ['blue', 'green', 'yellow', 'violet', 'red', 'cyan'];

  return (
    <div className="bar-chart">
      {Object.entries(data).map(([label, value], i) => (
        <div className="bar-chart-item" key={label}>
          <div className="bar-chart-label">{label}</div>
          <div className="bar-chart-track">
            <div
              className={`bar-chart-fill ${colors[i % colors.length]}`}
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
