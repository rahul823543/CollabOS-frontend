import {
  useState,
  useRef,
  useEffect,
  useCallback,
  useLayoutEffect,
  startTransition,
} from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import CineshaderRoom from './CineshaderRoom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Menu,
  Mail,
  Shield,
  Users,
  LogOut,
} from 'lucide-react';

import { useTeam } from '../context/TeamContext';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import SkillManager from './SkillManager';

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();

  const audioRef = useRef(null);
  const pollingRef = useRef(null);
  const mountedRef = useRef(true);

  const { teams, activeTeam, setActiveTeamId } = useTeam();
  const { user, logout } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showUserPanel, setShowUserPanel] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const [audioEnabled, setAudioEnabled] = useState(false);
  const [volume] = useState(0.35);

  const [brightness, setBrightness] = useState(100);
  const [uiOpacity, setUiOpacity] = useState(90);

  const [teamStats, setTeamStats] = useState({
    membersCount: 0,
    activeCount: 0,
    totalTasks: 0,
    progress: 0,
  });

  const fetchActivity = useCallback(async () => {
    if (!activeTeam?._id) {
      if (!mountedRef.current) return;

      startTransition(() => {
        setTeamStats({
          membersCount: 0,
          activeCount: 0,
          totalTasks: 0,
          progress: 0,
        });
      });

      return;
    }

    try {
      const res = await api.get(`/team/activity/${activeTeam._id}`);

      if (!mountedRef.current) return;

      const members = Array.isArray(res.data.members)
        ? res.data.members
        : [];

      startTransition(() => {
        setTeamStats({
          membersCount: members.length,
          activeCount: members.filter((m) => m.isOnline).length,
          totalTasks: res.data.totalTasks || 0,
          progress: Number(res.data.overallProgress) || 0,
        });
      });
    } catch (err) {
      if (
        err.code === 'ERR_CANCELED' ||
        err.name === 'CanceledError' ||
        err.message === 'Request aborted'
      ) {
        return;
      }

      if (err.response?.status !== 429) {
        console.error('Failed to load activity stats', err);
      }
    }
  }, [activeTeam]);

  useEffect(() => {
    mountedRef.current = true;

    if (pollingRef.current) {
      clearInterval(pollingRef.current);
    }

    fetchActivity();

    pollingRef.current = setInterval(fetchActivity, 60000);

    return () => {
      mountedRef.current = false;

      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [fetchActivity]);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;

    el.volume = volume;
    el.loop = true;

    const handleTimeUpdate = () => {
      if (el.duration && el.currentTime >= el.duration - 0.3) {
        el.currentTime = 0;
      }
    };

    el.addEventListener('timeupdate', handleTimeUpdate);

    return () => {
      el.removeEventListener('timeupdate', handleTimeUpdate);
    };
  }, [volume]);

  const toggleAudio = useCallback(() => {
    const el = audioRef.current;
    if (!el) return;

    if (audioEnabled) {
      el.pause();
      setAudioEnabled(false);
    } else {
      el.play().catch(() => {});
      setAudioEnabled(true);
    }
  }, [audioEnabled]);

  const handleLogout = useCallback(() => {
    logout();
    navigate('/login');
  }, [logout, navigate]);

  useLayoutEffect(() => {
    startTransition(() => {
      setMobileMenuOpen(false);
      setShowUserPanel(false);
      setShowSettings(false);
    });
  }, [location.pathname]);

  const brightnessOverlayStyle = {
    pointerEvents: 'none',
    position: 'fixed',
    inset: 0,
    zIndex: 9999,
    background:
      brightness < 100
        ? `rgba(0,0,0,${((100 - brightness) / 100) * 0.85})`
        : 'transparent',
    transition: 'background 0.3s ease',
  };

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        position: 'relative',
        background: '#0a0b0e',
      }}
    >
      <div style={brightnessOverlayStyle} />

      <audio
        ref={audioRef}
        src="/ambient.mpeg"
        preload="auto"
        loop
      />

      <div className="canvas-container">
        <Canvas
          camera={{ position: [0, 0, 1] }}
          dpr={
            typeof window !== 'undefined' && window.innerWidth <= 768
              ? 1
              : Math.min(window.devicePixelRatio, 2)
          }
        >
          <CineshaderRoom />
        </Canvas>
      </div>

      <button
        className="mobile-menu-btn"
        onClick={() => setMobileMenuOpen((v) => !v)}
        aria-label="Toggle menu"
      >
        {mobileMenuOpen ? (
          <X size={22} strokeWidth={1.5} />
        ) : (
          <Menu size={22} strokeWidth={1.5} />
        )}
      </button>

      {mobileMenuOpen && (
        <div
          className="mobile-overlay"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <Sidebar
        mobileMenuOpen={mobileMenuOpen}
        showSettings={showSettings}
        onToggleSettings={() => setShowSettings((s) => !s)}
        audioEnabled={audioEnabled}
        onToggleAudio={toggleAudio}
        onLogout={handleLogout}
        brightness={brightness}
        uiOpacity={uiOpacity}
        onBrightnessChange={setBrightness}
        onOpacityChange={setUiOpacity}
      />

      <div
        className="hud"
        style={{
          opacity: uiOpacity / 100,
          transition: 'opacity 0.2s ease',
        }}
      >
        <Topbar
          teams={teams}
          activeTeam={activeTeam}
          onSelectTeam={setActiveTeamId}
          user={user}
          showUserPanel={showUserPanel}
          onToggleUserPanel={() =>
            setShowUserPanel((v) => !v)
          }
          teamStats={teamStats}
        />

        <AnimatePresence>
          {showUserPanel && (
            <motion.div
              className="user-panel"
              initial={{
                opacity: 0,
                y: -10,
                scale: 0.95,
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                y: -10,
                scale: 0.95,
              }}
            >
              <div className="user-panel-header">
                <div className="user-panel-avatar">
                  {(user?.name || 'U')
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div className="user-panel-info">
                  <div className="user-panel-name">
                    {user?.name || 'Unknown'}
                  </div>

                  <div className="user-panel-status">
                    <div className="status-dot online" />
                    <span>ONLINE</span>
                  </div>
                </div>
              </div>

              <div className="user-panel-divider" />

              <div className="user-panel-details">
                <div className="user-panel-row">
                  <Mail size={12} />
                  <span>{user?.email || '—'}</span>
                </div>

                <div className="user-panel-row">
                  <Shield size={12} />
                  <span>
                    {activeTeam?.createdBy?._id === user?._id ||
                    activeTeam?.createdBy === user?._id
                      ? 'Team Leader'
                      : 'Team Member'}
                  </span>
                </div>

                <div className="user-panel-row">
                  <Users size={12} />
                  <span>
                    {activeTeam?.name || 'No Team'}
                  </span>
                </div>
              </div>

              <div className="user-panel-divider" />

              <SkillManager compact />

              <div className="user-panel-divider" />

              <button
                className="user-panel-logout"
                onClick={handleLogout}
              >
                <LogOut size={13} />
                <span>DISCONNECT</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="content-area">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            style={{
              width: '100%',
              maxWidth: '420px',
              flexShrink: 0,
            }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}