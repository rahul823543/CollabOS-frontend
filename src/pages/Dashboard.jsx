import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useTeam } from '../context/TeamContext';
import { useSocket } from '../context/SocketContext';
import {
  Folder,
  ListTodo,
  Users,
  GitFork,
  BarChart3,
  ArrowRight,
  Mail,
  CheckCheck,
  X,
} from 'lucide-react';
import EmptyState from '../components/EmptyState';
import SkillManager from '../components/SkillManager';

export default function Dashboard() {
  const { activeTeamId, activeTeam, refreshTeams } = useTeam();
  const socketContext = useSocket();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [members, setMembers] = useState([]);
  const [invites, setInvites] = useState([]);

  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
  });

  const acceptInvite = async (teamId) => {
    try {
      await api.post('/team/accept-invite', { teamId });
      await refreshTeams();
      const res = await api.get('/team/my-invites');
      setInvites(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const rejectInvite = async (teamId) => {
    try {
      await api.post('/team/reject-invite', { teamId });
      setInvites((prev) => prev.filter((i) => i.teamId !== teamId));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    let mounted = true;

    const fetchDashboardData = async () => {
      setLoading(true);

      try {
        const inviteRes = await api.get('/team/my-invites');
        if (mounted) setInvites(inviteRes.data || []);

        if (!activeTeamId) {
          if (mounted) setLoading(false);
          return;
        }

        const teamRes = await api.get(`/team/${activeTeamId}`);
        const team = teamRes.data;

        const projectsRes = await api.get(`/projects/team/${activeTeamId}`);
        const projects = Array.isArray(projectsRes.data)
          ? projectsRes.data
          : [];

        const taskResponses = await Promise.all(
          projects.map((project) =>
            api.get(`/tasks?projectId=${project._id}`)
          )
        );

        let allTasks = [];

        taskResponses.forEach((res) => {
          if (Array.isArray(res.data)) {
            allTasks.push(...res.data);
          }
        });

        const totalTasks = allTasks.length;
        const completedTasks = allTasks.filter(
          (t) => t.status === 'done'
        ).length;

        const pendingTasks = totalTasks - completedTasks;

        const overallProgress =
          totalTasks > 0
            ? Math.round((completedTasks / totalTasks) * 100)
            : 0;

        const memberStats = (team.members || []).map((member) => ({
          userId: member._id,
          name: member.name,
        }));

        if (!mounted) return;

        setMembers(memberStats);
        setProgress(overallProgress);
        setStats({
          totalTasks,
          completedTasks,
          pendingTasks,
        });
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchDashboardData();

    return () => {
      mounted = false;
    };
  }, [activeTeamId, refreshTeams]);

  const shortcuts = [
    { icon: Folder, label: 'PROJECTS', to: '/projects' },
    { icon: ListTodo, label: 'TASKS', to: '/tasks' },
    { icon: Users, label: 'TEAM', to: '/team' },
    { icon: GitFork, label: 'GITHUB', to: '/github' },
    { icon: BarChart3, label: 'ANALYTICS', to: '/contributions' },
  ];

  const isUserOnline = (userId) => {
    return socketContext?.isUserOnline
      ? socketContext.isUserOnline(userId)
      : false;
  };

  if (!activeTeamId && invites.length === 0) {
    return (
      <div className="glass-panel">
        <h1>NETWORK STANDBY</h1>
        <EmptyState
          icon={Users}
          title="No active team"
          description="Navigate to TEAM to initialize a new team."
          actionLabel="GO TO TEAM"
          onAction={() => navigate('/team')}
        />
      </div>
    );
  }

  return (
    <div
      className="glass-panel"
      style={{
        maxHeight: '75vh',
        overflowY: 'auto',
        overflowX: 'hidden',
      }}
    >
      {invites.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              marginBottom: '1.2rem',
              flexWrap: 'wrap',
            }}
          >
            <Mail size={14} style={{ color: 'var(--teal)' }} />

            <h3
              style={{
                margin: 0,
                color: 'var(--teal)',
                fontSize: '0.8rem',
                fontWeight: '700',
                letterSpacing: '3px',
              }}
            >
              TEAM INVITATIONS
            </h3>

            <span
              style={{
                background: 'rgba(47, 185, 212, 0.15)',
                border: '1px solid rgba(47, 185, 212, 0.35)',
                color: 'var(--teal)',
                fontSize: '0.65rem',
                fontWeight: '700',
                padding: '2px 8px',
                borderRadius: '20px',
              }}
            >
              {invites.length}
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}
          >
            {invites.map((invite) => (
              <div
                key={invite.teamId}
                style={{
                  background: 'rgba(255,255,255,0.025)',
                  border: '1px solid rgba(47,185,212,0.12)',
                  borderRadius: '14px',
                  padding: '1rem 1.2rem',
                }}
              >
                <div
                  style={{
                    marginBottom: '1rem',
                    color: '#fff',
                    wordBreak: 'break-word',
                  }}
                >
                  <strong>{invite.teamName}</strong> invited you
                </div>

                <div
                  style={{
                    display: 'flex',
                    gap: '0.7rem',
                    flexWrap: 'wrap',
                  }}
                >
                  <button
                    onClick={() => acceptInvite(invite.teamId)}
                    className="cyber-btn"
                  >
                    <CheckCheck size={12} />
                    ACCEPT
                  </button>

                  <button
                    onClick={() => rejectInvite(invite.teamId)}
                    className="cyber-btn danger"
                  >
                    <X size={12} />
                    REJECT
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTeamId && (
        <>
          <h1>{activeTeam?.name?.toUpperCase()} ACTIVITY</h1>

          <p className="subtitle">
            Overview of current team progress and member status
          </p>

          {loading ? (
            <p>Syncing data...</p>
          ) : (
            <>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns:
                    'repeat(auto-fit, minmax(100px, 1fr))',
                  gap: '1rem',
                  marginBottom: '1.5rem',
                }}
              >
                {[
                  ['TOTAL TASKS', stats.totalTasks],
                  ['COMPLETED', stats.completedTasks],
                  ['PENDING', stats.pendingTasks],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    style={{
                      padding: '1rem',
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '12px',
                      textAlign: 'center',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '1.5rem',
                        color: 'var(--teal)',
                        fontWeight: '700',
                      }}
                    >
                      {value}
                    </div>

                    <div
                      style={{
                        fontSize: '0.75rem',
                        opacity: 0.7,
                        marginTop: '0.4rem',
                      }}
                    >
                      {label}
                    </div>
                  </div>
                ))}
              </div>

              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <p>{progress}% COMPLETED</p>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns:
                    'repeat(auto-fit, minmax(140px, 1fr))',
                  gap: '0.6rem',
                  marginBottom: '2rem',
                }}
              >
                {shortcuts.map(({ icon: Icon, label, to }) => (
                  <Link
                    key={to}
                    to={to}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '0.5rem',
                      padding: '0.85rem',
                      background: 'rgba(255,255,255,0.025)',
                      border: '1px solid rgba(47,185,212,0.12)',
                      borderRadius: '10px',
                      textDecoration: 'none',
                      color: '#fff',
                    }}
                  >
                    <span
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '0.8rem',
                      }}
                    >
                      <Icon size={12} />
                      {label}
                    </span>

                    <ArrowRight size={10} />
                  </Link>
                ))}
              </div>

              <SkillManager />

              <h3
                style={{
                  marginTop: '1.8rem',
                  marginBottom: '1rem',
                  fontSize: '0.95rem',
                  letterSpacing: '2px',
                }}
              >
                OPERATOR STATUS
              </h3>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  minHeight: '140px',
                  maxHeight: '260px',
                  overflowY: 'auto',
                }}
              >
                {members.length === 0 ? (
                  <div
                    style={{
                      opacity: 0.55,
                      fontSize: '0.85rem',
                    }}
                  >
                    No operators detected
                  </div>
                ) : (
                  members.map((m) => (
                    <div
                      key={m.userId}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.85rem 1rem',
                        borderRadius: '12px',
                        border:
                          '1px solid rgba(255,255,255,0.06)',
                        background:
                          'rgba(255,255,255,0.025)',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          minWidth: 0,
                          flex: 1,
                        }}
                      >
                        <div
                          style={{
                            width: '10px',
                            height: '10px',
                            borderRadius: '50%',
                            background: isUserOnline(m.userId)
                              ? 'var(--teal)'
                              : '#ff6b6b',
                            flexShrink: 0,
                          }}
                        />

                        <span
                          style={{
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {m.name}
                        </span>
                      </div>

                      <span
                        style={{
                          color: isUserOnline(m.userId)
                            ? 'var(--teal)'
                            : '#ff6b6b',
                          fontWeight: '700',
                          fontSize: '0.78rem',
                          minWidth: '70px',
                          textAlign: 'right',
                        }}
                      >
                        {isUserOnline(m.userId)
                          ? 'ONLINE'
                          : 'OFFLINE'}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}