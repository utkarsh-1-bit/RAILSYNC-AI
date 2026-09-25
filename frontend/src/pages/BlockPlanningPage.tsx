import { useBlockContext } from '../context/BlockContext';
import { Zap, Shield, AlertTriangle, ListTodo, Activity, CheckCircle2, Clock } from 'lucide-react';
import { calculateRiskScore, findCompatibleTasks, calculateBlockUtilization, checkTrainConflicts } from '../utils/planningEngine';

export default function BlockPlanningPage() {
  const { 
    tasks, 
    blocks, 
    trainMovements, 
    selectedTasks, 
    toggleTaskSelection, 
    selectAllTasks, 
    clearSelection,
    isOptimizing,
    optimizePlan,
    optimizedPlan
  } = useBlockContext();

  const pendingTasks = tasks.filter(t => t.status === 'PENDING');
  const availableBlocks = blocks.filter(b => b.status === 'AVAILABLE');

  return (
    <div className="block-planning-container" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* HEADER SECTION */}
      <div className="page-title-section animate-in">
        <h1 className="page-title">Automatic Block Planning</h1>
        <p className="page-subtitle">Cross-department maintenance bundling & constraint optimization</p>
      </div>

      {/* HERO / ACTION SECTION */}
      <div className="planning-hero-section animate-in" style={{
        background: 'linear-gradient(145deg, rgba(30,41,59,0.7), rgba(15,23,42,0.9))',
        border: '1px solid var(--glass-border)',
        borderRadius: 'var(--radius-lg)',
        padding: '2.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '600px' }}>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Activity style={{ color: 'var(--accent-light)' }} /> AI Maintenance Opportunity Radar
          </h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.5rem', fontSize: '1.05rem' }}>
            Select pending maintenance tasks to bundle. The AI engine will analyze constraints, check timetable conflicts, and optimize cross-department bundling to maximize asset availability.
          </p>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button 
              className="btn btn-primary pulse-button" 
              onClick={optimizePlan}
              disabled={isOptimizing || selectedTasks.length === 0}
              style={{ padding: '0.8rem 1.5rem', fontSize: '1.05rem', fontWeight: 600 }}
            >
              {isOptimizing ? (
                <><div className="spinner" /> Optimizing Constraints...</>
              ) : (
                <><Zap size={20} /> Run AI Block Optimization</>
              )}
            </button>
          </div>
        </div>
        
        {/* Decorative Background Elements */}
        <div style={{ position: 'absolute', right: '-10%', top: '-50%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(79,125,249,0.15) 0%, transparent 70%)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', right: '10%', bottom: '-20%', width: '250px', height: '250px', background: 'radial-gradient(circle, rgba(167,139,250,0.1) 0%, transparent 70%)', borderRadius: '50%' }} />
      </div>

      {/* SUCCESS RESULTS BANNER */}
      {optimizedPlan && (
        <div className="panel animate-in" style={{ 
          borderColor: 'var(--success)', 
          background: 'rgba(22, 163, 74, 0.05)',
          padding: '2rem'
        }}>
          <div className="panel-header" style={{ marginBottom: '1.5rem' }}>
            <h2 className="panel-title" style={{ color: 'var(--success)', fontSize: '1.4rem' }}>
              <CheckCircle2 size={24} /> Optimized Block Plan Generated Successfully
            </h2>
          </div>
          <div className="grid-3">
             <div className="stat-card" style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(22,163,74,0.2)' }}>
                <div className="stat-card-label" style={{ color: 'var(--text-secondary)' }}>Conflicts Avoided</div>
                <div className="stat-card-value" style={{ color: 'var(--success)', fontSize: '2rem' }}>{optimizedPlan.metrics.conflictsAvoided}</div>
             </div>
             <div className="stat-card" style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(139,92,246,0.2)' }}>
                <div className="stat-card-label" style={{ color: 'var(--text-secondary)' }}>Cross-Dept Bundles</div>
                <div className="stat-card-value" style={{ color: 'var(--violet)', fontSize: '2rem' }}>{optimizedPlan.metrics.crossDeptBundles}</div>
             </div>
             <div className="stat-card" style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(79,125,249,0.2)' }}>
                <div className="stat-card-label" style={{ color: 'var(--text-secondary)' }}>Avg Utilization</div>
                <div className="stat-card-value" style={{ color: 'var(--accent-light)', fontSize: '2rem' }}>{optimizedPlan.metrics.avgUtilization}%</div>
             </div>
          </div>
        </div>
      )}

      {/* MAIN CONTENT SPLIT */}
      <div className="grid-2-1" style={{ gap: '2rem' }}>
        
        {/* LEFT COLUMN: TASK SELECTION */}
        <div className="panel animate-in" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div className="panel-header" style={{ paddingBottom: '1rem', borderBottom: '1px solid var(--glass-border)', marginBottom: '1.5rem' }}>
            <h2 className="panel-title" style={{ fontSize: '1.25rem' }}><ListTodo /> Pending Tasks ({pendingTasks.length})</h2>
            <div style={{ display: 'flex', gap: '0.75rem'}}>
              <button className="btn btn-ghost btn-sm" onClick={selectAllTasks} style={{ fontSize: '0.85rem' }}>Select All</button>
              <button className="btn btn-ghost btn-sm" onClick={clearSelection} style={{ fontSize: '0.85rem' }}>Clear</button>
            </div>
          </div>
          
          <div className="block-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto', paddingRight: '0.5rem', maxHeight: '700px' }}>
            {pendingTasks.map(task => {
              const risk = calculateRiskScore(task);
              const isSelected = selectedTasks.includes(task.id);
              
              return (
                <div 
                  key={task.id} 
                  className={`block-card ${isSelected ? 'active' : ''}`}
                  onClick={() => toggleTaskSelection(task.id)}
                  style={{ 
                    cursor: 'pointer', 
                    padding: '1.25rem',
                    borderRadius: 'var(--radius-md)',
                    border: isSelected ? '1px solid var(--accent)' : '1px solid var(--glass-border)',
                    background: isSelected ? 'rgba(79,125,249,0.08)' : 'rgba(255,255,255,0.02)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {/* Card Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                      <input 
                        type="checkbox" 
                        checked={isSelected}
                        readOnly
                        style={{ 
                          cursor: 'pointer', 
                          marginTop: '0.25rem',
                          width: '1.1rem',
                          height: '1.1rem',
                          accentColor: 'var(--accent)'
                        }}
                      />
                      <div>
                        <h4 style={{ margin: 0, fontSize: '1.1rem', color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                          <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{task.id}</span> — {task.asset}
                        </h4>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.35rem', display: 'flex', gap: '1rem' }}>
                          <span><Clock size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: '-2px' }}/>{task.duration} min</span>
                          <span>Dept: <strong>{task.department}</strong></span>
                        </div>
                      </div>
                    </div>
                    <span className={`badge badge-${risk.level === 'CRITICAL' ? 'danger' : risk.level === 'HIGH' ? 'warning' : risk.level === 'MEDIUM' ? 'info' : 'neutral'}`} style={{ fontWeight: 600, letterSpacing: '0.5px' }}>
                      {risk.level}
                    </span>
                  </div>
                  
                  {/* Details Grid */}
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '1fr 1fr', 
                    gap: '0.75rem', 
                    paddingLeft: '2.1rem',
                    paddingTop: '0.75rem',
                    borderTop: '1px solid rgba(255,255,255,0.05)',
                    fontSize: '0.9rem'
                  }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Location</span>
                      <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{task.location}</span>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Risk Score</span>
                      <span style={{ color: risk.score >= 80 ? 'var(--danger)' : risk.score >= 50 ? 'var(--warning)' : 'var(--success)', fontWeight: 700 }}>
                        {risk.score} <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 400 }}>/ 100</span>
                      </span>
                    </div>
                  </div>
                  
                  {/* Context/Reasoning */}
                  <div style={{ 
                    marginTop: '1rem', 
                    paddingLeft: '2.1rem',
                    fontSize: '0.8rem', 
                    color: 'var(--text-muted)',
                    fontStyle: 'italic'
                  }}>
                    ↳ {risk.reason}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: OPPORTUNITY RADAR */}
        <div className="panel animate-in delay-1" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div className="panel-header" style={{ paddingBottom: '1rem', borderBottom: '1px solid var(--glass-border)', marginBottom: '1.5rem' }}>
            <h2 className="panel-title" style={{ fontSize: '1.25rem' }}><Shield /> Block Windows & Radar</h2>
          </div>
          
          <div className="insights-container" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto', paddingRight: '0.5rem', maxHeight: '700px' }}>
            
            {/* Loading State */}
            {isOptimizing && (
              <div className="analyzing-state" style={{ 
                padding: '4rem 2rem', 
                textAlign: 'center', 
                background: 'rgba(0,0,0,0.2)', 
                borderRadius: 'var(--radius-md)'
              }}>
                <div className="spinner" style={{ width: '40px', height: '40px', margin: '0 auto 1.5rem auto', borderTopColor: 'var(--accent)' }}></div>
                <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)' }}>Simulating Constraint Optimization...</div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Evaluating {selectedTasks.length} tasks against train timetable schedules.</div>
              </div>
            )}
            
            {/* Results / Default State */}
            {!isOptimizing && availableBlocks.map(block => {
              const conflicts = checkTrainConflicts(block, trainMovements);
              const compatible = findCompatibleTasks(pendingTasks, block);
              const util = calculateBlockUtilization(block, compatible);
              
              if (compatible.length === 0 && conflicts.length === 0) return null;

              return (
                <div key={block.id} className="block-card" style={{ 
                  padding: '1.25rem', 
                  borderRadius: 'var(--radius-md)', 
                  background: conflicts.length > 0 ? 'rgba(220, 38, 38, 0.03)' : 'rgba(255,255,255,0.02)',
                  border: conflicts.length > 0 ? '1px solid rgba(220, 38, 38, 0.2)' : '1px solid var(--glass-border)'
                }}>
                  
                  {/* Block Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>{block.section}</h4>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                        <Clock size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: '-1px' }}/>
                        {block.startTime} – {block.endTime} <span style={{ opacity: 0.5, margin: '0 4px' }}>|</span> {block.duration} min
                      </div>
                    </div>
                  </div>
                  
                  {/* Conflicts Warning */}
                  {conflicts.length > 0 && (
                    <div style={{ 
                      padding: '0.75rem', 
                      background: 'rgba(220, 38, 38, 0.1)', 
                      borderLeft: '3px solid var(--danger)', 
                      borderRadius: '4px',
                      fontSize: '0.9rem',
                      color: 'var(--text-primary)',
                      marginBottom: '1rem'
                    }}>
                      <AlertTriangle size={16} style={{ display: 'inline', color: 'var(--danger)', marginRight: '8px', verticalAlign: '-3px'}}/>
                      <strong>Train Conflict:</strong> Train {conflicts[0].trainNumber} passes at {conflicts[0].time}
                    </div>
                  )}

                  {/* Opportunities */}
                  {compatible.length > 0 && conflicts.length === 0 && (
                    <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
                      <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--success)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <CheckCircle2 size={16} /> Opportunity: {compatible.length} Compatible Tasks
                      </div>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
                        {compatible.map(t => (
                          <div key={t.id} style={{ 
                            fontSize: '0.85rem', 
                            color: 'var(--text-secondary)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            background: 'rgba(255,255,255,0.03)',
                            padding: '0.4rem 0.6rem',
                            borderRadius: '4px'
                          }}>
                            <span>• {t.id} <span style={{ opacity: 0.5 }}>({t.department})</span></span>
                            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{t.duration}m</span>
                          </div>
                        ))}
                      </div>
                      
                      {/* Utilization Bar */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          <span>Potential Utilization</span>
                          <span style={{ fontWeight: 700, color: util >= 80 ? 'var(--success)' : 'var(--warning)' }}>{util}%</span>
                        </div>
                        <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '99px', overflow: 'hidden' }}>
                          <div style={{ 
                            height: '100%', 
                            width: `${Math.min(util, 100)}%`, 
                            background: util >= 80 ? 'var(--success)' : 'var(--warning)',
                            borderRadius: '99px',
                            transition: 'width 0.5s ease-out'
                          }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}