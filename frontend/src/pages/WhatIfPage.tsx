import React from 'react';
import { useBlockContext } from '../context/BlockContext';
import { AlertTriangle, Settings } from 'lucide-react';

export default function WhatIfPage() {
  const { addEmergencyDefect, optimizePlan } = useBlockContext();

  return (
    <div className="panel glass-panel">
      <div className="panel-header">
        <h2 className="panel-title">What-If Simulation & Emergency Replanning</h2>
      </div>
      
      <div className="grid-2">
        <div className="block-card">
          <h4>Simulate Emergency Defect</h4>
          <p style={{fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '1rem 0'}}>
            Inject a critical track fracture or signal failure into the network to see how the optimizer reassigns blocks.
          </p>
          <button className="btn btn-primary" onClick={addEmergencyDefect}>
            <AlertTriangle /> Inject Emergency Defect
          </button>
        </div>

        <div className="block-card">
          <h4>Re-Optimize Network</h4>
          <p style={{fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '1rem 0'}}>
            Run the CP-SAT engine to resolve conflicts and bundle new tasks into available block windows.
          </p>
          <button className="btn btn-secondary" onClick={optimizePlan}>
            <Settings /> Re-Optimize Plan
          </button>
        </div>
      </div>
    </div>
  );
}
