import { useState, useEffect } from 'react';
import { NavLink, useLocation, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Mountain, 
  Calendar, 
  Users, 
  Image, 
  Star, 
  ChevronLeft,
  ChevronRight,
  Download,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import AdminLogin from './Login';

const Sidebar = ({ collapsed, setCollapsed, mobileOpen, setMobileOpen, onLogout }) => {
  const location = useLocation();
  
  const navItems = [
    { path: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
    { path: '/admin/trips', icon: Mountain, label: 'Trips' },
    { path: '/admin/bookings', icon: Calendar, label: 'Bookings' },
    { path: '/admin/leads', icon: Download, label: 'PDF Leads' },
    { path: '/admin/categories', icon: Star, label: 'Categories' },
    { path: '/admin/testimonials', icon: Users, label: 'Testimonials' },
    { path: '/admin/gallery', icon: Image, label: 'Gallery' },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-xs"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside 
        className={`fixed left-0 top-0 h-screen bg-white border-r border-gray-200 z-50 transition-all duration-300 flex flex-col ${
          mobileOpen ? 'translate-x-0 w-56' : '-translate-x-full md:translate-x-0'
        } ${collapsed ? 'md:w-14' : 'md:w-56'}`}
      >
        {/* Logo Header */}
        <div className="h-13 flex items-center justify-between px-3 border-b border-gray-100 flex-shrink-0">
          {(!collapsed || mobileOpen) ? (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Mountain className="w-4.5 h-4.5 text-white" />
              </div>
              <div className="truncate">
                <h1 className="text-gray-900 font-bold text-sm leading-tight truncate">Trek Premi</h1>
                <p className="text-gray-400 text-[10px]">Admin Panel</p>
              </div>
            </div>
          ) : (
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center mx-auto">
              <Mountain className="w-4.5 h-4.5 text-white" />
            </div>
          )}
          {mobileOpen && (
            <button onClick={() => setMobileOpen(false)} className="md:hidden text-gray-400 hover:text-gray-600 p-1">
              <X size={18} />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = item.exact 
              ? location.pathname === item.path 
              : location.pathname.startsWith(item.path);
            
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.exact}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  isActive 
                    ? 'bg-primary-500 text-white shadow-sm font-semibold' 
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                } ${collapsed && !mobileOpen ? 'justify-center px-0' : ''}`}
                title={collapsed && !mobileOpen ? item.label : undefined}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                {(!collapsed || mobileOpen) && <span className="truncate">{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div className="p-2 border-t border-gray-100 space-y-0.5 flex-shrink-0">
          <button
            onClick={onLogout}
            className={`w-full flex items-center gap-2.5 px-3 py-2 text-red-600 hover:bg-red-50 text-xs font-semibold rounded-lg transition-colors ${
              collapsed && !mobileOpen ? 'justify-center px-0' : ''
            }`}
            title={collapsed && !mobileOpen ? "Sign Out" : undefined}
          >
            <LogOut size={16} className="flex-shrink-0" />
            {(!collapsed || mobileOpen) && <span>Sign Out</span>}
          </button>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`hidden md:flex w-full items-center gap-2.5 px-3 py-1.5 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-lg text-xs transition-colors ${
              collapsed ? 'justify-center px-0' : ''
            }`}
            title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {collapsed ? <ChevronRight size={16} className="flex-shrink-0" /> : <ChevronLeft size={16} className="flex-shrink-0" />}
            {!collapsed && <span className="font-medium text-[11px]">Collapse</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('adminLoggedIn') === 'true' || sessionStorage.getItem('adminLoggedIn') === 'true';
  });

  const handleLogout = () => {
    localStorage.removeItem('adminLoggedIn');
    sessionStorage.removeItem('adminLoggedIn');
    setIsLoggedIn(false);
  };

  if (!isLoggedIn) {
    return <AdminLogin onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Mobile Top Navbar */}
      <header className="md:hidden sticky top-0 z-30 bg-white border-b border-gray-200 h-12 flex items-center justify-between px-3">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg"
        >
          <Menu size={20} />
        </button>
        <div className="flex items-center gap-2">
          <Mountain className="w-5 h-5 text-primary-500" />
          <span className="font-bold text-xs text-gray-900">Trek Premi Admin</span>
        </div>
        <div className="w-8" />
      </header>

      <Sidebar 
        collapsed={collapsed} 
        setCollapsed={setCollapsed} 
        mobileOpen={mobileOpen} 
        setMobileOpen={setMobileOpen} 
        onLogout={handleLogout} 
      />
      
      <main 
        className={`flex-1 transition-all duration-300 min-w-0 ${
          collapsed ? 'md:ml-14' : 'md:ml-56'
        }`}
      >
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
