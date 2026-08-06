import React, { useState } from 'react';
import { X, Eye, EyeOff } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useUser } from '@/context/UserContext';
import { toast } from 'sonner';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [view, setView] = useState<'login' | 'register' | 'forgot' | 'reset' | 'google'>('login');
  const { login, register, googleLogin, forgotPassword, resetPassword } = useUser();
  const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '', token: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  if (!isOpen) return null;

  const handleModalClose = () => {
    setView('login');
    setFormData({ name: '', email: '', password: '', phone: '', token: '' });
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.phone && !/^\+?[\d\s-]{10,15}$/.test(formData.phone)) {
      toast.error('Please enter a valid phone number');
      return;
    }
    
    setLoading(true);
    try {
      const cleanEmail = formData.email.trim().toLowerCase();
      if (view === 'login') {
        await login(cleanEmail, formData.password, formData.phone);
        handleModalClose();
      } else if (view === 'register') {
        await register(formData.name, cleanEmail, formData.password, formData.phone);
        handleModalClose();
      } else if (view === 'google') {
        if (!cleanEmail.includes('gmail.com')) {
          toast.error('Please enter a valid Gmail address (@gmail.com)');
          setLoading(false);
          return;
        }
        await googleLogin(cleanEmail, formData.phone);
        handleModalClose();
      } else if (view === 'forgot') {
        const mockToken = await forgotPassword(cleanEmail);
        setFormData(prev => ({ ...prev, token: mockToken || '' }));
        setView('reset');
      } else if (view === 'reset') {
        await resetPassword(cleanEmail || formData.token, formData.password);
        setView('login');
        handleModalClose();
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Authentication failed';
      toast.error(errorMsg);
      if (errorMsg.toLowerCase().includes('account not found') && view === 'login') {
        setView('register');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl p-8 w-full max-w-md relative shadow-2xl animate-in fade-in zoom-in duration-200">
        <button 
          onClick={handleModalClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        
        <h2 className="text-2xl font-bold text-blue-950 mb-6 text-center flex items-center justify-center gap-2">
          {view === 'google' ? (
            <>
              <svg viewBox="0 0 24 24" className="w-6 h-6">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Google Sign-In
            </>
          ) : view === 'login' ? 'Welcome Back' : 
           view === 'register' ? 'Create Account' : 
           view === 'forgot' ? 'Reset Password' : 'New Password'}
        </h2>

        {(view === 'login' || view === 'register') && (
          <>
            <Button 
              type="button"
              onClick={() => setView('google')}
              disabled={loading}
              className="w-full bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl py-6 font-bold flex items-center justify-center gap-3 mb-6"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </Button>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-slate-500">Or continue with email</span>
              </div>
            </div>
          </>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {view === 'register' && (
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input 
                id="name" 
                required 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                placeholder="John Doe" 
                className="rounded-xl"
              />
            </div>
          )}

          {view === 'google' && (
            <p className="text-xs text-slate-500 text-center mb-4">
              Enter your Google Gmail and Password to sign in securely.
            </p>
          )}

          {(view === 'login' || view === 'register' || view === 'forgot' || view === 'reset' || view === 'google') && (
            <div className="space-y-2">
              <Label htmlFor="email">{view === 'google' ? 'Gmail Address' : 'Email'}</Label>
              <Input 
                id="email" 
                type="email" 
                required 
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                placeholder={view === 'google' ? "your.name@gmail.com" : "john@example.com"}
                className="rounded-xl"
              />
            </div>
          )}

          {(view === 'login' || view === 'register' || view === 'google') && (
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number (Optional)</Label>
              <Input 
                id="phone" 
                type="tel" 
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
                placeholder="+1 234 567 8900" 
                className="rounded-xl"
              />
            </div>
          )}

          {(view === 'login' || view === 'register' || view === 'reset' || view === 'google') && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="password">{view === 'google' ? 'Google Password' : view === 'reset' ? 'New Password' : 'Password'}</Label>
                {view === 'login' && (
                  <button type="button" onClick={() => setView('forgot')} className="text-xs text-blue-600 font-bold hover:underline">
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Input 
                  id="password" 
                  type={showPassword ? 'text' : 'password'} 
                  required 
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                  placeholder="••••••••" 
                  className="rounded-xl pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          )}
          
          <Button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-6 mt-4 font-bold transition-all"
          >
            {loading ? 'Please wait...' : (
              view === 'google' ? 'Sign In with Google' :
              view === 'login' ? 'Login' : 
              view === 'register' ? 'Sign Up' : 
              view === 'forgot' ? 'Send Reset Link' : 'Reset Password'
            )}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-600">
          {(view === 'login' || view === 'register') ? (
            <>
              {view === 'login' ? "Don't have an account? " : "Already have an account? "}
              <button 
                type="button"
                onClick={() => setView(view === 'login' ? 'register' : 'login')}
                className="text-blue-600 font-bold hover:underline"
              >
                {view === 'login' ? 'Sign up here' : 'Login here'}
              </button>
            </>
          ) : (
            <button 
              type="button"
              onClick={() => setView('login')}
              className="text-blue-600 font-bold hover:underline"
            >
              Back to Login
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
