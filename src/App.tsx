import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Github, 
  Linkedin, 
  Mail, 
  ExternalLink, 
  ChevronRight, 
  Download,
  MapPin,
  Briefcase,
  GraduationCap,
  Code2,
  User,
  Phone,
  Globe,
  LogIn,
  LogOut,
  Edit,
  Save,
  X,
  Plus,
  Trash2
} from 'lucide-react';
import { cn, OperationType, handleFirestoreError } from './lib/utils';
import { useAuth } from './AuthContext';
import { auth, db, googleProvider } from './firebase';
import { signInWithPopup, signOut } from 'firebase/auth';
import { 
  doc, 
  onSnapshot, 
  setDoc, 
  collection, 
  query, 
  orderBy, 
  addDoc, 
  deleteDoc,
  updateDoc
} from 'firebase/firestore';

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
  achievements: string[];
}

interface Project {
  id: string;
  title: string;
  description: string;
  tags: string[];
  link: string;
}

// --- Default Data ---
const DEFAULT_RESUME: ResumeData = {
  name: "陳慶儒",
  title: "全端工程師 / 使用者體驗設計師",
  location: "台灣, 台北",
  email: "your.email@example.com",
  phone: "+886 912 345 678",
  website: "chinluchen.dev",
  about: "我是一位熱衷於打造直觀且高效數位產品的開發者。擁有 5 年以上在網頁開發與 UI/UX 設計方面的經驗。"
};

