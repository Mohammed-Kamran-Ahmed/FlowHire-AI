import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Kanban, BarChart3, LogOut, User, Cpu, Briefcase } from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Pipelines', path: '/pipeline', icon: Kanban },
    { name: 'Hiring Analytics', path: '/analytics', icon: BarChart3 },
  ];

  return (
    <div className="w-64 bg-zinc-950 border-r border-zinc-800 flex flex-col h-screen fixed left-0 top-0 text-text-primary z-30 select-none">
      {/* Brand Logo Header */}
      <div className="p-6 border-b border-zinc-800 flex items-center space-x-3">
        <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
          <Cpu className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
            FlowHire AI
          </h1>
          <span className="text-[10px] tracking-widest text-zinc-500 uppercase font-semibold">Workspace</span>
        </div>
      </div>

      {/* Navigation list */}
      <div className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center px-4 py-3 rounded-xl text-sm font-medium transition duration-150 cursor-pointer ${
                isActive
                  ? 'bg-primary text-white shadow-lg shadow-primary/20'
                  : 'text-text-secondary hover:bg-zinc-900 hover:text-text-primary'
              }`
            }
          >
            <item.icon className="w-5 h-5 mr-3" />
            {item.name}
          </NavLink>
        ))}
      </div>

      {/* User profile bottom footer */}
      {user && (
        <div className="p-4 border-t border-zinc-800 bg-zinc-900/40">
          <div className="flex items-center space-x-3 p-2 bg-zinc-900/60 rounded-xl border border-zinc-800 mb-3">
            <div className="p-2 bg-zinc-800 rounded-lg text-primary">
              <User className="w-5 h-5" />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-[10px] text-primary font-semibold tracking-wider uppercase mt-0.5">
                {user.role}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center py-2.5 px-4 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl text-xs font-semibold text-red-400 hover:text-red-300 transition duration-150 cursor-pointer"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
};
