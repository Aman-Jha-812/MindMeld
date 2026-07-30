import { useState, useEffect, useRef, useCallback } from 'react';
import { FiClock, FiFile, FiTrash2 } from 'react-icons/fi';
import * as chatService from '../../services/chatService';
import { useChat } from '../../context/ChatContext';

const formatRelativeTime = (date) => {
  const now = Date.now();
  const diff = now - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

const isImageMime = (mime) => mime?.startsWith('image/');

const fileHref = (url, name, mime) =>
  mime?.startsWith('image/') ? url : `/api/files/download?url=${encodeURIComponent(url)}&name=${encodeURIComponent(name || 'file')}`;

const FilePreview = ({ fileUrl, fileName, fileSize, mimeType }) => (
  <a
    href={fileHref(fileUrl, fileName, mimeType)}
    target="_blank"
    rel="noopener noreferrer"
    className="block mt-1 max-w-[200px] sm:max-w-xs"
  >
    <div className="flex items-center gap-2 p-1.5 sm:p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer">
      {fileUrl && isImageMime(mimeType) ? (
        <img src={fileUrl} alt={fileName} className="w-8 h-8 sm:w-10 sm:h-10 object-cover rounded" />
      ) : (
        <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center bg-gray-700 rounded">
          <FiFile className="text-gray-400" size={14} />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-xs sm:text-sm text-gray-200 truncate">{fileName}</p>
        {fileSize && <p className="text-[10px] sm:text-xs text-gray-500">{fileSize}</p>}
      </div>
    </div>
  </a>
);

const MessageBubble = ({ message, onDelete }) => {
  const isImageMsg = message.messageType === 'image' || (message.file?.url && isImageMime(message.file.mimeType));
  return (
    <div className={`group flex gap-2 sm:gap-3 ${message.messageType === 'system' ? 'justify-center' : ''}`}>
      {message.messageType === 'system' ? (
        <div className="text-gray-500 text-xs italic text-center py-1 px-3 bg-gray-800/50 rounded-full">
          {message.content}
        </div>
      ) : (
        <>
          <div className="flex-shrink-0">
            {message.sender?.avatar ? (
              <img src={typeof message.sender.avatar === 'string' ? message.sender.avatar : message.sender.avatar?.url} alt="" className="w-6 h-6 sm:w-8 sm:h-8 rounded-full object-cover mt-0.5" />
            ) : (
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] sm:text-xs font-medium text-white mt-0.5">
                {message.sender?.name?.charAt(0)?.toUpperCase() || '?'}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-1 sm:gap-2 flex-wrap">
              <span className="text-xs sm:text-sm font-semibold text-gray-100 truncate max-w-[120px] sm:max-w-[200px]">
                {message.sender?.name || 'Unknown'}
              </span>
              <span className="text-[10px] sm:text-xs text-gray-500 whitespace-nowrap">{formatRelativeTime(message.createdAt)}</span>
              <button
                onClick={() => onDelete?.(message._id || message.id)}
                className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity p-1 text-gray-500 hover:text-red-400 shrink-0"
                title="Delete message"
              >
                <FiTrash2 size={12} />
              </button>
            </div>
            {isImageMsg && (
              <a href={fileHref(message.file.url, message.file.name, message.file.mimeType)} target="_blank" rel="noopener noreferrer" className="block mt-1.5 max-w-[200px] sm:max-w-sm">
                <img src={message.file.url} alt={message.file.name || ''} className="rounded-lg cursor-pointer hover:opacity-90 transition-opacity w-full" />
              </a>
            )}
            {message.content && (
              <p className="text-xs sm:text-sm text-gray-300 mt-0.5 whitespace-pre-wrap break-words">
                {message.content}
                {message.isEdited && <span className="text-gray-500 text-[10px] sm:text-xs ml-1 italic">(edited)</span>}
              </p>
            )}
            {message.file?.url && !isImageMsg && (
              <FilePreview fileUrl={message.file.url} fileName={message.file.name} fileSize={message.file.size} mimeType={message.file.mimeType} />
            )}
          </div>
        </>
      )}
    </div>
  );
};

const LoadingSpinner = () => (
  <div className="flex justify-center py-4">
    <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
  </div>
);

const MessageList = ({ messages, loading, onLoadMore, hasMore }) => {
  const containerRef = useRef(null);
  const bottomRef = useRef(null);
  const prevMessagesLength = useRef(messages?.length || 0);
  const sentinelRef = useRef(null);
  const { removeMessage } = useChat();

  const handleDelete = useCallback(async (messageId) => {
    if (!window.confirm('Delete this message?')) return;
    try {
      await chatService.deleteMessage(messageId);
      removeMessage(messageId);
    } catch (err) {
      console.error('Failed to delete message:', err);
    }
  }, [removeMessage]);

  const handleScroll = useCallback(() => {
    if (!sentinelRef.current || !containerRef.current) return;
    const rect = sentinelRef.current.getBoundingClientRect();
    if (rect.top < containerRef.current.getBoundingClientRect().top + 100) {
      if (hasMore && !loading && onLoadMore) {
        onLoadMore();
      }
    }
  }, [hasMore, loading, onLoadMore]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore && !loading && onLoadMore) {
          onLoadMore();
        }
      },
      { root: containerRef.current, threshold: 0.1 }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loading, onLoadMore]);

  useEffect(() => {
    if (bottomRef.current && messages?.length > prevMessagesLength.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
    prevMessagesLength.current = messages?.length || 0;
  }, [messages]);

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="flex flex-col h-full overflow-y-auto px-2 sm:px-4 py-2 space-y-2 sm:space-y-3"
    >
      {loading && (!messages || messages.length === 0) && <LoadingSpinner />}
      <div ref={sentinelRef} className="h-1" />
      {messages?.map((msg) => (
        <div key={msg._id || msg.id}>
          <MessageBubble message={msg} onDelete={handleDelete} />
        </div>
      ))}
      <div ref={bottomRef} />
      {loading && messages?.length > 0 && <LoadingSpinner />}
      {(!messages || messages.length === 0) && !loading && (
        <div className="flex flex-col items-center justify-center h-full text-gray-500">
          <FiClock size={32} className="mb-2" />
          <p className="text-sm">No messages yet. Start the conversation!</p>
        </div>
      )}
    </div>
  );
};

export default MessageList;
