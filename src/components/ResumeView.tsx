import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  ChevronRight, 
  MapPin,
  Briefcase,
  User,
  Globe,
  Layout
} from 'lucide-react';
import { motion } from 'motion/react';
import { db, doc, onSnapshot, collection, query, orderBy } from '../firebase';

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

interface FullResumeData {
  resume: ResumeData;
  experiences: Experience[];
  projects: Project[];
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

export const ResumeView: React.FC = () => {
  const [resume, setResume] = useState<ResumeData>(DEFAULT_RESUME);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('Requesting Firestore (cv_content/default_resume)...');
    console.log('Firebase DB Instance:', db);
    
    let hasReceivedData = false;

    // 3-second timeout for server response
    const timeoutId = setTimeout(() => {
      if (!hasReceivedData) {
        console.warn('Firebase server response timeout (3s). Using local/default data.');
        setLoading(false);
        // We don't set an error here because we want to show whatever we have (cache or defaults)
      }
    }, 3000);

    const unsub = onSnapshot(doc(db, 'cv_content', 'default_resume'), { includeMetadataChanges: true }, (docSnap) => {
      hasReceivedData = true;
      clearTimeout(timeoutId);
      
      console.log('Snapshot received. Exists:', docSnap.exists(), 'From Cache:', docSnap.metadata.fromCache);
      
      if (docSnap.exists()) {
        const data = docSnap.data() as FullResumeData;
        if (data.resume) setResume(data.resume);
        if (data.experiences) setExperiences(data.experiences);
        if (data.projects) setProjects(data.projects);
        setError(null);
      } else {
        console.log('No data found at cv_content/default_resume');
        setError('尚未建立資料，請前往後台進行設定。');
      }
      
      // Stop loading if we got server data OR if we have cached data
      setLoading(false);
    }, (err) => {
      clearTimeout(timeoutId);
      console.error('Firestore Snapshot Error details:', err);
      if (err.code === 'permission-denied') {
        setError('存取被拒絕：您沒有權限讀取此資料。');
      } else {
        setError(`讀取資料失敗: ${err.message}`);
      }
      setLoading(false);
    });

    return () => {
      console.log('Unsubscribing from Firestore listener...');
      unsub();
      clearTimeout(timeoutId);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-black rounded-full animate-spin" />
          <p className="text-xs font-bold tracking-widest uppercase text-gray-400">Requesting Firestore...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8F9FA] p-8 text-center">
        <div className="w-16 h-16 bg-red-50 text-red-600 rounded-3xl flex items-center justify-center mb-6">
          <Globe size={32} />
        </div>
        <h2 className="text-2xl font-bold mb-4">連線中斷</h2>
        <p className="text-gray-500 max-w-md mb-8 leading-relaxed">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="bg-black text-white px-8 py-4 rounded-2xl font-bold hover:opacity-90 transition-all"
        >
          重新連線
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-black font-sans selection:bg-black selection:text-white pb-32">
      {/* Hero Section */}
      <header className="pt-32 pb-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row gap-12 items-center md:items-start">
            <div className="w-48 h-48 bg-gray-200 rounded-[3rem] overflow-hidden shadow-xl">
              <img src="https://picsum.photos/seed/profile/400/400" alt="Profile" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-6xl md:text-7xl font-bold tracking-tighter mb-6">{resume.name}</h1>
              <p className="text-2xl text-gray-500 font-medium mb-8">{resume.title}</p>
              <div className="flex flex-wrap justify-center md:justify-start gap-6 text-gray-400">
                <div className="flex items-center gap-2"><MapPin size={18} /> {resume.location}</div>
                <div className="flex items-center gap-2"><Mail size={18} /> {resume.email}</div>
                <div className="flex items-center gap-2"><Globe size={18} /> {resume.website}</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 space-y-32">
        <section id="about">
          <SectionHeading icon={User}>關於我</SectionHeading>
          <p className="text-xl text-gray-600 leading-relaxed max-w-3xl">{resume.about}</p>
        </section>

        <section id="experience">
          <SectionHeading icon={Briefcase}>工作經歷</SectionHeading>
          <div className="space-y-12">
            {experiences.map((exp) => (
              <div key={exp.id} className="relative pl-8 border-l-2 border-gray-100">
                <div className="absolute -left-[9px] top-0 w-4 h-4 bg-black rounded-full border-4 border-white" />
                <h3 className="text-2xl font-bold">{exp.role}</h3>
                <p className="text-lg text-gray-500">{exp.company} • {exp.period}</p>
                <p className="text-gray-600 mt-4">{exp.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="projects">
          <SectionHeading icon={Layout}>精選專案</SectionHeading>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {projects.map((project) => (
              <div key={project.id} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm relative">
                <h3 className="text-2xl font-bold mb-3">{project.title}</h3>
                <p className="text-gray-500 mb-6">{project.description}</p>
                <a href={project.link} className="inline-flex items-center gap-2 font-bold text-sm">查看詳情 <ChevronRight size={16} /></a>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};
