import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  FiMessageSquare,
  FiCpu,
  FiUserPlus,
} from 'react-icons/fi';
import StatsCard from '../../components/dashboard/StatsCard';
import TaskCard from '../../components/dashboard/TaskCard';
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
  const { workspaces, loadWorkspaces } = useWorkspace();
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
    dashboardService.getRecentActivity(5)
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

  const firstName = user?.name?.split(' ')[0] || 'there';
  const primaryWorkspace = workspaces[0];
  const primaryWorkspacePath = primaryWorkspace
    ? `/workspace/${primaryWorkspace._id || primaryWorkspace.id}`
    : '/workspace';

  const features = [
    {
      title: 'Real-time Chat',
      description: 'Channels, direct messages, media sharing.',
      icon: FiMessageSquare,
      to: '/chat',
      iconClass: 'bg-brand-soft text-brand',
    },
    {
      title: 'AI Assistant',
      description: 'Summarize chats, generate code, debug, explain.',
      icon: FiCpu,
      to: '/chat',
      iconClass: 'bg-ai text-brand',
    },
    {
      title: 'Task Management',
      description: 'Boards, deadlines, progress tracking.',
      icon: FiCheckSquare,
      to: primaryWorkspacePath,
      iconClass: 'bg-accent-soft text-accent',
    },
    {
      title: 'Team Workspaces',
      description: 'Roles, permissions, integrations.',
      icon: FiUsers,
      to: '/workspace',
      iconClass: 'bg-hover text-ink-secondary',
    },
  ];

  const quickActions = [
    {
      label: 'Create workspace',
      description: 'Start a new team space',
      icon: FiPlus,
      onClick: () => navigate('/workspace/new'),
    },
    {
      label: 'Invite member',
      description: 'Grow your team',
      icon: FiUserPlus,
      onClick: () => navigate(primaryWorkspacePath),
    },
    {
      label: 'Ask AI',
      description: 'Get help in chat',
      icon: FiZap,
      onClick: () => navigate('/chat'),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 space-y-6">
      <section className="relative overflow-hidden rounded-2xl border border-line min-h-[260px] sm:min-h-[290px] lg:min-h-[310px]">
        <img
          src="/images/dashboard-hero.jpg"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(135deg, rgba(15,118,110,0.75) 0%, rgba(28,35,33,0.65) 100%)',
          }}
        />
        <div className="relative z-10 flex min-h-[260px] sm:min-h-[290px] lg:min-h-[310px] flex-col justify-center px-6 py-8 sm:px-8 lg:px-10">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
            <FiZap size={12} />
            Your team, in sync
          </span>
          <h1 className="mt-4 text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
            Welcome back, {firstName}
          </h1>
          <p className="mt-3 max-w-xl text-sm text-white/90 sm:text-base">
            Chat, plan and build together, with AI by your side.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={() => navigate('/chat')}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent/90"
            >
              <FiMessageSquare size={16} />
              Open Chat
            </button>
            <button
              onClick={() => navigate('/workspace/new')}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-card px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-hover"
            >
              <FiPlus size={16} />
              New Workspace
            </button>
          </div>
        </div>
      </section>

      <section className="flex items-start gap-4 rounded-xl border border-line bg-card p-5 sm:p-6">
        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand">
          <FiCpu size={20} />
        </div>
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-ink-muted">
            About MindMeld
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-ink-secondary sm:text-base">
            MindMeld is an AI-powered team collaboration platform that brings real-time chat,
            task management, team workspaces and an AI assistant into one place.
          </p>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-ink">Feature Highlights</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ title, description, icon: Icon, to, iconClass }) => (
            <Link
              key={title}
              to={to}
              className="group rounded-xl border border-line bg-card p-5 transition-colors hover:border-brand hover:bg-hover/40"
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconClass}`}>
                <Icon size={18} />
              </div>
              <h3 className="mt-4 flex items-center justify-between gap-2 text-sm font-semibold text-ink">
                {title}
                <FiArrowRight
                  size={14}
                  className="text-ink-muted transition-colors group-hover:text-brand"
                />
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-ink-secondary">{description}</p>
            </Link>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Workspaces"
          value={workspaces.length}
          icon={<FiGrid size={20} />}
          color="brand"
          change={workspaces.length > 0 ? `+${workspaces.length} total` : undefined}
        />
        <StatsCard
          title="Active Tasks"
          value={tasksLoading ? '...' : todayTasks.filter((t) => t.status !== 'completed').length}
          icon={<FiCheckSquare size={20} />}
          color="warning"
          change={`${tasks.filter((t) => t.status === 'completed').length} completed`}
        />
        <StatsCard
          title="Notifications"
          value={unreadCount}
          icon={<FiBell size={20} />}
          color="accent"
          change={unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
        />
        <StatsCard
          title="Online Members"
          value={onlineMembers}
          icon={<FiUsers size={20} />}
          color="success"
          change={onlineMembers > 0 ? `${onlineMembers} online now` : 'No activity'}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="bg-card rounded-xl border border-line p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-ink flex items-center gap-2">
                <FiCheckSquare className="text-brand" size={18} />
                Today&apos;s Tasks
              </h2>
              <span className="text-xs text-ink-muted bg-hover px-2 py-1 rounded-full">
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

          <div className="rounded-xl border border-line bg-card p-5">
            <div className="mb-4 flex items-center gap-2">
              <FiZap className="text-brand" size={18} />
              <h2 className="text-lg font-semibold text-ink">Quick Actions</h2>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {quickActions.map(({ label, description, icon: Icon, onClick }) => (
                <button
                  key={label}
                  type="button"
                  onClick={onClick}
                  className="flex items-center gap-3 rounded-lg border border-line bg-app/60 p-3 text-left transition-colors hover:border-brand hover:bg-hover"
                >
                  <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand">
                    <Icon size={16} />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-ink">{label}</span>
                    <span className="block truncate text-xs text-ink-muted">{description}</span>
                  </span>
                </button>
              ))}
            </div>
            <div className="mt-4 flex justify-end">
              <Link
                to="/workspace"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-brand transition-colors hover:text-brand-hover"
              >
                View all workspaces
                <FiArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-ai rounded-xl border border-ai-border p-5">
            <div className="flex items-center gap-2 mb-3">
              <FiZap className="text-brand" size={18} />
              <h2 className="text-lg font-semibold text-ink">AI Tip of the day</h2>
            </div>
            <div className="min-h-[80px] flex items-center">
              <p className="text-sm text-ink-secondary leading-relaxed animate-fadeIn">
                {AI_SUGGESTIONS[aiTipIndex]}
              </p>
            </div>
            <div className="flex gap-1.5 mt-3">
              {AI_SUGGESTIONS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setAiTipIndex(i)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === aiTipIndex ? 'bg-brand w-4' : 'bg-line-strong hover:bg-ink-muted'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="bg-card rounded-xl border border-line p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-ink flex items-center gap-2">
                <FiTrendingUp className="text-brand" size={18} />
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
