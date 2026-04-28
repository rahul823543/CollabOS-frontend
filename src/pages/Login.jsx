import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isRegister) {
        await register(name, email, password);
      } else {
        await login(email, password);
      }
      navigate('/');
    } catch (err) {
      setError(
        isRegister
          ? 'Registration failed. Email may already be in use.'
          : 'Invalid credentials or server error.'
      );
    } finally {
      setLoading(false);
    }
  };

  const cardStyle = {
    background: 'rgba(10, 14, 20, 0.65)',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    border: '1px solid rgba(47, 185, 212, 0.12)',
    borderRadius: '16px',
    padding: '40px 36px',
    width: '380px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255,255,255,0.03)',
  };

  const inputStyle = {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(47, 185, 212, 0.12)',
    padding: '0.8rem 1rem',
    color: '#fff',
    borderRadius: '8px',
    fontFamily: 'inherit',
    fontSize: '0.85rem',
    letterSpacing: '0.03em',
    outline: 'none',
    transition: 'border-color 0.3s',
    width: '100%',
  };

  return (
    <div style={cardStyle}>
      <h1 style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '14px',
        letterSpacing: '0.15em',
        color: '#ffffff',
        marginBottom: '4px',
        fontWeight: 500,
      }}>
        {isRegister ? 'CREATE ACCOUNT' : 'SYSTEM ACCESS'}
      </h1>
      <p style={{
        fontSize: '12px',
        color: 'var(--text-secondary)',
        marginBottom: '24px',
        lineHeight: 1.5,
      }}>
        {isRegister
          ? 'Register a new operator for the network'
          : 'Authenticate to access corporate network'}
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
        {error && (
          <p style={{
            color: '#ff6b6b',
            fontSize: '0.8rem',
            padding: '0.5rem 0.75rem',
            background: 'rgba(255, 107, 107, 0.08)',
            borderRadius: '6px',
            border: '1px solid rgba(255, 107, 107, 0.15)',
          }}>{error}</p>
        )}

        {isRegister && (
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={inputStyle}
          />
        )}

        <input
          type="email"
          placeholder="Corporate Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={inputStyle}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={inputStyle}
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            background: 'var(--teal)',
            color: '#000',
            padding: '0.8rem',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 'bold',
            cursor: 'pointer',
            marginTop: '0.3rem',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.8rem',
            letterSpacing: '0.12em',
            opacity: loading ? 0.6 : 1,
            transition: 'opacity 0.3s, box-shadow 0.3s',
            boxShadow: '0 0 20px rgba(47, 185, 212, 0.2)',
          }}
        >
          {loading ? 'PROCESSING...' : isRegister ? 'REGISTER' : 'AUTHORIZE'}
        </button>
      </form>

      <div style={{
        width: '100%',
        height: '1px',
        background: 'rgba(47, 185, 212, 0.08)',
        margin: '1.5rem 0 1rem',
      }} />

      <p
        onClick={() => { setIsRegister(!isRegister); setError(''); }}
        style={{
          color: 'rgba(255,255,255,0.35)',
          fontSize: '0.72rem',
          cursor: 'pointer',
          textAlign: 'center',
          letterSpacing: '0.1em',
          fontFamily: 'var(--font-mono)',
          transition: 'color 0.3s',
        }}
        onMouseEnter={(e) => e.target.style.color = '#2fb9d4'}
        onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,0.35)'}
      >
        {isRegister ? '← BACK TO LOGIN' : 'NEW OPERATOR? CREATE ACCOUNT →'}
      </p>
    </div>
  );
}
