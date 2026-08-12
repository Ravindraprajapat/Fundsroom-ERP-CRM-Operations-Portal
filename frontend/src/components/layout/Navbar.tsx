import { Menu, Calendar, Sparkles } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface NavbarProps {
  onMenuClick?: () => void;
}

export function Navbar({ onMenuClick }: NavbarProps) {
  const { user } = useAuth();

  const getRoleBadgeStyle = (role?: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-purple-100 text-purple-700 ring-1 ring-purple-500/20';
      case 'SALES':
        return 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-500/20';
      case 'WAREHOUSE':
        return 'bg-amber-100 text-amber-700 ring-1 ring-amber-500/20';
      case 'ACCOUNTS':
        return 'bg-blue-100 text-blue-700 ring-1 ring-blue-500/20';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="px-4 md:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="md:hidden p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg md:text-xl font-bold tracking-tight text-slate-950">
                Welcome back, {user?.name || 'User'}
              </h2>
              <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-orange-50 px-2 py-0.5 text-xs font-semibold text-orange-600 ring-1 ring-orange-500/20">
                <Sparkles className="h-3 w-3 text-orange-500" />
                Active Session
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium hidden sm:flex items-center gap-1.5 mt-0.5">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 md:gap-4">
         
          
          <div className="h-8 w-px bg-slate-200 hidden sm:block" />

          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="h-9 w-9 bg-slate-950 text-white rounded-xl flex items-center justify-center font-bold text-sm shadow-sm ring-2 ring-slate-900/10">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-bold text-slate-900 leading-tight">{user?.name}</p>
              <span className={`inline-block mt-0.5 rounded px-1.5 py-0.2 text-[9px] font-extrabold uppercase tracking-wider ${getRoleBadgeStyle(user?.role)}`}>
                {user?.role}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}