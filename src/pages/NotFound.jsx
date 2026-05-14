import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="glass-panel" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <AlertTriangle size={40} strokeWidth={1} style={{ color: 'var(--teal)', marginBottom: '1rem' }} />
        <h1 style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '2rem',
          letterSpacing: '0.15em',
          color: 'var(--teal)',
          marginBottom: '8px',
          fontWeight: 700,
        }}>
          404
        </h1>
        <p style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '12px',
          letterSpacing: '0.12em',
          color: '#fff',
          marginBottom: '8px',
        }}>
          SECTOR NOT FOUND
        </p>
        <p style={{
          fontSize: '12px',
          color: 'var(--text-secondary)',
          marginBottom: '24px',
          lineHeight: 1.5,
        }}>
          The requested resource does not exist in this network.
        </p>
        <Link
          to="/dashboard"
          style={{
            display: 'inline-block',
            background: 'rgba(47, 185, 212, 0.1)',
            color: 'var(--teal)',
            border: '1px solid rgba(47, 185, 212, 0.3)',
            padding: '0.6rem 1.5rem',
            borderRadius: '6px',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.75rem',
            letterSpacing: '0.1em',
            textDecoration: 'none',
            transition: 'background 0.2s',
          }}
        >
          RETURN TO DASHBOARD
        </Link>
      </motion.div>
    </div>
  );
}
