import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useWorkspace } from '../../context/WorkspaceContext';
import {
  FiGrid,
  FiCheckSquare,
  FiBell,
  FiUsers,
  FiZap,
  FiArrowRight,
  FiPlus,
  FiCalendar,
  FiTrendingUp,
} from 'react-icons/fi';
import StatsCard from '../../components/dashboard/StatsCard';
import TaskCard from '../../components/dashboard/TaskCard';
import WorkspaceCard from '../../components/dashboard/WorkspaceCard';
import ActivityFeed from '../../components/dashboard/ActivityFeed';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

const PLACEHOLDER_TASKS = [
  { id: '1', title: 'Review Q3 roadmap', priority: 'high', status: 'in_progress', dueDate: new Date(Date.now() + 86400000 * 2).toISOString(), assignee: null },
  { id: '2', title: 'Update API documentation', priority: 'medium', status: 'todo', dueDate: new Date(Date.now() + 86400000 * 5).toISOString(), assignee: null },
  { id: '3', title: 'Fix login page layout bug', priority: 'urgent', status: 'todo', dueDate: new Date(Date.now() - 86400000).toISOString(), assignee: null },
  { id: '4', title: 'Design system color tokens', priority: 'low', status: 'done', dueDate: new Date(Date.now() - 86400000 * 2).toISOString(), assignee: null },
];

const PLACEHOLDER_ACTIVITIES = [
  { id: '1', type: 'task_created', user: { name: 'Alex Chen' }, target: 'Design system audit', createdAt: new Date(Date.now() - 60000 * 15).toISOString() },
  { id: '2', type: 'message_sent', user: { name: 'Sarah Kim' }, target: 'general', createdAt: new Date(Date.now() - 60000 * 45).toISOString() },
  { id: '3', type: 'member_joined', user: { name: 'Jordan Lee' }, target: 'Design Team', createdAt: new Date(Date.now() - 3600000 * 2).toISOString() },
  { id: '4', type: 'task_completed', user: { name: 'You' }, target: 'Setup CI/CD pipeline', createdAt: new Date(Date.now() - 3600000 * 4).toISOString() },
  { id: '5', type: 'file_uploaded', user: { name: 'Maya Patel' }, target: 'mockups-v2.fig', createdAt: new Date(Date.now() - 3600000 * 6).toISOString() },
];

const AI_SUGGESTIONS = [
  'Try using "/summarize" in chat to get AI-powered conversation summaries.',
  'You can generate code snippets with the AI Assistant in any channel.',
  'Meeting notes can be auto-generated from chat transcripts.',
  'Ask the AI to review your code before pushing to production.',
];

const Dashboard = () => {
  const { user } = useAuth();
  const { workspaces, loading: workspacesLoading, loadWorkspaces } = useWorkspace();
  const navigate = useNavigate();

  const [tasks] = useState(PLACEHOLDER_TASKS);
  const [activities] = useState(PLACEHOLDER_ACTIVITIES);
  const [aiTipIndex, setAiTipIndex] = useState(0);

  useEffect(() => {
    loadWorkspaces();
  }, [loadWorkspaces]);

  useEffect(() => {
    const interval = setInterval(() => {
      setAiTipIndex((prev) => (prev + 1) % AI_SUGGESTIONS.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const todayTasks = tasks.filter((t) => {
    if (!t.dueDate) return true;
    const due = new Date(t.dueDate);
    const now = new Date();
    return due.toDateString() === now.toDateString() || t.status !== 'done';
  });

  const onlineMembers = Math.min(workspaces.reduce((acc, w) => acc + (w.memberCount || w.members?.length || 0), 0), 12) || 3;

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">
            Welcome back, {user?.name?.split(' ')[0] || 'there'}
          </h1>
          <p className="text-gray-500 text-sm mt-1">Here&apos;s what&apos;s happening across your workspaces.</p>
        </div>
        <button
          onClick={() => navigate('/workspace/new')}
          className="hidden sm:flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-500 transition-colors"
        >
          <FiPlus size={16} />
          New Workspace
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Workspaces"
          value={workspaces.length}
          icon={<FiGrid size={20} />}
          color="indigo"
          change={workspaces.length > 0 ? `+${workspaces.length} total` : undefined}
        />
        <StatsCard
          title="Active Tasks"
          value={todayTasks.filter((t) => t.status !== 'done').length}
          icon={<FiCheckSquare size={20} />}
          color="orange"
          change={`${todayTasks.filter((t) => t.status === 'done').length} completed`}
        />
        <StatsCard
          title="Notifications"
          value="3"
          icon={<FiBell size={20} />}
          color="purple"
          change="+2 since yesterday"
        />
        <StatsCard
          title="Online Members"
          value={onlineMembers}
          icon={<FiUsers size={20} />}
          color="green"
          change={onlineMembers > 0 ? `${onlineMembers} online now` : 'No activity'}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6">
        <div className="md:col-span-2 lg:col-span-2 space-y-6">
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-100 flex items-center gap-2">
                <FiCheckSquare className="text-indigo-400" size={18} />
                Today&apos;s Tasks
              </h2>
              <span className="text-xs text-gray-500 bg-gray-700 px-2 py-1 rounded-full">
                {todayTasks.filter((t) => t.status === 'done').length}/{todayTasks.length} done
              </span>
            </div>
            {todayTasks.length > 0 ? (
              <div className="space-y-2">
                {todayTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onClick={() => {}}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<FiCalendar size={32} />}
                title="No tasks for today"
                description="Enjoy your free day, or create a new task to get started."
                action="Create Task"
                onAction={() => {}}
              />
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-100 flex items-center gap-2">
                <FiGrid className="text-indigo-400" size={18} />
                Recent Workspaces
              </h2>
              {workspaces.length > 0 && (
                <button
                  onClick={() => navigate('/workspace')}
                  className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
                >
                  View all
                  <FiArrowRight size={14} />
                </button>
              )}
            </div>
            {workspacesLoading ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : workspaces.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {workspaces.slice(0, 4).map((workspace) => (
                  <WorkspaceCard
                    key={workspace._id || workspace.id}
                    workspace={workspace}
                    onClick={(w) => navigate(`/workspace/${w._id || w.id}`)}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<FiGrid size={32} />}
                title="No workspaces yet"
                description="Create your first workspace to collaborate with your team."
                action="Create Workspace"
                onAction={() => navigate('/workspace/new')}
              />
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-br from-indigo-900/30 to-purple-900/30 rounded-xl border border-indigo-800/30 p-5">
            <div className="flex items-center gap-2 mb-3">
              <FiZap className="text-yellow-400" size={18} />
              <h2 className="text-lg font-semibold text-gray-100">AI Suggestions</h2>
            </div>
            <div className="min-h-[80px] flex items-center">
              <p className="text-sm text-gray-300 leading-relaxed animate-fadeIn">
                {AI_SUGGESTIONS[aiTipIndex]}
              </p>
            </div>
            <div className="flex gap-1.5 mt-3">
              {AI_SUGGESTIONS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setAiTipIndex(i)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === aiTipIndex ? 'bg-indigo-400 w-4' : 'bg-gray-600 hover:bg-gray-500'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-100 flex items-center gap-2">
                <FiTrendingUp className="text-indigo-400" size={18} />
                Recent Activity
              </h2>
            </div>
            <ActivityFeed activities={activities} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
