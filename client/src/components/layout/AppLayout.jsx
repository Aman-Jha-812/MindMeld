import { useState, useEffect } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { FiHome, FiMessageSquare, FiGrid, FiLogOut, FiMenu, FiX, FiHash, FiUsers, FiBell, FiUser } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useWorkspace } from '../../context/WorkspaceContext';
import Avatar from '../common/Avatar';
import api from '../../services/api';

const mainNavLinks = [
  { to: '/dashboard', icon: FiHome, label: 'Dashboard' },
  { to: '/chat', icon: FiMessageSquare, label: 'Chat' },
  { to: '/workspace', icon: FiGrid, label: 'Workspaces' },
];

const AppLayout = () => {
  const { user, logout } = useAuth();
  const { activeWorkspace, members } = useWorkspace();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileSidebar, setMobileSidebar] = useState(false);
  const [mobileRightSidebar, setMobileRightSidebar] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    api.get('/notifications/unread-count')
      .then(({ data }) => setUnreadCount(data.count || data.data || 0))
      .catch(() => {});
  }, []);

  const showRightSidebar = activeWorkspace && (location.pathname.startsWith('/chat') || location.pathname.startsWith('/workspace'));

  return (
    <div className="flex min-h-screen bg-dark-950">
      {/* Mobile Menu Button — hidden on chat page (ChatPage has its own) */}
      {!location.pathname.startsWith('/chat') && (
        <button
          onClick={() => setMobileSidebar(true)}
          className="fixed top-4 left-4 z-30 lg:hidden p-2 rounded-lg bg-dark-900 border border-dark-700 text-dark-300 hover:text-dark-100"
        >
          <FiMenu size={20} />
        </button>
      )}

      {/* Left Sidebar */}
      <aside className="hidden lg:flex flex-col h-screen w-64 fixed left-0 top-0 bg-dark-900 border-r border-dark-700 overflow-y-auto z-20">
        <div className="flex items-center gap-3 px-6 py-5 border-b border-dark-700">
          <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">M</span>
          </div>
          <span className="text-lg font-bold text-dark-100">MindMeld</span>
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

        <div className="px-3 py-4 border-t border-dark-700">
          <button
            onClick={() => navigate('/notifications')}
            className="relative p-2 text-gray-400 hover:text-gray-200 hover:bg-gray-800 rounded-lg transition-colors mb-2 mx-auto block"
          >
            <FiBell size={20} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          <NavLink
            to="/profile"
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-dark-800 transition-colors"
          >
            <Avatar src={user?.avatar} name={user?.name} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-dark-100 truncate">{user?.name}</p>
              <p className="text-xs text-dark-400 truncate">{user?.email}</p>
            </div>
          </NavLink>
          <button
            onClick={logout}
            className="sidebar-link w-full mt-1 text-dark-400 hover:text-red-400"
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
          <aside className="fixed left-0 top-0 h-screen w-64 bg-dark-900 border-r border-dark-700 overflow-y-auto shadow-2xl animate-slideIn">
            <div className="flex items-center justify-between px-6 py-5 border-b border-dark-700">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">M</span>
                </div>
                <span className="text-lg font-bold text-dark-100">MindMeld</span>
              </div>
              <button
                onClick={() => setMobileSidebar(false)}
                className="p-1 rounded-lg text-dark-400 hover:text-dark-100 hover:bg-dark-700 transition-colors"
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

            <div className="px-3 py-4 border-t border-dark-700">
              <NavLink
                to="/profile"
                onClick={() => setMobileSidebar(false)}
                className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-dark-800 transition-colors"
              >
                <Avatar src={user?.avatar} name={user?.name} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-dark-100 truncate">{user?.name}</p>
                  <p className="text-xs text-dark-400 truncate">{user?.email}</p>
                </div>
              </NavLink>
              <button onClick={logout} className="sidebar-link w-full mt-1 text-dark-400 hover:text-red-400">
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

      {/* Right Sidebar */}
      {showRightSidebar && (
        <>
          <aside className="hidden lg:flex flex-col h-screen w-72 fixed right-0 top-0 bg-dark-800 border-l border-dark-700 overflow-y-auto z-20">
            <div className="px-5 py-5 border-b border-dark-700">
              <h2 className="text-lg font-semibold text-dark-100 truncate">{activeWorkspace.name}</h2>
              <p className="text-sm text-dark-400 mt-1">{activeWorkspace.description || 'No description'}</p>
            </div>

            <div className="px-5 py-4 border-b border-dark-700">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-dark-400 mb-3 flex items-center gap-2">
                <FiHash size={14} />
                Channels
              </h3>
              <div className="space-y-1">
                {activeWorkspace.channels?.length > 0 ? (
                  activeWorkspace.channels.map((channel) => (
                    <NavLink
                      key={channel._id || channel.id}
                      to={`/chat/${activeWorkspace._id || activeWorkspace.id}/${channel._id || channel.id}`}
                      className={({ isActive }) =>
                        `sidebar-link text-sm ${isActive ? 'active' : ''}`
                      }
                    >
                      <FiHash size={14} />
                      <span>{channel.name}</span>
                    </NavLink>
                  ))
                ) : (
                  <p className="text-sm text-dark-500 px-4 py-2">No channels yet</p>
                )}
              </div>
            </div>

            <div className="px-5 py-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-dark-400 mb-3 flex items-center gap-2">
                <FiUsers size={14} />
                Members ({members.length})
              </h3>
              <div className="space-y-2">
                {members.length > 0 ? (
                  members.map((member) => (
                    <div key={member._id || member.id} className="flex items-center gap-3 px-2 py-1.5">
                      <Avatar
                        src={member.avatar || member.user?.avatar}
                        name={member.name || member.user?.name}
                        size="sm"
                      />
                      <span className="text-sm text-dark-200 truncate">
                        {member.name || member.user?.name || 'Unknown'}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-dark-500 px-2 py-1.5">No members loaded</p>
                )}
              </div>
            </div>
          </aside>

          {/* Mobile Right Sidebar Trigger — not rendered on chat page (channel sidebar has members) */}
          {!location.pathname.startsWith('/chat') && (
            <button
              onClick={() => setMobileRightSidebar(true)}
              className="fixed bottom-4 right-4 z-30 lg:hidden p-3 rounded-full bg-primary-600 text-white shadow-lg hover:bg-primary-700 transition-colors"
            >
              <FiUsers size={20} />
            </button>
          )}

          {/* Mobile Right Sidebar Overlay — top drawer (stays above input) */}
          {mobileRightSidebar && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileRightSidebar(false)} />
              <div className="fixed top-16 left-0 right-0 max-h-[50vh] bg-dark-800 shadow-2xl overflow-y-auto rounded-b-xl animate-slideDown">
                <div className="sticky top-0 bg-dark-800 px-5 py-4 border-b border-dark-700 flex items-center justify-between z-10">
                  <h2 className="text-lg font-semibold text-dark-100 truncate">{activeWorkspace?.name}</h2>
                  <button
                    onClick={() => setMobileRightSidebar(false)}
                    className="p-1 rounded-lg text-dark-400 hover:text-dark-100 hover:bg-dark-700 transition-colors"
                  >
                    <FiX size={20} />
                  </button>
                </div>

                <div className="px-5 py-4 border-b border-dark-700">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-dark-400 mb-3 flex items-center gap-2">
                    <FiHash size={14} />
                    Channels
                  </h3>
                  <div className="space-y-1">
                    {activeWorkspace?.channels?.map((channel) => (
                      <NavLink
                        key={channel._id || channel.id}
                        to={`/chat/${activeWorkspace._id || activeWorkspace.id}/${channel._id || channel.id}`}
                        onClick={() => setMobileRightSidebar(false)}
                        className={({ isActive }) =>
                          `sidebar-link text-sm ${isActive ? 'active' : ''}`
                        }
                      >
                        <FiHash size={14} />
                        <span>{channel.name}</span>
                      </NavLink>
                    ))}
                  </div>
                </div>

                <div className="px-5 py-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-dark-400 mb-3 flex items-center gap-2">
                    <FiUsers size={14} />
                    Members ({members.length})
                  </h3>
                  <div className="space-y-2">
                    {members.map((member) => (
                      <div key={member._id || member.id} className="flex items-center gap-3 px-2 py-1.5">
                        <Avatar
                          src={member.avatar || member.user?.avatar}
                          name={member.name || member.user?.name}
                          size="sm"
                        />
                        <span className="text-sm text-dark-200 truncate">
                          {member.name || member.user?.name || 'Unknown'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <style>{`
                @keyframes slideDown {
                  from { transform: translateY(-100%); }
                  to { transform: translateY(0); }
                }
                .animate-slideDown {
                  animation: slideDown 0.25s ease-out;
                }
              `}</style>
            </div>
          )}
        </>
      )}

      {/* Main Content */}
      <main
        className={`flex-1 min-h-screen transition-all duration-200 ${
          showRightSidebar ? 'lg:ml-64 lg:mr-72' : 'lg:ml-64'
        } pt-16 lg:pt-0`}
      >
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
