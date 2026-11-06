import { useState, useEffect } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { FiHome, FiMessageSquare, FiGrid, FiLogOut, FiMenu, FiX, FiBell, FiUser } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useChat } from '../../context/ChatContext';
import Avatar from '../common/Avatar';

const mainNavLinks = [
  { to: '/dashboard', icon: FiHome, label: 'Dashboard' },
  { to: '/chat', icon: FiMessageSquare, label: 'Chat' },
  { to: '/workspace', icon: FiGrid, label: 'Workspaces' },
];

const AppLayout = () => {
  const { user, logout } = useAuth();
  const { unreadCount, refreshUnreadCount } = useChat();
  const location = useLocation();
  const navigate = useNavigate();
  const isWorkspaceDetail = /^\/workspace\/[^/]+/.test(location.pathname);
  const [mobileSidebar, setMobileSidebar] = useState(false);

  useEffect(() => {
    refreshUnreadCount();
  }, [refreshUnreadCount]);

  return (
    <div className="flex min-h-screen bg-app">
      {/* Mobile Menu Button — hidden where the page provides its own menu toggle */}
      {!location.pathname.startsWith('/chat') && !isWorkspaceDetail && (
        <button
          onClick={() => setMobileSidebar(true)}
          className="fixed top-4 left-4 z-30 lg:hidden p-2 rounded-lg bg-sidebar border border-line text-ink-secondary hover:text-ink"
        >
          <FiMenu size={20} />
        </button>
      )}

      {/* Left Sidebar */}
      <aside className="hidden lg:flex flex-col h-screen w-64 fixed left-0 top-0 bg-sidebar border-r border-line overflow-y-auto z-20">
        <div className="flex items-center gap-3 px-6 py-5 border-b border-line">
          <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center">
            <span className="text-white font-bold text-sm">M</span>
          </div>
          <span className="text-lg font-bold text-ink">MindMeld</span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {mainNavLinks.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/dashboard'}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'active' : ''}`
              }
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'active' : ''}`
            }
          >
            <FiUser size={18} />
            <span>My Profile</span>
          </NavLink>
        </nav>

        <div className="px-3 py-4 border-t border-line">
          <button
            onClick={() => navigate('/notifications')}
            className="relative p-2 text-ink-secondary hover:text-ink hover:bg-hover rounded-lg transition-colors mb-2 mx-auto block"
          >
            <FiBell size={20} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-white text-xs rounded-full flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          <NavLink
            to="/profile"
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-hover transition-colors"
          >
            <Avatar src={user?.avatar} name={user?.name} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-ink truncate">{user?.name}</p>
              <p className="text-xs text-ink-secondary truncate">{user?.email}</p>
            </div>
          </NavLink>
          <button
            onClick={logout}
            className="sidebar-link w-full mt-1 text-ink-secondary hover:text-danger"
          >
            <FiLogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Left Sidebar Overlay */}
      {mobileSidebar && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileSidebar(false)} />
          <aside className="fixed left-0 top-0 h-screen w-64 bg-sidebar border-r border-line overflow-y-auto shadow-2xl animate-slideIn">
            <div className="flex items-center justify-between px-6 py-5 border-b border-line">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center">
                  <span className="text-white font-bold text-sm">M</span>
                </div>
                <span className="text-lg font-bold text-ink">MindMeld</span>
              </div>
              <button
                onClick={() => setMobileSidebar(false)}
                className="p-1 rounded-lg text-ink-secondary hover:text-ink hover:bg-hover transition-colors"
              >
                <FiX size={20} />
              </button>
            </div>

            <nav className="px-3 py-4 space-y-1">
              {mainNavLinks.map(({ to, icon: Icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/dashboard'}
                  onClick={() => setMobileSidebar(false)}
                  className={({ isActive }) =>
                    `sidebar-link ${isActive ? 'active' : ''}`
                  }
                >
                  <Icon size={18} />
                  <span>{label}</span>
                </NavLink>
              ))}
              <NavLink
                to="/profile"
                onClick={() => setMobileSidebar(false)}
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? 'active' : ''}`
                }
              >
                <FiUser size={18} />
                <span>My Profile</span>
              </NavLink>
            </nav>

            <div className="px-3 py-4 border-t border-line">
              <NavLink
                to="/profile"
                onClick={() => setMobileSidebar(false)}
                className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-hover transition-colors"
              >
                <Avatar src={user?.avatar} name={user?.name} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink truncate">{user?.name}</p>
                  <p className="text-xs text-ink-secondary truncate">{user?.email}</p>
                </div>
              </NavLink>
              <button onClick={logout} className="sidebar-link w-full mt-1 text-ink-secondary hover:text-danger">
                <FiLogOut size={18} />
                <span>Logout</span>
              </button>
            </div>
          </aside>
          <style>{`
            @keyframes slideIn {
              from { transform: translateX(-100%); }
              to { transform: translateX(0); }
            }
            .animate-slideIn {
              animation: slideIn 0.2s ease-out;
            }
          `}</style>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 min-w-0 min-h-screen lg:ml-64 pt-16 lg:pt-0">
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
