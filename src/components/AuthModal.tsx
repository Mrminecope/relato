import { useState } from 'react';
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { setCachedOAuthToken } from '../lib/gmail';
import { RelatoLogo } from '../components/RelatoLogo';
import { GoogleAuthProvider } from 'firebase/auth';
import { ArrowLeft, Shield, Mail, Lock, Sparkles, CheckCircle2 } from 'lucide-react';

interface AuthModalProps {
  initialMode: 'login' | 'signup';
  onClose: () => void;
  onSuccess: (userId: string, email?: string) => void;
}

export function AuthModal({ initialMode, onClose, onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await signInWithPopup(auth, googleProvider);
      if (res.user) {
        // Cache OAuth token securely in memory for Gmail API operations
        const credential = GoogleAuthProvider.credentialFromResult(res);
        if (credential?.accessToken) {
          setCachedOAuthToken(credential.accessToken, 3600);
        }
        onSuccess(res.user.uid, res.user.email || undefined);
      }
    } catch (err: any) {
      console.error('Google Sign In error:', err);
      setError(err.message || 'Failed to sign in with Google. Please try email/password.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      if (mode === 'signup') {
        const res = await createUserWithEmailAndPassword(auth, email, password);
        onSuccess(res.user.uid, res.user.email || undefined);
      } else {
        const res = await signInWithEmailAndPassword(auth, email, password);
        onSuccess(res.user.uid, res.user.email || undefined);
      }
    } catch (err: any) {
      console.error('Email Auth error:', err);
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="bg-[#FAF8F5] w-full max-w-md rounded-3xl border border-[#E8E1D7] shadow-2xl p-7 sm:p-9 relative animate-in fade-in zoom-in-95 duration-200">
        
        {/* Back / Close button */}
        <button
          onClick={onClose}
          className="absolute top-6 left-6 p-2 rounded-full hover:bg-[#EFEAE2] text-[#635C54] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <div className="text-center pt-2 mb-7">
          <div className="flex justify-center mb-3">
            <RelatoLogo className="h-8" textClassName="text-2xl font-semibold" />
          </div>
          <h2 className="text-xl font-medium text-[#292929]">
            {mode === 'signup' ? 'Begin Your Anonymous Discovery' : 'Welcome Back to Relato'}
          </h2>
          <p className="text-xs text-[#7B736A] mt-1.5">
            {mode === 'signup'
              ? 'Your private identity stays safeguarded in Firestore. You will craft an anonymous alias in the next step.'
              : 'Sign in to access your mutual connections and pending requests.'}
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-xl bg-red-50/80 border border-red-200 text-xs text-red-700 leading-relaxed">
            {error}
          </div>
        )}

        {/* Google One-Click Button */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-white hover:bg-[#F4EFEA] text-[#2E2E2E] border border-[#D9D1C6] py-3 px-4 rounded-xl text-sm font-medium transition-all shadow-2xs cursor-pointer disabled:opacity-50 mb-4"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        <div className="flex items-center my-4">
          <div className="flex-1 border-t border-[#E5DED5]"></div>
          <span className="px-3 text-[11px] uppercase tracking-wider text-[#9C948B]">or email</span>
          <div className="flex-1 border-t border-[#E5DED5]"></div>
        </div>

        {/* Email & Password Form */}
        <form onSubmit={handleEmailAuth} className="space-y-3.5">
          <div>
            <label className="block text-xs font-medium text-[#575048] mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#9C948B] absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-[#DDD5CB] rounded-xl text-sm text-[#2B2B2B] placeholder:text-[#AAA299] focus:outline-hidden focus:border-[#2B2B2B] focus:ring-1 focus:ring-[#2B2B2B]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#575048] mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#9C948B] absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-[#DDD5CB] rounded-xl text-sm text-[#2B2B2B] placeholder:text-[#AAA299] focus:outline-hidden focus:border-[#2B2B2B] focus:ring-1 focus:ring-[#2B2B2B]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#2B2B2B] hover:bg-[#1A1A1A] text-white py-3 rounded-xl text-sm font-medium transition-all shadow-xs cursor-pointer disabled:opacity-50 mt-1"
          >
            {loading ? 'Authenticating...' : mode === 'signup' ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        {/* Switch mode */}
        <div className="text-center mt-5">
          <button
            onClick={() => {
              setMode(mode === 'signup' ? 'login' : 'signup');
              setError(null);
            }}
            className="text-xs text-[#6B635A] hover:text-[#2B2B2B] underline decoration-[#CCC4BA] cursor-pointer"
          >
            {mode === 'signup'
              ? 'Already registered? Sign in here'
              : "Don't have an account yet? Create one"}
          </button>
        </div>

      </div>
    </div>
  );
}
