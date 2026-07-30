import { FiHash, FiUsers, FiChevronRight } from 'react-icons/fi';

const ChatHeader = ({ channel, workspaceName, onToggleMembers }) => {
  if (!channel) {
    return (
      <div className="flex items-center px-6 py-3 border-b border-gray-800 bg-gray-900">
        <p className="text-sm text-gray-500">Select a channel to start chatting</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between px-3 sm:px-6 py-2 sm:py-3 border-b border-gray-800 bg-gray-900 min-h-0">
      <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
        {workspaceName && (
          <>
            <span className="text-[10px] sm:text-xs text-gray-500 truncate max-w-[80px] sm:max-w-none">{workspaceName}</span>
            <FiChevronRight size={10} className="text-gray-600 flex-shrink-0" />
          </>
        )}
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          <FiHash size={14} className="text-gray-400 flex-shrink-0" />
          <h1 className="text-sm sm:text-lg font-semibold text-gray-100 truncate">{channel.name}</h1>
        </div>
        {channel.description && (
          <span className="hidden sm:block text-xs text-gray-500 truncate max-w-[120px] lg:max-w-[200px] ml-2 pl-2 border-l border-gray-700">
            {channel.description}
          </span>
        )}
      </div>
      <button
        onClick={onToggleMembers}
        className="flex items-center gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm text-gray-400 hover:text-gray-200 hover:bg-gray-800 rounded-lg transition-colors shrink-0"
        title="Toggle members panel"
      >
        <FiUsers size={14} />
        <span className="hidden sm:inline">Members</span>
      </button>
    </div>
  );
};

export default ChatHeader;
