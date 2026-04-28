import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
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

// 1. Refactor to use <Outlet /> instead of { children }
const ProtectedRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ color: 'white', padding: '2rem' }}>
        Loading system...
      </div>
    );
  }

  // Outlet tells React Router to render the child routes defined below
  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

const LoginPage = () => {
  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        position: 'relative',
        background: '#0a0b0e',
      }}
    >
      <div className="canvas-container">
        <Canvas camera={{ position: [0, 0, 1] }}>
          <CineshaderRoom />
        </Canvas>
      </div>

      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
          padding: '80px 40px 80px 100px',
        }}
      >
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

        {/* 2. Group all protected routes under the ProtectedRoute wrapper */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="projects" element={<Projects />} />
            <Route path="tasks" element={<Tasks />} />
            <Route path="team" element={<Team />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
