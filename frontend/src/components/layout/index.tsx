import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Briefcase,
  CheckSquare,
  BarChart3,
  Users,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  Search,
  Bell,
  Sparkles,
  Sun,
  Moon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/store/useAppStore';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: Briefcase, label: 'Projects', path: '/projects' },
  { icon: CheckSquare, label: 'Tasks', path: '/tasks' },
  { icon: BarChart3, label: 'Analytics', path: '/analytics' },
  { icon: Users, label: 'Team', path: '/team' },
];

export const Sidebar = () => {
  const isCollapsed = useAppStore(state => state.sidebarCollapsed);
  const setIsCollapsed = useAppStore(state => state.setSidebarCollapsed);

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen bg-white dark:bg-[#020617] border-r border-slate-200 dark:border-slate-800 transition-all duration-300 z-50 flex flex-col",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      <div className="p-6 flex items-center justify-between">
        {!isCollapsed && (
          <div className="flex items-center gap-2 font-bold text-2xl text-indigo-600 dark:text-indigo-400 tracking-tight">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
              <Sparkles size={18} fill="currentColor" />
            </div>
            <span>NexusAI</span>
          </div>
        )}
        {isCollapsed && (
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white mx-auto">
            <Sparkles size={18} fill="currentColor" />
          </div>
        )}
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group",
              isActive
                ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400"
                : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900/50 hover:text-slate-900 dark:hover:text-slate-100"
            )}
          >
            <item.icon size={22} className={cn("shrink-0", !isCollapsed && "group-hover:scale-110 transition-transform")} />
            {!isCollapsed && <span className="font-medium">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-100 dark:border-slate-800">
        {!isCollapsed && (
          <Button variant="outline" className="w-full justify-start gap-3 mb-4 rounded-xl border-dashed border-slate-300 dark:border-slate-700 dark:text-slate-400">
            <PlusCircle size={18} />
            <span>New Project</span>
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900/50 text-slate-500"
        >
          {isCollapsed ? <ChevronRight size={20} /> : <div className="flex items-center gap-3 w-full px-1"><ChevronLeft size={20} /> <span className="text-sm font-medium">Collapse</span></div>}
        </Button>
      </div>
    </aside>
  );
};

export const Navbar = () => {
  const currentUser = useAppStore(state => state.currentUser);
  const { theme, toggleTheme } = useAppStore();

  return (
    <header className="h-16 bg-white/70 dark:bg-[#020617]/70 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 sticky top-0 z-40 transition-colors duration-300">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative w-full max-w-md hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search tasks, projects..."
            className="w-full bg-slate-50 dark:bg-slate-900/50 border-none rounded-xl py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-indigo-500/20 transition-all outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-full transition-colors"
        >
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </Button>
        <Button variant="ghost" size="icon" className="relative text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-full">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
        </Button>
        <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-800 mx-2"></div>
        <div className="flex items-center gap-3 cursor-pointer group">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-none">{currentUser?.name || 'User'}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 capitalize">{currentUser?.role?.toLowerCase().replace('_', ' ') || 'Member'}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 border-2 border-white dark:border-slate-800 shadow-sm flex items-center justify-center text-indigo-700 dark:text-indigo-400 font-bold overflow-hidden group-hover:ring-2 group-hover:ring-indigo-500/20 transition-all">
            {currentUser?.avatar ? (
              <img src={currentUser.avatar} alt={currentUser.name || 'User'} className="w-full h-full object-cover" />
            ) : (
              <span>{currentUser?.name?.charAt(0) || 'U'}</span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
