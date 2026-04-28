import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useTeam } from '../context/TeamContext';

export default function Dashboard() {
  const { activeTeamId, activeTeam } = useTeam();
  const [loading, setLoading] = useState(false);
  
  // Dashboard data
  const [progress, setProgress] = useState(0);
  const [members, setMembers] = useState([]);
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0
  });

  useEffect(() => {
    const fetchActivity = async () => {
      if (!activeTeamId) return;
      
      setLoading(true);
      try {
        const res = await api.get(`/teams/activity/${activeTeamId}`);
        
        if (res.data) {
          if (Array.isArray(res.data.members)) {
            setMembers(res.data.members);
          }
          if (res.data.overallProgress) {
            setProgress(parseInt(res.data.overallProgress) || 0);
          }
          setStats({
            totalTasks: res.data.totalTasks || 0,
            completedTasks: res.data.completedTasks || 0,
            pendingTasks: res.data.pendingTasks || 0,
          });
        }
      } catch (err) {
        console.error("Failed to load activity", err);
      } finally {
        setLoading(false);
      }
    };

    fetchActivity();
  }, [activeTeamId]);

  if (!activeTeamId) {
    return (
      <div className="glass-panel">
        <h1>NETWORK STANDBY</h1>
        <p className="subtitle">No active team selected. Navigate to MEMBERS to initialize a new team.</p>
      </div>
    );
  }

  return (
    <div className="glass-panel" style={{ maxHeight: '85vh', overflowY: 'auto' }}>
      <h1>{activeTeam?.name?.toUpperCase()} ACTIVITY</h1>
      <p className="subtitle">Overview of current team progress and member status</p>
      
      {loading ? (
        <p style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>Syncing data...</p>
      ) : (
        <>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ flex: 1, background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontFamily: 'var(--font-mono)', color: 'var(--teal)' }}>{stats.totalTasks}</div>
              <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.1em' }}>TOTAL TASKS</div>
            </div>
            <div style={{ flex: 1, background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontFamily: 'var(--font-mono)', color: '#2fd48d' }}>{stats.completedTasks}</div>
              <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.1em' }}>COMPLETED</div>
            </div>
            <div style={{ flex: 1, background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
              <div style={{ fontSize: '1.5rem', fontFamily: 'var(--font-mono)', color: '#ff6b6b' }}>{stats.pendingTasks}</div>
              <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.1em' }}>PENDING</div>
            </div>
          </div>

          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <p className="progress-text">{progress}% COMPLETED</p>
          
          <h3 style={{ fontSize: '0.85rem', fontFamily: 'var(--font-mono)', color: 'var(--teal)', marginTop: '2rem', marginBottom: '1rem' }}>OPERATOR STATUS</h3>
          {members.length === 0 ? (
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>No team members found.</p>
          ) : (
            members.map((m, i) => (
              <div className="member-row" key={m.userId || i}>
                <div className="member-avatar">{(m.name || 'U').charAt(0)}</div>
                <div className="member-info">
                  <div className="member-name">{m.name || 'Unknown'}</div>
                  <div className="member-role" style={{ fontSize: '0.7rem' }}>
                    <span style={{ color: 'var(--teal)' }}>{m.completedTasks} done</span> / {m.pendingTasks + m.completedTasks} tasks
                  </div>
                </div>
                <div className="member-status">
                  <div className={`status-dot ${m.isOnline ? 'online' : 'offline'}`} />
                  <span className="status-label">{m.isOnline ? 'ONLINE' : 'OFFLINE'}</span>
                </div>
              </div>
            ))
          )}
        </>
      )}
    </div>
  );
}
