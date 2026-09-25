import { useEffect, useState } from 'react';
import { CalendarClock, Train, MapPin, Clock, AlertTriangle } from 'lucide-react';
import { apiFetch } from '../api';
import type { ScheduleEntry, Train as TrainType } from '../api';

function formatTime(iso: string | null) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false });
}

export default function SchedulesPage() {
  const [schedules, setSchedules] = useState<ScheduleEntry[]>([]);
  const [trains, setTrains] = useState<TrainType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrain, setSelectedTrain] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'timeline'>('table');

  useEffect(() => {
    Promise.all([
      apiFetch<ScheduleEntry[]>('/schedules/'),
      apiFetch<TrainType[]>('/trains/'),
    ])
      .then(([s, t]) => {
        setSchedules(s);
        setTrains(t);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Group schedules by train
  const byTrain = schedules.reduce<Record<number, ScheduleEntry[]>>((acc, s) => {
    acc[s.train_id] = acc[s.train_id] || [];
    acc[s.train_id].push(s);
    return acc;
  }, {});

  // Sort each group by sequence
  Object.values(byTrain).forEach((arr) => arr.sort((a, b) => a.sequence_number - b.sequence_number));

  const displayedSchedules = selectedTrain
    ? (byTrain[selectedTrain] || [])
    : schedules;

  const selectedTrainData = selectedTrain ? trains.find((t) => t.id === selectedTrain) : null;

  return (
    <>
      <div className="page-title-section animate-in">
        <h1 className="page-title">Schedules</h1>
        <p className="page-subtitle">Train schedules, timings, and platform assignments</p>
      </div>

      {/* Train selector */}
      <div className="flex gap-1 mb-2 animate-in" style={{ flexWrap: 'wrap' }}>
        <button
          className={`btn btn-sm ${!selectedTrain ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setSelectedTrain(null)}
        >
          All Trains
        </button>
        {trains.map((t) => (
          <button
            key={t.id}
            className={`btn btn-sm ${selectedTrain === t.id ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setSelectedTrain(t.id)}
          >
            {t.number}
          </button>
        ))}
      </div>

      {/* View mode toggle */}
      <div className="flex gap-1 mb-2 animate-in">
        <button
          className={`btn btn-sm ${viewMode === 'table' ? 'btn-secondary' : 'btn-ghost'}`}
          onClick={() => setViewMode('table')}
          style={{ borderColor: viewMode === 'table' ? 'var(--accent)' : undefined }}
        >
          <CalendarClock style={{ width: 14, height: 14 }} /> Table
        </button>
        <button
          className={`btn btn-sm ${viewMode === 'timeline' ? 'btn-secondary' : 'btn-ghost'}`}
          onClick={() => setViewMode('timeline')}
          style={{ borderColor: viewMode === 'timeline' ? 'var(--accent)' : undefined }}
        >
          <Clock style={{ width: 14, height: 14 }} /> Timeline
        </button>
      </div>

      {loading ? (
        <div className="empty-state">
          <div className="loader"><div className="loader-dot" /><div className="loader-dot" /><div className="loader-dot" /></div>
        </div>
      ) : viewMode === 'table' ? (
        /* Table View */
        <div className="panel animate-in">
          {selectedTrainData && (
            <div className="panel-header">
              <div className="panel-title">
                <div className="panel-title-dot" />
                {selectedTrainData.number} — {selectedTrainData.name}
              </div>
            </div>
          )}
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Train</th>
                  <th>Seq</th>
                  <th>Station</th>
                  <th>Arrival</th>
                  <th>Departure</th>
                  <th>Platform</th>
                  <th>Delay</th>
                  <th>Day</th>
                </tr>
              </thead>
              <tbody>
                {displayedSchedules.map((s) => (
                  <tr key={s.id}>
                    <td style={{ fontWeight: 600, color: 'var(--accent-light)' }}>
                      {s.train_number}
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}>{s.sequence_number}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{s.station_name}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{s.station_code}</div>
                    </td>
                    <td>{formatTime(s.arrival_time)}</td>
                    <td>{formatTime(s.departure_time)}</td>
                    <td>
                      {s.platform ? (
                        <span className="badge badge-neutral">P{s.platform}</span>
                      ) : '—'}
                    </td>
                    <td>
                      {s.delay_minutes > 0 ? (
                        <span className="badge badge-warning">
                          <AlertTriangle style={{ width: 10, height: 10 }} />
                          +{s.delay_minutes}m
                        </span>
                      ) : (
                        <span className="badge badge-success">On Time</span>
                      )}
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}>Day {s.day}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Timeline View */
        <div className="grid-2">
          {(selectedTrain ? [selectedTrain] : Object.keys(byTrain).map(Number)).map((trainId) => {
            const stops = byTrain[trainId] || [];
            const trainInfo = trains.find((t) => t.id === trainId);
            return (
              <div className="panel animate-in" key={trainId}>
                <div className="panel-header">
                  <div className="panel-title">
                    <div className="panel-title-dot" />
                    <Train style={{ width: 14, height: 14 }} />
                    {trainInfo?.number} — {trainInfo?.name}
                  </div>
                </div>
                <div className="timeline">
                  {stops.map((s, i) => (
                    <div className="timeline-item" key={s.id}>
                      <div
                        className={`timeline-dot ${
                          i === 0 ? 'origin' : i === stops.length - 1 ? 'destination' : s.delay_minutes > 0 ? 'delayed' : ''
                        }`}
                      />
                      <div className="timeline-content">
                        <div className="timeline-station">
                          {s.station_name} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({s.station_code})</span>
                        </div>
                        <div className="timeline-time">
                          {s.arrival_time && <span>Arr: {formatTime(s.arrival_time)}</span>}
                          {s.departure_time && <span>Dep: {formatTime(s.departure_time)}</span>}
                          {s.delay_minutes > 0 && (
                            <span className="timeline-delay">+{s.delay_minutes}m late</span>
                          )}
                        </div>
                        {s.platform && (
                          <div className="timeline-platform">Platform {s.platform}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
