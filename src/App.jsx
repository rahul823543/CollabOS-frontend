import { Routes, Route } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';

import CineshaderRoom from './components/CineshaderRoom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import Tasks from './pages/Tasks';
import Team from './pages/Team';
import GitHubIntegration from './pages/GitHubIntegration';
import GoogleIntegration from './pages/GoogleIntegration';
import Contributions from './pages/Contributions';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

import './App.css';

const AuthPageWrapper = ({ children }) => (
  <div
    style={{
      width: '100vw',
      height: '100vh',
      position: 'relative',
      background: '#0a0b0e',
    }}
  >
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

    <div
      className="login-wrapper"
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        padding:
          'clamp(20px, 5vw, 80px) clamp(16px, 4vw, 40px) clamp(20px, 5vw, 80px) clamp(16px, 6vw, 100px)',
      }}
    >
      {children}
    </div>
  </div>
);

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Home />} />

      <Route
        path="/login"
        element={
          <AuthPageWrapper>
            <Login />
          </AuthPageWrapper>
        }
      />

      <Route
        path="/signup"
        element={
          <AuthPageWrapper>
            <Signup />
          </AuthPageWrapper>
        }
      />

      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/team" element={<Team />} />
          <Route path="/github" element={<GitHubIntegration />} />
          <Route path="/google" element={<GoogleIntegration />} />
          <Route path="/contributions" element={<Contributions />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;