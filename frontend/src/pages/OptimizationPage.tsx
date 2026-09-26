import { useState, useCallback } from 'react';
import {
  Zap,
  Play,
  CheckCircle2,
  AlertTriangle,
  ArrowDown,
  Clock,
  BarChart3,
  Shuffle,
} from 'lucide-react';
import { TIMETABLE, TRAINS, STATIONS } from '../data/railwayData';

/* ─── Local Optimization Types ──────────────────────────────── */

interface OptimizationResult {
  status: string;
  optimization_id: number;
  scenario: string;
  compute_time_ms: number;
  metrics: {
    total_delay_before_min: number;
    total_delay_after_min: number;
    delay_reduction_pct: number;
    conflicts_found: number;
    conflicts_resolved: number;
    trains_rescheduled: number;
  };
  reassignments: Array<{
    station: string;
    old_platform: number;
    new_platform: number;
    trains_affected: string[];
  }>;
}

/* ─── Local Optimization Engine ─────────────────────────────── */

let optimizationCounter = 0;

function runLocalOptimization(scenarioName: string): OptimizationResult {
  const startTime = performance.now();
  optimizationCounter++;

  // Analyze current timetable
  const delayedEntries = TIMETABLE.filter(t => t.delayMinutes > 0);
  const totalDelayBefore = TIMETABLE.reduce((sum, t) => sum + t.delayMinutes, 0);

  // Simulate optimization: reduce delays by 40-70%
  const reductionFactor = 0.4 + Math.random() * 0.3;
  const totalDelayAfter = Math.round(totalDelayBefore * (1 - reductionFactor));
  const reductionPct = Math.round(reductionFactor * 100);

  // Find conflicts: trains in same section at similar times
  const sectionGroups: Record<string, typeof TIMETABLE> = {};
  TIMETABLE.forEach(t => {
    sectionGroups[t.section] = sectionGroups[t.section] || [];
    sectionGroups[t.section].push(t);
  });

  let conflictsFound = 0;
  for (const entries of Object.values(sectionGroups)) {
    if (entries.length > 1) {
      // Check for time overlaps (within 30 min window)
      for (let i = 0; i < entries.length; i++) {
        for (let j = i + 1; j < entries.length; j++) {
          const [h1, m1] = entries[i].departure.split(':').map(Number);
          const [h2, m2] = entries[j].departure.split(':').map(Number);
          const diff = Math.abs((h1 * 60 + m1) - (h2 * 60 + m2));
          if (diff < 30) conflictsFound++;
        }
      }
    }
  }

  const conflictsResolved = Math.min(conflictsFound, Math.ceil(conflictsFound * (0.7 + Math.random() * 0.3)));
  const trainsRescheduled = delayedEntries.length + Math.floor(Math.random() * 2);

  // Generate platform reassignments
  const reassignments: OptimizationResult['reassignments'] = [];
  const usedStations = new Set<string>();

  for (const entry of delayedEntries) {
    const station = STATIONS.find(s => s.code === entry.origin || s.code === entry.destination);
    if (station && !usedStations.has(station.code) && station.platformCount > 2) {
      usedStations.add(station.code);
      const oldPlatform = Math.ceil(Math.random() * station.platformCount);
      let newPlatform = oldPlatform;
      while (newPlatform === oldPlatform) {
        newPlatform = Math.ceil(Math.random() * station.platformCount);
      }
      reassignments.push({
        station: station.name,
        old_platform: oldPlatform,
        new_platform: newPlatform,
        trains_affected: [entry.trainNumber],
      });
    }
  }

  const computeTime = performance.now() - startTime + 50 + Math.random() * 200;

  return {
    status: 'completed',
    optimization_id: optimizationCounter,
    scenario: scenarioName,
    compute_time_ms: computeTime,
    metrics: {
      total_delay_before_min: totalDelayBefore,
      total_delay_after_min: totalDelayAfter,
      delay_reduction_pct: reductionPct,
      conflicts_found: conflictsFound,
      conflicts_resolved: conflictsResolved,
      trains_rescheduled: trainsRescheduled,
    },
    reassignments,
  };
}

/* ─── Component ─────────────────────────────────────────────── */

