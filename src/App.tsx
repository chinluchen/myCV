import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Mail, 
  ChevronRight, 
  Download,
  MapPin,
  Briefcase,
  User,
  Globe,
  LogIn,
  LogOut,
  Edit,
  Save,
  X,
  Plus,
  Trash2,
  Layout,
  Github
} from 'lucide-react';
import { cn } from './lib/utils';
import { useAuth } from './AuthContext';
import { 
  auth, 
  db, 
  signInWithEmailAndPassword, 
  signInWithPopup,
  githubProvider,
  signOut,
  doc,
  onSnapshot,
  updateDoc,
  collection,
  addDoc,
  deleteDoc,
  query,
  orderBy
} from './firebase';

// --- Types ---
interface ResumeData {
  name: string;
  title: string;
  location: string;
  email: string;
  phone: string;
  website: string;
  about: string;
}

interface Experience {
  id: string;
  company: string;
  role: string;
  period: string;
  description: string;
}

interface Project {
  id: string;
  title: string;
  description: string;
  tags: string[];
  link: string;
}

const DEFAULT_RESUME: ResumeData = {
  name: "陳慶儒",
  title: "全端工程師 / 使用者體驗設計師",
  location: "台灣, 台北",
  email: "chinlu0322@gmail.com",
  phone: "+886 912 345 678",
  website: "chinluchen.dev",
  about: "我是一位熱衷於打造直觀且高效數位產品的開發者。"
};

const SectionHeading = ({ children, icon: Icon }: { children: React.ReactNode, icon: any }) => (
  <div className="flex items-center gap-3 mb-8">
    <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white">
      <Icon size={20} />
    </div>
    <h2 className="text-3xl font-bold tracking-tight">{children}</h2>
  </div>
);

