import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useTeam } from '../context/TeamContext';
import { useAuth } from '../context/AuthContext';
import { UserPlus, UserMinus, Plus } from 'lucide-react';

export default function Team() {
  const { activeTeamId, activeTeam, refreshTeams } = useTeam();
  const { user } = useAuth();
  
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchTeam = async () => {
    if (!activeTeamId) return;
    setLoading(true);
    try {
      const res = await api.get(`/team/${activeTeamId}`);
      setMembers(res.data.members || []);
    } catch (err) {
      console.error("Team API error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
    setError('');
    setSuccess('');
  }, [activeTeamId]);

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    if (!newTeamName.trim()) return;
    
    setLoading(true);
    setError('');
    try {
      await api.post('/team/create', { name: newTeamName });
      await refreshTeams();
      setNewTeamName('');
      setSuccess('Team created successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create team');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!newMemberEmail.trim() || !activeTeamId) return;

    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await api.post('/team/add-member', { 
        teamId: activeTeamId, 
        email: newMemberEmail 
      });
      await fetchTeam();
      setNewMemberEmail('');
      setSuccess('Member added successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add member');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!activeTeamId) return;
    
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await api.post('/team/remove-member', { 
        teamId: activeTeamId, 
        userId 
      });
      await fetchTeam();
      setSuccess('Member removed successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove member');
    } finally {
      setLoading(false);
    }
  };

  // If no team is selected (or user has no teams)
  if (!activeTeamId) {
    return (
      <div className="glass-panel">
        <h1>CREATE A TEAM</h1>
        <p className="subtitle">You need to create a team before accessing the network.</p>
        
        {error && <div style={{ color: '#ff6b6b', marginBottom: '1rem', fontSize: '0.85rem' }}>{error}</div>}
        
        <form onSubmit={handleCreateTeam} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
          <input
            type="text"
            placeholder="Team Name (e.g. Alpha Squad)"
            value={newTeamName}
            onChange={(e) => setNewTeamName(e.target.value)}
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(47, 185, 212, 0.12)',
              padding: '0.8rem 1rem',
              color: '#fff',
              borderRadius: '8px',
              fontFamily: 'inherit',
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
              fontFamily: 'var(--font-mono)',
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? 'PROCESSING...' : 'INITIALIZE TEAM'}
          </button>
        </form>
      </div>
    );
  }

  const isCreator = activeTeam?.createdBy?._id === user?._id || activeTeam?.createdBy === user?._id;

  return (
    <div className="glass-panel" style={{ maxHeight: '85vh', overflowY: 'auto' }}>
      <h1>{activeTeam?.name?.toUpperCase() || 'TEAM'} MEMBERS</h1>
      <p className="subtitle">Network roster and operator status</p>
      
      {error && <div style={{ color: '#ff6b6b', marginBottom: '1rem', fontSize: '0.85rem', padding: '0.5rem', background: 'rgba(255, 107, 107, 0.08)', borderRadius: '6px' }}>{error}</div>}
      {success && <div style={{ color: '#2fd48d', marginBottom: '1rem', fontSize: '0.85rem', padding: '0.5rem', background: 'rgba(47, 212, 141, 0.08)', borderRadius: '6px' }}>{success}</div>}

      {isCreator && (
        <form onSubmit={handleAddMember} style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
          <input
            type="email"
            placeholder="Invite operator by email"
            value={newMemberEmail}
            onChange={(e) => setNewMemberEmail(e.target.value)}
            style={{
              flex: 1,
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(47, 185, 212, 0.12)',
              padding: '0.6rem 0.8rem',
              color: '#fff',
              borderRadius: '6px',
              fontFamily: 'inherit',
              fontSize: '0.85rem',
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
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.2s',
            }}
            onMouseOver={e => e.currentTarget.style.background = 'rgba(47, 185, 212, 0.2)'}
            onMouseOut={e => e.currentTarget.style.background = 'rgba(47, 185, 212, 0.1)'}
          >
            <UserPlus size={16} />
          </button>
        </form>
      )}
      
      {loading && members.length === 0 ? (
        <p style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>Loading directory...</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {members.map((m, i) => (
            <div className="member-row" key={m._id || i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div className="member-avatar">{(m.name || 'U').charAt(0)}</div>
                <div className="member-info">
                  <div className="member-name">{m.name} {activeTeam?.createdBy?._id === m._id || activeTeam?.createdBy === m._id ? '(Leader)' : ''}</div>
                  <div className="member-role" style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>{m.email}</div>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {isCreator && m._id !== user?._id && (
                  <button 
                    onClick={() => handleRemoveMember(m._id)}
                    title="Remove Member"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'rgba(255, 107, 107, 0.6)',
                      cursor: 'pointer',
                      padding: '4px',
                    }}
                    onMouseOver={e => e.currentTarget.style.color = '#ff6b6b'}
                    onMouseOut={e => e.currentTarget.style.color = 'rgba(255, 107, 107, 0.6)'}
                  >
                    <UserMinus size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Team Creation for users who already have a team */}
      <div style={{ marginTop: '3rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <h3 style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '1rem', fontFamily: 'var(--font-mono)' }}>CREATE NEW TEAM</h3>
        <form onSubmit={handleCreateTeam} style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            placeholder="New Team Name"
            value={newTeamName}
            onChange={(e) => setNewTeamName(e.target.value)}
            style={{
              flex: 1,
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              padding: '0.6rem 0.8rem',
              color: '#fff',
              borderRadius: '6px',
              fontFamily: 'inherit',
              fontSize: '0.85rem',
              outline: 'none',
            }}
          />
          <button
            type="submit"
            disabled={loading || !newTeamName}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              color: '#fff',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              padding: '0 1rem',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.2s',
            }}
            onMouseOver={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
            onMouseOut={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
          >
            <Plus size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
