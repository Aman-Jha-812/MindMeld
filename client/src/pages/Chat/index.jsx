import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useChat } from '../../context/ChatContext';
import useSocket from '../../hooks/useSocket';
import AIAssistantPanel from '../../components/ai/AIAssistantPanel';
import ChatContainer from '../../components/chat/ChatContainer';
import ChannelList from '../../components/chat/ChannelList';
import Avatar from '../../components/common/Avatar';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';
import {
  FiMessageSquare,
  FiHash,
  FiChevronDown,
  FiZap,
  FiGrid,
  FiArrowLeft,
  FiX,
  FiPaperclip,
  FiDownload,
  FiMaximize2,
  FiClock,
  FiMenu,
} from 'react-icons/fi';
import { formatRelativeTime, formatFileSize, isImageFile } from '../../utils/helpers';

const ChatPage = () => {
  const { workspaceId, channelId } = useParams();
  const navigate = useNavigate();
  const {
    workspaces,
    loading: workspacesLoading,
    activeWorkspace,
    setActiveWorkspace,
    loadWorkspaces,
    loadWorkspaceById,
    members,
    loadMembers,
  } = useWorkspace();
  const {
    channels,
    activeChannel,
    setActiveChannel,
    loadChannels,
    loading: chatLoading,
    messages,
    typingUsers,
    isConnected,
    setTyping,
    clearTyping,
    addMessage,
    joinChannel,
    leaveChannel,
    socketVersion,
  } = useChat();

  const [showSidebar, setShowSidebar] = useState(false);
  const [showWorkspaceDropdown, setShowWorkspaceDropdown] = useState(false);
  const [aiPanelOpen, setAiPanelOpen] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(min-width: 1280px)').matches,
  );
  const [previewFile, setPreviewFile] = useState(null);
  const [localTyping, setLocalTyping] = useState({});

  const { socket } = useSocket();

  const hasRouteParams = !!workspaceId;
  const showChat = hasRouteParams && channels.length > 0;

  useEffect(() => {
    if (!workspaceId) {
      loadWorkspaces();
    }
  }, [workspaceId, loadWorkspaces]);

  useEffect(() => {
    if (workspaceId) {
      loadWorkspaceById(workspaceId);
      loadChannels(workspaceId);
      loadMembers(workspaceId);
    }
  }, [workspaceId, loadWorkspaceById, loadChannels, loadMembers]);

  useEffect(() => {
    if (channelId && channels.length > 0) {
      const found = channels.find(
        (ch) => (ch._id || ch.id) === channelId
      );
      if (found) {
        setActiveChannel(found);
      }
    }
  }, [channelId, channels, setActiveChannel]);

  useEffect(() => {
    if (!channelId && channels.length > 0 && workspaceId) {
      const first = channels[0];
      setActiveChannel(first);
      navigate(`/chat/${workspaceId}/${first._id || first.id}`, { replace: true });
    }
  }, [channelId, channels, workspaceId, navigate, setActiveChannel]);

  useEffect(() => {
    if (!channelId) return;
    joinChannel(channelId);
    return () => leaveChannel(channelId);
  }, [channelId, joinChannel, leaveChannel, socketVersion]);

  useEffect(() => {
    if (!socket) return;
    const handleTyping = (data) => {
      if (data.channelId === (activeChannel?._id || activeChannel?.id)) {
        setTyping(data.userId, data.channelId);
        setTimeout(() => clearTyping(data.userId, data.channelId), 3000);
      }
    };
    socket.on('typing', handleTyping);
    return () => {
      socket.off('typing', handleTyping);
    };
  }, [socket, activeChannel, setTyping, clearTyping]);

  const handleSelectChannel = useCallback((channel) => {
    setActiveChannel(channel);
    if (workspaceId) {
      navigate(`/chat/${workspaceId}/${channel._id || channel.id}`);
    }
  }, [workspaceId, navigate, setActiveChannel]);

  const handleSelectWorkspace = useCallback((workspace) => {
    setActiveWorkspace(workspace);
    setShowWorkspaceDropdown(false);
    const wsId = workspace._id || workspace.id;
    navigate(`/chat/${wsId}`);
  }, [navigate, setActiveWorkspace]);

  const handleCreateChannel = useCallback(async (data) => {
    const { createChannel } = await import('../../services/chatService');
    try {
      const { data: result } = await createChannel(workspaceId, data);
      const newChannel = result.channel || result;
      loadChannels(workspaceId);
      setActiveChannel(newChannel);
      navigate(`/chat/${workspaceId}/${newChannel._id || newChannel.id}`);
    } catch (err) {
      console.error('Failed to create channel:', err);
    }
  }, [workspaceId, loadChannels, setActiveChannel, navigate]);

  const isTyping = activeChannel
    ? (typingUsers[activeChannel._id || activeChannel.id]?.length || 0) > 0
    : false;

  if (!hasRouteParams && workspacesLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!hasRouteParams) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-brand-soft rounded-2xl flex items-center justify-center mx-auto mb-6">
            <FiMessageSquare size={32} className="text-brand" />
          </div>
          <h2 className="text-xl font-semibold text-ink mb-2">Select a workspace</h2>
          <p className="text-ink-muted mb-8">Choose a workspace from the sidebar or below to start chatting with your team.</p>
          {workspaces.length > 0 ? (
            <div className="space-y-2">
              {workspaces.map((ws) => (
                <button
                  key={ws._id || ws.id}
                  onClick={() => handleSelectWorkspace(ws)}
                  className="w-full flex items-center gap-3 px-5 py-3 bg-card hover:bg-hover rounded-xl border border-line hover:border-brand transition-all text-left group"
                >
                  <div className="w-10 h-10 rounded-lg bg-brand flex items-center justify-center flex-shrink-0">
                    <FiGrid size={18} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink truncate">{ws.name}</p>
                    <p className="text-xs text-ink-muted truncate">{ws.description || 'No description'}</p>
                  </div>
                  <FiChevronDown size={16} className="text-ink-muted -rotate-90 group-hover:text-ink-secondary transition-colors" />
                </button>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<FiGrid size={32} />}
              title="No workspaces"
              description="Create or join a workspace to start chatting."
              action="Go to Dashboard"
              onAction={() => navigate('/dashboard')}
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full min-w-0 overflow-hidden h-[calc(100vh-64px)] lg:h-[calc(100vh-3rem)] -m-6">
      {/* Mobile sidebar toggle */}
      <button
        onClick={() => setShowSidebar(true)}
        className="fixed top-4 left-4 z-30 lg:hidden p-2.5 rounded-lg bg-sidebar border border-line text-ink-secondary hover:text-ink shadow-lg"
      >
        <FiMenu size={20} />
      </button>

      {/* Sidebar overlay for mobile */}
      {showSidebar && (
        <div className="fixed inset-0 z-40 lg:hidden" onClick={() => setShowSidebar(false)}>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
        </div>
      )}

      {/* Channel sidebar */}
      <div className={`lg:flex flex-col w-60 bg-sidebar border-r border-line flex-shrink-0 ${showSidebar ? 'fixed inset-y-0 left-0 z-50 shadow-2xl animate-slideIn' : 'hidden'}`}>
        <div className="flex lg:hidden items-center justify-between px-4 pt-3 pb-1">
          <Link to="/dashboard" className="text-sm text-brand hover:text-brand-hover font-medium" onClick={() => setShowSidebar(false)}>
            ← Dashboard
          </Link>
          <button onClick={() => setShowSidebar(false)} className="p-1 text-ink-secondary hover:text-ink">
            <FiX size={18} />
          </button>
        </div>
        <div className="px-4 py-3 border-b border-line relative">
          <button
            onClick={() => setShowWorkspaceDropdown(!showWorkspaceDropdown)}
            className="w-full flex items-center gap-2 text-left"
          >
            <Avatar
              src={activeWorkspace?.avatar}
              name={activeWorkspace?.name}
              size="sm"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-ink truncate">
                {activeWorkspace?.name || 'Select workspace'}
              </p>
              <p className="text-xs text-ink-muted flex items-center gap-1">
                <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-success' : 'bg-ink-muted'}`} />
                {isConnected ? 'Connected' : 'Disconnected'}
              </p>
            </div>
            <FiChevronDown size={16} className={`text-ink-muted transition-transform ${showWorkspaceDropdown ? 'rotate-180' : ''}`} />
          </button>

          {showWorkspaceDropdown && (
            <div className="absolute left-0 right-0 top-full mt-1 mx-3 bg-card border border-line rounded-lg shadow-xl z-30 py-1 max-h-60 overflow-y-auto">
              {workspaces.map((ws) => {
                const wsId = ws._id || ws.id;
                const isActive = wsId === (activeWorkspace?._id || activeWorkspace?.id);
                return (
                  <button
                    key={wsId}
                    onClick={() => handleSelectWorkspace(ws)}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors ${
                      isActive ? 'bg-brand-soft text-brand' : 'text-ink-secondary hover:bg-hover'
                    }`}
                  >
                    <Avatar src={ws.avatar} name={ws.name} size="sm" />
                    <span className="truncate">{ws.name}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          <ChannelList
            channels={channels}
            activeChannelId={channelId}
            onSelectChannel={(ch) => { handleSelectChannel(ch); setShowSidebar(false); }}
            onCreateChannel={handleCreateChannel}
            workspaceId={workspaceId}
          />
          {chatLoading && (
            <div className="flex justify-center py-3">
              <LoadingSpinner size="sm" />
            </div>
          )}
        </div>

        <div className="px-3 py-3 border-t border-line space-y-2">
          <button
            onClick={() => setAiPanelOpen(!aiPanelOpen)}
            className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
              aiPanelOpen
                ? 'bg-brand-soft text-brand border border-brand'
                : 'text-ink-secondary hover:text-ink hover:bg-hover border border-transparent'
            }`}
          >
            <FiZap size={16} />
            <span>AI Assistant</span>
            {aiPanelOpen && <FiX size={14} className="ml-auto" />}
          </button>
          {activeWorkspace && (
            <div className="px-3 py-2">
              <p className="text-xs text-ink-muted font-medium uppercase tracking-wider mb-2">Members</p>
              <div className="flex flex-wrap gap-1">
                {members.slice(0, 8).map((member) => {
                  const memberName = member.name || member.user?.name || '?';
                  return (
                    <Avatar
                      key={member._id || member.id}
                      src={member.avatar || member.user?.avatar}
                      name={memberName}
                      size="sm"
                      className="ring-2 ring-sidebar"
                    />
                  );
                })}
                {members.length > 8 && (
                  <div className="w-8 h-8 rounded-full bg-card flex items-center justify-center text-xs text-ink-secondary ring-2 ring-sidebar">
                    +{members.length - 8}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main chat area */}
      <div className="flex flex-1 basis-0 flex-col min-w-0 w-full pl-10 lg:pl-0">
        {!showChat ? (
          <div className="flex-1 flex items-center justify-center bg-card">
            <EmptyState
              icon={<FiMessageSquare size={48} />}
              title="No channels in this workspace"
              description="Create a channel to start discussing with your team."
              action="Create Channel"
              onAction={() => handleCreateChannel({ name: 'general', description: 'General discussion' })}
            />
          </div>
        ) : activeChannel ? (
          <>
            <ChatContainer workspaceId={workspaceId} channelId={channelId} workspaceName={activeWorkspace?.name} />
            {isTyping && (
              <div className="px-6 py-1.5 text-xs text-ink-muted bg-card border-t border-line flex items-center gap-2">
                <span className="flex gap-0.5">
                  <span className="w-1 h-1 bg-ink-muted rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1 h-1 bg-ink-muted rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1 h-1 bg-ink-muted rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </span>
                Someone is typing...
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-card">
            <LoadingSpinner size="lg" />
          </div>
        )}
      </div>

      <AIAssistantPanel
        isOpen={aiPanelOpen}
        onClose={() => setAiPanelOpen(false)}
        channelMessages={messages}
      />

      <Modal
        isOpen={!!previewFile}
        onClose={() => setPreviewFile(null)}
        title={previewFile?.name || 'File Preview'}
        size="lg"
      >
        {previewFile && (
          <div className="space-y-4">
            {previewFile.mimeType && isImageFile(previewFile.mimeType) ? (
              <div className="flex items-center justify-center bg-hover rounded-lg overflow-hidden max-h-[60vh]">
                <img
                  src={previewFile.url}
                  alt={previewFile.name}
                  className="max-w-full max-h-[60vh] object-contain"
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-ink-secondary">
                <FiPaperclip size={48} className="mb-4" />
                <p className="text-sm text-ink-secondary mb-1">{previewFile.name}</p>
                <p className="text-xs text-ink-muted">{previewFile.mimeType || 'Unknown type'}</p>
              </div>
            )}
            <div className="flex items-center justify-between px-1">
              <div className="text-sm text-ink-secondary">
                <span className="text-ink-secondary font-medium">{previewFile.name}</span>
                {previewFile.size && (
                  <span className="ml-2 text-ink-muted">{formatFileSize(previewFile.size)}</span>
                )}
              </div>
              <div className="flex gap-2">
                {previewFile.url && (
                  <a
                    href={previewFile.url}
                    download={previewFile.name}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-brand hover:text-brand-hover bg-brand-soft hover:bg-brand-soft rounded-lg transition-colors"
                  >
                    <FiDownload size={14} />
                    Download
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ChatPage;