export default function App() {
  const { user, role, loading: authLoading } = useAuth();
  const isLoggedIn = !!user && role === 'admin';

  const [resume, setResume] = useState<ResumeData>(DEFAULT_RESUME);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<ResumeData>(DEFAULT_RESUME);
  
  const [showLogin, setShowLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // 1. 讀取雲端資料 (resume_data 集合)
  useEffect(() => {
    const unsubResume = onSnapshot(doc(db, 'resume_data', 'main'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as ResumeData;
        setResume(data);
        setEditData(data);
      }
    });

    const unsubExp = onSnapshot(query(collection(db, 'experience'), orderBy('period', 'desc')), (snap) => {
      setExperiences(snap.docs.map(d => ({ id: d.id, ...d.data() } as Experience)));
    });

    const unsubProj = onSnapshot(collection(db, 'projects'), (snap) => {
      setProjects(snap.docs.map(d => ({ id: d.id, ...d.data() } as Project)));
    });

    return () => { unsubResume(); unsubExp(); unsubProj(); };
  }, []);

  // 2. 實作 Email/Password 登入系統
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

  // 3. 實作後台編輯邏輯 (儲存功能)
  const handleSaveResume = async () => {
    try {
      await updateDoc(doc(db, 'resume_data', 'main'), { ...editData });
      setIsEditing(false);
    } catch (err) {
      console.error("Save failed:", err);
      alert("儲存失敗，請確認權限");
    }
  };

  if (authLoading) return <div className="min-h-screen flex items-center justify-center">載入中...</div>;

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

      {/* Navigation */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-white/70 backdrop-blur-xl border border-gray-200/50 rounded-full px-6 py-3 shadow-sm flex items-center gap-6">
        <div className="flex items-center gap-8">
          {['About', 'Experience', 'Projects'].map((item) => (
            <button key={item} onClick={() => document.getElementById(item.toLowerCase())?.scrollIntoView({ behavior: 'smooth' })} className="text-sm font-medium text-gray-500 hover:text-black">{item}</button>
          ))}
        </div>
        <div className="h-4 w-px bg-gray-200" />
        {user ? (
          <div className="flex items-center gap-3">
            {isLoggedIn && (
              <button onClick={() => setIsEditing(!isEditing)} className={cn("p-2 rounded-full", isEditing ? "bg-black text-white" : "hover:bg-gray-100")}>
                {isEditing ? <X size={18} /> : <Edit size={18} />}
              </button>
            )}
            <button onClick={() => signOut(auth)} className="text-gray-400 hover:text-red-500"><LogOut size={18} /></button>
          </div>
        ) : (
          <button onClick={() => setShowLogin(true)} className="text-gray-400 hover:text-black"><LogIn size={18} /></button>
        )}
      </nav>

      {/* Hero Section */}
      <header className="pt-32 pb-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row gap-12 items-center md:items-start">
            <div className="w-48 h-48 bg-gray-200 rounded-[3rem] overflow-hidden shadow-xl">
              <img src="https://picsum.photos/seed/profile/400/400" alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
            <div className="flex-1 text-center md:text-left">
              {isEditing ? (
                <div className="space-y-4">
                  <input className="text-5xl font-bold w-full bg-transparent border-b border-black outline-none" value={editData.name} onChange={e => setEditData({...editData, name: e.target.value})} />
                  <input className="text-2xl text-gray-500 w-full bg-transparent border-b border-gray-200 outline-none" value={editData.title} onChange={e => setEditData({...editData, title: e.target.value})} />
                  <button onClick={handleSaveResume} className="bg-black text-white px-6 py-2 rounded-lg flex items-center gap-2 mt-4"><Save size={16} /> 儲存變更</button>
                </div>
              ) : (
                <>
                  <h1 className="text-6xl md:text-7xl font-bold tracking-tighter mb-6">{resume.name}</h1>
                  <p className="text-2xl text-gray-500 font-medium mb-8">{resume.title}</p>
                  <div className="flex flex-wrap justify-center md:justify-start gap-6 text-gray-400">
                    <div className="flex items-center gap-2"><MapPin size={18} /> {resume.location}</div>
                    <div className="flex items-center gap-2"><Mail size={18} /> {resume.email}</div>
                    <div className="flex items-center gap-2"><Globe size={18} /> {resume.website}</div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 space-y-32 pb-32">
        <section id="about">
          <SectionHeading icon={User}>關於我</SectionHeading>
          {isEditing ? (
            <textarea className="w-full h-40 p-4 rounded-2xl border border-gray-200 outline-none" value={editData.about} onChange={e => setEditData({...editData, about: e.target.value})} />
          ) : (
            <p className="text-xl text-gray-600 leading-relaxed max-w-3xl">{resume.about}</p>
          )}
        </section>

        <section id="experience">
          <SectionHeading icon={Briefcase}>工作經歷</SectionHeading>
          <div className="space-y-12">
            {experiences.map((exp) => (
              <div key={exp.id} className="relative pl-8 border-l-2 border-gray-100">
                <div className="absolute -left-[9px] top-0 w-4 h-4 bg-black rounded-full border-4 border-white" />
                <div className="flex justify-between">
                  <h3 className="text-2xl font-bold">{exp.role}</h3>
                  {isLoggedIn && <button onClick={() => deleteDoc(doc(db, 'experience', exp.id))} className="text-red-400"><Trash2 size={18} /></button>}
                </div>
                <p className="text-lg text-gray-500">{exp.company} • {exp.period}</p>
                <p className="text-gray-600 mt-4">{exp.description}</p>
              </div>
            ))}
            {isLoggedIn && (
              <button onClick={() => addDoc(collection(db, 'experience'), { company: '新公司', role: '新職位', period: '2024', description: '描述' })} className="flex items-center gap-2 text-gray-400 hover:text-black"><Plus size={18} /> 新增經歷</button>
            )}
          </div>
        </section>

        <section id="projects">
          <SectionHeading icon={Layout}>精選專案</SectionHeading>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {projects.map((project) => (
              <div key={project.id} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm relative">
                {isLoggedIn && <button onClick={() => deleteDoc(doc(db, 'projects', project.id))} className="absolute top-6 right-6 text-red-400"><Trash2 size={16} /></button>}
                <h3 className="text-2xl font-bold mb-3">{project.title}</h3>
                <p className="text-gray-500 mb-6">{project.description}</p>
                <a href={project.link} className="inline-flex items-center gap-2 font-bold text-sm">查看詳情 <ChevronRight size={16} /></a>
              </div>
            ))}
            {isLoggedIn && (
              <button onClick={() => addDoc(collection(db, 'projects'), { title: '新專案', description: '描述', tags: ['React'], link: '#' })} className="border-2 border-dashed border-gray-200 rounded-[2.5rem] p-8 flex flex-col items-center justify-center text-gray-400 hover:border-black transition-all">
                <Plus size={32} className="mb-2" />
                <span className="font-bold">新增專案</span>
              </button>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
