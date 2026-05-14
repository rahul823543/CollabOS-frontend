import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useTeam } from '../context/TeamContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { UserPlus, UserMinus, Plus, LogOut } from 'lucide-react';
import EmptyState from '../components/EmptyState';

export default function Team() {
  const { activeTeamId, activeTeam, refreshTeams } = useTeam();
  const { user } = useAuth();
  const { addToast } = useToast();

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');

  const fetchTeam = async () => {
    if (!activeTeamId) {
      setMembers([]);
      return;
    }

    setLoading(true);

    try {
      const res = await api.get(`/team/${activeTeamId}`);
      let teamMembers = res.data.members || [];

      try {
        const skillsRes = await api.get(
          `/skills/teams/${activeTeamId}/members`
        );

        const skillsMap = {};

        (skillsRes.data || []).forEach((m) => {
          skillsMap[m.userId] = m.skills || [];
        });

        teamMembers = teamMembers.map((m) => ({
          ...m,
          skills: skillsMap[m._id] || m.skills || [],
        }));
      } catch (err) {
        console.error('Skill fetch failed:', err);
      }

      setMembers(teamMembers);
    } catch (err) {
      console.error('Team fetch failed:', err);
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!activeTeamId) {
      setMembers([]);
      return;
    }

    let cancelled = false;

    const load = async () => {
      setLoading(true);

      try {
        const res = await api.get(`/team/${activeTeamId}`);
        let teamMembers = res.data.members || [];

        try {
          const skillsRes = await api.get(
            `/skills/teams/${activeTeamId}/members`
          );

          const skillsMap = {};

          (skillsRes.data || []).forEach((m) => {
            skillsMap[m.userId] = m.skills || [];
          });

          teamMembers = teamMembers.map((m) => ({
            ...m,
            skills: skillsMap[m._id] || m.skills || [],
          }));
        } catch (err) {
          console.error('Skill fetch failed:', err);
        }

        if (!cancelled) setMembers(teamMembers);
      } catch (err) {
        console.error('Team fetch failed:', err);
        if (!cancelled) setMembers([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [activeTeamId]);

  const handleCreateTeam = async (e) => {
    e.preventDefault();

    if (!newTeamName.trim()) return;

    setLoading(true);

    try {
      await api.post('/team/create', {
        name: newTeamName.trim(),
      });

      await refreshTeams();

      setNewTeamName('');

      addToast('Team created successfully!', 'success');
    } catch (err) {
      addToast(
        err.response?.data?.message || 'Failed to create team',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  // ONLY CHANGED: add-member -> invite
  const handleAddMember = async (e) => {
    e.preventDefault();

    if (!newMemberEmail.trim() || !activeTeamId) return;

    setLoading(true);

    try {
      await api.post('/team/invite', {
        teamId: activeTeamId,
        email: newMemberEmail.trim(),
      });

      setNewMemberEmail('');

      addToast('Invite sent successfully!', 'success');
    } catch (err) {
      addToast(
        err.response?.data?.message || 'Failed to send invite',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!activeTeamId) return;

    setLoading(true);

    try {
      await api.post('/team/remove-member', {
        teamId: activeTeamId,
        userId,
      });

      await fetchTeam();

      addToast('Member removed successfully!', 'success');
    } catch (err) {
      addToast(
        err.response?.data?.message || 'Failed to remove member',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveTeam = async () => {
    if (!activeTeamId) return;

    setLoading(true);

    try {
      await api.post('/team/leave', {
        teamId: activeTeamId,
      });

      await refreshTeams();
      setMembers([]);

      addToast('Left team successfully!', 'success');
    } catch (err) {
      addToast(
        err.response?.data?.message || 'Failed to leave team',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  const isCreator =
    activeTeam?.createdBy?._id === user?._id ||
    activeTeam?.createdBy === user?._id;

  if (!activeTeamId) {
    return (
      <div className="glass-panel">
        <h1>CREATE A TEAM</h1>
        <p className="subtitle">Create a team to start collaborating.</p>

        <form
          onSubmit={handleCreateTeam}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            marginTop: '1rem',
          }}
        >
          <input
            type="text"
            placeholder="Team Name"
            value={newTeamName}
            onChange={(e) => setNewTeamName(e.target.value)}
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(47, 185, 212, 0.12)',
              padding: '0.8rem 1rem',
              color: '#fff',
              borderRadius: '8px',
              outline: 'none',
            }}
          />

          <button
            type="submit"
            disabled={loading || !newTeamName}
            style={{
              background: 'var(--teal)',
              color: '#000',
              padding: '0.8rem',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
          >
            {loading ? 'PROCESSING...' : 'CREATE TEAM'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div
      className="glass-panel"
      style={{
        maxHeight: '75vh',
        overflowY: 'auto',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <h1>{activeTeam?.name?.toUpperCase() || 'TEAM'} MEMBERS</h1>
          <p className="subtitle">Manage your team network</p>
        </div>

        <button
          onClick={handleLeaveTeam}
          disabled={loading}
          style={{
            background: 'rgba(255, 107, 107, 0.08)',
            border: '1px solid rgba(255, 107, 107, 0.2)',
            color: '#ff6b6b',
            padding: '0.6rem 1rem',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <LogOut size={14} />
          LEAVE TEAM
        </button>
      </div>

      {isCreator && (
        <form
          onSubmit={handleAddMember}
          style={{
            display: 'flex',
            gap: '0.5rem',
            marginTop: '1.5rem',
            marginBottom: '2rem',
          }}
        >
          <input
            type="email"
            placeholder="Invite member by email"
            value={newMemberEmail}
            onChange={(e) => setNewMemberEmail(e.target.value)}
            style={{
              flex: 1,
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(47, 185, 212, 0.12)',
              padding: '0.6rem 0.8rem',
              color: '#fff',
              borderRadius: '6px',
              outline: 'none',
            }}
          />

          <button
            type="submit"
            disabled={loading || !newMemberEmail}
            style={{
              background: 'rgba(47, 185, 212, 0.1)',
              color: 'var(--teal)',
              border: '1px solid rgba(47, 185, 212, 0.3)',
              padding: '0 1rem',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            <UserPlus size={16} />
          </button>
        </form>
      )}

      {loading && members.length === 0 ? (
        <p>Loading members...</p>
      ) : members.length === 0 ? (
        <EmptyState title="No members" description="Your team is empty." />
      ) : (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
          }}
        >
          {members.map((m) => (
            <div
              key={m._id}
              className="member-row"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  gap: '1rem',
                  alignItems: 'center',
                }}
              >
                <div className="member-avatar">
                  {(m.name || 'U').charAt(0)}
                </div>

                <div>
                  <div>
                    {m.name}{' '}
                    {(activeTeam?.createdBy?._id === m._id ||
                      activeTeam?.createdBy === m._id) &&
                      '(Leader)'}
                  </div>

                  <div
                    style={{
                      fontSize: '0.75rem',
                      color: 'rgba(255,255,255,0.5)',
                    }}
                  >
                    {m.email}
                  </div>

                  {m.skills?.length > 0 && (
                    <div
                      style={{
                        display: 'flex',
                        gap: '0.3rem',
                        flexWrap: 'wrap',
                        marginTop: '0.4rem',
                      }}
                    >
                      {m.skills.map((skill) => (
                        <span key={skill} className="skill-tag">
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {isCreator && m._id !== user?._id && (
                <button
                  onClick={() => handleRemoveMember(m._id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#ff6b6b',
                    cursor: 'pointer',
                  }}
                >
                  <UserMinus size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <div
        style={{
          marginTop: '3rem',
          paddingTop: '1.5rem',
          borderTop: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <h3
          style={{
            marginBottom: '1rem',
            fontSize: '0.8rem',
          }}
        >
          CREATE NEW TEAM
        </h3>

        <form
          onSubmit={handleCreateTeam}
          style={{
            display: 'flex',
            gap: '0.5rem',
          }}
        >
          <input
            type="text"
            placeholder="New Team Name"
            value={newTeamName}
            onChange={(e) => setNewTeamName(e.target.value)}
            style={{
              flex: 1,
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.1)',
              padding: '0.6rem',
              color: '#fff',
              borderRadius: '6px',
            }}
          />

          <button
            type="submit"
            disabled={loading || !newTeamName}
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#fff',
              padding: '0 1rem',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            <Plus size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}