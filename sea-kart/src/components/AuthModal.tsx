import React, { useState, useEffect, useRef } from 'react';
import { X, ShieldCheck, Lock } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { Button } from './ui/button';
import { useUser } from '@/context/UserContext';
import { toast } from 'sonner';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { googleLogin } = useUser();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const googleBtnRef = useRef<HTMLButtonElement>(null);

  const handleDirectEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = emailInput.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      toast.error('Please enter a valid Gmail or Email address.');
      return;
    }
    setLoading(true);
    try {
      await googleLogin(cleanEmail, cleanEmail.split('@')[0], '', '');
      toast.success(`Signed in as ${cleanEmail}`);
      document.body.style.overflow = 'unset';
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Sign in failed.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const triggerGooglePopup = useGoogleLogin({
    prompt: 'select_account',
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      try {
        // Fetch user profile from Google
        const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });

        if (!res.ok) {
          throw new Error(`Google userinfo fetch failed: ${res.status}`);
        }

        const profile = await res.json();
        console.log('Google profile:', profile);
        
        if (profile && profile.email) {
          await googleLogin(
            profile.email,
            profile.name || profile.email.split('@')[0],
            profile.picture || '',
            ''
          );
          document.body.style.overflow = 'unset';
          onClose();
        } else {
          toast.error('Google did not return an email. Please try again.');
        }
      } catch (err: any) {
        console.error('Google login error:', err);
        toast.error(err.message || 'Google sign-in failed. Please try again.');
      } finally {
        setLoading(false);
      }
    },
    onError: (err) => {
      console.log('Google popup error:', err);
      toast.error('Google sign-in was cancelled or blocked. Please try again.');
      setLoading(false);
    }
  });

  if (!isOpen) return null;

  const modalContent = (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md transition-opacity duration-300"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-[24px] p-8 w-full max-w-[400px] relative animate-in fade-in zoom-in-95 duration-200">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center mb-3 border border-blue-100 dark:border-blue-800/50 shadow-inner">
            <svg viewBox="0 0 24 24" className="w-8 h-8">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white text-center">
            Sign in with Google
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 text-center mt-1">
            Safe &amp; Passwordless Gmail Verification
          </p>
        </div>

        <div className="mb-6 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 rounded-2xl p-4 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-xs text-emerald-800 dark:text-emerald-300 leading-relaxed">
            <span className="font-bold">100% Safe Gmail Authentication:</span> You will never be asked for your password. Passwordless Google sign-in is guaranteed.
          </div>
        </div>

        <div className="space-y-4 relative z-20">
          <Button 
            ref={googleBtnRef}
            id="google-signin-btn"
            type="button" 
            onClick={() => triggerGooglePopup()}
            disabled={loading}
            className="w-full bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-white border-2 border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 rounded-xl py-6 font-bold flex items-center justify-center gap-3 shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer"
          >
            <svg viewBox="0 0 24 24" className="w-6 h-6">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            {loading ? 'Verifying with Google...' : 'Sign in with Google One-Tap'}
          </Button>

          <div className="relative flex items-center justify-center my-3">
            <div className="border-t border-slate-200 dark:border-slate-800 w-full"></div>
            <span className="bg-white dark:bg-slate-900 px-3 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider whitespace-nowrap">
              Or Enter Gmail / Email
            </span>
            <div className="border-t border-slate-200 dark:border-slate-800 w-full"></div>
          </div>

          <form onSubmit={handleDirectEmailSubmit} className="space-y-2.5">
            <input
              type="email"
              required
              placeholder="Enter your Gmail (e.g. name@gmail.com)"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Button
              type="submit"
              disabled={loading || !emailInput.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl py-3 text-sm shadow-md transition-all"
            >
              {loading ? 'Signing In...' : 'Continue with Gmail →'}
            </Button>
          </form>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center gap-2 text-xs text-slate-400 dark:text-slate-500">
          <Lock className="w-3.5 h-3.5" />
          <span>Protected by Google Identity Services</span>
        </div>
      </div>
    </div>
  );

  if (typeof document !== 'undefined') {
    return createPortal(modalContent, document.body);
  }
  return modalContent;
};

export default AuthModal;
