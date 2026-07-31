import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useWorkspace } from '../../context/WorkspaceContext';
import { useChat } from '../../context/ChatContext';
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
import * as dashboardService from '../../services/dashboardService';

const AI_SUGGESTIONS = [
  'Try using "/summarize" in chat to get AI-powered conversation summaries.',
  'You can generate code snippets with the AI Assistant in any channel.',
  'Meeting notes can be auto-generated from chat transcripts.',
  'Ask the AI to review your code before pushing to production.',
];

const Dashboard = () => {
  const { user } = useAuth();
  const { workspaces, loading: workspacesLoading, loadWorkspaces } = useWorkspace();
  const { unreadCount } = useChat();
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [activities, setActivities] = useState([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [aiTipIndex, setAiTipIndex] = useState(0);

  useEffect(() => {
    loadWorkspaces();
  }, [loadWorkspaces]);

  useEffect(() => {
    dashboardService.getRecentActivity(10)
      .then(({ data }) => setActivities(data.data || []))
      .catch(() => setActivities([]))
      .finally(() => setActivitiesLoading(false));
  }, []);

  useEffect(() => {
    if (workspaces.length === 0) {
      setTasks([]);
      setTasksLoading(false);
      return;
    }
    setTasksLoading(true);
    Promise.all(workspaces.map((w) => dashboardService.getWorkspaceTasks(w._id || w.id)))
      .then((results) => {
        const all = results.flatMap((r) => r.data?.data || []);
        setTasks(all);
      })
      .catch(() => setTasks([]))
      .finally(() => setTasksLoading(false));
  }, [workspaces]);

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
    return due.toDateString() === now.toDateString() || t.status !== 'completed';
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
          value={tasksLoading ? '...' : todayTasks.filter((t) => t.status !== 'completed').length}
          icon={<FiCheckSquare size={20} />}
          color="orange"
          change={`${tasks.filter((t) => t.status === 'completed').length} completed`}
        />
        <StatsCard
          title="Notifications"
          value={unreadCount}
          icon={<FiBell size={20} />}
          color="purple"
          change={unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
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
                {todayTasks.filter((t) => t.status === 'completed').length}/{todayTasks.length} done
              </span>
            </div>
            {tasksLoading ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : todayTasks.length > 0 ? (
              <div className="space-y-2">
                {todayTasks.map((task) => (
                  <TaskCard
                    key={task._id || task.id}
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
            {activitiesLoading ? (
              <div className="flex items-center justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : (
              <ActivityFeed activities={activities} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
