import { Search, Bell, User } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="h-20 px-8 flex items-center justify-between border-b border-white/10 bg-[#0a0a0f]/50 backdrop-blur-md sticky top-0 z-40">
      <div className="flex-1 max-w-xl">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-violet-400 transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Search challenges, help posts, or users..." 
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-12 pr-4 outline-none focus:border-violet-500/50 focus:ring-4 focus:ring-violet-500/10 transition-all placeholder:text-slate-500"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-6 ml-8">
        <button className="relative p-2 text-slate-400 hover:text-white transition-colors">
          <Bell size={24} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-violet-500 rounded-full"></span>
        </button>
        <div className="flex items-center gap-3 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full cursor-pointer hover:bg-white/10 transition-all">
          <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-cyan-500 rounded-full flex items-center justify-center font-bold text-sm">
            JD
          </div>
          <span className="text-sm font-medium pr-1">John Doe</span>
        </div>
      </div>
    </nav>
  );
}
