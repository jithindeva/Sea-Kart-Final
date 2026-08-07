import React, { useState } from 'react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md">
      <div className="bg-white rounded-3xl p-8 w-full max-w-md relative shadow-2xl border border-slate-100 animate-in fade-in zoom-in duration-200">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mb-3 border border-blue-100 shadow-inner">
            <svg viewBox="0 0 24 24" className="w-8 h-8">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 text-center">
            Sign in with Google
          </h2>
          <p className="text-sm text-slate-500 text-center mt-1">
            Safe & Passwordless Gmail Verification
          </p>
        </div>

        {/* Security Reassurance Banner */}
        <div className="mb-6 bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="text-xs text-emerald-800 leading-relaxed">
            <span className="font-bold">100% Safe Gmail Authentication:</span> You will never be asked for your password. Passwordless Google sign-in is guaranteed.
          </div>
        </div>

        {/* Primary Official Google Popup Button */}
        <div className="space-y-4">
          <Button 
            type="button" 
            onClick={() => triggerGooglePopup()}
            disabled={loading}
            className="w-full bg-white hover:bg-slate-50 text-slate-800 border-2 border-slate-200 hover:border-slate-300 rounded-xl py-6 font-bold flex items-center justify-center gap-3 shadow-md hover:shadow-lg transition-all"
          >
            <svg viewBox="0 0 24 24" className="w-6 h-6">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            {loading ? 'Verifying with Google...' : 'Sign in with Google Popup'}
          </Button>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-xs text-slate-400">
          <Lock className="w-3.5 h-3.5" />
          <span>Protected by Google Identity Services</span>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;





