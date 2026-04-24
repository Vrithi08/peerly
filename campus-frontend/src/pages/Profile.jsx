import { motion } from 'framer-motion';
import { Trophy, MessageSquare, Star, Zap, Edit3, Settings, Calendar, Award, CheckCircle2, TrendingUp } from 'lucide-react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

const userStats = [
  { label: 'Pulse Points', value: '2,450', icon: Zap, color: 'text-yellow-400' },
  { label: 'Global Rank', value: '#42', icon: Trophy, color: 'text-violet-400' },
  { label: 'Challenges', value: '15', icon: Award, color: 'text-cyan-400' },
  { label: 'Helped Peers', value: '28', icon: MessageSquare, color: 'text-emerald-400' },
];

const categoryStrengths = [
  { subject: 'Coding', A: 120, fullMark: 150 },
  { subject: 'Design', A: 98, fullMark: 150 },
  { subject: 'Music', A: 86, fullMark: 150 },
  { subject: 'Writing', A: 99, fullMark: 150 },
  { subject: 'Photography', A: 85, fullMark: 150 },
  { subject: 'Sports', A: 65, fullMark: 150 },
];

const participationData = [
  { name: 'Jan', participation: 4 },
  { name: 'Feb', participation: 7 },
  { name: 'Mar', participation: 5 },
  { name: 'Apr', participation: 9 },
];

const recentActivity = [
  { id: 1, type: 'Challenge', title: 'Joined Campus Hackathon 2026', time: '2 hours ago', icon: Trophy },
  { id: 2, type: 'Help', title: 'Earned 50 points for a helpful reply', time: '5 hours ago', icon: Zap },
  { id: 3, type: 'Achievement', title: 'Unlocked "Speed Coder" Badge', time: '1 day ago', icon: Star },
  { id: 4, type: 'Challenge', title: 'Submitted UX Design Sprint', time: '2 days ago', icon: CheckCircle2 },
];

export default function Profile() {
  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20">
      {/* Profile Header */}
      <section className="relative glass-card overflow-hidden">
        <div className="h-48 bg-gradient-to-r from-violet-600/20 via-cyan-600/20 to-emerald-600/20"></div>
        <div className="px-10 pb-10">
          <div className="flex flex-col md:flex-row items-end gap-6 -mt-16 relative z-10">
            <div className="relative group">
              <img 
                src="https://i.pravatar.cc/150?img=33" 
                alt="Profile" 
                className="w-40 h-40 rounded-3xl border-4 border-[#0a0a0f] object-cover shadow-2xl" 
              />
              <button className="absolute bottom-3 right-3 p-2 bg-violet-600 rounded-xl text-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                <Edit3 size={18} />
              </button>
            </div>
            
            <div className="flex-1 space-y-2 mb-2">
              <div className="flex items-center gap-4">
                <h1 className="text-4xl font-bold tracking-tight text-white">John <span className="gradient-text">Doe</span></h1>
                <span className="px-3 py-1 bg-violet-500/10 text-violet-400 border border-violet-500/20 rounded-full text-xs font-bold uppercase tracking-widest">Master</span>
              </div>
              <p className="text-slate-400 max-w-lg">Full-stack developer passionate about building scalable campus solutions. Always down for a hackathon or helping out on the help desk.</p>
              <div className="flex items-center gap-4 pt-2 text-sm text-slate-500">
                <span className="flex items-center gap-1.5"><Calendar size={16} /> Joined Jan 2026</span>
                <span className="flex items-center gap-1.5 font-medium text-emerald-400 underline cursor-pointer">@johndoe_dev</span>
              </div>
            </div>

            <div className="flex gap-3 mb-2">
              <button className="btn-primary flex items-center gap-2">
                <Settings size={18} />
                Edit Profile
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {userStats.map((stat, i) => (
          <motion.div 
            key={stat.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-6 flex items-center gap-5"
          >
            <div className={`p-4 rounded-2xl bg-white/5 ${stat.color}`}>
              <stat.icon size={28} />
            </div>
            <div>
              <p className="text-sm text-slate-400 font-medium">{stat.label}</p>
              <h3 className="text-2xl font-bold text-white">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Analytics & Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Category Strengths Radar Chart */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Award className="text-violet-400" size={24} />
            Category Strengths
          </h2>
          <div className="glass-card p-6 h-[350px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={categoryStrengths}>
                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                <Radar
                  name="John"
                  dataKey="A"
                  stroke="#8b5cf6"
                  fill="#8b5cf6"
                  fillOpacity={0.6}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="glass-card p-6 space-y-4">
             <h3 className="font-bold flex items-center gap-2">
               <TrendingUp className="text-emerald-400" size={20} />
               Participation Rate
             </h3>
             <div className="h-40">
               <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={participationData}>
                   <defs>
                     <linearGradient id="colorParticipation" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3}/>
                       <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                     </linearGradient>
                   </defs>
                   <Tooltip 
                     contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px', fontSize: '12px' }}
                     itemStyle={{ color: '#06b6d4' }}
                   />
                   <Area type="monotone" dataKey="participation" stroke="#06b6d4" fillOpacity={1} fill="url(#colorParticipation)" />
                 </AreaChart>
               </ResponsiveContainer>
             </div>
          </div>
        </div>

        {/* Recent Activity (Center Column) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Participation History</h2>
            <button className="text-sm text-slate-400 hover:text-white transition-colors font-medium">View All History</button>
          </div>
          
          <div className="space-y-4">
            {recentActivity.map((activity, i) => (
              <motion.div 
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + (i * 0.1) }}
                className="glass-card p-5 flex items-center gap-5 group hover:border-violet-500/20 transition-all cursor-pointer"
              >
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-violet-400 transition-colors">
                  <activity.icon size={24} />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-slate-100 group-hover:text-violet-400 transition-colors">{activity.title}</h4>
                  <p className="text-sm text-slate-500">{activity.type} • {activity.time}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                   <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">+50 XP</span>
                   <Calendar size={18} className="text-slate-600 group-hover:text-slate-300 transition-colors" />
                </div>
              </motion.div>
            ))}
          </div>

          {/* Level Progression */}
          <div className="glass-card p-8 space-y-6 bg-gradient-to-br from-violet-600/5 to-transparent">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold">Rank Progression</h3>
              <span className="text-sm font-bold text-violet-400">Level 15 Master</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-medium mb-1">
                <span className="text-slate-400">Current XP: 2,450</span>
                <span className="text-slate-400">Next Level: 3,000</span>
              </div>
              <div className="h-4 bg-white/5 rounded-full overflow-hidden border border-white/5 p-1">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '81.6%' }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-violet-600 via-cyan-500 to-violet-600 bg-[length:200%_100%] animate-gradient-x rounded-full shadow-[0_0_15px_rgba(139,92,246,0.5)]"
                />
              </div>
              <p className="text-[10px] text-center text-slate-500 uppercase tracking-[0.2em] pt-2 italic">
                Only 550 XP left to reach Level 16
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
