import { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Award, TrendingUp, Search, Filter, Zap } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';

const categories = ['All', 'Coding', 'Design', 'Photography', 'Music', 'Writing'];

const leaderboardData = [
  { id: 1, name: 'Sarah Jenkins', points: 4500, rank: 1, avatar: 'https://i.pravatar.cc/150?img=32', trend: 'up', wins: 12, category: 'Coding' },
  { id: 2, name: 'Marcus Chen', points: 4200, rank: 2, avatar: 'https://i.pravatar.cc/150?img=12', trend: 'down', wins: 8, category: 'Design' },
  { id: 3, name: 'Alex Rivera', points: 3900, rank: 3, avatar: 'https://i.pravatar.cc/150?img=54', trend: 'stable', wins: 10, category: 'Photography' },
  { id: 4, name: 'Jessica Wang', points: 3600, rank: 4, avatar: 'https://i.pravatar.cc/150?img=44', trend: 'up', wins: 6, category: 'Music' },
  { id: 5, name: 'David Miller', points: 3400, rank: 5, avatar: 'https://i.pravatar.cc/150?img=60', trend: 'up', wins: 5, category: 'Writing' },
];

const categoryDistribution = [
  { name: 'Coding', value: 85 },
  { name: 'Design', value: 72 },
  { name: 'Music', value: 45 },
  { name: 'Writing', value: 64 },
];

export default function Leaderboard() {
  const [activeCategory, setActiveCategory] = useState('All');

  return (
    <div className="space-y-10 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">Campus <span className="gradient-text">Leaderboard</span></h1>
          <p className="text-slate-400">The hall of fame for the most talented students on campus.</p>
        </div>
        
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="Search talent..." 
              className="bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 outline-none focus:border-violet-500/50"
            />
          </div>
        </div>
      </div>

      {/* Podium Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end max-w-4xl mx-auto py-10">
        {/* 2nd Place */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6 text-center order-2 md:order-1 h-64 flex flex-col justify-center border-white/5"
        >
          <div className="relative mx-auto mb-4">
            <img src={leaderboardData[1].avatar} className="w-20 h-20 rounded-full border-4 border-slate-400 shadow-xl" alt="" />
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-slate-400 rounded-full flex items-center justify-center text-white font-bold border-2 border-[#0a0a0f]">2</div>
          </div>
          <h3 className="font-bold">{leaderboardData[1].name}</h3>
          <p className="text-slate-400 text-sm mb-2">{leaderboardData[1].points} pts</p>
          <div className="text-[10px] uppercase font-bold text-slate-500">Runner Up</div>
        </motion.div>

        {/* 1st Place */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-8 text-center order-1 md:order-2 h-80 flex flex-col justify-center border-violet-500/30 bg-violet-600/5 relative"
        >
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-yellow-500">
            <Trophy size={48} className="drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]" />
          </div>
          <div className="relative mx-auto mb-4">
            <img src={leaderboardData[0].avatar} className="w-24 h-24 rounded-full border-4 border-yellow-500 shadow-2xl" alt="" />
            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold border-2 border-[#0a0a0f]">1</div>
          </div>
          <h3 className="text-xl font-bold">{leaderboardData[0].name}</h3>
          <p className="text-violet-400 font-bold mb-2">{leaderboardData[0].points} pts</p>
          <div className="text-xs uppercase font-bold text-yellow-500 tracking-widest">Campus Legend</div>
        </motion.div>

        {/* 3rd Place */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-6 text-center order-3 h-56 flex flex-col justify-center border-white/5"
        >
          <div className="relative mx-auto mb-4">
            <img src={leaderboardData[2].avatar} className="w-16 h-16 rounded-full border-4 border-amber-700 shadow-xl" alt="" />
            <div className="absolute -bottom-2 -right-2 w-7 h-7 bg-amber-700 rounded-full flex items-center justify-center text-white font-bold border-2 border-[#0a0a0f]">3</div>
          </div>
          <h3 className="font-bold">{leaderboardData[2].name}</h3>
          <p className="text-slate-400 text-sm mb-2">{leaderboardData[2].points} pts</p>
          <div className="text-[10px] uppercase font-bold text-slate-500">Bronze Podium</div>
        </motion.div>
      </div>

      {/* Main Table & Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                  activeCategory === cat 
                    ? 'bg-violet-600 text-white shadow-[0_0_10px_rgba(139,92,246,0.3)]' 
                    : 'bg-white/5 text-slate-500 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="glass-card overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-white/5 text-[10px] uppercase font-bold text-slate-500 tracking-widest">
                <tr>
                  <th className="px-6 py-4">Rank</th>
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Primary Category</th>
                  <th className="px-6 py-4">Wins</th>
                  <th className="px-6 py-4 text-right">Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {leaderboardData.map((user) => (
                  <tr key={user.id} className="hover:bg-white/5 transition-colors cursor-pointer group">
                    <td className="px-6 py-4 font-bold text-slate-400 group-hover:text-white">#{user.rank}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img src={user.avatar} className="w-8 h-8 rounded-full" alt="" />
                        <span className="font-medium">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400">{user.category}</td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                        <Medal size={14} /> {user.wins}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-violet-400">{user.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Category Strength Chart */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <TrendingUp className="text-cyan-400" size={20} />
            Category Performance
          </h2>
          <div className="glass-card p-6 h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryDistribution} layout="vertical">
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px' }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                  {categoryDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#8b5cf6' : '#06b6d4'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 pt-4 border-t border-white/5 text-center">
              <p className="text-xs text-slate-500 leading-relaxed italic">
                "Coding and Design are the most competitive categories this semester."
              </p>
            </div>
          </div>

          <div className="glass-card p-6 bg-gradient-to-br from-cyan-600/10 to-transparent border-cyan-500/20">
             <div className="flex items-center gap-3 mb-3">
               <div className="p-2 bg-cyan-500/20 rounded-lg text-cyan-400"><Zap size={20} /></div>
               <h4 className="font-bold">Real-Time Pulse</h4>
             </div>
             <p className="text-sm text-slate-400">Live updates are active. The leaderboard refreshes as voting phases close across campus.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
