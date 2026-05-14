import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { register, googleLogin } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (!name.trim() || name.trim().length < 2) {
      setError('Name must be at least 2 characters.');
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.');
      return false;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validate()) return;

    setLoading(true);

    try {
      await register(name, email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Registration failed. Email may already be in use.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setError('');
      setLoading(true);

      await googleLogin(credentialResponse.credential);

      navigate('/dashboard');
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Google authentication failed.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('Google authentication failed.');
  };

  const cardStyle = {
    background: 'rgba(10, 14, 20, 0.65)',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    border: '1px solid rgba(47, 185, 212, 0.12)',
    borderRadius: '16px',
    padding: 'clamp(24px, 4vw, 40px) clamp(20px, 3.5vw, 36px)',
    width: '100%',
    maxWidth: '380px',
    boxShadow:
      '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255,255,255,0.03)',
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
      <h1
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '14px',
          letterSpacing: '0.15em',
          color: '#ffffff',
          marginBottom: '4px',
          fontWeight: 500,
        }}
      >
        CREATE ACCOUNT
      </h1>

      <p
        style={{
          fontSize: '12px',
          color: 'var(--text-secondary)',
          marginBottom: '24px',
          lineHeight: 1.5,
        }}
      >
        Register a new operator for the network
      </p>

      <form
        onSubmit={handleSubmit}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.9rem',
        }}
      >
        {error && (
          <p
            style={{
              color: '#ff6b6b',
              fontSize: '0.8rem',
              padding: '0.5rem 0.75rem',
              background: 'rgba(255, 107, 107, 0.08)',
              borderRadius: '6px',
              border: '1px solid rgba(255, 107, 107, 0.15)',
            }}
          >
            {error}
          </p>
        )}

        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          style={inputStyle}
        />

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
          placeholder="Password (min 6 characters)"
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
          {loading ? 'PROCESSING...' : 'REGISTER'}
        </button>
      </form>

      <div
        style={{
          margin: '1.2rem 0',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={handleGoogleError}
          theme="filled_black"
          size="large"
          text="signup_with"
          shape="pill"
        />
      </div>

      <div
        style={{
          width: '100%',
          height: '1px',
          background: 'rgba(47, 185, 212, 0.08)',
          margin: '1rem 0 1rem',
        }}
      />

      <Link
        to="/login"
        style={{
          display: 'block',
          color: 'rgba(255,255,255,0.35)',
          fontSize: '0.72rem',
          cursor: 'pointer',
          textAlign: 'center',
          letterSpacing: '0.1em',
          fontFamily: 'var(--font-mono)',
          transition: 'color 0.3s',
          textDecoration: 'none',
        }}
        onMouseEnter={(e) =>
          (e.target.style.color = '#2fb9d4')
        }
        onMouseLeave={(e) =>
          (e.target.style.color = 'rgba(255,255,255,0.35)')
        }
      >
        ← BACK TO LOGIN
      </Link>
    </div>
  );
}