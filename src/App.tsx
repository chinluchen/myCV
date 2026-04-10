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
  Globe
} from 'lucide-react';
import { cn } from './lib/utils';

// --- Resume Data (Easily editable here) ---
const RESUME_DATA = {
  name: "您的姓名",
  title: "全端工程師 / 使用者體驗設計師",
  location: "台灣, 台北",
  email: "your.email@example.com",
  phone: "+886 912 345 678",
  website: "www.yourwebsite.com",
  about: "我是一位熱衷於打造直觀且高效數位產品的開發者。擁有 5 年以上在網頁開發與 UI/UX 設計方面的經驗，擅長將複雜的需求轉化為簡潔、優雅的解決方案。我追求程式碼的品質，同時也極度重視使用者的互動體驗。",
  skills: [
    { category: "前端開發", items: ["React", "TypeScript", "Tailwind CSS", "Next.js", "Framer Motion"] },
    { category: "後端開發", items: ["Node.js", "Express", "Firebase", "PostgreSQL", "GraphQL"] },
    { category: "設計工具", items: ["Figma", "Adobe XD", "Spline (3D)", "Principle"] },
    { category: "其他技能", items: ["Git", "Docker", "CI/CD", "AWS", "Agile/Scrum"] }
  ],
  experience: [
    {
      company: "某知名科技公司",
      role: "資深全端工程師",
      period: "2022 - 至今",
      description: "負責核心產品的前端架構優化，將載入速度提升了 40%。領導 5 人開發小組完成多項跨平台專案。",
      achievements: ["導入 TypeScript 減少了 30% 的運行時錯誤", "設計並實作了公司內部的 UI 組件庫"]
    },
    {
      company: "創新數位工作室",
      role: "網頁開發工程師",
      period: "2020 - 2022",
      description: "開發超過 20 個響應式網站與電子商務平台。與設計師緊密合作，確保視覺稿的高還原度。",
      achievements: ["優化 SEO 讓客戶網站流量平均成長 50%", "實作自動化測試流程"]
    }
  ],
  education: [
    {
      school: "國立某某大學",
      degree: "資訊工程學系 學士",
      period: "2016 - 2020"
    }
  ],
  projects: [
    {
      title: "AI 驅動的專案管理工具",
      description: "整合 Gemini API 的自動化任務分配系統。",
      tags: ["React", "Firebase", "AI"],
      link: "#"
    },
    {
      title: "互動式 3D 數據看板",
      description: "使用 Three.js 呈現的即時物流監控介面。",
      tags: ["Three.js", "D3.js", "WebSocket"],
      link: "#"
    }
  ]
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
  const [activeSection, setActiveSection] = useState('about');

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-black font-sans selection:bg-black selection:text-white">
      {/* Navigation */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-white/70 backdrop-blur-xl border border-gray-200/50 rounded-full px-6 py-3 shadow-sm">
        <div className="flex items-center gap-8">
          {['About', 'Experience', 'Projects', 'Contact'].map((item) => (
            <button
              key={item}
              onClick={() => {
                const element = document.getElementById(item.toLowerCase());
                element?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-sm font-medium text-gray-500 hover:text-black transition-colors"
            >
              {item}
            </button>
          ))}
        </div>
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
              <img 
                src="https://picsum.photos/seed/profile/400/400" 
                alt="Profile" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex-1 text-center md:text-left">
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-block px-4 py-1.5 bg-black text-white text-xs font-bold rounded-full mb-6 tracking-widest uppercase"
              >
                Available for work
              </motion.span>
              <h1 className="text-6xl md:text-7xl font-bold tracking-tighter leading-none mb-6">
                {RESUME_DATA.name}
              </h1>
              <p className="text-2xl text-gray-500 font-medium mb-8">
                {RESUME_DATA.title}
              </p>
              <div className="flex flex-wrap justify-center md:justify-start gap-6 text-gray-400">
                <div className="flex items-center gap-2"><MapPin size={18} /> {RESUME_DATA.location}</div>
                <div className="flex items-center gap-2"><Mail size={18} /> {RESUME_DATA.email}</div>
                <div className="flex items-center gap-2"><Globe size={18} /> {RESUME_DATA.website}</div>
              </div>
            </div>
          </motion.div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 space-y-32 pb-32">
        {/* About */}
        <section id="about" className="scroll-mt-32">
          <SectionHeading icon={User}>關於我</SectionHeading>
          <p className="text-xl text-gray-600 leading-relaxed max-w-3xl">
            {RESUME_DATA.about}
          </p>
        </section>

        {/* Skills */}
        <section id="skills">
          <SectionHeading icon={Code2}>專業技能</SectionHeading>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {RESUME_DATA.skills.map((skillGroup) => (
              <div key={skillGroup.category} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                <h3 className="font-bold mb-4 text-gray-400 uppercase text-xs tracking-widest">{skillGroup.category}</h3>
                <div className="flex flex-wrap gap-2">
                  {skillGroup.items.map(item => (
                    <span key={item} className="px-3 py-1 bg-gray-50 rounded-lg text-sm font-medium border border-gray-100">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Experience */}
        <section id="experience" className="scroll-mt-32">
          <SectionHeading icon={Briefcase}>工作經歷</SectionHeading>
          <div className="space-y-12">
            {RESUME_DATA.experience.map((exp, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="relative pl-8 border-l-2 border-gray-100"
              >
                <div className="absolute -left-[9px] top-0 w-4 h-4 bg-black rounded-full border-4 border-white" />
                <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-bold">{exp.role}</h3>
                    <p className="text-lg text-gray-500">{exp.company}</p>
                  </div>
                  <span className="text-sm font-bold text-gray-400 mt-2 md:mt-0">{exp.period}</span>
                </div>
                <p className="text-gray-600 mb-4 max-w-2xl">{exp.description}</p>
                <ul className="space-y-2">
                  {exp.achievements.map((ach, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-gray-500">
                      <div className="w-1.5 h-1.5 bg-gray-300 rounded-full" />
                      {ach}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Projects */}
        <section id="projects" className="scroll-mt-32">
          <SectionHeading icon={Layout}>精選專案</SectionHeading>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {RESUME_DATA.projects.map((project, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -5 }}
                className="group bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors">
                    <ExternalLink size={20} />
                  </div>
                  <div className="flex gap-2">
                    {project.tags.map(tag => (
                      <span key={tag} className="text-[10px] font-bold uppercase tracking-widest text-gray-400 bg-gray-50 px-2 py-1 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-3">{project.title}</h3>
                <p className="text-gray-500 mb-6">{project.description}</p>
                <a href={project.link} className="inline-flex items-center gap-2 font-bold text-sm hover:gap-3 transition-all">
                  查看詳情 <ChevronRight size={16} />
                </a>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Contact */}
        <section id="contact" className="scroll-mt-32">
          <div className="bg-black text-white p-12 md:p-20 rounded-[3rem] text-center">
            <h2 className="text-4xl md:text-6xl font-bold mb-8 tracking-tight">準備好開始合作了嗎？</h2>
            <p className="text-gray-400 text-xl mb-12 max-w-xl mx-auto">
              我目前正在尋找新的機會。如果您有任何想法或專案想聊聊，歡迎隨時聯繫我。
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a 
                href={`mailto:${RESUME_DATA.email}`}
                className="bg-white text-black px-8 py-4 rounded-full font-bold flex items-center gap-2 hover:scale-105 transition-transform"
              >
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
        <div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-sm text-gray-400 font-medium">
            © 2026 {RESUME_DATA.name}. Built with React & Tailwind.
          </div>
          <div className="flex gap-8">
            <a href="#" className="text-gray-400 hover:text-black transition-colors"><Github size={20} /></a>
            <a href="#" className="text-gray-400 hover:text-black transition-colors"><Linkedin size={20} /></a>
            <a href="#" className="text-gray-400 hover:text-black transition-colors"><Mail size={20} /></a>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Helper for layout
import { Layout } from 'lucide-react';
