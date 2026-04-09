import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Github, 
  Linkedin, 
  Mail, 
  ExternalLink, 
  ChevronRight, 
  Layout, 
  FileText, 
  User, 
  LogIn,
  LogOut,
  Plus,
  Trash2,
  Edit,
  Save,
  X,
  Menu
} from 'lucide-react';
import { useAuth } from './AuthContext';
import { auth, db, googleProvider } from './firebase';
import { signInWithPopup, signOut } from 'firebase/auth';
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  deleteDoc, 
  doc, 
  updateDoc, 
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { OperationType, handleFirestoreError } from './lib/utils';
import ReactMarkdown from 'react-markdown';

// --- Types ---
interface Project {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  link: string;
  tags: string[];
  createdAt: Timestamp;
}

interface Post {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  slug: string;
  published: boolean;
  createdAt: Timestamp;
}

// --- Components ---

const Navbar = ({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (t: string) => void }) => {
  const { user, role } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const navItems = [
    { id: 'home', label: 'Home', icon: Layout },
    { id: 'projects', label: 'Projects', icon: Layout },
    { id: 'blog', label: 'Blog', icon: FileText },
  ];

  if (role === 'admin') {
    navItems.push({ id: 'admin', label: 'Admin', icon: User });
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('home')}>
            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <span className="font-bold text-xl tracking-tight">Portfolio</span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-black",
                  activeTab === item.id ? "text-black" : "text-gray-500"
                )}
              >
                {item.label}
              </button>
            ))}
            {user ? (
              <div className="flex items-center gap-4 pl-4 border-l border-gray-200">
                <img src={user.photoURL || ''} alt="" className="w-8 h-8 rounded-full border border-gray-200" referrerPolicy="no-referrer" />
                <button onClick={handleLogout} className="text-gray-500 hover:text-red-600 transition-colors">
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <button
                onClick={handleLogin}
                className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-800 transition-all"
              >
                <LogIn size={16} />
                Login
              </button>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <Menu size={24} />
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-gray-100 overflow-hidden"
          >
            <div className="px-4 py-4 space-y-4">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); setIsMenuOpen(false); }}
                  className="block w-full text-left text-lg font-medium text-gray-600"
                >
                  {item.label}
                </button>
              ))}
              {!user && (
                <button
                  onClick={handleLogin}
                  className="w-full flex items-center justify-center gap-2 bg-black text-white py-3 rounded-xl font-medium"
                >
                  <LogIn size={18} />
                  Login
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const Home = () => (
  <div className="pt-32 pb-20 px-4 max-w-7xl mx-auto">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-3xl"
    >
      <h1 className="text-6xl md:text-8xl font-bold tracking-tighter leading-none mb-8">
        Building digital <br />
        <span className="text-gray-400">experiences.</span>
      </h1>
      <p className="text-xl text-gray-600 mb-12 leading-relaxed max-w-2xl">
        I'm a full-stack developer and designer focused on creating clean, 
        functional, and user-centric digital products. Welcome to my personal space.
      </p>
      <div className="flex flex-wrap gap-4">
        <button className="bg-black text-white px-8 py-4 rounded-full font-medium flex items-center gap-2 hover:scale-105 transition-transform">
          View Projects <ChevronRight size={20} />
        </button>
        <div className="flex items-center gap-4 px-4">
          <a href="#" className="text-gray-400 hover:text-black transition-colors"><Github size={24} /></a>
          <a href="#" className="text-gray-400 hover:text-black transition-colors"><Linkedin size={24} /></a>
          <a href="#" className="text-gray-400 hover:text-black transition-colors"><Mail size={24} /></a>
        </div>
      </div>
    </motion.div>
  </div>
);

const Projects = () => {
  const [projects, setProjects] = React.useState<Project[]>([]);

  React.useEffect(() => {
    const q = query(collection(db, 'projects'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
      setProjects(data);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'projects'));
    return () => unsubscribe();
  }, []);

  return (
    <div className="pt-32 pb-20 px-4 max-w-7xl mx-auto">
      <div className="mb-16">
        <h2 className="text-4xl font-bold mb-4">Selected Projects</h2>
        <p className="text-gray-500">A collection of things I've built recently.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {projects.map((project, idx) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="group cursor-pointer"
          >
            <div className="aspect-video bg-gray-100 rounded-3xl overflow-hidden mb-6 relative">
              <img 
                src={project.imageUrl || `https://picsum.photos/seed/${project.id}/800/450`} 
                alt={project.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <ExternalLink className="text-white" size={32} />
              </div>
            </div>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-2xl font-bold mb-2">{project.title}</h3>
                <p className="text-gray-600 mb-4">{project.description}</p>
                <div className="flex gap-2">
                  {project.tags?.map(tag => (
                    <span key={tag} className="text-xs font-medium bg-gray-100 px-3 py-1 rounded-full uppercase tracking-wider text-gray-500">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
        {projects.length === 0 && (
          <div className="col-span-full py-20 text-center text-gray-400 border-2 border-dashed border-gray-100 rounded-3xl">
            No projects added yet.
          </div>
        )}
      </div>
    </div>
  );
};

const Blog = () => {
  const [posts, setPosts] = React.useState<Post[]>([]);

  React.useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post))
        .filter(p => p.published);
      setPosts(data);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'posts'));
    return () => unsubscribe();
  }, []);

  return (
    <div className="pt-32 pb-20 px-4 max-w-3xl mx-auto">
      <div className="mb-16">
        <h2 className="text-4xl font-bold mb-4">Writing</h2>
        <p className="text-gray-500">Thoughts on code, design, and life.</p>
      </div>
      <div className="space-y-16">
        {posts.map((post, idx) => (
          <motion.article
            key={post.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="group cursor-pointer"
          >
            <span className="text-sm text-gray-400 mb-2 block">
              {post.createdAt?.toDate().toLocaleDateString()}
            </span>
            <h3 className="text-3xl font-bold mb-4 group-hover:text-gray-600 transition-colors">
              {post.title}
            </h3>
            <p className="text-gray-600 leading-relaxed mb-6">
              {post.excerpt}
            </p>
            <div className="flex items-center gap-2 text-black font-medium">
              Read article <ChevronRight size={16} />
            </div>
          </motion.article>
        ))}
        {posts.length === 0 && (
          <div className="py-20 text-center text-gray-400 border-2 border-dashed border-gray-100 rounded-3xl">
            No blog posts published yet.
          </div>
        )}
      </div>
    </div>
  );
};

const Admin = () => {
  const { role } = useAuth();
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [posts, setPosts] = React.useState<Post[]>([]);
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [isAddingPost, setIsAddingPost] = useState(false);

  // Form states
  const [newProject, setNewProject] = useState({ title: '', description: '', link: '', tags: '' });
  const [newPost, setNewPost] = useState({ title: '', content: '', excerpt: '', slug: '', published: true });

  React.useEffect(() => {
    if (role !== 'admin') return;

    const unsubProjects = onSnapshot(query(collection(db, 'projects'), orderBy('createdAt', 'desc')), (snapshot) => {
      setProjects(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project)));
    });

    const unsubPosts = onSnapshot(query(collection(db, 'posts'), orderBy('createdAt', 'desc')), (snapshot) => {
      setPosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post)));
    });

    return () => { unsubProjects(); unsubPosts(); };
  }, [role]);

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'projects'), {
        ...newProject,
        tags: newProject.tags.split(',').map(t => t.trim()),
        createdAt: serverTimestamp()
      });
      setIsAddingProject(false);
      setNewProject({ title: '', description: '', link: '', tags: '' });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'projects');
    }
  };

  const handleAddPost = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'posts'), {
        ...newPost,
        createdAt: serverTimestamp()
      });
      setIsAddingPost(false);
      setNewPost({ title: '', content: '', excerpt: '', slug: '', published: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'posts');
    }
  };

  const deleteItem = async (col: string, id: string) => {
    if (!confirm('Are you sure?')) return;
    try {
      await deleteDoc(doc(db, col, id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, col);
    }
  };

  if (role !== 'admin') return <div className="pt-32 text-center">Unauthorized</div>;

  return (
    <div className="pt-32 pb-20 px-4 max-w-7xl mx-auto">
      <h2 className="text-4xl font-bold mb-12">Admin Dashboard</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Projects Management */}
        <section>
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-2xl font-bold">Projects</h3>
            <button 
              onClick={() => setIsAddingProject(true)}
              className="bg-black text-white p-2 rounded-lg hover:scale-105 transition-transform"
            >
              <Plus size={20} />
            </button>
          </div>

          {isAddingProject && (
            <motion.form 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={handleAddProject} 
              className="bg-gray-50 p-6 rounded-2xl mb-8 space-y-4"
            >
              <input 
                placeholder="Title" 
                className="w-full p-3 rounded-xl border border-gray-200"
                value={newProject.title}
                onChange={e => setNewProject({...newProject, title: e.target.value})}
                required
              />
              <textarea 
                placeholder="Description" 
                className="w-full p-3 rounded-xl border border-gray-200"
                value={newProject.description}
                onChange={e => setNewProject({...newProject, description: e.target.value})}
                required
              />
              <input 
                placeholder="Tags (comma separated)" 
                className="w-full p-3 rounded-xl border border-gray-200"
                value={newProject.tags}
                onChange={e => setNewProject({...newProject, tags: e.target.value})}
              />
              <div className="flex gap-2">
                <button type="submit" className="bg-black text-white px-6 py-2 rounded-xl font-medium">Save</button>
                <button type="button" onClick={() => setIsAddingProject(false)} className="text-gray-500">Cancel</button>
              </div>
            </motion.form>
          )}

          <div className="space-y-4">
            {projects.map(p => (
              <div key={p.id} className="flex justify-between items-center p-4 bg-white border border-gray-100 rounded-xl">
                <span className="font-medium">{p.title}</span>
                <button onClick={() => deleteItem('projects', p.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg">
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Blog Management */}
        <section>
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-2xl font-bold">Blog Posts</h3>
            <button 
              onClick={() => setIsAddingPost(true)}
              className="bg-black text-white p-2 rounded-lg hover:scale-105 transition-transform"
            >
              <Plus size={20} />
            </button>
          </div>

          {isAddingPost && (
            <motion.form 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={handleAddPost} 
              className="bg-gray-50 p-6 rounded-2xl mb-8 space-y-4"
            >
              <input 
                placeholder="Title" 
                className="w-full p-3 rounded-xl border border-gray-200"
                value={newPost.title}
                onChange={e => setNewPost({...newPost, title: e.target.value})}
                required
              />
              <input 
                placeholder="Slug" 
                className="w-full p-3 rounded-xl border border-gray-200"
                value={newPost.slug}
                onChange={e => setNewPost({...newPost, slug: e.target.value})}
                required
              />
              <textarea 
                placeholder="Excerpt" 
                className="w-full p-3 rounded-xl border border-gray-200"
                value={newPost.excerpt}
                onChange={e => setNewPost({...newPost, excerpt: e.target.value})}
              />
              <textarea 
                placeholder="Content (Markdown)" 
                className="w-full p-3 rounded-xl border border-gray-200 h-40"
                value={newPost.content}
                onChange={e => setNewPost({...newPost, content: e.target.value})}
                required
              />
              <div className="flex gap-2">
                <button type="submit" className="bg-black text-white px-6 py-2 rounded-xl font-medium">Save</button>
                <button type="button" onClick={() => setIsAddingPost(false)} className="text-gray-500">Cancel</button>
              </div>
            </motion.form>
          )}

          <div className="space-y-4">
            {posts.map(p => (
              <div key={p.id} className="flex justify-between items-center p-4 bg-white border border-gray-100 rounded-xl">
                <div>
                  <span className="font-medium block">{p.title}</span>
                  <span className="text-xs text-gray-400">{p.published ? 'Published' : 'Draft'}</span>
                </div>
                <button onClick={() => deleteItem('posts', p.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg">
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

// --- Main App Component ---

import { cn } from './lib/utils';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-12 h-12 bg-black rounded-xl"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main>
        <AnimatePresence mode="wait">
          {activeTab === 'home' && <Home key="home" />}
          {activeTab === 'projects' && <Projects key="projects" />}
          {activeTab === 'blog' && <Blog key="blog" />}
          {activeTab === 'admin' && <Admin key="admin" />}
        </AnimatePresence>
      </main>

      <footer className="py-12 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-sm text-gray-400">
            © 2026 Personal Portfolio. Built with React & Firebase.
          </div>
          <div className="flex gap-8">
            <a href="#" className="text-sm font-medium hover:text-black transition-colors">Github</a>
            <a href="#" className="text-sm font-medium hover:text-black transition-colors">Twitter</a>
            <a href="#" className="text-sm font-medium hover:text-black transition-colors">LinkedIn</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
