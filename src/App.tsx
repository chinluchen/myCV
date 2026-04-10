import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LogIn,
  LogOut,
  Github,
  X,
  User
} from 'lucide-react';
import { useAuth } from './AuthContext';
import { 
  auth, 
  signInWithEmailAndPassword, 
  signInWithPopup,
  githubProvider,
  signOut
} from './firebase';
import { ResumeView } from './components/ResumeView';
import { AdminDashboard } from './components/AdminDashboard';

export default function App() {
  const { user, role, loading: authLoading } = useAuth();
  const isLoggedIn = !!user && role === 'admin';
  
  console.log("[App] State:", { user: user?.email, role, authLoading, isLoggedIn });
  const [showLogin, setShowLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setShowLogin(false);
      setEmail('');
      setPassword('');
    } catch (err: any) {
      setLoginError("登入失敗，請檢查帳號密碼");
    }
  };

  const handleGithubLogin = async () => {
    setLoginError('');
    try {
      await signInWithPopup(auth, githubProvider);
      setShowLogin(false);
    } catch (err: any) {
      console.error(err);
      setLoginError("GitHub 登入失敗，請確認 Firebase 設定");
    }
  };

  if (isLoggedIn) {
    return <AdminDashboard />;
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-black font-sans selection:bg-black selection:text-white">
      {/* Login Modal */}
      <AnimatePresence>
        {showLogin && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowLogin(false)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl">
              <h2 className="text-3xl font-bold mb-8">管理員登入</h2>
              <form onSubmit={handleLogin} className="space-y-6">
                <input type="email" placeholder="Email" required className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none" value={email} onChange={e => setEmail(e.target.value)} />
                <input type="password" placeholder="Password" required className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none" value={password} onChange={e => setPassword(e.target.value)} />
                {loginError && <p className="text-red-500 text-sm">{loginError}</p>}
                <button type="submit" className="w-full bg-black text-white py-4 rounded-xl font-bold">登入</button>
              </form>
              
              <div className="mt-6">
                <div className="relative flex items-center justify-center mb-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-100"></div>
                  </div>
                  <span className="relative px-4 bg-white text-xs text-gray-400 uppercase font-bold tracking-widest">或使用</span>
                </div>
                
                <button 
                  onClick={handleGithubLogin}
                  className="w-full border border-gray-200 py-4 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-gray-50 transition-colors"
                >
                  <Github size={20} /> 使用 GitHub 登入
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Navigation (Only show login button if not logged in) */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-white/70 backdrop-blur-xl border border-gray-200/50 rounded-full px-6 py-3 shadow-sm flex items-center gap-6">
        <div className="flex items-center gap-8">
          {['About', 'Experience', 'Projects'].map((item) => (
            <button key={item} onClick={() => document.getElementById(item.toLowerCase())?.scrollIntoView({ behavior: 'smooth' })} className="text-sm font-medium text-gray-500 hover:text-black">{item}</button>
          ))}
        </div>
        <div className="h-4 w-px bg-gray-200" />
        {authLoading ? (
          <div className="w-5 h-5 border-2 border-gray-200 border-t-gray-400 rounded-full animate-spin" />
        ) : user ? (
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">{role || 'User'}</span>
            <button onClick={() => signOut(auth)} className="text-gray-400 hover:text-red-500 flex items-center gap-2">
              <LogOut size={18} />
              <span className="text-xs font-bold uppercase tracking-wider">Logout</span>
            </button>
          </div>
        ) : (
          <button onClick={() => setShowLogin(true)} className="text-gray-400 hover:text-black flex items-center gap-2">
            <LogIn size={18} />
            <span className="text-xs font-bold uppercase tracking-wider">Login</span>
          </button>
        )}
      </nav>

      <ResumeView />

      {user && !isLoggedIn && !authLoading && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-white border border-gray-200 px-8 py-6 rounded-[2rem] shadow-2xl flex flex-col items-center gap-4 max-w-md w-full animate-in fade-in slide-in-from-bottom-4">
          <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600">
            <User size={24} />
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-gray-900">權限不足</p>
            <p className="text-sm text-gray-500 mt-1">
              您已登入，但目前的帳號尚未獲得管理員權限。
            </p>
          </div>
          <div className="w-full bg-gray-50 p-4 rounded-xl space-y-2">
            <div className="flex justify-between text-[10px] font-mono text-gray-400">
              <span>NAME:</span>
              <span className="text-gray-600">{user.displayName || "Not Set"}</span>
            </div>
            <div className="flex justify-between text-[10px] font-mono text-gray-400">
              <span>EMAIL:</span>
              <span className="text-gray-600">{user.email || "Hidden"}</span>
            </div>
            <div className="flex justify-between text-[10px] font-mono text-gray-400">
              <span>UID:</span>
              <span className="text-gray-600">{user.uid}</span>
            </div>
          </div>
          <div className="flex gap-3 w-full">
            <button onClick={() => signOut(auth)} className="flex-1 bg-black text-white py-3 rounded-xl font-bold text-sm">登出帳號</button>
            <button onClick={() => setShowLogin(false)} className="flex-1 border border-gray-200 py-3 rounded-xl font-bold text-sm text-gray-500">關閉</button>
          </div>
        </div>
      )}
    </div>
  );
}
