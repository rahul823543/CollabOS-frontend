import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { Canvas } from '@react-three/fiber';
import CineshaderRoom from './components/CineshaderRoom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Tasks from './pages/Tasks';
import Team from './pages/Team';
import Login from './pages/Login';
import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div style={{ color: 'white', padding: '2rem' }}>Loading system...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Login wrapper — same cinematic background + consistent HUD chrome
const LoginPage = () => {
  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', background: '#0a0b0e' }}>
      {/* Same cinematic 3D background */}
      <div className="canvas-container">
        <Canvas camera={{ position: [0, 0, 1] }}>
          <CineshaderRoom />
        </Canvas>
      </div>

      {/* Consistent HUD — Top bar (Brand + Nav) */}
      <div className="hud">
        <div className="hud-top">
          <div>
            <div className="brand">
              <span className="brand-res">RES</span>
              <span className="brand-label">C O L L A B O S</span>
              <span className="brand-dot">[·]</span>
            </div>
            <div className="route-label">SYSTEM ACCESS</div>
          </div>

          <div className="hud-nav">
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.08em', color: 'var(--teal)', textTransform: 'uppercase' }}>LOGIN</span>
            <div className="hud-avatar">
              <div className="hud-avatar-dot" style={{ background: '#4a5f72' }} />
            </div>
          </div>
        </div>

        {/* Consistent HUD — Bottom bar */}
        <div className="hud-bottom">
          <div className="hud-meta">
            <div className="hud-meta-item">
              <span className="hud-meta-label">STATUS</span>
              <span className="hud-meta-value">LOCKED</span>
            </div>
            <div className="hud-divider" />
            <div className="hud-meta-item">
              <span className="hud-meta-label">PROTOCOL</span>
              <span className="hud-meta-value">AUTH</span>
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

      {/* Login form — LEFT aligned */}
      <div style={{
        position: 'absolute',
        inset: 0,
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        padding: '80px 40px 80px 100px',
      }}>
        <Login />
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="projects" element={<Projects />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="team" element={<Team />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
