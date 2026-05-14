import { useAuth } from '../context/AuthContext';
import { useTeam } from '../context/TeamContext';
import { useNavigate } from 'react-router-dom';
import SkillManager from '../components/SkillManager';
import { Mail, Shield, Users, LogOut, Hash } from 'lucide-react';

export default function Profile() {
  const { user, logout } = useAuth();
  const { teams, activeTeam } = useTeam();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isCreator = activeTeam?.createdBy?._id === user?._id || activeTeam?.createdBy === user?._id;

  return (
    <div className="glass-panel" style={{ maxHeight: '75vh', overflowY: 'auto' }}>
      <h1>OPERATOR PROFILE</h1>
      <p className="subtitle">Your identity and configuration</p>

      {/* User Info */}
      <div style={{
        background: 'rgba(47, 185, 212, 0.03)',
        border: '1px solid rgba(47, 185, 212, 0.08)',
        borderRadius: '10px',
        padding: '1.2rem',
        marginBottom: '1.5rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(47, 185, 212, 0.3), rgba(47, 185, 212, 0.08))',
            border: '1.5px solid rgba(47, 185, 212, 0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'var(--font-mono)',
            fontSize: '18px',
            fontWeight: 700,
            color: 'var(--teal)',
            flexShrink: 0,
            boxShadow: '0 0 16px rgba(47, 185, 212, 0.12)',
          }}>
            {(user?.name || 'U').charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', fontWeight: 500, color: '#fff', letterSpacing: '0.04em' }}>
              {user?.name || 'Unknown'}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '3px' }}>
              <div className="status-dot online" />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.08em', color: '#34d399', textTransform: 'uppercase' }}>
                ONLINE
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px', color: 'var(--text-secondary)' }}>
            <Mail size={12} strokeWidth={1.5} style={{ color: 'var(--teal-dim)', flexShrink: 0 }} />
            <span>{user?.email || '—'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px', color: 'var(--text-secondary)' }}>
            <Shield size={12} strokeWidth={1.5} style={{ color: 'var(--teal-dim)', flexShrink: 0 }} />
            <span>{isCreator ? 'Team Leader' : 'Team Member'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px', color: 'var(--text-secondary)' }}>
            <Users size={12} strokeWidth={1.5} style={{ color: 'var(--teal-dim)', flexShrink: 0 }} />
            <span>{teams.length} team{teams.length !== 1 ? 's' : ''} — Active: {activeTeam?.name || 'None'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px', color: 'var(--text-secondary)' }}>
            <Hash size={12} strokeWidth={1.5} style={{ color: 'var(--teal-dim)', flexShrink: 0 }} />
            <span style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', color: 'var(--teal)' }}>
              {user?._id?.slice(-8)?.toUpperCase() || '—'}
            </span>
          </div>
        </div>
      </div>

      {/* Skills */}
      <SkillManager />

      {/* Logout */}
      <button
        onClick={handleLogout}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          width: '100%',
          padding: '12px 16px',
          marginTop: '2rem',
          background: 'none',
          border: '1px solid rgba(255, 107, 107, 0.2)',
          borderRadius: '8px',
          cursor: 'pointer',
          fontFamily: 'var(--font-mono)',
          fontSize: '10px',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'rgba(255, 107, 107, 0.6)',
          transition: 'color 0.2s, background 0.2s, border-color 0.2s',
        }}
        onMouseEnter={e => { e.currentTarget.style.color = '#ff6b6b'; e.currentTarget.style.background = 'rgba(255, 107, 107, 0.06)'; }}
        onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255, 107, 107, 0.6)'; e.currentTarget.style.background = 'none'; }}
      >
        <LogOut size={13} strokeWidth={1.5} />
        <span>DISCONNECT</span>
      </button>
    </div>
  );
}
