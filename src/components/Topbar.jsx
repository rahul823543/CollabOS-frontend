import { Link, useLocation } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import TeamSelector from './TeamSelector';

export default function Topbar({
  teams,
  activeTeam,
  onSelectTeam,
  user,
  showUserPanel,
  onToggleUserPanel,
  teamStats,
}) {
  const location = useLocation();

  const routeName = () => {
    switch (location.pathname) {
      case '/dashboard':     return 'DASHBOARD';
      case '/projects':      return 'PROJECTS';
      case '/tasks':         return 'TASKS';
      case '/team':          return 'MEMBERS';
      case '/github':        return 'GITHUB';
      case '/google':        return 'GOOGLE';
      case '/contributions': return 'CONTRIBUTIONS';
      case '/profile':       return 'PROFILE';
      default:               return '';
    }
  };

  return (
    <>
      <div className="hud-top">
        <div>
          <div className="brand">
            <span className="brand-res">RES</span>
            <span className="brand-label">C O L L A B O S</span>
            <span className="brand-dot">[·]</span>
          </div>
          <div className="route-label">{routeName()}</div>
        </div>

        <div className="hud-nav">
          <TeamSelector teams={teams} activeTeam={activeTeam} onSelect={onSelectTeam} />
          <Link to="/dashboard" className={location.pathname === '/dashboard' ? 'hud-nav-active' : ''}>DASHBOARD</Link>
          <Link to="/projects" className={location.pathname === '/projects' ? 'hud-nav-active' : ''}>PROJECTS</Link>
          <Link to="/tasks" className={location.pathname === '/tasks' ? 'hud-nav-active' : ''}>TASKS</Link>
          <Link to="/team" className={location.pathname === '/team' ? 'hud-nav-active' : ''}>TEAM</Link>
          <div
            className="hud-avatar-btn"
            onClick={onToggleUserPanel}
            title={user?.name || 'User Profile'}
          >
            <span className="hud-avatar-initial">{(user?.name || 'U').charAt(0).toUpperCase()}</span>
            <div className="hud-avatar-dot" />
            <ChevronDown size={10} strokeWidth={2} className={`hud-avatar-chevron ${showUserPanel ? 'open' : ''}`} />
          </div>
        </div>
      </div>

      <div className="hud-bottom">
        <div className="hud-meta">
          <div className="hud-meta-item">
            <span className="hud-meta-label">MEMBERS</span>
            <span className="hud-meta-value">{teamStats?.membersCount || 0}</span>
          </div>
          <div className="hud-divider" />
          <div className="hud-meta-item">
            <span className="hud-meta-label">ACTIVE</span>
            <span className="hud-meta-value">{teamStats?.activeCount || 0}</span>
          </div>
          <div className="hud-divider" />
          <div className="hud-meta-item">
            <span className="hud-meta-label">TASKS</span>
            <span className="hud-meta-value">{teamStats?.totalTasks || 0}</span>
          </div>
          <div className="hud-divider" />
          <div className="hud-meta-item">
            <span className="hud-meta-label">PROGRESS</span>
            <span className="hud-meta-value">{teamStats?.progress || 0}%</span>
          </div>
        </div>

        <div className="scrubber">
          <div className="scrubber-line" />
          <div className="scrubber-handle" />
          <span className="scrubber-text">HOLD</span>
          <div className="scrubber-line" />
        </div>

        <div className="hud-version">
          <span>v1.0.0</span>
          <span>COLLABOS</span>
        </div>
      </div>
    </>
  );
}
