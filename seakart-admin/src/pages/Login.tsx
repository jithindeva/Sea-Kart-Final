import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Mail, Lock, Waves } from 'lucide-react';
import { useNavigate, Navigate } from 'react-router-dom';


export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setError('Please enter an admin email.');
      return;
    }

    setLoading(true);
    try {
      await login(cleanEmail, password);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  if (user) {
    return <Navigate to="/" />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)' }}>
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div style={{
          position: 'absolute', top: '-10%', left: '-10%', width: '50%', height: '50%',
          background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)',
          animation: 'pulse 4s ease-in-out infinite',
          borderRadius: '50%'
        }} />
        <div style={{
          position: 'absolute', bottom: '-10%', right: '-10%', width: '60%', height: '60%',
          background: 'radial-gradient(circle, rgba(6,182,212,0.12) 0%, transparent 70%)',
          animation: 'pulse 5s ease-in-out infinite reverse',
          borderRadius: '50%'
        }} />
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '40%', height: '40%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)',
          animation: 'pulse 6s ease-in-out infinite',
          borderRadius: '50%'
        }} />
      </div>

      {/* Animated top rainbow bar */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: '4px', zIndex: 100,
        background: 'linear-gradient(90deg, #3b82f6, #06b6d4, #6366f1, #8b5cf6, #06b6d4, #3b82f6)',
        backgroundSize: '300% 100%',
        animation: 'rainbowSlide 3s linear infinite'
      }} />

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.7; }
        }
        @keyframes rainbowSlide {
          0% { background-position: 0% 0%; }
          100% { background-position: 300% 0%; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .card-animate { animation: fadeInUp 0.5s ease both; }
        .input-field {
          width: 100%;
          background: rgba(15,23,42,0.6);
          border: 1px solid rgba(71,85,105,0.5);
          border-radius: 12px;
          padding: 12px 44px 12px 44px;
          color: white;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          backdrop-filter: blur(8px);
        }
        .input-field:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59,130,246,0.15);
        }
        .input-field::placeholder { color: rgba(148,163,184,0.6); }
        .login-btn {
          width: 100%;
          padding: 14px;
          border-radius: 12px;
          font-weight: 700;
          font-size: 15px;
          color: white;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
          background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);
          position: relative;
          overflow: hidden;
        }
        .login-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 8px 25px rgba(59,130,246,0.4);
        }
        .login-btn:active:not(:disabled) { transform: translateY(0); }
        .login-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .login-btn::after {
          content: '';
          position: absolute;
          top: 0; left: -100%; width: 100%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
          transition: left 0.4s;
        }
        .login-btn:hover::after { left: 100%; }
      `}</style>

      <div className="card-animate w-full max-w-md relative z-10">
        {/* Card */}
        <div style={{
          background: 'rgba(15,23,42,0.8)',
          border: '1px solid rgba(71,85,105,0.4)',
          borderRadius: '24px',
          padding: '40px',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 25px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)'
        }}>
          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: '72px', height: '72px', borderRadius: '20px', marginBottom: '16px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
              boxShadow: '0 8px 25px rgba(59,130,246,0.4)'
            }}>
              <Waves style={{ width: 36, height: 36, color: 'white' }} />
            </div>
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'white', margin: 0, letterSpacing: '-0.5px' }}>
              Sea Kart Admin
            </h1>
            <p style={{ color: 'rgba(148,163,184,0.8)', fontSize: '14px', marginTop: '6px' }}>
              Secure Partner Portal
            </p>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
              color: '#f87171', padding: '12px 16px', borderRadius: '12px',
              marginBottom: '20px', fontSize: '13px', textAlign: 'center',
              animation: 'fadeInUp 0.3s ease'
            }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Email field */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'rgba(148,163,184,0.9)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Admin Email
              </label>
              <div style={{ position: 'relative' }}>
                <Mail style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: 'rgba(148,163,184,0.5)' }} />
                <input
                  id="admin-email"
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="input-field"
                  placeholder="seakart019@gmail.com"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password field */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'rgba(148,163,184,0.9)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Master Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: 'rgba(148,163,184,0.5)' }} />
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="input-field"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  style={{ paddingRight: '44px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', padding: '4px',
                    color: 'rgba(148,163,184,0.5)', transition: 'color 0.2s', display: 'flex', alignItems: 'center'
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#3b82f6')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'rgba(148,163,184,0.5)')}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff style={{ width: 16, height: 16 }} /> : <Eye style={{ width: 16, height: 16 }} />}
                </button>
              </div>
            </div>

            <button
              id="admin-login-btn"
              type="submit"
              disabled={loading}
              className="login-btn"
              style={{ marginTop: '8px' }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
                    <path d="M21 12a9 9 0 11-6.219-8.56" />
                  </svg>
                  Authenticating...
                </span>
              ) : (
                '🔐 Secure Login'
              )}
            </button>
          </form>

          <p style={{ textAlign: 'center', color: 'rgba(100,116,139,0.7)', fontSize: '12px', marginTop: '24px' }}>
            🔒 Authorized personnel only · Sea Kart &copy; 2024
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
