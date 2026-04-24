import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Mail, Lock, User, ArrowRight, Github, Chrome } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate login
    navigate('/');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0a0f]">
      {/* Background Decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-violet-600/20 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-600/20 blur-[120px] rounded-full"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md p-8 relative z-10"
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-violet-600 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(139,92,246,0.4)] mb-4">
            <Zap className="text-white fill-white" size={32} />
          </div>
          <h1 className="text-4xl font-bold tracking-tighter">Peer<span className="text-violet-500">ly.</span></h1>
          <p className="text-slate-500 mt-2">{isLogin ? 'Welcome back to Peerly!' : 'Join the Peerly community'}</p>
        </div>

        {/* Auth Card */}
        <div className="glass-card p-8 border-white/10 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input 
                    type="text" 
                    placeholder="John Doe" 
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 outline-none focus:border-violet-500/50 focus:ring-4 focus:ring-violet-500/10 transition-all"
                    required
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input 
                  type="email" 
                  placeholder="name@university.edu" 
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 outline-none focus:border-violet-500/50 focus:ring-4 focus:ring-violet-500/10 transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Password</label>
                {isLogin && <button type="button" className="text-[10px] text-violet-400 hover:text-violet-300 font-bold uppercase tracking-wider">Forgot?</button>}
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 outline-none focus:border-violet-500/50 focus:ring-4 focus:ring-violet-500/10 transition-all"
                  required
                />
              </div>
            </div>

            <button type="submit" className="w-full btn-primary py-3 flex items-center justify-center gap-2 mt-4 group">
              <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-px bg-white/10"></div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Or continue with</span>
            <div className="flex-1 h-px bg-white/10"></div>
          </div>

          {/* Social Logins */}
          <div className="grid grid-cols-2 gap-4">
            <button className="flex items-center justify-center gap-2 bg-white/5 border border-white/10 rounded-xl py-2.5 hover:bg-white/10 transition-all">
              <Chrome size={18} />
              <span className="text-sm font-medium">Google</span>
            </button>
            <button className="flex items-center justify-center gap-2 bg-white/5 border border-white/10 rounded-xl py-2.5 hover:bg-white/10 transition-all">
              <Github size={18} />
              <span className="text-sm font-medium">GitHub</span>
            </button>
          </div>
        </div>

        {/* Toggle Mode */}
        <p className="text-center mt-8 text-slate-400 text-sm">
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="ml-2 text-violet-400 font-bold hover:text-violet-300 transition-colors"
          >
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      </motion.div>
    </div>
  );
}
