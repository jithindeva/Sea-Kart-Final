import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, Lock } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import { Button } from './ui/button';
import { useUser } from '@/context/UserContext';
import { toast } from 'sonner';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { googleLogin } = useUser();
  const [loading, setLoading] = useState(false);

  // When modal opens: lock body scroll so the page doesn't jump/scroll underneath
  useEffect(() => {
    if (isOpen) {
      // Prevent background page scroll on Android WebView when modal is open
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
      return () => {
        // Restore scroll position when modal closes
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);

  // Live Official Google OAuth Popup trigger - STRICT VERIFICATION ONLY
  const triggerGooglePopup = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      try {
        // Fetch real verified account info from Google's official API
        const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        const profile = await res.json();

        if (profile && profile.email) {
          await googleLogin(profile.email, '');
          toast.success(`Welcome ${profile.name || profile.email}! Verified by Google.`);
          onClose();
        } else {
          toast.error('Google verification failed. Unverified account.');
        }
      } catch (err: any) {
        toast.error('Google account verification failed.');
      } finally {
        setLoading(false);
      }
    },
    onError: (err) => {
      console.log('Google login error:', err);
      toast.error('Google Popup blocked or domain updating. Please allow popups.');
      setLoading(false);
    }
  });

  if (!isOpen) return null;

  return (
    /* Full fixed overlay — always centered on the VISIBLE viewport, never scrolls page */
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 99999,
        background: 'rgba(15, 23, 42, 0.80)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          background: '#ffffff',
          borderRadius: '24px',
          padding: '32px',
          width: '100%',
          maxWidth: '400px',
          position: 'relative',
          boxShadow: '0 25px 60px rgba(0,0,0,0.4)',
          animation: 'authModalPop 0.22s ease-out both',
        }}
      >
        <style>{`
          @keyframes authModalPop {
            from { opacity: 0; transform: scale(0.92) translateY(12px); }
            to   { opacity: 1; transform: scale(1)    translateY(0);     }
          }
        `}</style>

        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: '16px', right: '16px',
            width: '32px', height: '32px', borderRadius: '50%',
            border: 'none', background: '#f1f5f9', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#64748b',
          }}
        >
          <X style={{ width: '16px', height: '16px' }} />
        </button>

        {/* Google Icon + Heading */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '24px' }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '16px',
            background: '#eff6ff', border: '1px solid #bfdbfe',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '12px', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)',
          }}>
            <svg viewBox="0 0 24 24" style={{ width: '32px', height: '32px' }}>
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.3px' }}>
            Sign in with Google
          </h2>
          <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0', textAlign: 'center' }}>
            Safe &amp; Passwordless Gmail Verification
          </p>
        </div>

        {/* Security Banner */}
        <div style={{
          marginBottom: '20px', background: '#f0fdf4', border: '1px solid #bbf7d0',
          borderRadius: '16px', padding: '14px 16px', display: 'flex', gap: '10px',
        }}>
          <ShieldCheck style={{ width: '18px', height: '18px', color: '#16a34a', flexShrink: 0, marginTop: '1px' }} />
          <p style={{ fontSize: '12px', color: '#15803d', margin: 0, lineHeight: 1.5 }}>
            <strong>100% Safe:</strong> You will never be asked for your password. Passwordless Google sign-in guaranteed.
          </p>
        </div>

        {/* Google Sign-in Button */}
        <button
          id="google-signin-btn"
          type="button"
          onClick={() => triggerGooglePopup()}
          disabled={loading}
          style={{
            width: '100%', padding: '14px 20px', borderRadius: '14px',
            border: '2px solid #e2e8f0', background: loading ? '#f8fafc' : '#ffffff',
            color: '#1e293b', fontWeight: 700, fontSize: '15px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
            cursor: loading ? 'not-allowed' : 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
            transition: 'all 0.15s',
            WebkitTapHighlightColor: 'transparent',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#93c5fd'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 16px rgba(37,99,235,0.15)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#e2e8f0'; (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)'; }}
          onMouseDown={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.97)'; }}
          onMouseUp={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'; }}
          onTouchStart={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.97)'; }}
          onTouchEnd={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'; }}
        >
          <svg viewBox="0 0 24 24" style={{ width: '22px', height: '22px', flexShrink: 0 }}>
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          {loading ? 'Verifying with Google...' : 'Sign in with Google'}
        </button>

        {/* Footer */}
        <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
          <Lock style={{ width: '12px', height: '12px', color: '#94a3b8' }} />
          <span style={{ fontSize: '11px', color: '#94a3b8' }}>Protected by Google Identity Services</span>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
