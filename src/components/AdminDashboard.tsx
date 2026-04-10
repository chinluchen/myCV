import React, { useState, useEffect } from 'react';
import { 
  Save, 
  LogOut, 
  User, 
  Briefcase, 
  Layout, 
  Plus, 
  Trash2,
  ChevronLeft,
  Globe
} from 'lucide-react';
import { cn } from '../lib/utils';
import { db, auth, signOut, doc, onSnapshot, setDoc, collection, addDoc, deleteDoc, query, orderBy } from '../firebase';

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

export const AdminDashboard: React.FC = () => {
  const [resume, setResume] = useState<ResumeData | null>(null);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'about' | 'experience' | 'projects'>('about');

  useEffect(() => {
    const unsubResume = onSnapshot(doc(db, 'resume_data', 'main'), (docSnap) => {
      if (docSnap.exists()) {
        setResume(docSnap.data() as ResumeData);
      }
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
    try {
      await setDoc(doc(db, 'resume_data', 'main'), resume, { merge: true });
      alert("「關於我」已更新！");
    } catch (err) {
      alert("儲存失敗");
    }
  };

  const handleAddExperience = async () => {
    await addDoc(collection(db, 'experience'), {
      company: '新公司',
      role: '新職位',
      period: '2024 - Present',
      description: '請輸入工作描述...'
    });
  };

  const handleAddProject = async () => {
    await addDoc(collection(db, 'projects'), {
      title: '新專案',
      description: '專案描述...',
      tags: ['React', 'Tailwind'],
      link: '#'
    });
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">載入後台資料中...</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Layout size={20} /> 後台管理
          </h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => setActiveTab('about')}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all",
              activeTab === 'about' ? "bg-black text-white shadow-lg shadow-black/10" : "text-gray-500 hover:bg-gray-100"
            )}
          >
            <User size={18} /> 編輯關於我
          </button>
          <button 
            onClick={() => setActiveTab('experience')}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all",
              activeTab === 'experience' ? "bg-black text-white shadow-lg shadow-black/10" : "text-gray-500 hover:bg-gray-100"
            )}
          >
            <Briefcase size={18} /> 經歷管理
          </button>
          <button 
            onClick={() => setActiveTab('projects')}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all",
              activeTab === 'projects' ? "bg-black text-white shadow-lg shadow-black/10" : "text-gray-500 hover:bg-gray-100"
            )}
          >
            <Layout size={18} /> 專案管理
          </button>
        </nav>
        <div className="p-4 border-t border-gray-100 space-y-2">
          <button 
            onClick={() => window.open('/', '_blank')}
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-500 hover:bg-gray-100 rounded-xl font-medium transition-colors"
          >
            <Globe size={18} /> 前往網站首頁
          </button>
          <button 
            onClick={() => signOut(auth)}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl font-medium transition-colors"
          >
            <LogOut size={18} /> 登出系統
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-12 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          {activeTab === 'about' && (
            <>
              <header className="mb-12 flex justify-between items-end">
                <div>
                  <h2 className="text-4xl font-bold mb-2">編輯「關於我」</h2>
                  <p className="text-gray-500">修改您的個人簡介與基本資訊</p>
                </div>
                <button 
                  onClick={handleSaveAbout}
                  className="bg-black text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-800 transition-all shadow-lg shadow-black/10"
                >
                  <Save size={20} /> 儲存所有變更
                </button>
              </header>

              {resume && (
                <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-400 uppercase tracking-wider">姓名</label>
                      <input 
                        className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:border-black outline-none transition-all"
                        value={resume.name}
                        onChange={e => setResume({...resume, name: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-400 uppercase tracking-wider">職稱</label>
                      <input 
                        className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:border-black outline-none transition-all"
                        value={resume.title}
                        onChange={e => setResume({...resume, title: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-400 uppercase tracking-wider">地點</label>
                      <input 
                        className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:border-black outline-none transition-all"
                        value={resume.location}
                        onChange={e => setResume({...resume, location: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-400 uppercase tracking-wider">Email</label>
                      <input 
                        className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:border-black outline-none transition-all"
                        value={resume.email}
                        onChange={e => setResume({...resume, email: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-400 uppercase tracking-wider">網站</label>
                      <input 
                        className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:border-black outline-none transition-all"
                        value={resume.website}
                        onChange={e => setResume({...resume, website: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-400 uppercase tracking-wider">個人簡介 (About)</label>
                    <textarea 
                      className="w-full h-48 px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:border-black outline-none transition-all resize-none"
                      value={resume.about}
                      onChange={e => setResume({...resume, about: e.target.value})}
                    />
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === 'experience' && (
            <>
              <header className="mb-12 flex justify-between items-end">
                <div>
                  <h2 className="text-4xl font-bold mb-2">經歷管理</h2>
                  <p className="text-gray-500">管理您的工作與教育經歷</p>
                </div>
                <button 
                  onClick={handleAddExperience}
                  className="bg-black text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-800 transition-all shadow-lg shadow-black/10"
                >
                  <Plus size={20} /> 新增經歷
                </button>
              </header>

              <div className="space-y-6">
                {experiences.map(exp => (
                  <div key={exp.id} className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 relative group">
                    <button 
                      onClick={() => deleteDoc(doc(db, 'experience', exp.id))}
                      className="absolute top-6 right-6 p-2 text-gray-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={20} />
                    </button>
                    <div className="grid grid-cols-2 gap-6 mb-6">
                      <input 
                        className="text-2xl font-bold bg-transparent border-b border-transparent focus:border-gray-200 outline-none w-full"
                        value={exp.role}
                        onChange={e => setDoc(doc(db, 'experience', exp.id), { role: e.target.value }, { merge: true })}
                      />
                      <input 
                        className="text-lg text-gray-500 bg-transparent border-b border-transparent focus:border-gray-200 outline-none w-full"
                        value={exp.company}
                        onChange={e => setDoc(doc(db, 'experience', exp.id), { company: e.target.value }, { merge: true })}
                      />
                    </div>
                    <input 
                      className="text-sm font-bold text-gray-400 uppercase tracking-widest bg-transparent border-b border-transparent focus:border-gray-200 outline-none w-full mb-4"
                      value={exp.period}
                      onChange={e => setDoc(doc(db, 'experience', exp.id), { period: e.target.value }, { merge: true })}
                    />
                    <textarea 
                      className="w-full h-24 bg-gray-50 p-4 rounded-xl border border-transparent focus:border-gray-100 outline-none resize-none"
                      value={exp.description}
                      onChange={e => setDoc(doc(db, 'experience', exp.id), { description: e.target.value }, { merge: true })}
                    />
                  </div>
                ))}
              </div>
            </>
          )}

          {activeTab === 'projects' && (
            <>
              <header className="mb-12 flex justify-between items-end">
                <div>
                  <h2 className="text-4xl font-bold mb-2">專案管理</h2>
                  <p className="text-gray-500">展示您的精選作品</p>
                </div>
                <button 
                  onClick={handleAddProject}
                  className="bg-black text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-800 transition-all shadow-lg shadow-black/10"
                >
                  <Plus size={20} /> 新增專案
                </button>
              </header>

              <div className="grid grid-cols-1 gap-6">
                {projects.map(project => (
                  <div key={project.id} className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 relative group">
                    <button 
                      onClick={() => deleteDoc(doc(db, 'projects', project.id))}
                      className="absolute top-6 right-6 p-2 text-gray-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={20} />
                    </button>
                    <input 
                      className="text-2xl font-bold bg-transparent border-b border-transparent focus:border-gray-200 outline-none w-full mb-4"
                      value={project.title}
                      onChange={e => setDoc(doc(db, 'projects', project.id), { title: e.target.value }, { merge: true })}
                    />
                    <textarea 
                      className="w-full h-24 bg-gray-50 p-4 rounded-xl border border-transparent focus:border-gray-100 outline-none resize-none mb-4"
                      value={project.description}
                      onChange={e => setDoc(doc(db, 'projects', project.id), { description: e.target.value }, { merge: true })}
                    />
                    <div className="flex items-center gap-4">
                      <label className="text-xs font-bold text-gray-400 uppercase">連結:</label>
                      <input 
                        className="flex-1 text-sm text-blue-500 bg-transparent border-b border-transparent focus:border-gray-200 outline-none"
                        value={project.link}
                        onChange={e => setDoc(doc(db, 'projects', project.id), { link: e.target.value }, { merge: true })}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};
