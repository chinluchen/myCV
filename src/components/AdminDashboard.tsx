import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Save, 
  LogOut, 
  User, 
  Briefcase, 
  Layout, 
  Plus, 
  Trash2,
  ChevronLeft,
  Globe,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { cn } from '../lib/utils';
import { 
  db, 
  doc, 
  onSnapshot, 
  setDoc, 
  collection, 
  addDoc, 
  deleteDoc, 
  query, 
  orderBy,
  getDocFromServer,
  handleFirestoreError,
  OperationType
} from '../firebase';
import { useAuth } from '../AuthContext';

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

export const AdminDashboard: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const { logout } = useAuth();
  const [resume, setResume] = useState<ResumeData | null>(null);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'about' | 'experience' | 'projects'>('about');
  
  // Toast state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const unsubResume = onSnapshot(doc(db, 'resume_data', 'main'), (docSnap) => {
      if (docSnap.exists()) {
        setResume(docSnap.data() as ResumeData);
      }
      setLoading(false);
    }, (err) => {
      console.error("Resume snapshot error:", err);
      setLoading(false);
    });

    const unsubExp = onSnapshot(query(collection(db, 'experience'), orderBy('period', 'desc')), (snap) => {
      setExperiences(snap.docs.map(d => ({ id: d.id, ...d.data() } as Experience)));
    });

    const unsubProj = onSnapshot(collection(db, 'projects'), (snap) => {
      setProjects(snap.docs.map(d => ({ id: d.id, ...d.data() } as Project)));
    });

    return () => { unsubResume(); unsubExp(); unsubProj(); };
  }, []);

  const handleSaveAbout = async () => {
    if (!resume) return;
    const path = 'resume_data/main';
    try {
      await setDoc(doc(db, 'resume_data', 'main'), resume);
      console.log('資料已成功存入資料庫 (resume_data/main)');
      // 強制從伺服器讀取一次以驗證權限與寫入
      await getDocFromServer(doc(db, 'resume_data', 'main'));
      showToast("「關於我」已更新！");
    } catch (err) {
      console.error('儲存失敗:', err);
      handleFirestoreError(err, OperationType.WRITE, path);
      showToast("儲存失敗：權限不足或網路錯誤", "error");
    }
  };

  const handleSaveExperience = async (id: string) => {
    const exp = experiences.find(e => e.id === id);
    if (!exp) return;
    const path = `experience/${id}`;
    try {
      const { id: _, ...data } = exp;
      await setDoc(doc(db, 'experience', id), data);
      console.log(`資料已成功存入資料庫 (experience/${id})`);
      await getDocFromServer(doc(db, 'experience', id));
      showToast("經歷已儲存");
    } catch (err) {
      console.error('儲存失敗:', err);
      handleFirestoreError(err, OperationType.WRITE, path);
      showToast("儲存失敗", "error");
    }
  };

  const handleSaveProject = async (id: string) => {
    const proj = projects.find(p => p.id === id);
    if (!proj) return;
    const path = `projects/${id}`;
    try {
      const { id: _, ...data } = proj;
      await setDoc(doc(db, 'projects', id), data);
      console.log(`資料已成功存入資料庫 (projects/${id})`);
      await getDocFromServer(doc(db, 'projects', id));
      showToast("專案已儲存");
    } catch (err) {
      console.error('儲存失敗:', err);
      handleFirestoreError(err, OperationType.WRITE, path);
      showToast("儲存失敗", "error");
    }
  };

  const handleAddExperience = async () => {
    try {
      await addDoc(collection(db, 'experience'), {
        company: '新公司',
        role: '新職位',
        period: '2024 - Present',
        description: '請輸入工作描述...'
      });
      showToast("已新增經歷");
    } catch (err) {
      showToast("新增失敗", "error");
    }
  };

  const handleAddProject = async () => {
    try {
      await addDoc(collection(db, 'projects'), {
        title: '新專案',
        description: '專案描述...',
        tags: ['React', 'Tailwind'],
        link: '#'
      });
      showToast("已初始化新專案");
    } catch (err) {
      showToast("新增失敗", "error");
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">載入後台資料中...</div>;

  return (
    <div className="min-h-screen bg-[#E4E3E0] text-[#141414] font-mono selection:bg-[#141414] selection:text-[#E4E3E0] flex">
      {/* Sidebar - Technical Style */}
      <aside className="w-72 bg-[#E4E3E0] border-r border-[#141414] flex flex-col">
        <div className="p-8 border-b border-[#141414]">
          <h1 className="text-xs font-bold tracking-[0.2em] uppercase flex items-center gap-3">
            <div className="w-2 h-2 bg-[#141414] animate-pulse" />
            Control Panel v1.0
          </h1>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {[
            { id: 'about', label: '01_ABOUT_ME', icon: User },
            { id: 'experience', label: '02_EXPERIENCE', icon: Briefcase },
            { id: 'projects', label: '03_PROJECTS', icon: Layout }
          ].map((tab) => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "w-full flex items-center justify-between px-4 py-3 text-xs font-bold tracking-wider transition-all border border-transparent",
                activeTab === tab.id 
                  ? "bg-[#141414] text-[#E4E3E0] border-[#141414]" 
                  : "text-[#141414]/60 hover:border-[#141414]/20"
              )}
            >
              <div className="flex items-center gap-3">
                <tab.icon size={14} />
                {tab.label}
              </div>
              {activeTab === tab.id && <ChevronLeft size={14} className="rotate-180" />}
            </button>
          ))}
        </nav>
        <div className="p-6 border-t border-[#141414] space-y-3">
          <div className="text-[10px] text-[#141414]/40 mb-4">
            SYSTEM_STATUS: <span className="text-green-600">ONLINE</span><br />
            AUTH_LEVEL: <span className="text-red-600">ADMIN_ROOT</span>
          </div>
          <button 
            onClick={() => onBack?.()}
            className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-bold border border-[#141414] hover:bg-[#141414] hover:text-[#E4E3E0] transition-all uppercase tracking-widest"
          >
            <ChevronLeft size={14} /> Back to Site
          </button>
          <button 
            onClick={() => window.open('/', '_blank')}
            className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-bold border border-[#141414] hover:bg-[#141414] hover:text-[#E4E3E0] transition-all uppercase tracking-widest"
          >
            <Globe size={14} /> View Live Site (New Tab)
          </button>
          <button 
            onClick={() => logout()}
            className="w-full flex items-center gap-3 px-4 py-3 text-[10px] font-bold border border-red-600 text-red-600 hover:bg-red-600 hover:text-white transition-all uppercase tracking-widest"
          >
            <LogOut size={14} /> Terminate Session
          </button>
        </div>
      </aside>

      {/* Main Content - Data Grid Style */}
      <main className="flex-1 p-12 overflow-y-auto bg-white/50">
        <div className="max-w-4xl mx-auto">
          {activeTab === 'about' && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <header className="mb-12 flex justify-between items-end border-b border-[#141414] pb-8">
                <div>
                  <h2 className="font-serif italic text-4xl mb-2">About_Me.config</h2>
                  <p className="text-xs text-[#141414]/50 tracking-widest uppercase">Modify core identity parameters</p>
                </div>
                <button 
                  onClick={handleSaveAbout}
                  className="bg-[#141414] text-[#E4E3E0] px-8 py-4 text-xs font-bold tracking-[0.2em] uppercase hover:opacity-90 transition-all flex items-center gap-3"
                >
                  <Save size={16} /> Execute_Save
                </button>
              </header>

              {resume && (
                <div className="grid grid-cols-1 gap-12">
                  <div className="space-y-8">
                    <div className="grid grid-cols-2 gap-12">
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold text-[#141414]/40 uppercase tracking-[0.2em]">Parameter: Name</label>
                        <input 
                          className="w-full bg-transparent border-b border-[#141414]/10 focus:border-[#141414] py-2 text-lg outline-none transition-all"
                          value={resume.name}
                          onChange={e => setResume({...resume, name: e.target.value})}
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold text-[#141414]/40 uppercase tracking-[0.2em]">Parameter: Title</label>
                        <input 
                          className="w-full bg-transparent border-b border-[#141414]/10 focus:border-[#141414] py-2 text-lg outline-none transition-all"
                          value={resume.title}
                          onChange={e => setResume({...resume, title: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-12">
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold text-[#141414]/40 uppercase tracking-[0.2em]">Loc: Location</label>
                        <input 
                          className="w-full bg-transparent border-b border-[#141414]/10 focus:border-[#141414] py-2 text-sm outline-none transition-all"
                          value={resume.location}
                          onChange={e => setResume({...resume, location: e.target.value})}
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold text-[#141414]/40 uppercase tracking-[0.2em]">Net: Email</label>
                        <input 
                          className="w-full bg-transparent border-b border-[#141414]/10 focus:border-[#141414] py-2 text-sm outline-none transition-all"
                          value={resume.email}
                          onChange={e => setResume({...resume, email: e.target.value})}
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold text-[#141414]/40 uppercase tracking-[0.2em]">Web: Website</label>
                        <input 
                          className="w-full bg-transparent border-b border-[#141414]/10 focus:border-[#141414] py-2 text-sm outline-none transition-all"
                          value={resume.website}
                          onChange={e => setResume({...resume, website: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] font-bold text-[#141414]/40 uppercase tracking-[0.2em]">Data: Biography</label>
                      <textarea 
                        className="w-full h-64 bg-[#141414]/5 p-6 text-sm leading-relaxed outline-none border border-transparent focus:border-[#141414]/10 transition-all resize-none"
                        value={resume.about}
                        onChange={e => setResume({...resume, about: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'experience' && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <header className="mb-12 flex justify-between items-end border-b border-[#141414] pb-8">
                <div>
                  <h2 className="font-serif italic text-4xl mb-2">Experience_Log.db</h2>
                  <p className="text-xs text-[#141414]/50 tracking-widest uppercase">Manage professional timeline entries</p>
                </div>
                <button 
                  onClick={handleAddExperience}
                  className="bg-[#141414] text-[#E4E3E0] px-8 py-4 text-xs font-bold tracking-[0.2em] uppercase hover:opacity-90 transition-all flex items-center gap-3"
                >
                  <Plus size={16} /> Append_Entry
                </button>
              </header>

              <div className="space-y-1">
                {experiences.map(exp => (
                  <div key={exp.id} className="group flex flex-col gap-4 p-8 border border-[#141414]/10 hover:border-[#141414] transition-all bg-white/30">
                    <div className="flex gap-8">
                      <div className="w-32 pt-1 text-[10px] font-bold text-[#141414]/40 tracking-tighter">
                        <input 
                          className="bg-transparent outline-none w-full border-b border-transparent focus:border-[#141414]/20"
                          value={exp.period}
                          onChange={e => setExperiences(prev => prev.map(item => item.id === exp.id ? { ...item, period: e.target.value } : item))}
                        />
                      </div>
                      <div className="flex-1 space-y-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1 space-y-1">
                            <input 
                              className="text-xl font-bold bg-transparent outline-none w-full border-b border-transparent focus:border-[#141414]/20"
                              value={exp.role}
                              onChange={e => setExperiences(prev => prev.map(item => item.id === exp.id ? { ...item, role: e.target.value } : item))}
                            />
                            <input 
                              className="text-xs italic font-serif text-[#141414]/60 bg-transparent outline-none w-full border-b border-transparent focus:border-[#141414]/20"
                              value={exp.company}
                              onChange={e => setExperiences(prev => prev.map(item => item.id === exp.id ? { ...item, company: e.target.value } : item))}
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => handleSaveExperience(exp.id)}
                              className="p-2 text-[#141414] hover:bg-[#141414] hover:text-[#E4E3E0] transition-all rounded-lg"
                              title="Save Changes"
                            >
                              <Save size={14} />
                            </button>
                            <button 
                              onClick={() => deleteDoc(doc(db, 'experience', exp.id))}
                              className="p-2 text-red-600 hover:bg-red-50 transition-all rounded-lg"
                              title="Delete Entry"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                        <textarea 
                          className="w-full bg-transparent text-sm leading-relaxed outline-none border-l border-[#141414]/10 pl-4 focus:border-[#141414] transition-all resize-none h-24"
                          value={exp.description}
                          onChange={e => setExperiences(prev => prev.map(item => item.id === exp.id ? { ...item, description: e.target.value } : item))}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'projects' && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <header className="mb-12 flex justify-between items-end border-b border-[#141414] pb-8">
                <div>
                  <h2 className="font-serif italic text-4xl mb-2">Project_Archive.idx</h2>
                  <p className="text-xs text-[#141414]/50 tracking-widest uppercase">Curate featured work and repositories</p>
                </div>
                <button 
                  onClick={handleAddProject}
                  className="bg-[#141414] text-[#E4E3E0] px-8 py-4 text-xs font-bold tracking-[0.2em] uppercase hover:opacity-90 transition-all flex items-center gap-3"
                >
                  <Plus size={16} /> Initialize_Project
                </button>
              </header>

              <div className="grid grid-cols-1 gap-1">
                {projects.map(project => (
                  <div key={project.id} className="group p-8 border border-[#141414]/10 hover:border-[#141414] transition-all bg-white/30 space-y-6">
                    <div className="flex justify-between items-start">
                      <input 
                        className="text-2xl font-bold bg-transparent outline-none w-full border-b border-transparent focus:border-[#141414]/20"
                        value={project.title}
                        onChange={e => setProjects(prev => prev.map(item => item.id === project.id ? { ...item, title: e.target.value } : item))}
                      />
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleSaveProject(project.id)}
                          className="p-2 text-[#141414] hover:bg-[#141414] hover:text-[#E4E3E0] transition-all rounded-lg"
                          title="Save Project"
                        >
                          <Save size={16} />
                        </button>
                        <button 
                          onClick={() => deleteDoc(doc(db, 'projects', project.id))}
                          className="p-2 text-red-600 hover:bg-red-50 transition-all rounded-lg"
                          title="Delete Project"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <textarea 
                      className="w-full bg-transparent text-sm leading-relaxed outline-none border-l border-[#141414]/10 pl-4 focus:border-[#141414] transition-all resize-none h-24"
                      value={project.description}
                      onChange={e => setProjects(prev => prev.map(item => item.id === project.id ? { ...item, description: e.target.value } : item))}
                    />
                    <div className="flex items-center gap-4 text-[10px] font-bold text-[#141414]/40 uppercase tracking-widest">
                      <span>URL_LINK:</span>
                      <input 
                        className="flex-1 bg-transparent outline-none text-[#141414] border-b border-transparent focus:border-[#141414]/20"
                        value={project.link}
                        onChange={e => setProjects(prev => prev.map(item => item.id === project.id ? { ...item, link: e.target.value } : item))}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 50, x: '-50%' }}
            className={cn(
              "fixed bottom-8 left-1/2 z-[200] px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 text-xs font-bold tracking-widest uppercase",
              toast.type === 'success' ? "bg-[#141414] text-[#E4E3E0]" : "bg-red-600 text-white"
            )}
          >
            {toast.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
