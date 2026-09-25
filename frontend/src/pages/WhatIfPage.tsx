import { useBlockContext } from '../context/BlockContext';
import { AlertTriangle, Settings, RotateCcw, Zap } from 'lucide-react';

export default function WhatIfPage() {
  const { 
    scenarios, 
    applyScenario, 
    resetScenarios, 
    reOptimize, 
    isOptimizing,
    optimizedPlan,
    defects
  } = useBlockContext();

  return (
    <div className="whatif-container" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      <div className="page-title-section animate-in">
        <h1 className="page-title">What-If Simulation</h1>
        <p className="page-subtitle">Test constraint optimization against unexpected emergency scenarios</p>
      </div>

      <div className="grid-2-1" style={{ gap: '2rem' }}>
        
        {/* Left Col: Scenarios List */}
        <div className="panel animate-in">
          <div className="panel-header" style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>
            <h2 className="panel-title"><AlertTriangle /> Emergency Scenarios</h2>
            <button className="btn btn-ghost btn-sm" onClick={resetScenarios}>
              <RotateCcw size={16} /> Reset
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {scenarios.map(scenario => (
              <div key={scenario.id} className={`block-card ${scenario.applied ? 'active' : ''}`} style={{ 
                padding: '1.25rem', 
                border: scenario.applied ? '1px solid var(--danger)' : '1px solid var(--glass-border)',
                background: scenario.applied ? 'rgba(220,38,38,0.05)' : 'rgba(255,255,255,0.02)',
                transition: 'all 0.2s ease'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <h4 style={{ margin: 0, fontSize: '1.1rem', color: scenario.applied ? 'var(--danger)' : 'var(--text-primary)' }}>
                    {scenario.name}
                  </h4>
                  {scenario.applied && (
                    <span className="badge badge-danger">INJECTED</span>
                  )}
                </div>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                  {scenario.description}
                </p>
                <button 
                  className={`btn ${scenario.applied ? 'btn-secondary' : 'btn-primary'}`} 
                  onClick={() => applyScenario(scenario.id)}
                  disabled={scenario.applied}
                  style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
                >
                  {scenario.applied ? 'Scenario Applied' : 'Inject Scenario'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right Col: Actions & Results */}
        <div className="panel animate-in delay-1" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="panel-header" style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>
            <h2 className="panel-title"><Settings /> Optimization Engine</h2>
          </div>

          <div style={{ background: 'linear-gradient(145deg, rgba(30,41,59,0.7), rgba(15,23,42,0.9))', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--glass-border)', textAlign: 'center', marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '1rem', color: 'var(--accent-light)' }}>Re-plan Entire Network</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
              Run the AI engine to evaluate all pending tasks (including injected emergencies), recalculate train constraints, and generate a new optimal block plan.
            </p>
            <button 
              className="btn btn-primary pulse-button" 
              onClick={reOptimize}
              disabled={isOptimizing}
              style={{ padding: '0.75rem 2rem', fontSize: '1.05rem', margin: '0 auto', display: 'flex' }}
            >
              {isOptimizing ? (
                <><div className="spinner" /> Replanning Network...</>
              ) : (
                <><Zap /> Run Global Re-Optimization</>
              )}
            </button>
          </div>

          {/* Active Defects Tracking */}
          {defects.length > 0 && (
            <div style={{ padding: '1.5rem', background: 'rgba(220,38,38,0.05)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(220,38,38,0.2)' }}>
              <h4 style={{ color: 'var(--danger)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertTriangle size={18} /> Active Emergency Defects
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {defects.map(d => (
                  <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', background: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: '4px' }}>
                    <span><strong>{d.type}</strong> at {d.location}</span>
                    <span style={{ color: 'var(--danger)', fontWeight: 600 }}>{d.severity}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Results Summary */}
          {optimizedPlan && !isOptimizing && (
            <div style={{ marginTop: 'auto', paddingTop: '2rem' }}>
              <h4 style={{ marginBottom: '1rem', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Zap size={18} /> Re-Optimization Successful
              </h4>
              <div className="grid-2">
                <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Tasks Scheduled</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>{optimizedPlan.metrics.totalTasks}</div>
                </div>
                <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Avg Utilization</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-light)' }}>{optimizedPlan.metrics.avgUtilization}%</div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
