import { motion } from 'framer-motion';
import { Trophy, MessageSquare, Users, TrendingUp, Clock, ArrowRight } from 'lucide-react';

const stats = [
  { label: 'Active Challenges', value: '12', icon: Trophy, color: 'text-violet-400' },
  { label: 'Unresolved Help', value: '8', icon: MessageSquare, color: 'text-cyan-400' },
  { label: 'Total Participants', value: '1,240', icon: Users, color: 'text-emerald-400' },
  { label: 'Your Rank', value: '#42', icon: TrendingUp, color: 'text-amber-400' },
];

const featuredChallenges = [
  { id: 1, title: 'Campus Hackathon 2026', category: 'Tech', prize: '$500', deadline: '2 days left', participants: 156 },
  { id: 2, title: 'Photography Contest', category: 'Art', prize: 'Canon EOS R5', deadline: '5 days left', participants: 89 },
  { id: 3, title: 'Open Source Contribution', category: 'Open Source', prize: 'Badge + Swags', deadline: '1 week left', participants: 234 },
];

export default function Home() {
  return (
    <div className="space-y-10">
      {/* Welcome Banner */}
      <section className="relative h-64 rounded-3xl overflow-hidden flex items-center px-10">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-900/40 to-cyan-900/40 z-10"></div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1523050853064-85a175c494a0?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center"></div>
        <div className="relative z-20 max-w-2xl">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-bold mb-4 tracking-tight"
          >
            Welcome back, <span className="gradient-text">John!</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-slate-200"
          >
            Check out the new challenges and help your peers to earn Pulse Points.
          </motion.p>
        </div>
      </section>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div 
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-6 flex items-center gap-5"
          >
            <div className={`p-4 rounded-2xl bg-white/5 ${stat.color}`}>
              <stat.icon size={28} />
            </div>
            <div>
              <p className="text-sm text-slate-400 font-medium">{stat.label}</p>
              <h3 className="text-2xl font-bold">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Featured Challenges */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Featured Challenges</h2>
            <button className="text-violet-400 hover:text-violet-300 font-medium flex items-center gap-2 text-sm">
              View all <ArrowRight size={16} />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {featuredChallenges.map((challenge, i) => (
              <motion.div 
                key={challenge.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + (i * 0.1) }}
                className="glass-card group cursor-pointer overflow-hidden"
              >
                <div className="h-40 bg-white/5 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] to-transparent opacity-60"></div>
                  <div className="absolute top-4 left-4 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider text-violet-300">
                    {challenge.category}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2 group-hover:text-violet-400 transition-colors">{challenge.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-slate-400 mb-4">
                    <span className="flex items-center gap-1.5"><Clock size={14} /> {challenge.deadline}</span>
                    <span className="flex items-center gap-1.5"><Users size={14} /> {challenge.participants}</span>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <span className="text-sm font-medium text-emerald-400">Prize: {challenge.prize}</span>
                    <button className="text-sm font-bold text-violet-400">Join Now</button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Sidebar Activity */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Recent Help Posts</h2>
          <div className="glass-card divide-y divide-white/5">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="p-4 hover:bg-white/5 transition-colors cursor-pointer first:rounded-t-2xl last:rounded-b-2xl">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex-shrink-0"></div>
                  <div className="space-y-1">
                    <h4 className="font-semibold text-sm line-clamp-1">Need help with React Testing Library...</h4>
                    <p className="text-xs text-slate-400">Posted by Sarah M. • 2h ago</p>
                    <div className="flex gap-2 pt-2">
                       <span className="px-2 py-0.5 bg-rose-500/10 text-rose-500 rounded text-[10px] font-bold uppercase">Urgent</span>
                       <span className="px-2 py-0.5 bg-violet-500/10 text-violet-500 rounded text-[10px] font-bold uppercase">React</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <button className="w-full py-4 text-sm font-semibold text-slate-400 hover:text-white transition-colors">
              Load More Activity
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
