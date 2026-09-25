import React, { useState } from 'react';
import { Network, Cpu, CheckCircle, Clock, AlertTriangle, Play, Settings2, BarChart2, Layers, Crosshair } from 'lucide-react';
import { useBlockContext } from '../context/BlockContext';
import './BlockPlanning.css';

export default function BlockPlanningPage() {
  const { tasks, blocks, selectedTasks, optimizePlan, isOptimizing } = useBlockContext();
  const [activeBlock, setActiveBlock] = useState<string | null>(null);

  const pendingCount = tasks.filter(t => t.status === 'PENDING').length;
  const selectedCount = selectedTasks.length;
  
  const compatibleTasks = tasks.filter(t => selectedTasks.includes(t.id));
  const totalSelectedDuration = compatibleTasks.reduce((acc, t) => acc + t.duration, 0);

  return (
    <div className="block-planning-container">
      <div className="page-title-section animated-fade-in-up">
        <h1 className="page-title">AI Automatic Block Planning</h1>
        <p className="page-subtitle">Maximize Asset Availability for Train Operations on Indian Railways</p>
      </div>

      <div className="planning-hero-section animated-fade-in-up delay-1">
        <div className="hero-content">
          <h2>Intelligent Network Analyzer</h2>
          <p>
            Automatically analyze multiple block sections, optimize train routing, and predict maintenance windows.
            <br/><br/>
            <strong>Selected Tasks:</strong> {selectedCount} | <strong>Total Duration:</strong> {totalSelectedDuration} min
          </p>
          <button 
            className={`btn btn-primary pulse-button ${isOptimizing ? 'analyzing' : ''}`}
            onClick={optimizePlan}
            disabled={isOptimizing || selectedCount === 0}
          >
            {isOptimizing ? (
              <><Cpu className="spin-icon" /> AI Optimizing Blocks...</>
            ) : (
              <><Play /> Constraint-Based Block Optimization</>
            )}
          </button>
        </div>
        <div className="hero-visual">
          <div className="glowing-orb"></div>
          <div className="grid-overlay"></div>
          <div className="floating-shape shape-1"></div>
          <div className="floating-shape shape-2"></div>
        </div>
      </div>

      <div className="grid-3 animated-fade-in-up delay-2">
        <div className="panel stat-panel glass-panel">
          <div className="stat-icon-wrapper blue-glow">
            <Layers />
          </div>
          <div className="stat-info">
            <h3>Active Blocks</h3>
            <div className="stat-value">1,248</div>
            <div className="stat-trend positive">↑ 12% optimized today</div>
          </div>
        </div>

        <div className="panel stat-panel glass-panel">
          <div className="stat-icon-wrapper green-glow">
            <CheckCircle />
          </div>
          <div className="stat-info">
            <h3>Asset Availability</h3>
            <div className="stat-value">94.2%</div>
            <div className="stat-trend positive">↑ 3.4% vs last week</div>
          </div>
        </div>

        <div className="panel stat-panel glass-panel">
          <div className="stat-icon-wrapper violet-glow">
            <Cpu />
          </div>
          <div className="stat-info">
            <h3>AI Confidence Score</h3>
            <div className="stat-value">98.5%</div>
            <div className="stat-trend neutral">Stable predictions</div>
          </div>
        </div>
      </div>

      <div className="grid-2-1 mt-4 animated-fade-in-up delay-3">
        <div className="panel glass-panel">
          <div className="panel-header">
            <h2 className="panel-title">
              <Network className="mr-2 text-accent" /> Network Block Status
            </h2>
            <button className="panel-action"><Settings2 /> Filter</button>
          </div>
          
          <div className="block-list">
            {blocks.map((block, idx) => (
              <div 
                key={block.id} 
                className={`block-card ${activeBlock === block.id ? 'active' : ''} ${isOptimizing ? 'scanning' : ''}`}
                style={{ animationDelay: `${idx * 0.1}s` }}
                onMouseEnter={() => setActiveBlock(block.id)}
                onMouseLeave={() => setActiveBlock(null)}
              >
                <div className="block-card-header">
                  <h4>{block.section}</h4>
                  <span className={`status-badge ${block.status === 'AVAILABLE' ? 'optimal' : 'warning'}`}>
                    {block.status === 'AVAILABLE' && <CheckCircle size={14} />}
                    {block.status === 'SCHEDULED' && <Clock size={14} />}
                    {block.status === 'EMERGENCY' && <AlertTriangle size={14} />}
                    {block.status}
                  </span>
                </div>
                <div className="block-metrics">
                  <div className="metric">
                    <span>Time Window</span>
                    <span className="metric-val">{block.startTime} - {block.endTime}</span>
                  </div>
                  <div className="metric">
                    <span>Duration</span>
                    <span className="maintenance-text optimal">{block.duration} min</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="panel glass-panel">
          <div className="panel-header">
            <h2 className="panel-title">
              <BarChart2 className="mr-2 text-accent" /> Unified Block Management
            </h2>
          </div>
          <div className="insights-container">
            {isOptimizing ? (
              <div className="analyzing-state">
                <div className="radar-scanner"></div>
                <p>Running Neural Network Models...</p>
              </div>
            ) : (
              <div className="insights-list" style={{ padding: '0.5rem' }}>
                {compatibleTasks.length === 0 ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No tasks selected. Go to <strong>Block Requests</strong> to select pending tasks from Engineering, S&T, or Traction.
                  </div>
                ) : (
                  <>
                    <div style={{ marginBottom: '1rem' }}>
                      <h4 style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>
                        Engineering Block (SMMS)
                      </h4>
                      {compatibleTasks.filter(t => t.department === 'Engineering').length === 0 && <div className="text-muted" style={{fontSize: '0.8rem'}}>No Engineering tasks.</div>}
                      {compatibleTasks.filter(t => t.department === 'Engineering').map(task => (
                        <div key={task.id} className="insight-item" style={{ padding: '0.5rem', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '4px' }}>
                          <div className={`insight-dot ${task.priority === 'CRITICAL' ? 'critical' : 'warning'}`}></div>
                          <div className="insight-text">
                            <strong>{task.id}:</strong> {task.asset} at {task.location}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                      <h4 style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>
                        S&T Block (TMS)
                      </h4>
                      {compatibleTasks.filter(t => t.department === 'S&T').length === 0 && <div className="text-muted" style={{fontSize: '0.8rem'}}>No S&T tasks.</div>}
                      {compatibleTasks.filter(t => t.department === 'S&T').map(task => (
                        <div key={task.id} className="insight-item" style={{ padding: '0.5rem', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '4px' }}>
                          <div className={`insight-dot ${task.priority === 'CRITICAL' ? 'critical' : 'warning'}`}></div>
                          <div className="insight-text">
                            <strong>{task.id}:</strong> {task.asset} at {task.location}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                      <h4 style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>
                        Traction Block (OHE)
                      </h4>
                      {compatibleTasks.filter(t => t.department === 'Traction').length === 0 && <div className="text-muted" style={{fontSize: '0.8rem'}}>No Traction tasks.</div>}
                      {compatibleTasks.filter(t => t.department === 'Traction').map(task => (
                        <div key={task.id} className="insight-item" style={{ padding: '0.5rem', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '4px' }}>
                          <div className={`insight-dot ${task.priority === 'CRITICAL' ? 'critical' : 'warning'}`}></div>
                          <div className="insight-text">
                            <strong>{task.id}:</strong> {task.asset} at {task.location}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
