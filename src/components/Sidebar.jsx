import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  ListTodo,
  Folder,
  Settings,
  Volume2,
  VolumeX,
  LogOut,
  GitFork,
  Globe,
  BarChart3,
  User,
  Sun,
  Monitor,
} from 'lucide-react';

export default function Sidebar({
  mobileMenuOpen,
  showSettings,
  onToggleSettings,
  audioEnabled,
  onToggleAudio,
  onLogout,
  brightness = 100,
  uiOpacity = 90,
  onBrightnessChange = () => {},
  onOpacityChange = () => {},
}) {
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, title: 'Dashboard' },
    { path: '/projects', icon: Folder, title: 'Projects' },
    { path: '/team', icon: Users, title: 'Team' },
    { path: '/tasks', icon: ListTodo, title: 'Tasks' },
    { path: '/github', icon: GitFork, title: 'GitHub' },
    { path: '/google', icon: Globe, title: 'Google' },
    { path: '/contributions', icon: BarChart3, title: 'Contributions' },
    { path: '/profile', icon: User, title: 'Profile' },
  ];

  return (
    <>
      <div className={`sidebar ${mobileMenuOpen ? 'sidebar-open' : ''}`}>
        {/* NAVIGATION */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            alignItems: 'center',
          }}
        >
          {navItems.map(({ path, icon: Icon, title }) => (
            <Link
              key={path}
              to={path}
              title={title}
              className={location.pathname === path ? 'sidebar-btn-active' : ''}
            >
              <Icon size={20} strokeWidth={1.5} />
            </Link>
          ))}
        </div>

        {/* SPACER */}
        <div style={{ flexGrow: 1 }} />

        {/* CONTROLS */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            alignItems: 'center',
          }}
        >
          <button
            title="Settings"
            onClick={onToggleSettings}
            className={showSettings ? 'sidebar-btn-active' : ''}
          >
            <Settings size={20} strokeWidth={1.5} />
          </button>

          <button
            onClick={onToggleAudio}
            title={audioEnabled ? 'Mute Music' : 'Play Music'}
          >
            {audioEnabled ? (
              <Volume2 size={20} strokeWidth={1.5} />
            ) : (
              <VolumeX size={20} strokeWidth={1.5} />
            )}
          </button>

          <button
            onClick={onLogout}
            title="Logout"
            className="logout-btn"
          >
            <LogOut size={20} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* SETTINGS PANEL */}
      {showSettings && (
        <div
          style={{
            position: 'fixed',
            left: '90px',
            bottom: '90px',
            width: '260px',
            background: 'rgba(5, 15, 25, 0.92)',
            border: '1px solid rgba(47, 185, 212, 0.2)',
            borderRadius: '16px',
            padding: '1.2rem',
            backdropFilter: 'blur(20px)',
            zIndex: 9999,
            boxShadow: '0 0 30px rgba(47,185,212,0.12)',
          }}
        >
          <h3
            style={{
              color: '#2fb9d4',
              fontSize: '0.8rem',
              fontFamily: 'var(--font-mono)',
              marginBottom: '1rem',
              letterSpacing: '2px',
            }}
          >
            SYSTEM SETTINGS
          </h3>

          {/* Brightness */}
          <div style={{ marginBottom: '1rem' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '0.5rem',
                color: '#fff',
                fontSize: '0.75rem',
              }}
            >
              <Sun size={14} />
              BRIGHTNESS
            </div>

            <input
              type="range"
              min="50"
              max="120"
              value={brightness}
              onChange={(e) =>
                onBrightnessChange(Number(e.target.value))
              }
              style={{ width: '100%' }}
            />
          </div>

          {/* UI Opacity */}
          <div style={{ marginBottom: '1rem' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '0.5rem',
                color: '#fff',
                fontSize: '0.75rem',
              }}
            >
              <Monitor size={14} />
              UI OPACITY
            </div>

            <input
              type="range"
              min="50"
              max="100"
              value={uiOpacity}
              onChange={(e) =>
                onOpacityChange(Number(e.target.value))
              }
              style={{ width: '100%' }}
            />
          </div>

          {/* Audio */}
          <button
            onClick={onToggleAudio}
            style={{
              width: '100%',
              padding: '0.7rem',
              borderRadius: '10px',
              border: '1px solid rgba(47,185,212,0.2)',
              background: 'rgba(47,185,212,0.08)',
              color: '#2fb9d4',
              cursor: 'pointer',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.75rem',
            }}
          >
            {audioEnabled ? 'MUTE MUSIC' : 'PLAY MUSIC'}
          </button>
        </div>
      )}
    </>
  );
}