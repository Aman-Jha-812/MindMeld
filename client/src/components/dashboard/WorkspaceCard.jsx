import { FiUsers, FiHash } from 'react-icons/fi';

const ACCENTS = [
  'border-l-workspace-1',
  'border-l-workspace-2',
  'border-l-workspace-3',
  'border-l-workspace-4',
  'border-l-workspace-5',
];

const getAccent = (id) => {
  if (!id) return ACCENTS[0];
  let hash = 0;
  const str = String(id);
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
  }
  return ACCENTS[Math.abs(hash) % ACCENTS.length];
};

const ROLE_BADGES = {
  owner: 'bg-warning-soft text-warning',
  admin: 'bg-success-soft text-success',
  member: 'bg-info-soft text-info',
  viewer: 'bg-ink-muted/20 text-ink-secondary',
};

const WorkspaceCard = ({ workspace, onClick }) => {
  const accent = getAccent(workspace?._id || workspace?.id);
  const role = workspace?.role?.toLowerCase() || 'member';
  const roleBadge = ROLE_BADGES[role] || ROLE_BADGES.member;

  return (
    <button
      onClick={() => onClick?.(workspace)}
      className={`relative w-full text-left bg-card rounded-xl p-5 border border-line border-l-4 ${accent} hover:border-brand transition-all duration-200 hover:scale-[1.02] hover:shadow-xl overflow-hidden group cursor-pointer`}
    >
      <div className="relative z-10">
        <h3 className="text-lg font-semibold text-ink mb-1 truncate">
          {workspace.name}
        </h3>
        {workspace.description && (
          <p className="text-sm text-ink-secondary mb-4 line-clamp-2">
            {workspace.description}
          </p>
        )}
        <div className="flex items-center gap-4 text-xs text-ink-muted">
          <span className="flex items-center gap-1">
            <FiUsers size={14} />
            {workspace.memberCount ?? workspace.members?.length ?? 0} members
          </span>
          <span className="flex items-center gap-1">
            <FiHash size={14} />
            {workspace.channelCount ?? workspace.channels?.length ?? 0} channels
          </span>
          <span className={`ml-auto px-2 py-0.5 rounded-full text-[10px] font-medium capitalize ${roleBadge}`}>
            {role}
          </span>
        </div>
      </div>
    </button>
  );
};

export default WorkspaceCard;
