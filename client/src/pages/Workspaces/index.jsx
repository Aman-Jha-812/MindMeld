import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiGrid, FiPlus } from 'react-icons/fi';
import { useWorkspace } from '../../context/WorkspaceContext';
import WorkspaceCard from '../../components/dashboard/WorkspaceCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

const WorkspacesPage = () => {
  const { workspaces, loading, loadWorkspaces } = useWorkspace();
  const navigate = useNavigate();

  useEffect(() => {
    loadWorkspaces().catch(() => {});
  }, [loadWorkspaces]);

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">Workspaces</h1>
          <p className="text-sm text-ink-secondary mt-1">
            All workspaces you own or belong to.
          </p>
        </div>
        <button
          onClick={() => navigate('/workspace/new')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand text-white text-sm font-medium rounded-lg hover:bg-brand-hover transition-colors"
        >
          <FiPlus size={16} />
          New Workspace
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <LoadingSpinner size="lg" />
        </div>
      ) : workspaces.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {workspaces.map((workspace) => (
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
  );
};

export default WorkspacesPage;
