import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  Warehouse, 
  FileText,
  LogOut,
  X,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface NavItem {
  name: string;
  path: string;
  icon: React.ReactNode;
  roles: string[];
  category: 'overview' | 'management';
}

const navItems: NavItem[] = [
  { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="h-5 w-5" />, roles: ['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'], category: 'overview' },
  { name: 'Customers', path: '/customers', icon: <Users className="h-5 w-5" />, roles: ['ADMIN', 'SALES'], category: 'management' },
  { name: 'Products', path: '/products', icon: <Package className="h-5 w-5" />, roles: ['ADMIN', 'WAREHOUSE'], category: 'management' },
  { name: 'Inventory', path: '/inventory', icon: <Warehouse className="h-5 w-5" />, roles: ['ADMIN', 'WAREHOUSE'], category: 'management' },
  { name: 'Challans', path: '/challans', icon: <FileText className="h-5 w-5" />, roles: ['ADMIN', 'SALES', 'ACCOUNTS'], category: 'management' },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const location = useLocation();
  const { user, logout } = useAuth();

  const filteredNavItems = navItems.filter(item => 
    user && item.roles.includes(user.role)
  );

  const overviewItems = filteredNavItems.filter(i => i.category === 'overview');
  const managementItems = filteredNavItems.filter(i => i.category === 'management');

  const handleLinkClick = () => {
    if (onClose) onClose();
  };

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
        return 'bg-slate-100 text-slate-700 ring-1 ring-slate-400/20';
    }
  };

  const renderNavGroup = (title: string, items: NavItem[]) => {
    if (items.length === 0) return null;
    return (
      <div className="mb-6">
        <p className="px-3 mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          {title}
        </p>
        <ul className="space-y-1.5">
          {items.map((item) => {
            const isActive = location.pathname === item.path || 
              (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
            
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  onClick={handleLinkClick}
                  className={`group relative flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive 
                      ? 'bg-slate-900 text-white shadow-md shadow-slate-950/15' 
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 hover:translate-x-1'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`transition-colors duration-200 ${
                      isActive ? 'text-orange-400' : 'text-slate-400 group-hover:text-slate-700'
                    }`}>
                      {item.icon}
                    </span>
                    <span>{item.name}</span>
                  </div>

                  {isActive && (
                    <div className="flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-orange-400 animate-pulse" />
                      <ChevronRight className="h-4 w-4 text-slate-400" />
                    </div>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    );
  };

  return (
    <aside className={`
      fixed inset-y-0 left-0 z-40 w-68 bg-white border-r border-slate-200/80 transform transition-transform duration-300 ease-in-out flex flex-col shadow-xl shadow-slate-900/5
      md:relative md:translate-x-0
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
    `}>
      {/* Brand Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-white shadow-md shadow-slate-950/20 ring-2 ring-orange-500/20">
            <span className="text-lg font-black tracking-tight text-white">F</span>
            <span className="absolute bottom-1.5 right-1.5 h-2 w-2 rounded-full bg-orange-500 ring-2 ring-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-base font-bold tracking-tight text-slate-900">Fundsroom ERP</h1>
              <span className="rounded-full bg-orange-100 px-1.5 py-0.5 text-[10px] font-bold text-orange-600">v1.0</span>
            </div>
            <p className="text-xs font-medium text-slate-400">Operations Portal</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="md:hidden p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          aria-label="Close sidebar"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-5 overflow-y-auto custom-scrollbar">
        {renderNavGroup('Overview', overviewItems)}
        {renderNavGroup('Management', managementItems)}

        {/* System Health Card Widget */}
        <div className="mt-4 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 p-4 text-white shadow-lg shadow-slate-950/10">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-orange-400" />
              <span className="text-xs font-semibold text-slate-200">ERP System</span>
            </div>
            <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
              Live
            </span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            All operations & database pipelines active.
          </p>
        </div>
      </nav>

      {/* User Profile & Logout */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <div className="flex items-center justify-between gap-3 p-2.5 rounded-2xl bg-white border border-slate-200/70 shadow-sm">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative flex-shrink-0">
              <div className="h-9 w-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-900 truncate">{user?.name || 'User'}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`inline-block rounded-md px-1.5 py-0.2 text-[10px] font-bold uppercase tracking-wider ${getRoleBadgeStyle(user?.role)}`}>
                  {user?.role || 'Guest'}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              logout();
              handleLinkClick();
            }}
            title="Logout"
            className="flex-shrink-0 p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}