import React from 'react';
import { useBlockContext } from '../context/BlockContext';
import { Filter, CheckSquare, Clock, AlertTriangle } from 'lucide-react';

export default function BlockRequestsPage() {
  const { tasks, toggleTaskSelection, selectedTasks } = useBlockContext();

  return (
    <div className="panel glass-panel">
      <div className="panel-header">
        <h2 className="panel-title">Maintenance Block Requests</h2>
        <button className="btn btn-secondary"><Filter /> Filter</button>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>Select</th>
            <th>Task ID</th>
            <th>Department</th>
            <th>Asset & Location</th>
            <th>Priority & Risk</th>
            <th>Duration</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map(task => (
            <tr key={task.id} className={selectedTasks.includes(task.id) ? 'active' : ''}>
              <td>
                <input 
                  type="checkbox" 
                  checked={selectedTasks.includes(task.id)} 
                  onChange={() => toggleTaskSelection(task.id)}
                />
              </td>
              <td><strong>{task.id}</strong></td>
              <td>{task.department}</td>
              <td>
                <div>{task.asset}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)'}}>{task.location}</div>
              </td>
              <td>
                <div style={{display: 'flex', gap: '0.5rem', alignItems: 'center'}}>
                  <span className={`badge badge-${task.priority === 'CRITICAL' ? 'danger' : task.priority === 'HIGH' ? 'warning' : 'info'}`}>
                    {task.priority}
                  </span>
                  <span style={{ fontSize: '0.75rem'}}>Risk: {task.risk}%</span>
                </div>
              </td>
              <td>{task.duration} min</td>
              <td>
                <span className={`badge badge-${task.status === 'COMPLETED' ? 'success' : task.status === 'PLANNED' ? 'info' : 'neutral'}`}>
                  {task.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
