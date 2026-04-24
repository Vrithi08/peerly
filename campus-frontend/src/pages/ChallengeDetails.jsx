import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { Trophy, Clock, Users, ArrowLeft, Send, ThumbsUp, Code, Image as ImageIcon, MessageSquare, Star, Zap, ChevronRight } from 'lucide-react';
// import { useChallengePulse } from '../hooks/useChallengePulse';

// Mock Data for a single challenge
const challengeData = {
  id: 1,
  title: 'Campus Hackathon 2026',
  creator: 'Engineering Club',
  category: 'Coding',
  description: 'Build a scalable solution for campus navigation using any modern framework. Focus on accessibility and real-time updates.',
  prize: '$500',
  participants: 156,
  status: 'Open', // Open, Voting, Closed
  submissionType: 'CODE',
  submissionDeadline: 'Oct 25, 2026 • 11:59 PM',
  votingDeadline: 'Oct 28, 2026 • 11:59 PM',
};

const submissions = [
  { id: 1, student: 'Sarah J.', content: 'Built a React-based interactive map...', votes: 145, preview: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=400&auto=format&fit=crop' },
  { id: 2, student: 'Mike R.', content: 'PWA for campus transit tracking...', votes: 132, preview: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=400&auto=format&fit=crop' },
  { id: 3, student: 'Emily D.', content: 'Voice assistant for dorm services...', votes: 98, preview: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=400&auto=format&fit=crop' },
];

export default function ChallengeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [phase, setPhase] = useState(challengeData.status);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [votedId, setVotedId] = useState(null);
  const [liveSubmissions, setLiveSubmissions] = useState(submissions);
  const [activities, setActivities] = useState([
    { id: 1, user: 'User_42', target: 'Sarah J.', time: 'Just now' },
    { id: 2, user: 'CreativeMind', target: 'Mike R.', time: '2m ago' },
  ]);

  const isConnected = false;
  const pulseData = null;
  // const { pulseData, isConnected } = useChallengePulse(id);

  // Update local state when a real-time pulse is received
  useEffect(() => {
    if (pulseData) {
      setLiveSubmissions(prev => prev.map(sub => 
        sub.id === pulseData.submissionId 
          ? { ...sub, votes: pulseData.voteCount } 
          : sub
      ));
      
      setActivities(prev => [
        { id: Date.now(), user: 'Someone', target: 'an entry', time: 'Just now' },
        ...prev.slice(0, 4)
      ]);
    }
  }, [pulseData]);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      {/* Back Button */}
      <button onClick={() => navigate('/challenges')} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4">
        <ArrowLeft size={20} />
        <span className="text-sm font-medium">Back to Challenges</span>
      </button>

      {/* Main Header Card */}
      <section className="glass-card p-8 border-violet-500/20 bg-gradient-to-br from-violet-600/5 to-transparent relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
           <Trophy size={120} />
        </div>
        
        <div className="flex flex-col md:flex-row justify-between gap-8 relative z-10">
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-violet-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-full">{challengeData.category}</span>
              <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md border ${
                phase === 'Open' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' :
                phase === 'Voting' ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' :
                'bg-slate-500/20 text-slate-400 border-slate-500/30'
              }`}>
                {phase} Phase
              </div>
            </div>
            <h1 className="text-4xl font-bold">{challengeData.title}</h1>
            <p className="text-slate-400 max-w-2xl leading-relaxed">{challengeData.description}</p>
            
            <div className="flex flex-wrap gap-6 pt-4">
              <div className="flex items-center gap-2 text-slate-300">
                <Clock className="text-violet-400" size={18} />
                <div className="text-xs">
                  <p className="text-slate-500 font-bold uppercase tracking-tighter">Deadline</p>
                  <p className="font-semibold">{phase === 'Open' ? challengeData.submissionDeadline : challengeData.votingDeadline}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Trophy className="text-yellow-500" size={18} />
                <div className="text-xs">
                  <p className="text-slate-500 font-bold uppercase tracking-tighter">Grand Prize</p>
                  <p className="font-semibold text-emerald-400">{challengeData.prize}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Users className="text-cyan-400" size={18} />
                <div className="text-xs">
                  <p className="text-slate-500 font-bold uppercase tracking-tighter">Participants</p>
                  <p className="font-semibold">{challengeData.participants} Students</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 md:w-64">
             {phase === 'Open' && (
               <button 
                 onClick={() => setIsSubmitting(true)}
                 className="btn-primary py-4 text-lg"
               >
                 Submit Entry
               </button>
             )}
             {phase === 'Voting' && (
               <div className="glass-card p-4 text-center border-cyan-500/30 bg-cyan-500/5">
                  <p className="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-1">Voting Live</p>
                  <p className="text-xl font-bold">Cast your vote!</p>
               </div>
             )}
             <button className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl font-semibold hover:bg-white/10 transition-all text-sm">
               Invite Peer
             </button>
          </div>
        </div>
      </section>

      {/* Main Content (Changes based on Phase) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left: Entries / Submission Form */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-2xl font-bold">
            {phase === 'Open' ? 'Challenge Rules & Submission' : 'Entries Gallery'}
          </h2>

          <AnimatePresence mode="wait">
            {isSubmitting ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="glass-card p-8 border-violet-500/40 bg-violet-600/5"
              >
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <Code className="text-violet-400" />
                    Submit Your Code
                  </h3>
                  <button onClick={() => setIsSubmitting(false)} className="text-slate-500 hover:text-white">Cancel</button>
                </div>
                
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Entry Description</label>
                    <textarea className="w-full bg-[#0a0a0f] border border-white/10 rounded-xl p-4 outline-none focus:border-violet-500/50 min-h-[100px]" placeholder="Briefly explain your solution..."></textarea>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Your Code / Demo Link</label>
                    <div className="h-64 bg-[#011627] rounded-xl border border-white/5 p-4 font-mono text-sm overflow-auto">
                      <p className="text-slate-500">// Start coding your solution here...</p>
                      <p className="text-cyan-400">function</p> <p className="text-white inline">peerlyPulse() {'{'}</p>
                      <p className="text-white ml-4">console.log(<span className="text-emerald-400">"Built with talent!"</span>);</p>
                      <p className="text-white">{'}'}</p>
                    </div>
                  </div>
                  <button className="w-full btn-primary py-3 flex items-center justify-center gap-2">
                    <Send size={18} />
                    Submit Entry
                  </button>
                </div>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {liveSubmissions.map((sub, i) => (
                  <motion.div 
                    key={sub.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="glass-card overflow-hidden group border-white/5 hover:border-violet-500/20"
                  >
                    <div className="relative h-48">
                      <img src={sub.preview} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] to-transparent opacity-60"></div>
                      <div className="absolute top-4 left-4 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-violet-600 border border-white/20 flex items-center justify-center font-bold text-xs">
                          {sub.student[0]}
                        </div>
                        <span className="text-xs font-bold shadow-lg">{sub.student}</span>
                      </div>
                    </div>
                    <div className="p-4 flex items-center justify-between">
                       <div className="space-y-1">
                          <p className="text-sm font-bold text-slate-200 line-clamp-1">{sub.content}</p>
                          <p className="text-[10px] text-slate-500 uppercase font-bold">{sub.votes} Pulse Votes</p>
                       </div>
                       {phase === 'Voting' && (
                         <button 
                          onClick={() => setVotedId(sub.id)}
                          className={`p-3 rounded-xl transition-all ${
                            votedId === sub.id 
                            ? 'bg-emerald-500/20 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]' 
                            : 'bg-white/5 text-slate-500 hover:bg-white/10 hover:text-white'
                          }`}
                         >
                           <ThumbsUp size={20} fill={votedId === sub.id ? "currentColor" : "none"} />
                         </button>
                       )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Right: Real-time Pulse Feed */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Zap className={isConnected ? "text-yellow-500" : "text-slate-600"} size={20} />
              Real-Time Pulse
            </h2>
            <span className={`flex items-center gap-1.5 text-[10px] font-bold uppercase ${isConnected ? 'text-emerald-400 animate-pulse' : 'text-rose-500'}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-rose-500'}`}></div> 
              {isConnected ? 'Live' : 'Offline'}
            </span>
          </div>

          <div className="glass-card p-6 space-y-6">
            {/* Top Submissions Mini-Leaderboard */}
            <div className="space-y-4">
               <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Live Ranking</h4>
               {[...liveSubmissions].sort((a, b) => b.votes - a.votes).map((sub, i) => (
                 <div key={sub.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-slate-600">#{i+1}</span>
                      <span className="text-sm font-medium">{sub.student}</span>
                    </div>
                    <div className="flex items-center gap-4 flex-1 mx-4">
                       <div className="h-1.5 flex-1 bg-white/5 rounded-full overflow-hidden">
                          <motion.div 
                            layout
                            initial={{ width: 0 }}
                            animate={{ width: `${(sub.votes / 200) * 100}%` }}
                            className="h-full bg-violet-500"
                          />
                       </div>
                    </div>
                    <span className="text-xs font-bold text-violet-400">{sub.votes}</span>
                 </div>
               ))}
            </div>

            <div className="pt-6 border-t border-white/5 space-y-4">
               <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Recent Activity</h4>
               {activities.map(activity => (
                 <motion.div 
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={activity.id} 
                    className="flex items-center gap-3 text-xs text-slate-400"
                 >
                    <Star className="text-yellow-500" size={14} />
                    <span><b className="text-slate-200">{activity.user}</b> just voted for <b className="text-slate-200">{activity.target}</b></span>
                 </motion.div>
               ))}
            </div>

            <div className="pt-6">
               <button 
                 onClick={() => setPhase(phase === 'Open' ? 'Voting' : phase === 'Voting' ? 'Closed' : 'Open')}
                 className="w-full py-2 bg-white/5 hover:bg-white/10 rounded-lg text-[10px] font-bold uppercase tracking-widest text-slate-500 transition-all"
               >
                 Demo: Advance Phase
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
