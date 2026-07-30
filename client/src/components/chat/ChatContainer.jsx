import { useEffect, useCallback, useState } from 'react';
import { FiX } from 'react-icons/fi';
import { useChat } from '../../context/ChatContext';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import MessageInput from './MessageInput';

const ChatContainer = ({ workspaceId, channelId, workspaceName }) => {
  const {
    messages,
    loading,
    activeChannel,
    loadMessages,
    sendMessage,
    setTyping,
  } = useChat();

  const [error, setError] = useState(null);

  useEffect(() => {
    if (channelId && workspaceId) {
      loadMessages(workspaceId, channelId);
    }
  }, [channelId, workspaceId, loadMessages]);

  const handleSend = useCallback(
    async ({ content, file }) => {
      if (!channelId || !workspaceId) return;
      setError(null);
      try {
        await sendMessage(workspaceId, channelId, content, file);
      } catch (err) {
        console.error('Failed to send message:', err);
        setError(err?.response?.data?.message || err.message || 'Failed to send message');
      }
    },
    [channelId, workspaceId, sendMessage]
  );

  const handleTyping = useCallback(
    (channelId) => {
      if (channelId) {
        setTyping(channelId);
      }
    },
    [setTyping]
  );

  return (
    <div className="flex flex-col w-full h-full bg-gray-900">
      <ChatHeader
        channel={activeChannel}
        workspaceName={workspaceName}
        onToggleMembers={() => {}}
      />
      {error && (
        <div className="px-4 py-2 bg-red-900/50 border-b border-red-800 text-sm text-red-200 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-200 ml-2">
            <FiX size={14} />
          </button>
        </div>
      )}
      <div className="flex-1 w-full overflow-hidden relative">
        <MessageList
          messages={messages}
          loading={loading}
          hasMore={false}
        />
      </div>
      <MessageInput
        onSend={handleSend}
        onTyping={handleTyping}
        disabled={!channelId}
      />
    </div>
  );
};

export default ChatContainer;