// --- Components ---

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
  const [resume, setResume] = useState<ResumeData>(DEFAULT_RESUME);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<ResumeData>(DEFAULT_RESUME);

  // Fetch Data
  useEffect(() => {
    const unsubResume = onSnapshot(doc(db, 'content', 'resume'), (doc) => {
      if (doc.exists()) {
        setResume(doc.data() as ResumeData);
        setEditData(doc.data() as ResumeData);
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

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error(err);
      alert("登入失敗，請確認網域授權設定");
    }
  };

  const handleSaveResume = async () => {
    try {
      await setDoc(doc(db, 'content', 'resume'), editData);
      setIsEditing(false);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'content/resume');
    }
  };

  if (authLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-black font-sans selection:bg-black selection:text-white">
      {/* Navigation */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-white/70 backdrop-blur-xl border border-gray-200/50 rounded-full px-6 py-3 shadow-sm flex items-center gap-6">
        <div className="flex items-center gap-8">
          {['About', 'Experience', 'Projects', 'Contact'].map((item) => (
            <button
              key={item}
              onClick={() => document.getElementById(item.toLowerCase())?.scrollIntoView({ behavior: 'smooth' })}
              className="text-sm font-medium text-gray-500 hover:text-black transition-colors"
            >
              {item}
            </button>
          ))}
        </div>
        <div className="h-4 w-px bg-gray-200" />
        {user ? (
          <div className="flex items-center gap-3">
            {role === 'admin' && (
              <button 
                onClick={() => setIsEditing(!isEditing)}
                className={cn("p-2 rounded-full transition-colors", isEditing ? "bg-black text-white" : "hover:bg-gray-100")}
              >
                {isEditing ? <X size={18} /> : <Edit size={18} />}
              </button>
            )}
            <button onClick={() => signOut(auth)} className="text-gray-400 hover:text-red-500 transition-colors">
              <LogOut size={18} />
            </button>
          </div>
        ) : (
          <button onClick={handleLogin} className="text-gray-400 hover:text-black transition-colors">
            <LogIn size={18} />
          </button>
        )}
      </nav>

      {/* Hero Section */}
      <header className="pt-32 pb-20 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row gap-12 items-center md:items-start"
          >
            <div className="w-48 h-48 bg-gray-200 rounded-[3rem] overflow-hidden rotate-3 hover:rotate-0 transition-transform duration-500 shadow-xl">
              <img src="https://picsum.photos/seed/profile/400/400" alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
            <div className="flex-1 text-center md:text-left">
              {isEditing ? (
                <div className="space-y-4">
                  <input 
                    className="text-5xl font-bold w-full bg-transparent border-b border-black outline-none"
                    value={editData.name}
                    onChange={e => setEditData({...editData, name: e.target.value})}
                  />
                  <input 
                    className="text-2xl text-gray-500 w-full bg-transparent border-b border-gray-200 outline-none"
                    value={editData.title}
                    onChange={e => setEditData({...editData, title: e.target.value})}
                  />
                  <div className="flex gap-2 pt-4">
                    <button onClick={handleSaveResume} className="bg-black text-white px-4 py-2 rounded-lg flex items-center gap-2">
                      <Save size={16} /> Save Changes
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h1 className="text-6xl md:text-7xl font-bold tracking-tighter leading-none mb-6">{resume.name}</h1>
                  <p className="text-2xl text-gray-500 font-medium mb-8">{resume.title}</p>
                  <div className="flex flex-wrap justify-center md:justify-start gap-6 text-gray-400">
                    <div className="flex items-center gap-2"><MapPin size={18} /> {resume.location}</div>
                    <div className="flex items-center gap-2"><Mail size={18} /> {resume.email}</div>
                    <div className="flex items-center gap-2"><Globe size={18} /> {resume.website}</div>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 space-y-32 pb-32">
        {/* About */}
        <section id="about" className="scroll-mt-32">
          <SectionHeading icon={User}>關於我</SectionHeading>
          {isEditing ? (
            <textarea 
              className="w-full h-40 p-4 rounded-2xl border border-gray-200 outline-none"
              value={editData.about}
              onChange={e => setEditData({...editData, about: e.target.value})}
            />
          ) : (
            <p className="text-xl text-gray-600 leading-relaxed max-w-3xl">{resume.about}</p>
          )}
        </section>

        {/* Experience */}
        <section id="experience" className="scroll-mt-32">
          <SectionHeading icon={Briefcase}>工作經歷</SectionHeading>
          <div className="space-y-12">
            {experiences.map((exp, idx) => (
              <div key={exp.id} className="relative pl-8 border-l-2 border-gray-100">
                <div className="absolute -left-[9px] top-0 w-4 h-4 bg-black rounded-full border-4 border-white" />
                <div className="flex justify-between">
                  <h3 className="text-2xl font-bold">{exp.role}</h3>
                  {role === 'admin' && (
                    <button onClick={() => deleteDoc(doc(db, 'experience', exp.id))} className="text-red-400 hover:text-red-600">
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
                <p className="text-lg text-gray-500">{exp.company} • {exp.period}</p>
                <p className="text-gray-600 mt-4">{exp.description}</p>
              </div>
            ))}
            {role === 'admin' && (
              <button 
                onClick={() => addDoc(collection(db, 'experience'), { company: 'New Company', role: 'New Role', period: '2024', description: 'Description', achievements: [] })}
                className="flex items-center gap-2 text-gray-400 hover:text-black transition-colors font-medium"
              >
                <Plus size={18} /> Add Experience
              </button>
            )}
          </div>
        </section>

        {/* Projects */}
        <section id="projects" className="scroll-mt-32">
          <SectionHeading icon={Layout}>精選專案</SectionHeading>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {projects.map((project) => (
              <div key={project.id} className="group bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all relative">
                {role === 'admin' && (
                  <button onClick={() => deleteDoc(doc(db, 'projects', project.id))} className="absolute top-6 right-6 text-red-400">
                    <Trash2 size={16} />
                  </button>
                )}
                <h3 className="text-2xl font-bold mb-3">{project.title}</h3>
                <p className="text-gray-500 mb-6">{project.description}</p>
                <div className="flex gap-2 mb-6">
                  {project.tags.map(tag => <span key={tag} className="text-[10px] font-bold uppercase tracking-widest text-gray-400 bg-gray-50 px-2 py-1 rounded">{tag}</span>)}
                </div>
                <a href={project.link} className="inline-flex items-center gap-2 font-bold text-sm hover:gap-3 transition-all">
                  查看詳情 <ChevronRight size={16} />
                </a>
              </div>
            ))}
            {role === 'admin' && (
              <button 
                onClick={() => addDoc(collection(db, 'projects'), { title: 'New Project', description: 'Description', tags: ['React'], link: '#' })}
                className="border-2 border-dashed border-gray-200 rounded-[2.5rem] p-8 flex flex-col items-center justify-center text-gray-400 hover:border-black hover:text-black transition-all"
              >
                <Plus size={32} className="mb-2" />
                <span className="font-bold">Add New Project</span>
              </button>
            )}
          </div>
        </section>

        {/* Contact */}
        <section id="contact" className="scroll-mt-32">
          <div className="bg-black text-white p-12 md:p-20 rounded-[3rem] text-center">
            <h2 className="text-4xl md:text-6xl font-bold mb-8 tracking-tight">準備好開始合作了嗎？</h2>
            <div className="flex flex-wrap justify-center gap-4">
              <a href={`mailto:${resume.email}`} className="bg-white text-black px-8 py-4 rounded-full font-bold flex items-center gap-2 hover:scale-105 transition-transform">
                發送郵件 <Mail size={20} />
              </a>
              <button className="bg-white/10 backdrop-blur-md text-white px-8 py-4 rounded-full font-bold flex items-center gap-2 hover:bg-white/20 transition-all">
                下載履歷 <Download size={20} />
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-12 border-t border-gray-100 bg-white">
        <div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8 text-sm text-gray-400">
          <div>© 2026 {resume.name}. Built with React & Firebase.</div>
          <div className="flex gap-8">
            <a href="#" className="hover:text-black transition-colors">Github</a>
            <a href="#" className="hover:text-black transition-colors">LinkedIn</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

import { Layout } from 'lucide-react';
