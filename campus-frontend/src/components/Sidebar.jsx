import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Trophy, MessageSquare, User, Settings, LogOut, Zap, Award } from 'lucide-react';

export default function Sidebar() {
  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: Trophy, label: 'Challenges', path: '/challenges' },
    { icon: Award, label: 'Leaderboard', path: '/leaderboard' },
    { icon: MessageSquare, label: 'Help Desk', path: '/help' },
    { icon: User, label: 'Profile', path: '/profile' },
  ];

  return (
    <aside className="w-72 h-screen sticky top-0 border-r border-white/10 bg-[#0a0a0f] flex flex-col p-6">
      <div className="flex items-center gap-3 px-2 mb-10">
        <div className="w-10 h-10 bg-violet-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.3)]">
          <Zap className="text-white fill-white" size={24} />
        </div>
        <span className="text-2xl font-bold tracking-tighter">Peer<span className="text-violet-500">ly.</span></span>
      </div>

      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => (
          <NavLink 
            key={item.label} 
            to={item.path}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <item.icon size={22} />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="pt-6 border-t border-white/10 space-y-2">
        <button className="nav-link w-full text-left">
          <Settings size={22} />
          <span className="font-medium">Settings</span>
        </button>
        <button className="nav-link w-full text-left text-rose-400 hover:text-rose-300 hover:bg-rose-500/5">
          <LogOut size={22} />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}
