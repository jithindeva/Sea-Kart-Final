import React, { useState } from 'react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { Eye, EyeOff, Mail, Lock, Waves } from 'lucide-react';

export default function AdminLoginView({ onLoginSuccess }: { onLoginSuccess?: () => void }) {
  const { user, login } = useAdminAuth();
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
      if (onLoginSuccess) onLoginSuccess();
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)' }}>
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.7; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
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
        }
        .login-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 8px 25px rgba(59,130,246,0.4);
        }
        .login-btn:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>

      <div className="card-animate" style={{
        background: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(59, 130, 246, 0.2)',
        borderRadius: '24px',
        padding: '40px',
        width: '100%',
        maxWidth: '440px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
        position: 'relative',
        zIndex: 10
      }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '20px',
            background: 'linear-gradient(135deg, #2563eb, #06b6d4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px', boxShadow: '0 10px 25px -5px rgba(37,99,235,0.5)'
          }}>
            <Waves style={{ width: 32, height: 32, color: 'white' }} />
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'white', letterSpacing: '-0.02em', margin: 0 }}>
            SeaKart Control Portal
          </h1>
          <p style={{ color: 'rgba(148,163,184,0.8)', fontSize: '13px', marginTop: '6px' }}>
            Authorized Administrator Sign-In
          </p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '12px', padding: '12px 16px', color: '#fca5a5', fontSize: '13px',
            marginBottom: '20px'
          }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
                placeholder="admin@seakart.com"
                autoComplete="email"
              />
            </div>
          </div>

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
            {loading ? 'Authenticating...' : '🔐 Secure Admin Login'}
          </button>
        </form>
      </div>
    </div>
  );
}
