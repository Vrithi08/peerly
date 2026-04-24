import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Calendar, Type, FileText, Layout, Image as ImageIcon, Code, Music, Send, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const categories = ['Coding', 'Design', 'Photography', 'Music', 'Writing', 'Sports', 'Other'];
const submissionTypes = [
  { id: 'CODE', icon: Code, label: 'Code' },
  { id: 'IMAGE', icon: ImageIcon, label: 'Image' },
  { id: 'AUDIO', icon: Music, label: 'Audio' },
  { id: 'TEXT', icon: FileText, label: 'Text' },
];

export default function CreateChallenge() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Coding',
    submissionType: 'CODE',
    submissionDeadline: '',
    votingDeadline: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate creation
    navigate('/challenges');
  };

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/5 rounded-full transition-all">
          <X size={24} />
        </button>
        <h1 className="text-3xl font-bold">Post a New <span className="gradient-text">Challenge</span></h1>
      </div>

      <div className="glass-card p-8 border-white/10 shadow-2xl">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Title & Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Challenge Title</label>
              <div className="relative">
                <Type className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input 
                  type="text" 
                  placeholder="e.g., The Great Campus Hackathon" 
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 outline-none focus:border-violet-500/50 transition-all"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Category</label>
              <div className="relative">
                <Layout className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <select 
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 outline-none focus:border-violet-500/50 transition-all appearance-none"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                >
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Description & Rules</label>
            <div className="relative">
              <FileText className="absolute left-4 top-4 text-slate-500" size={18} />
              <textarea 
                rows="5"
                placeholder="Describe the challenge, provide prompts, and list any specific rules..." 
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 outline-none focus:border-violet-500/50 transition-all"
                required
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>
          </div>

          {/* Submission Type */}
          <div className="space-y-4">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Accepting Submission Type</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {submissionTypes.map((type) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setFormData({...formData, submissionType: type.id})}
                  className={`flex flex-col items-center gap-3 p-4 rounded-2xl border transition-all ${
                    formData.submissionType === type.id 
                      ? 'bg-violet-600/20 border-violet-500 text-violet-400 shadow-[0_0_20px_rgba(139,92,246,0.1)]' 
                      : 'bg-white/5 border-white/10 text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <type.icon size={24} />
                  <span className="text-xs font-bold uppercase tracking-wider">{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Deadlines */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Submission Deadline</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input 
                  type="datetime-local" 
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 outline-none focus:border-violet-500/50 transition-all"
                  required
                  value={formData.submissionDeadline}
                  onChange={(e) => setFormData({...formData, submissionDeadline: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Voting Deadline</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input 
                  type="datetime-local" 
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 outline-none focus:border-violet-500/50 transition-all"
                  required
                  value={formData.votingDeadline}
                  onChange={(e) => setFormData({...formData, votingDeadline: e.target.value})}
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-6">
            <button type="submit" className="w-full btn-primary py-4 flex items-center justify-center gap-2 group shadow-[0_20px_40px_rgba(139,92,246,0.2)]">
              <Send size={20} className="group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
              <span className="text-lg font-bold">Publish Challenge</span>
            </button>
            <p className="text-center text-[10px] text-slate-500 uppercase font-bold tracking-widest mt-4">
              Your challenge will be live instantly across the Peerly pulse.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
