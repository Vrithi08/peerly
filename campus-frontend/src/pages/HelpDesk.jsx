import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Plus, Search, Filter, MessageCircle, Heart, Share2, MoreVertical, ShieldAlert } from 'lucide-react';

const categories = ['All', 'Coding', 'Design', 'Academics', 'Events', 'General'];

const posts = [
  {
    id: 1,
    author: 'Sarah Jenkins',
    role: 'Student',
    time: '2h ago',
    title: 'Need help with React Context API',
    content: "I'm trying to implement a global state for the theme but it's not updating the components correctly. Any tips?",
    category: 'Coding',
    urgency: 'Medium',
    likes: 12,
    replies: 5,
    tags: ['React', 'JavaScript'],
    avatar: 'https://i.pravatar.cc/150?img=32'
  },
  {
    id: 2,
    author: 'Marcus Chen',
    role: 'Grad Student',
    time: '4h ago',
    title: 'Lost my ID card near the Library',
    content: "If anyone found a student ID with the name Marcus, please let me know. I need it for the exams tomorrow!",
    category: 'General',
    urgency: 'Urgent',
    likes: 8,
    replies: 2,
    tags: ['Lost & Found'],
    avatar: 'https://i.pravatar.cc/150?img=12'
  },
  {
    id: 3,
    author: 'Alex Rivera',
    role: 'Alumni',
    time: '1d ago',
    title: 'Best resources for learning UX Design?',
    content: "Looking for some premium courses or blogs that go deep into user psychology and wireframing.",
    category: 'Design',
    urgency: 'Low',
    likes: 24,
    replies: 15,
    tags: ['UX', 'Design'],
    avatar: 'https://i.pravatar.cc/150?img=54'
  }
];

export default function HelpDesk() {
  const [activeCategory, setActiveCategory] = useState('All');

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">Campus <span className="gradient-text">Help Desk</span></h1>
          <p className="text-slate-400">Collaborate, solve problems, and help your peers.</p>
        </div>
        
        <button className="btn-primary flex items-center gap-2">
          <Plus size={20} />
          <span>Ask for Help</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center bg-white/5 p-2 rounded-2xl border border-white/10">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="text" 
            placeholder="Search for questions or topics..." 
            className="w-full bg-transparent py-3 pl-12 pr-4 outline-none placeholder:text-slate-500"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                activeCategory === cat 
                  ? 'bg-violet-600 text-white' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Help Posts Feed */}
      <div className="space-y-6">
        {posts.map((post, i) => (
          <motion.div 
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-6 group hover:border-violet-500/30 transition-all"
          >
            <div className="flex gap-5">
              {/* Author & Info */}
              <div className="flex-shrink-0 flex flex-col items-center gap-3">
                <img src={post.avatar} alt={post.author} className="w-12 h-12 rounded-full border-2 border-white/10" />
                <div className="h-full w-0.5 bg-white/5 rounded-full"></div>
              </div>

              <div className="flex-1 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="font-bold text-slate-100">{post.author}</h4>
                      <span className="text-xs px-2 py-0.5 bg-white/5 rounded-md text-slate-400 font-medium">{post.role}</span>
                      <span className="text-xs text-slate-500">• {post.time}</span>
                    </div>
                    <h3 className="text-xl font-bold group-hover:text-violet-400 transition-colors">{post.title}</h3>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${
                      post.urgency === 'Urgent' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' :
                      post.urgency === 'Medium' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                      'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                    }`}>
                      {post.urgency}
                    </span>
                    <button className="text-slate-600 hover:text-white transition-colors">
                      <MoreVertical size={20} />
                    </button>
                  </div>
                </div>

                <p className="text-slate-300 leading-relaxed italic border-l-2 border-violet-500/20 pl-4 py-1">
                  "{post.content}"
                </p>

                <div className="flex flex-wrap gap-2">
                  {post.tags.map(tag => (
                    <span key={tag} className="px-2.5 py-1 bg-white/5 rounded-full text-xs text-slate-400">#{tag}</span>
                  ))}
                </div>

                {/* Footer Interactions */}
                <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-6">
                  <div className="flex items-center gap-6">
                    <button className="flex items-center gap-2 text-slate-400 hover:text-rose-400 transition-colors text-sm">
                      <Heart size={18} />
                      <span>{post.likes}</span>
                    </button>
                    <button className="flex items-center gap-2 text-slate-400 hover:text-violet-400 transition-colors text-sm">
                      <MessageCircle size={18} />
                      <span>{post.replies} Replies</span>
                    </button>
                    <button className="flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition-colors text-sm">
                      <Share2 size={18} />
                    </button>
                  </div>
                  <button className="text-sm font-bold text-violet-400 hover:text-violet-300 transition-colors">
                    View Conversation
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Community Guideline Alert */}
      <div className="bg-gradient-to-r from-violet-900/20 to-transparent border border-violet-500/20 rounded-2xl p-6 flex items-start gap-4">
        <ShieldAlert className="text-violet-400 flex-shrink-0" size={24} />
        <div>
          <h5 className="font-bold text-violet-100 mb-1">Help Desk Guidelines</h5>
          <p className="text-sm text-slate-400 leading-relaxed">
            Please be respectful and patient when helping others. Earning <span className="text-violet-400 font-bold">Pulse Points</span> through helpful replies will boost your campus rank and unlock exclusive rewards.
          </p>
        </div>
      </div>
    </div>
  );
}
