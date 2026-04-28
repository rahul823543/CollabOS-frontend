import { useState, useRef, useEffect, useCallback } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import CineshaderRoom from './CineshaderRoom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, ListTodo, Folder,
  Settings, Volume2, VolumeX, X,
  Sun, Zap, Music, Monitor, Eye, Wind
} from 'lucide-react';
import { useTeam } from '../context/TeamContext';

export default function Layout() {
  const location = useLocation();
  const audioRef = useRef(null);
  const { teams, activeTeam, setActiveTeamId, teamStats } = useTeam();

  // ── Settings state ──────────────────────────────────────────────────────────
  const [showSettings, setShowSettings] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [volume, setVolume] = useState(0.35);
  const [brightness, setBrightness] = useState(100);   // percent  100 = normal
  const [animSpeed, setAnimSpeed]   = useState(1);      // 0.5 / 1 / 1.5 / 2
  const [showParticles, setShowParticles] = useState(true);
  const [uiOpacity, setUiOpacity]   = useState(90);    // HUD glass opacity %

  // ── Audio ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    el.volume = volume;
    el.loop   = true;
    // Seamless cross-fade loop — re-start 0.3 s before end to avoid gap
    const handleTimeUpdate = () => {
      if (el.duration && el.currentTime >= el.duration - 0.3) {
        el.currentTime = 0;
      }
    };
    el.addEventListener('timeupdate', handleTimeUpdate);
    return () => el.removeEventListener('timeupdate', handleTimeUpdate);
  }, []);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    el.volume = volume;
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

  // ── Brightness overlay style ─────────────────────────────────────────────
  const brightnessOverlayStyle = {
    pointerEvents : 'none',
    position      : 'fixed',
    inset         : 0,
    zIndex        : 9999,
    background    : brightness < 100
      ? `rgba(0,0,0,${(100 - brightness) / 100 * 0.85})`
      : 'transparent',
    transition    : 'background 0.3s',
  };

  // ── Route label ──────────────────────────────────────────────────────────
  const routeName = () => {
    switch (location.pathname) {
      case '/':         return 'TEAM VIEW';
      case '/projects': return 'PROJECTS';
      case '/tasks':    return 'TASKS';
      case '/team':     return 'MEMBERS';
      default:          return '';
    }
  };

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', background: '#0a0b0e' }}>

      {/* ── Brightness overlay ── */}
      <div style={brightnessOverlayStyle} />

      {/* ── Audio ── */}
      <audio ref={audioRef} src="/ambient.mpeg" preload="auto" loop />

      {/* ── 3-D Canvas ── */}
      <div className="canvas-container">
        <Canvas camera={{ position: [0, 0, 1] }}>
          <CineshaderRoom />
        </Canvas>
      </div>

      {/* ── Sidebar ── */}
      <div className="sidebar">
        <Link to="/"        title="Dashboard"><LayoutDashboard size={20} strokeWidth={1.5} /></Link>
        <Link to="/projects" title="Projects" ><Folder          size={20} strokeWidth={1.5} /></Link>
        <Link to="/team"    title="Team"      ><Users           size={20} strokeWidth={1.5} /></Link>
        <Link to="/tasks"   title="Tasks"     ><ListTodo        size={20} strokeWidth={1.5} /></Link>

        <button
          title="Settings"
          onClick={() => setShowSettings(s => !s)}
          className={showSettings ? 'sidebar-btn-active' : ''}
        >
          <Settings size={20} strokeWidth={1.5} />
        </button>

        <div style={{ flexGrow: 1 }} />

        <button onClick={toggleAudio} title={audioEnabled ? 'Mute Music' : 'Play Music'}>
          {audioEnabled
            ? <Volume2 size={20} strokeWidth={1.5} />
            : <VolumeX size={20} strokeWidth={1.5} />}
        </button>
      </div>

      {/* ── Settings Panel ── */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            className="settings-panel"
            initial={{ x: -320, opacity: 0 }}
            animate={{ x: 0,    opacity: 1 }}
            exit   ={{ x: -320, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Header */}
            <div className="settings-header">
              <div className="settings-title">
                <Settings size={13} strokeWidth={1.5} />
                <span>SYSTEM SETTINGS</span>
              </div>
              <button className="settings-close" onClick={() => setShowSettings(false)}>
                <X size={14} strokeWidth={1.5} />
              </button>
            </div>

            <div className="settings-body">

              {/* ── Audio ── */}
              <div className="settings-section">
                <div className="settings-section-label">
                  <Music size={11} strokeWidth={1.5} />
                  AUDIO
                </div>

                <div className="settings-row">
                  <span>Ambient Music</span>
                  <button
                    className={`toggle-pill ${audioEnabled ? 'on' : ''}`}
                    onClick={toggleAudio}
                  >
                    <span className="toggle-knob" />
                  </button>
                </div>

                <div className="settings-row col">
                  <div className="settings-row-top">
                    <span>Volume</span>
                    <span className="settings-value">{Math.round(volume * 100)}%</span>
                  </div>
                  <input
                    type="range" min={0} max={1} step={0.01}
                    value={volume}
                    onChange={e => setVolume(parseFloat(e.target.value))}
                    className="settings-slider"
                  />
                </div>
              </div>

              {/* ── Display ── */}
              <div className="settings-section">
                <div className="settings-section-label">
                  <Monitor size={11} strokeWidth={1.5} />
                  DISPLAY
                </div>

                <div className="settings-row col">
                  <div className="settings-row-top">
                    <span>
                      <Sun size={11} strokeWidth={1.5} style={{ display:'inline', marginRight:4, verticalAlign:'middle' }} />
                      Brightness
                    </span>
                    <span className="settings-value">{brightness}%</span>
                  </div>
                  <input
                    type="range" min={20} max={100} step={1}
                    value={brightness}
                    onChange={e => setBrightness(parseInt(e.target.value))}
                    className="settings-slider"
                  />
                </div>

                <div className="settings-row col">
                  <div className="settings-row-top">
                    <span>
                      <Eye size={11} strokeWidth={1.5} style={{ display:'inline', marginRight:4, verticalAlign:'middle' }} />
                      HUD Opacity
                    </span>
                    <span className="settings-value">{uiOpacity}%</span>
                  </div>
                  <input
                    type="range" min={30} max={100} step={1}
                    value={uiOpacity}
                    onChange={e => setUiOpacity(parseInt(e.target.value))}
                    className="settings-slider"
                  />
                </div>
              </div>

              {/* ── Performance ── */}
              <div className="settings-section">
                <div className="settings-section-label">
                  <Zap size={11} strokeWidth={1.5} />
                  PERFORMANCE
                </div>

                <div className="settings-row">
                  <span>
                    <Wind size={11} strokeWidth={1.5} style={{ display:'inline', marginRight:4, verticalAlign:'middle' }} />
                    Animations
                  </span>
                  <button
                    className={`toggle-pill ${showParticles ? 'on' : ''}`}
                    onClick={() => setShowParticles(p => !p)}
                  >
                    <span className="toggle-knob" />
                  </button>
                </div>

                <div className="settings-row col">
                  <div className="settings-row-top">
                    <span>Anim Speed</span>
                    <span className="settings-value">{animSpeed}×</span>
                  </div>
                  <input
                    type="range" min={0.5} max={2} step={0.5}
                    value={animSpeed}
                    onChange={e => setAnimSpeed(parseFloat(e.target.value))}
                    className="settings-slider"
                  />
                </div>
              </div>

              {/* ── About ── */}
              <div className="settings-section">
                <div className="settings-section-label">
                  <Monitor size={11} strokeWidth={1.5} />
                  ABOUT
                </div>
                <div className="settings-about">
                  <div className="settings-about-row"><span>Version</span><span>v1.0.0</span></div>
                  <div className="settings-about-row"><span>Build</span><span>2026.04.28</span></div>
                  <div className="settings-about-row"><span>Engine</span><span>CollabOS Core</span></div>
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── HUD Overlay ── */}
      <div className="hud" style={{ opacity: uiOpacity / 100 }}>
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
            {teams.length > 1 && (
              <select
                value={activeTeam?._id || ''}
                onChange={e => setActiveTeamId(e.target.value)}
                style={{
                  background   : 'rgba(255,255,255,0.05)',
                  color        : 'var(--teal)',
                  border       : '1px solid rgba(47,185,212,0.3)',
                  padding      : '4px 8px',
                  borderRadius : '4px',
                  fontFamily   : 'var(--font-mono)',
                  fontSize     : '11px',
                  outline      : 'none',
                  cursor       : 'pointer',
                }}
              >
                {teams.map(t => (
                  <option key={t._id} value={t._id} style={{ background: '#0a0b0e', color: '#fff' }}>
                    {t.name}
                  </option>
                ))}
              </select>
            )}
            {teams.length === 1 && (
              <span
                style={{
                  color        : 'var(--teal)',
                  fontFamily   : 'var(--font-mono)',
                  fontSize     : '11px',
                  letterSpacing: '0.05em',
                  padding      : '4px 8px',
                  border       : '1px solid rgba(47,185,212,0.15)',
                  borderRadius : '4px',
                  background   : 'rgba(255,255,255,0.03)',
                }}
              >
                {activeTeam?.name}
              </span>
            )}
            <Link to="/">DASHBOARD</Link>
            <Link to="/projects">PROJECTS</Link>
            <Link to="/tasks">TASKS</Link>
            <Link to="/team">TEAM</Link>
            <div className="hud-avatar">
              <div className="hud-avatar-dot" />
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
      </div>

      {/* ── Route Content ── */}
      <div className="content-area">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, x: 20, filter: 'blur(8px)' }}
            animate={{ opacity: 1, x: 0,  filter: 'blur(0px)' }}
            exit   ={{ opacity: 0, x: -20, filter: 'blur(8px)' }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            style={{ width: '420px', flexShrink: 0 }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