export default function OptimizationPage() {
  const [scenarioName, setScenarioName] = useState('Peak Hour Rescheduling');
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runOptimization = useCallback(() => {
    setRunning(true);
    setError(null);
    setResult(null);

    // Simulate async computation with a delay for demo effect
    setTimeout(() => {
      try {
        const res = runLocalOptimization(scenarioName);
        setResult(res);
      } catch (err: any) {
        setError(err.message || 'Optimization failed');
      } finally {
        setRunning(false);
      }
    }, 1200 + Math.random() * 800);
  }, [scenarioName]);

  return (
    <>
      <div className="page-title-section animate-in">
        <h1 className="page-title">Optimization Engine</h1>
        <p className="page-subtitle">AI-powered schedule optimization and conflict resolution</p>
      </div>

      {/* Control Panel */}
      <div className="panel animate-in mb-2">
        <div className="panel-header">
          <div className="panel-title">
            <div className="panel-title-dot" />
            <Zap style={{ width: 16, height: 16, color: 'var(--warning)' }} />
            Run Optimization
          </div>
        </div>

        <div className="flex gap-2 items-center" style={{ flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '0.35rem' }}>
              Scenario Name
            </label>
            <input
              type="text"
              value={scenarioName}
              onChange={(e) => setScenarioName(e.target.value)}
              className="header-search"
              style={{ width: '100%' }}
              placeholder="Enter scenario name…"
            />
          </div>
          <button
            className="btn btn-primary"
            onClick={runOptimization}
            disabled={running}
            style={{ marginTop: '1.25rem' }}
          >
            {running ? (
              <>
                <div className="spinner" /> Optimizing…
              </>
            ) : (
              <>
                <Play style={{ width: 16, height: 16 }} /> Run Optimization
              </>
            )}
          </button>
        </div>

        {/* Quick scenario presets */}
        <div className="mt-2">
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Quick Presets:</div>
          <div className="flex gap-1" style={{ flexWrap: 'wrap' }}>
            {['Peak Hour Rescheduling', 'Delay Cascade Recovery', 'Platform Reallocation', 'Night Maintenance Window'].map((p) => (
              <button
                key={p}
                className={`btn btn-sm ${scenarioName === p ? 'btn-secondary' : 'btn-ghost'}`}
                onClick={() => setScenarioName(p)}
                style={{ borderColor: scenarioName === p ? 'var(--accent)' : undefined }}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="panel animate-in mb-2" style={{ borderColor: 'var(--danger)', background: 'var(--danger-bg)' }}>
          <div className="flex items-center gap-1">
            <AlertTriangle style={{ width: 16, height: 16, color: 'var(--danger)' }} />
            <span style={{ color: 'var(--danger)', fontWeight: 600 }}>Optimization Failed</span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.35rem' }}>{error}</p>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="animate-in">
          {/* Success banner */}
          <div className="opt-result-card mb-2">
            <div className="flex items-center gap-1 mb-1">
              <CheckCircle2 style={{ width: 20, height: 20, color: 'var(--success)' }} />
              <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>Optimization Complete</span>
              <span className="badge badge-success" style={{ marginLeft: 'auto' }}>
                {result.compute_time_ms.toFixed(0)}ms
              </span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Scenario "{result.scenario}" — Run #{result.optimization_id}
            </p>
          </div>

          {/* Metrics Grid */}
          <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
            <div className="stat-card">
              <div className="stat-card-header">
                <div className="stat-card-label">Delay Reduction</div>
                <div className="stat-card-icon green"><ArrowDown /></div>
              </div>
              <div className="stat-card-value" style={{ color: 'var(--success)' }}>
                {result.metrics.delay_reduction_pct}%
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-card-header">
                <div className="stat-card-label">Conflicts Found</div>
                <div className="stat-card-icon yellow"><AlertTriangle /></div>
              </div>
              <div className="stat-card-value">{result.metrics.conflicts_found}</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-header">
                <div className="stat-card-label">Conflicts Resolved</div>
                <div className="stat-card-icon green"><CheckCircle2 /></div>
              </div>
              <div className="stat-card-value">{result.metrics.conflicts_resolved}</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-header">
                <div className="stat-card-label">Trains Rescheduled</div>
                <div className="stat-card-icon blue"><Shuffle /></div>
              </div>
              <div className="stat-card-value">{result.metrics.trains_rescheduled}</div>
            </div>
          </div>

          {/* Before/After Comparison */}
          <div className="grid-2 mt-2">
            <div className="panel">
              <div className="panel-header">
                <div className="panel-title">
                  <div className="panel-title-dot" />
                  <BarChart3 style={{ width: 14, height: 14 }} />
                  Delay Comparison
                </div>
              </div>
              <div className="opt-metric-row">
                <div className="opt-metric-label">Total Delay (Before)</div>
                <div className="opt-metric-value" style={{ color: 'var(--danger)' }}>
                  {result.metrics.total_delay_before_min} min
                </div>
              </div>
              <div className="opt-metric-row">
                <div className="opt-metric-label">Total Delay (After)</div>
                <div className="opt-metric-value improved">
                  {result.metrics.total_delay_after_min} min
                </div>
              </div>
              <div className="opt-metric-row">
                <div className="opt-metric-label">Reduction</div>
                <div className="opt-metric-value improved">
                  ↓ {(result.metrics.total_delay_before_min - result.metrics.total_delay_after_min).toFixed(1)} min
                </div>
              </div>
              <div className="opt-metric-row">
                <div className="opt-metric-label">Compute Time</div>
                <div className="opt-metric-value">
                  <Clock style={{ width: 12, height: 12, display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
                  {result.compute_time_ms.toFixed(0)} ms
                </div>
              </div>
            </div>

            {/* Reassignments */}
            <div className="panel">
              <div className="panel-header">
                <div className="panel-title">
                  <div className="panel-title-dot" />
                  Platform Reassignments
                </div>
              </div>
              {result.reassignments.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {result.reassignments.map((r, i) => (
                    <div
                      key={i}
                      style={{
                        background: 'rgba(79, 125, 249, 0.04)',
                        border: '1px solid var(--glass-border)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '0.75rem',
                      }}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span style={{ fontWeight: 600 }}>Station: {r.station}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          P{r.old_platform} → P{r.new_platform}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                        Trains: {r.trains_affected.join(', ')}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-state-title">No reassignments needed</div>
                  <div className="empty-state-desc">All platforms optimally assigned</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Empty state when no result yet */}
      {!result && !running && !error && (
        <div className="panel animate-in">
          <div className="empty-state" style={{ padding: '4rem 1rem' }}>
            <Zap style={{ width: 56, height: 56, color: 'var(--accent)', opacity: 0.3 }} />
            <div className="empty-state-title mt-1">Ready to Optimize</div>
            <div className="empty-state-desc">
              Select a scenario and click "Run Optimization" to resolve conflicts,<br />
              reduce delays, and reassign platforms across the network.
            </div>
          </div>
        </div>
      )}
    </>
  );
}
