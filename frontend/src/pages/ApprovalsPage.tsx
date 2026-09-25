import React from 'react';
import { useBlockContext } from '../context/BlockContext';

export default function ApprovalsPage() {
  const { optimizedBlocks } = useBlockContext();

  return (
    <div className="panel glass-panel">
      <div className="panel-header">
        <h2 className="panel-title">Human-in-the-Loop Approvals</h2>
      </div>
      <p style={{marginBottom: '1rem', color: 'var(--text-secondary)'}}>
        Review AI-recommended block plans before they are finalized. AI Decision-Support System.
      </p>

      {optimizedBlocks.length === 0 ? (
        <div style={{padding: '2rem', textAlign: 'center', color: 'var(--text-muted)'}}>
          No pending approvals. Generate a plan from the Block Planning module.
        </div>
      ) : (
        <div className="grid-2">
          {optimizedBlocks.map(block => (
            <div key={block.id} className="block-card">
              <div className="block-card-header">
                <h4>{block.id} - {block.section}</h4>
                <span className="status-badge optimal">AI RECOMMENDED</span>
              </div>
              <div style={{ fontSize: '0.85rem', marginBottom: '1rem', color: 'var(--text-secondary)'}}>
                Date: {block.date} | {block.startTime} - {block.endTime} ({block.duration} min)
                <br/>
                Tasks bundled: {block.bundledTasks.length}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="btn btn-primary btn-sm">APPROVE</button>
                <button className="btn btn-secondary btn-sm">MODIFY</button>
                <button className="btn btn-ghost btn-sm" style={{color: 'var(--danger)'}}>REJECT</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
