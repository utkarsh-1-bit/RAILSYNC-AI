import { useBlockContext } from '../context/BlockContext';
import { CheckCircle, XCircle, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function ApprovalsPage() {
  const { blocks, approveBlock, rejectBlock } = useBlockContext();

  // Find blocks that have been scheduled by the AI but not yet approved or rejected
  const pendingApprovals = blocks.filter(b => 
    b.status === 'SCHEDULED' && (!b.approvalStatus || b.approvalStatus === 'PENDING_REVIEW')
  );

  return (
    <div className="approvals-container" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      <div className="page-title-section animate-in">
        <h1 className="page-title">Human-in-the-Loop Approvals</h1>
        <p className="page-subtitle">Review and authorize AI-recommended maintenance block plans.</p>
      </div>

      <div className="panel animate-in" style={{ padding: '2rem' }}>
        <div className="panel-header" style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>
          <h2 className="panel-title" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <ShieldCheck style={{ color: 'var(--accent-light)' }} /> 
            Pending Approvals ({pendingApprovals.length})
          </h2>
        </div>

        {pendingApprovals.length === 0 ? (
          <div style={{ padding: '4rem 2rem', textAlign: 'center', background: 'rgba(0,0,0,0.1)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--glass-border)' }}>
            <ShieldCheck size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem', opacity: 0.5 }} />
            <h3 style={{ color: 'var(--text-secondary)' }}>No pending approvals.</h3>
            <p style={{ color: 'var(--text-muted)' }}>Generate a new block plan using the AI Optimizer to see requests here.</p>
          </div>
        ) : (
          <div className="grid-2">
            {pendingApprovals.map(block => (
              <div key={block.id} className="block-card" style={{ padding: '1.5rem', border: '1px solid rgba(79,125,249,0.3)', background: 'linear-gradient(180deg, rgba(79,125,249,0.05) 0%, rgba(255,255,255,0.02) 100%)' }}>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-primary)' }}>{block.section}</h4>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                      Date: <strong>{block.date}</strong> | {block.startTime} - {block.endTime}
                    </div>
                  </div>
                  <span className="badge badge-info" style={{ fontWeight: 600 }}>AI RECOMMENDED</span>
                </div>
                
                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '4px', marginBottom: '1.5rem' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Bundled Tasks ({block.bundledTasks.length})
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {block.bundledTasks.map(taskId => (
                      <div key={taskId} style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>• {taskId}</div>
                    ))}
                  </div>
                  <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>AI Estimated Utilization:</span>
                    <span style={{ fontWeight: 700, color: block.utilization >= 80 ? 'var(--success)' : 'var(--warning)' }}>{block.utilization}%</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button 
                    className="btn btn-primary" 
                    style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: '0.5rem', background: 'var(--success)', borderColor: 'var(--success)' }}
                    onClick={() => approveBlock(block.id)}
                  >
                    <CheckCircle size={18} /> APPROVE
                  </button>
                  <button 
                    className="btn btn-ghost" 
                    style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: '0.5rem', color: 'var(--danger)' }}
                    onClick={() => rejectBlock(block.id)}
                  >
                    <XCircle size={18} /> REJECT
                  </button>
                </div>
                
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
