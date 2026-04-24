import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Clock, Users, Search, Filter, ArrowUpRight, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const categories = ['All', 'Tech', 'Art', 'Sports', 'Open Source', 'Social'];

const allChallenges = [
  { id: 1, title: 'Campus Hackathon 2026', category: 'Tech', prize: '$500', deadline: '2 days left', participants: 156, status: 'Active', image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=1000&auto=format&fit=crop' },
  { id: 2, title: 'Photography Contest', category: 'Art', prize: 'Canon EOS R5', deadline: '5 days left', participants: 89, status: 'Active', image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1000&auto=format&fit=crop' },
  { id: 3, title: 'Open Source Contribution', category: 'Open Source', prize: 'Badge + Swags', deadline: '1 week left', participants: 234, status: 'Upcoming', image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1000&auto=format&fit=crop' },
  { id: 4, title: 'Inter-College Basketball', category: 'Sports', prize: 'Trophy + $200', deadline: 'Completed', participants: 450, status: 'Completed', image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=1000&auto=format&fit=crop' },
  { id: 5, title: 'UX Design Sprint', category: 'Tech', prize: '$300', deadline: '3 days left', participants: 112, status: 'Active', image: 'https://images.unsplash.com/photo-1586717791821-3f44a563eb4c?q=80&w=1000&auto=format&fit=crop' },
  { id: 6, title: 'Eco-Campus Initiative', category: 'Social', prize: 'Sustainability Award', deadline: '2 weeks left', participants: 75, status: 'Active', image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=1000&auto=format&fit=crop' },
];

export default function Challenges() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredChallenges = allChallenges.filter(challenge => {
    const matchesCategory = activeCategory === 'All' || challenge.category === activeCategory;
    const matchesSearch = challenge.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-8 pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">Campus <span className="gradient-text">Challenges</span></h1>
          <p className="text-slate-400">Discover and participate in exciting events around the campus.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/create-challenge')}
            className="btn-primary flex items-center gap-2"
          >
            <Plus size={20} />
            Post Challenge
          </button>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="Search challenges..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 outline-none focus:border-violet-500/50 transition-all w-64"
            />
          </div>
          <button className="p-2.5 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all">
            <Filter size={20} />
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
              activeCategory === cat 
                ? 'bg-violet-600 text-white shadow-[0_0_15px_rgba(139,92,246,0.4)]' 
                : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Challenges Grid */}
      <motion.div 
        layout
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
      >
        <AnimatePresence mode='popLayout'>
          {filteredChallenges.map((challenge) => (
              <motion.div
                key={challenge.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                onClick={() => navigate(`/challenge/${challenge.id}`)}
                className="glass-card group overflow-hidden flex flex-col cursor-pointer"
              >
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={challenge.image} 
                  alt={challenge.title} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent to-transparent opacity-80"></div>
                <div className="absolute top-4 left-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md border ${
                    challenge.status === 'Active' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                    challenge.status === 'Upcoming' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' :
                    'bg-slate-500/20 text-slate-400 border-slate-500/30'
                  }`}>
                    {challenge.status}
                  </span>
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-xs font-bold text-violet-400 uppercase tracking-widest">{challenge.category}</span>
                  <ArrowUpRight className="text-slate-600 group-hover:text-white transition-colors" size={20} />
                </div>
                <h3 className="text-xl font-bold mb-4 group-hover:text-violet-400 transition-colors leading-tight">{challenge.title}</h3>
                
                <div className="grid grid-cols-2 gap-4 mt-auto">
                  <div className="space-y-1">
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Prize Pool</p>
                    <p className="text-sm font-semibold text-slate-200">{challenge.prize}</p>
                  </div>
                  <div className="space-y-1 text-right">
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Deadline</p>
                    <p className="text-sm font-semibold text-slate-200">{challenge.deadline}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-6 mt-6 border-t border-white/5">
                  <div className="flex items-center -space-x-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="w-7 h-7 rounded-full border-2 border-[#0a0a0f] bg-slate-700 overflow-hidden">
                        <img src={`https://i.pravatar.cc/100?img=${challenge.id + i}`} alt="avatar" />
                      </div>
                    ))}
                    <div className="w-7 h-7 rounded-full border-2 border-[#0a0a0f] bg-white/10 flex items-center justify-center text-[10px] font-bold">
                      +{challenge.participants - 3}
                    </div>
                  </div>
                  <button className="btn-primary py-1.5 px-4 text-xs">Join Challenge</button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {filteredChallenges.length === 0 && (
        <div className="text-center py-20">
          <p className="text-slate-500 text-lg">No challenges found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}
