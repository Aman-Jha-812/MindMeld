import { useEffect, useState, useCallback } from 'react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useChat } from '../../context/ChatContext';
import * as chatService from '../../services/chatService';
import {
  FiHash,
  FiUsers,
  FiSettings,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiLogOut,
  FiUserPlus,
  FiChevronDown,
  FiCheckSquare,
  FiCpu,
  FiMessageSquare,
  FiX,
  FiEye,
  FiEyeOff,
  FiCircle,
  FiMenu,
} from 'react-icons/fi';
import ChatContainer from '../../components/chat/ChatContainer';
import ChannelList from '../../components/chat/ChannelList';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import InviteModal from './components/InviteModal';
import AIAssistantPanel from '../../components/ai/AIAssistantPanel';
import TaskCard from '../../components/dashboard/SortableTaskCard';
import api from '../../services/api';

const ROLE_BADGE_VARIANTS = {
  owner: 'warning',
  admin: 'success',
  member: 'info',
  viewer: 'default',
};

const WorkspacePage = () => {
  const { id: workspaceId } = useParams();
  const isNewWorkspace = workspaceId === 'new';
  const navigate = useNavigate();
  const {
    activeWorkspace,
    members,
    loading,
    loadWorkspaceById,
    loadMembers,
    createWorkspace,
    removeMember,
    leaveWorkspace,
    deleteWorkspace,
  } = useWorkspace();
  const {
    channels,
    activeChannel,
    setActiveChannel,
    loadChannels,
    messages,
  } = useChat();

  const [showSidebar, setShowSidebar] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [showCreateChannel, setShowCreateChannel] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', description: '', type: 'general' });
  const [creating, setCreating] = useState(false);
  const [createWorkspaceForm, setCreateWorkspaceForm] = useState({ name: '', description: '' });
  const [creatingWorkspace, setCreatingWorkspace] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [taskForm, setTaskForm] = useState({ title: '', priority: 'medium', dueDate: '' });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDragEnd = async ({ active, over }) => {
    if (!over || active.id === over.id) return;
    const oldIndex = tasks.findIndex((t) => (t._id || t.id) === active.id);
    const newIndex = tasks.findIndex((t) => (t._id || t.id) === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    const next = arrayMove(tasks, oldIndex, newIndex);
    setTasks(next);
    api.put('/tasks/reorder', {
      tasks: next.map((t, i) => ({ id: t._id || t.id, order: i, status: t.status })),
    }).catch(() => toast.error('Failed to save task order'));
  };

  const handleCreateWorkspace = useCallback(async (e) => {
    e.preventDefault();
    if (!createWorkspaceForm.name.trim()) return;
    setCreatingWorkspace(true);
    try {
      const workspace = await createWorkspace(createWorkspaceForm);
      navigate(`/workspace/${workspace._id || workspace.id}`);
      toast.success('Workspace created!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create workspace');
    } finally {
      setCreatingWorkspace(false);
    }
  }, [createWorkspaceForm, createWorkspace, navigate]);

  useEffect(() => {
    if (workspaceId && !isNewWorkspace) {
      loadWorkspaceById(workspaceId);
      loadChannels(workspaceId);
      loadMembers(workspaceId);
    }
  }, [workspaceId, isNewWorkspace, loadWorkspaceById, loadChannels, loadMembers]);

  useEffect(() => {
    if (channels.length > 0 && !activeChannel) {
      setActiveChannel(channels[0]);
    }
  }, [channels, activeChannel, setActiveChannel]);

  useEffect(() => {
    if (workspaceId && !isNewWorkspace) {
      api.get(`/tasks/workspaces/${workspaceId}/tasks`)
        .then(({ data }) => setTasks(data.data || []))
        .catch(() => {});
    }
  }, [workspaceId, isNewWorkspace]);

  const handleCreateChannel = useCallback(async (e) => {
    e?.preventDefault();
    if (!createForm.name.trim()) return;
    setCreating(true);
    try {
      const { data } = await chatService.createChannel(workspaceId, {
        name: createForm.name.trim().toLowerCase().replace(/\s+/g, '-'),
        description: createForm.description.trim(),
        type: createForm.type,
      });
      const newChannel = data.channel || data;
      loadChannels(workspaceId);
      setActiveChannel(newChannel);
      setShowCreateChannel(false);
      setCreateForm({ name: '', description: '', type: 'general' });
      toast.success(`Channel #${newChannel.name} created`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create channel');
    } finally {
      setCreating(false);
    }
  }, [createForm, workspaceId, loadChannels, setActiveChannel]);

  const handleRemoveMember = async (memberId) => {
    try {
      await removeMember(workspaceId, memberId);
      toast.success('Member removed');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to remove member');
    }
  };

  const handleLeave = async () => {
    try {
      await leaveWorkspace(workspaceId);
      navigate('/dashboard');
      toast.success('Left workspace');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to leave workspace');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteWorkspace(workspaceId);
      navigate('/dashboard');
      toast.success('Workspace deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete workspace');
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post(`/tasks/workspaces/${workspaceId}/tasks`, taskForm);
      const newTask = data.data || data;
      setTasks(prev => [...prev, newTask]);
      setShowCreateTask(false);
      setTaskForm({ title: '', priority: 'medium', dueDate: '' });
      toast.success('Task created');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create task');
    }
  };

  const handleTaskStatusChange = async (task, nextStatus) => {
    const taskId = task._id || task.id;
    const prevStatus = task.status;
    setTasks((prev) => prev.map((t) =>
      (t._id === taskId || t.id === taskId) ? { ...t, status: nextStatus } : t
    ));
    try {
      await api.put(`/tasks/${taskId}`, { status: nextStatus });
      toast.success(`Task ${nextStatus === 'completed' ? 'completed' : 'updated'}`);
    } catch (err) {
      setTasks((prev) => prev.map((t) =>
        (t._id === taskId || t.id === taskId) ? { ...t, status: prevStatus } : t
      ));
      toast.error(err.response?.data?.message || 'Failed to update task');
    }
  };

  const currentUserRole = activeWorkspace?.role?.toLowerCase() || 'member';
  const isAdmin = currentUserRole === 'owner' || currentUserRole === 'admin';
  const channelCount = channels.length;

  if (loading && !activeWorkspace && !isNewWorkspace) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (isNewWorkspace) {
    return (
      <div className="max-w-lg mx-auto py-12 px-4">
        <div className="card">
          <h2 className="text-xl font-bold text-gray-100 mb-6">Create Workspace</h2>
          <form onSubmit={handleCreateWorkspace} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Workspace Name</label>
              <input
                type="text"
                value={createWorkspaceForm.name}
                onChange={(e) => setCreateWorkspaceForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="e.g. My Team"
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Description</label>
              <textarea
                value={createWorkspaceForm.description}
                onChange={(e) => setCreateWorkspaceForm((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="What's this workspace about?"
                className="input-field"
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creatingWorkspace || !createWorkspaceForm.name.trim()}
                className="btn-primary"
              >
                {creatingWorkspace ? 'Creating...' : 'Create Workspace'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  if (!activeWorkspace) {
    return (
      <EmptyState
        icon={<FiHash size={48} />}
        title="Workspace not found"
        description="This workspace doesn't exist or you don't have access to it."
        action="Go to Dashboard"
        onAction={() => navigate('/dashboard')}
      />
    );
  }

  return (
    <div className="flex h-[calc(100vh-3rem)] -m-6 relative">
      {/* Mobile sidebar toggle */}
      <button
        onClick={() => setShowSidebar(true)}
        className="fixed top-4 left-4 z-30 lg:hidden p-2 rounded-lg bg-gray-900 border border-gray-700 text-gray-300 hover:text-gray-100 shadow-lg"
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
      <div className={`lg:flex flex-col w-72 bg-gray-900 border-r border-gray-800 flex-shrink-0 ${showSidebar ? 'fixed inset-y-0 left-0 z-50 shadow-2xl animate-slideIn' : 'hidden'}`}>
        <div className="flex lg:hidden items-center justify-between px-4 pt-3 pb-1">
          <span className="text-sm font-semibold text-gray-100">Workspace</span>
          <button onClick={() => setShowSidebar(false)} className="p-1 text-gray-400 hover:text-gray-200">
            <FiX size={18} />
          </button>
        </div>
        <div className="px-4 py-4 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <h2 className="text-sm font-semibold text-gray-100 truncate">{activeWorkspace.name}</h2>
              <p className="text-xs text-gray-500 truncate mt-0.5">{activeWorkspace.description || 'No description'}</p>
            </div>
            <button
              onClick={() => setShowAI(!showAI)}
              className={`p-1.5 rounded-lg transition-colors ${showAI ? 'bg-indigo-600/20 text-indigo-400' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'}`}
              title="AI Assistant"
            >
              <FiCpu size={16} />
            </button>
            <div className="relative ml-2">
              <button
                onClick={() => setSettingsOpen(!settingsOpen)}
                className="p-1.5 text-gray-400 hover:text-gray-200 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <FiSettings size={16} />
              </button>
              {settingsOpen && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-30 py-1">
                  {isAdmin && (
                    <button
                      onClick={() => { setShowInviteModal(true); setSettingsOpen(false); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 transition-colors"
                    >
                      <FiUserPlus size={14} />
                      Invite Members
                    </button>
                  )}
                  {isAdmin && (
                    <button
                      onClick={() => { setShowCreateChannel(true); setSettingsOpen(false); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 transition-colors"
                    >
                      <FiPlus size={14} />
                      Create Channel
                    </button>
                  )}
                  {isAdmin && (
                    <button
                      onClick={() => { handleDelete(); setSettingsOpen(false); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-gray-700 transition-colors"
                    >
                      <FiTrash2 size={14} />
                      Delete Workspace
                    </button>
                  )}
                  <button
                    onClick={() => { handleLeave(); setSettingsOpen(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 transition-colors"
                  >
                    <FiLogOut size={14} />
                    Leave Workspace
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <FiHash size={12} />
              {channelCount} channels
            </span>
            <span className="flex items-center gap-1">
              <FiUsers size={12} />
              {members.length} members
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <ChannelList
            channels={channels}
            activeChannelId={activeChannel?._id || activeChannel?.id}
            onSelectChannel={setActiveChannel}
            onCreateChannel={() => setShowCreateChannel(true)}
            workspaceId={workspaceId}
          />
        </div>

        <div className="px-4 py-3 border-t border-gray-800">
          <button
            onClick={() => setShowMembers(!showMembers)}
            className="w-full flex items-center gap-2 text-sm text-gray-400 hover:text-gray-200 transition-colors"
          >
            <FiUsers size={16} />
            <span>Members ({members.length})</span>
            <FiChevronDown
              size={14}
              className={`ml-auto transition-transform ${showMembers ? 'rotate-180' : ''}`}
            />
          </button>
          {showMembers && (
            <div className="mt-2 space-y-1 max-h-48 overflow-y-auto">
              {members.map((member) => {
                const memberId = member._id || member.id;
                const memberName = member.name || member.user?.name || 'Unknown';
                const memberRole = (member.role || member.user?.role || 'member').toLowerCase();
                return (
                  <div key={memberId} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-800 transition-colors group">
                    <Avatar
                      src={member.avatar || member.user?.avatar}
                      name={memberName}
                      size="sm"
                    />
                    <span className="text-sm text-gray-300 truncate flex-1">{memberName}</span>
                    <Badge variant={ROLE_BADGE_VARIANTS[memberRole] || 'default'} size="sm">
                      {memberRole}
                    </Badge>
                  </div>
                );
              })}
              {members.length === 0 && (
                <p className="text-xs text-gray-600 px-2 py-1">No members loaded</p>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col min-w-0 pt-12 lg:pt-0">
        {channels.length === 0 ? (
          <div className="flex-1 flex items-center justify-center bg-gray-900">
            <EmptyState
              icon={<FiMessageSquare size={48} />}
              title="No channels yet"
              description="Create the first channel to start collaborating with your team."
              action="Create Channel"
              onAction={() => setShowCreateChannel(true)}
            />
          </div>
        ) : activeChannel ? (
          <ChatContainer
              workspaceId={workspaceId}
              channelId={activeChannel?._id || activeChannel?.id}
              workspaceName={activeWorkspace?.name}
            />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-900">
            <LoadingSpinner size="lg" />
          </div>
        )}
      </div>

      {isAdmin && (
        <div className={`lg:flex flex-col w-80 bg-gray-900 border-l border-gray-800 flex-shrink-0 overflow-y-auto ${showMembers ? 'fixed inset-y-0 right-0 z-50 shadow-2xl animate-slideIn lg:relative lg:inset-auto lg:z-auto lg:shadow-none' : 'hidden'}`}>
          <div className="px-5 py-4 border-b border-gray-800">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                <FiUsers size={16} className="text-indigo-400" />
                Members ({members.length})
              </h3>
              <button
                onClick={() => setShowInviteModal(true)}
                className="p-1.5 text-gray-400 hover:text-gray-200 hover:bg-gray-800 rounded-lg transition-colors"
                title="Invite member"
              >
                <FiUserPlus size={16} />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
            {members.map((member) => {
              const memberId = member._id || member.id;
              const memberName = member.name || member.user?.name || 'Unknown';
              const memberRole = (member.role || member.user?.role || 'member').toLowerCase();
              const isOnline = member.isOnline ?? true;
              return (
                <div
                  key={memberId}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-800/60 transition-colors group"
                >
                  <div className="relative flex-shrink-0">
                    <Avatar
                      src={member.avatar || member.user?.avatar}
                      name={memberName}
                      size="sm"
                    />
                    <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-gray-900 ${
                      isOnline ? 'bg-green-500' : 'bg-gray-500'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-200 truncate">{memberName}</p>
                    <p className="text-xs text-gray-500">
                      {isOnline ? 'Online' : 'Offline'}
                    </p>
                  </div>
                  <Badge variant={ROLE_BADGE_VARIANTS[memberRole] || 'default'} size="sm">
                    {memberRole}
                  </Badge>
                  {isAdmin && memberRole !== 'owner' && (
                    <button
                      onClick={() => handleRemoveMember(memberId)}
                      className="p-1 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                      title="Remove member"
                    >
                      <FiX size={14} />
                    </button>
                  )}
                </div>
              );
            })}
            {members.length === 0 && (
              <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                <FiUsers size={24} className="mb-2" />
                <p className="text-sm">No members</p>
              </div>
            )}
          </div>
          <div className="px-5 py-4 border-b border-gray-800">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                <FiCheckSquare size={16} className="text-indigo-400" />
                Tasks
              </h3>
              <button
                onClick={() => setShowCreateTask(true)}
                className="p-1.5 text-gray-400 hover:text-gray-200 hover:bg-gray-800 rounded-lg transition-colors"
                title="Create task"
              >
                <FiPlus size={16} />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
            {tasks.length > 0 ? (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={tasks.map((t) => t._id || t.id)} strategy={verticalListSortingStrategy}>
                  {tasks.map((task) => (
                    <TaskCard key={task._id || task.id} task={task} onStatusChange={handleTaskStatusChange} />
                  ))}
                </SortableContext>
              </DndContext>
            ) : (
              <p className="text-xs text-gray-600 text-center py-4">No tasks yet</p>
            )}
          </div>
          <div className="px-5 py-4 border-t border-gray-800">
            <button
              onClick={() => setShowInviteModal(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-500 transition-colors"
            >
              <FiUserPlus size={16} />
              Invite Member
            </button>
          </div>
        </div>
      )}

      <Modal
        isOpen={showCreateChannel}
        onClose={() => { setShowCreateChannel(false); setCreateForm({ name: '', description: '', type: 'general' }); }}
        title="Create Channel"
        size="sm"
      >
        <form onSubmit={handleCreateChannel} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Channel Name</label>
            <div className="relative">
              <FiHash className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
              <input
                type="text"
                value={createForm.name}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="e.g. project-alpha"
                className="w-full bg-gray-800 text-gray-100 placeholder-gray-500 rounded-lg pl-10 pr-3 py-2 text-sm border border-gray-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                autoFocus
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Description</label>
            <input
              type="text"
              value={createForm.description}
              onChange={(e) => setCreateForm((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="What's this channel about?"
              className="w-full bg-gray-800 text-gray-100 placeholder-gray-500 rounded-lg px-3 py-2 text-sm border border-gray-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Type</label>
            <select
              value={createForm.type}
              onChange={(e) => setCreateForm((prev) => ({ ...prev, type: e.target.value }))}
              className="w-full bg-gray-800 text-gray-100 rounded-lg px-3 py-2 text-sm border border-gray-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="general">General</option>
              <option value="development">Development</option>
              <option value="design">Design</option>
              <option value="hr">HR</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => { setShowCreateChannel(false); setCreateForm({ name: '', description: '', type: 'general' }); }}
              className="px-4 py-2 text-sm text-gray-400 hover:text-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating || !createForm.name.trim()}
              className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {creating ? 'Creating...' : 'Create Channel'}
            </button>
          </div>
        </form>
      </Modal>

      <AIAssistantPanel
        isOpen={showAI}
        onClose={() => setShowAI(false)}
        channelMessages={messages}
      />

      <InviteModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        workspaceId={workspaceId}
      />

      <Modal isOpen={showCreateTask} onClose={() => setShowCreateTask(false)} title="Create Task" size="sm">
        <form onSubmit={handleCreateTask} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Title</label>
            <input type="text" value={taskForm.title} onChange={(e) => setTaskForm(prev => ({...prev, title: e.target.value}))} className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Priority</label>
            <select value={taskForm.priority} onChange={(e) => setTaskForm(prev => ({...prev, priority: e.target.value}))} className="input-field">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Due Date</label>
            <input type="date" value={taskForm.dueDate} onChange={(e) => setTaskForm(prev => ({...prev, dueDate: e.target.value}))} className="input-field" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setShowCreateTask(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={!taskForm.title.trim()} className="btn-primary">Create</button>
          </div>
        </form>
      </Modal>

      {settingsOpen && (
        <div className="fixed inset-0 z-20" onClick={() => setSettingsOpen(false)} />
      )}
    </div>
  );
};

export default WorkspacePage;
