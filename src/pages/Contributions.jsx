import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useTeam } from '../context/TeamContext';
import { useToast } from '../context/ToastContext';
import { BarChart3, Trophy, TrendingDown, CheckCircle2, Clock } from 'lucide-react';
import EmptyState from '../components/EmptyState';
import ContributionChart from '../components/ContributionChart';

export default function Contributions() {
  const { activeTeamId } = useTeam();
  const { addToast } = useToast();

  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [contributions, setContributions] = useState([]);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch projects
  useEffect(() => {
    const fetchProjects = async () => {
      if (!activeTeamId) return;
      try {
        const res = await api.get(`/projects/team/${activeTeamId}`);
        setProjects(res.data || []);
        if (res.data.length > 0 && !selectedProjectId) {
          setSelectedProjectId(res.data[0]._id);
        }
      } catch (err) {
        console.error('Failed to load projects', err);
      }
    };
    fetchProjects();
  }, [activeTeamId]);

  // Fetch contributions and insights
  useEffect(() => {
    const fetchData = async () => {
      if (!selectedProjectId) return;
      setLoading(true);
      try {
        const [contribRes, insightsRes] = await Promise.all([
          api.get(`/contributions/project/${selectedProjectId}`),
          api.get(`/contributions/insights/${selectedProjectId}`),
        ]);
        setContributions(contribRes.data || []);
        setInsights(insightsRes.data || null);
      } catch (err) {
        console.error('Failed to load contribution data', err);
        addToast('Failed to load contributions', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedProjectId]);

  if (!activeTeamId) {
    return (
      <div className="glass-panel">
        <h1>CONTRIBUTIONS</h1>
        <EmptyState title="No active team" description="Select or create a team first." />
      </div>
    );
  }

  // Build leaderboard from contributions
  const leaderboard = {};
  contributions.forEach(c => {
    const name = c.userId?.name || c.authorName || 'Unknown';
    leaderboard[name] = (leaderboard[name] || 0) + (c.weight || 1);
  });
  const leaderboardData = Object.entries(leaderboard)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  return (
    <div className="glass-panel" style={{ maxHeight: '75vh', overflowY: 'auto' }}>
      <h1>CONTRIBUTIONS</h1>
      <p className="subtitle">Project contribution insights and leaderboard</p>

      {/* Project Selector */}
      {projects.length > 0 ? (
        <div style={{ marginBottom: '1.5rem' }}>
          <select
            value={selectedProjectId}
            onChange={e => setSelectedProjectId(e.target.value)}
            style={{
              border: '1px solid rgba(47, 185, 212, 0.2)',
              padding: '0.6rem 0.8rem',
              color: 'var(--teal)',
              borderRadius: '8px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.85rem',
              outline: 'none',
              width: '100%',
              cursor: 'pointer',
            }}
          >
            <option value="" disabled>Select Project...</option>
            {projects.map(p => (
              <option key={p._id} value={p._id}>{p.title}</option>
            ))}
          </select>
        </div>
      ) : (
        <EmptyState title="No projects" description="Create a project first to see contributions." />
      )}

      {loading ? (
        <p style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>Loading insights...</p>
      ) : (
        <>
          {/* Insights Cards */}
          {insights && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.8rem', marginBottom: '1.5rem' }}>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                <Trophy size={16} style={{ color: '#f6e05e', marginBottom: '4px' }} />
                <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.08em', fontFamily: 'var(--font-mono)', marginBottom: '4px' }}>TOP CONTRIBUTOR</div>
                <div style={{ fontSize: '0.9rem', fontFamily: 'var(--font-mono)', color: 'var(--teal)' }}>{insights.topContributor || '—'}</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                <TrendingDown size={16} style={{ color: '#ff6b6b', marginBottom: '4px' }} />
                <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.08em', fontFamily: 'var(--font-mono)', marginBottom: '4px' }}>LEAST ACTIVE</div>
                <div style={{ fontSize: '0.9rem', fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.6)' }}>{insights.leastActive || '—'}</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                <CheckCircle2 size={16} style={{ color: '#2fd48d', marginBottom: '4px' }} />
                <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.08em', fontFamily: 'var(--font-mono)', marginBottom: '4px' }}>COMPLETION</div>
                <div style={{ fontSize: '0.9rem', fontFamily: 'var(--font-mono)', color: '#2fd48d' }}>{insights.completionRate || '0%'}</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
                <Clock size={16} style={{ color: '#ff6b6b', marginBottom: '4px' }} />
                <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.08em', fontFamily: 'var(--font-mono)', marginBottom: '4px' }}>LATE TASKS</div>
                <div style={{ fontSize: '0.9rem', fontFamily: 'var(--font-mono)', color: '#ff6b6b' }}>{insights.lateTasks || 0}</div>
              </div>
            </div>
          )}

          {/* Leaderboard */}
          {leaderboardData.length > 0 ? (
            <>
              <h3 style={{ fontSize: '0.85rem', fontFamily: 'var(--font-mono)', color: 'var(--teal)', marginBottom: '1rem' }}>
                LEADERBOARD
              </h3>
              <ContributionChart data={leaderboardData} label="weight" />
            </>
          ) : selectedProjectId ? (
            <EmptyState
              icon={BarChart3}
              title="No contributions yet"
              description="Complete tasks to build the leaderboard."
            />
          ) : null}

          {/* Contribution List */}
          {contributions.length > 0 && (
            <>
              <h3 style={{ fontSize: '0.85rem', fontFamily: 'var(--font-mono)', color: 'var(--teal)', marginTop: '1.5rem', marginBottom: '1rem' }}>
                RECENT CONTRIBUTIONS
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {contributions.slice(0, 20).map((c, i) => (
                  <div key={c._id || i} style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.05)',
                    borderRadius: '6px',
                    padding: '0.6rem 0.8rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                    <div>
                      <span style={{ fontSize: '0.8rem', color: '#fff' }}>{c.commitMessage || c.taskId?.title || 'Contribution'}</span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginLeft: '0.5rem' }}>
                        by {c.userId?.name || c.authorName || 'Unknown'}
                      </span>
                    </div>
                    {c.weight && (
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--teal)' }}>
                        +{c.weight}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
