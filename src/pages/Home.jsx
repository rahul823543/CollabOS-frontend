import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import CineshaderRoom from '../components/CineshaderRoom';
import { motion } from 'framer-motion';
import { Users, Bot, GitFork, BarChart3, Folder, Zap } from 'lucide-react';

const features = [
  { icon: Users, title: 'TEAM MANAGEMENT', desc: 'Create teams, invite members, manage roles' },
  { icon: Bot, title: 'AI TASK GENERATION', desc: 'Auto-generate tasks from project descriptions' },
  { icon: GitFork, title: 'GITHUB INTEGRATION', desc: 'Connect repos, sync commits, track contributions' },
  { icon: BarChart3, title: 'ANALYTICS', desc: 'Contribution insights and progress tracking' },
  { icon: Folder, title: 'PROJECT TRACKING', desc: 'Organize projects with deadlines and milestones' },
  { icon: Zap, title: 'REAL-TIME SYNC', desc: 'Live updates across your entire team' },
];

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (user) navigate('/dashboard', { replace: true });
  }, [user, navigate]);

  if (user) return null;

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', background: '#0a0b0e', overflow: 'auto' }}>
      <div className="canvas-container">
        <Canvas
          camera={{ position: [0, 0, 1] }}
          dpr={typeof window !== 'undefined' && window.innerWidth <= 768 ? 1 : Math.min(window.devicePixelRatio, 2)}
        >
          <CineshaderRoom />
        </Canvas>
      </div>

      <div style={{ position: 'relative', zIndex: 10, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 24px' }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          style={{ textAlign: 'center', maxWidth: '600px' }}
        >
          <div className="brand" style={{ justifyContent: 'center', marginBottom: '12px' }}>
            <span className="brand-res">RES</span>
            <span className="brand-label" style={{ fontSize: '18px' }}>C O L L A B O S</span>
            <span className="brand-dot">[·]</span>
          </div>

          <h1 style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 'clamp(20px, 4vw, 32px)',
            letterSpacing: '0.1em',
            color: '#fff',
            marginBottom: '12px',
            fontWeight: 600,
          }}>
            COLLABORATIVE OPERATIONS SYSTEM
          </h1>

          <p style={{
            color: 'var(--text-secondary)',
            fontSize: 'clamp(12px, 2vw, 15px)',
            lineHeight: 1.6,
            marginBottom: '32px',
            maxWidth: '500px',
            margin: '0 auto 32px',
          }}>
            A team management platform for hackathons. Build projects, assign tasks with AI, track contributions, and ship faster.
          </p>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/login')}
              style={{
                background: 'var(--teal)',
                color: '#000',
                padding: '12px 32px',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.85rem',
                letterSpacing: '0.1em',
                boxShadow: '0 0 20px rgba(47, 185, 212, 0.3)',
                transition: 'box-shadow 0.3s, transform 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 30px rgba(47, 185, 212, 0.5)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 0 20px rgba(47, 185, 212, 0.3)'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              LOGIN
            </button>
            <button
              onClick={() => navigate('/signup')}
              style={{
                background: 'rgba(47, 185, 212, 0.08)',
                color: 'var(--teal)',
                padding: '12px 32px',
                border: '1px solid rgba(47, 185, 212, 0.3)',
                borderRadius: '8px',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.85rem',
                letterSpacing: '0.1em',
                transition: 'background 0.3s, transform 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(47, 185, 212, 0.15)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(47, 185, 212, 0.08)'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              CREATE ACCOUNT
            </button>
          </div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            maxWidth: '700px',
            width: '100%',
            marginTop: '60px',
          }}
        >
          {features.map(({ icon: Icon, title, desc }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              style={{
                background: 'rgba(10, 14, 20, 0.5)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(47, 185, 212, 0.08)',
                borderRadius: '10px',
                padding: '20px',
                textAlign: 'center',
              }}
            >
              <Icon size={22} strokeWidth={1.5} style={{ color: 'var(--teal)', marginBottom: '8px' }} />
              <h3 style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.12em', color: '#fff', marginBottom: '6px' }}>{title}</h3>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
