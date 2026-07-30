import { useEffect } from 'react';
import { FiX } from 'react-icons/fi';

const Sidebar = ({ children, isOpen, onClose, side = 'left' }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const positionClasses = side === 'right'
    ? 'right-0 border-l border-dark-700'
    : 'left-0 border-r border-dark-700';

  const slideAnim = side === 'right' ? 'animate-slideInRight' : 'animate-slideIn';

  return (
    <>
      <aside
        className={`hidden lg:flex flex-col h-screen fixed top-0 ${positionClasses} bg-dark-900 w-64 overflow-y-auto z-30`}
      >
        {children}
      </aside>

      {isOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <aside
            className={`fixed top-0 ${positionClasses} h-screen w-64 bg-dark-900 overflow-y-auto z-50 shadow-2xl ${slideAnim}`}
          >
            <div className="flex justify-end p-4">
              <button
                onClick={onClose}
                className="p-1 rounded-lg text-dark-400 hover:text-dark-100 hover:bg-dark-700 transition-colors duration-200"
              >
                <FiX size={20} />
              </button>
            </div>
            {children}
          </aside>
          <style>{`
            @keyframes slideIn {
              from { transform: translateX(-100%); }
              to { transform: translateX(0); }
            }
            @keyframes slideInRight {
              from { transform: translateX(100%); }
              to { transform: translateX(0); }
            }
            .animate-slideIn {
              animation: slideIn 0.2s ease-out;
            }
            .animate-slideInRight {
              animation: slideInRight 0.2s ease-out;
            }
          `}</style>
        </div>
      )}
    </>
  );
};

export default Sidebar;
