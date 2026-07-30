import { FiUsers, FiHash } from 'react-icons/fi';

const GRADIENTS = [
  'from-indigo-900/40 to-purple-900/40',
  'from-blue-900/40 to-cyan-900/40',
  'from-emerald-900/40 to-teal-900/40',
  'from-orange-900/40 to-red-900/40',
  'from-pink-900/40 to-rose-900/40',
  'from-violet-900/40 to-indigo-900/40',
];

const getGradient = (id) => {
  if (!id) return GRADIENTS[0];
  let hash = 0;
  const str = String(id);
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
  }
  return GRADIENTS[Math.abs(hash) % GRADIENTS.length];
};

const ROLE_BADGES = {
  owner: 'bg-yellow-500/20 text-yellow-400',
  admin: 'bg-green-500/20 text-green-400',
  member: 'bg-blue-500/20 text-blue-400',
  viewer: 'bg-gray-500/20 text-gray-400',
};

const WorkspaceCard = ({ workspace, onClick }) => {
  const gradient = getGradient(workspace?._id || workspace?.id);
  const role = workspace?.role?.toLowerCase() || 'member';
  const roleBadge = ROLE_BADGES[role] || ROLE_BADGES.member;

  return (
    <button
      onClick={() => onClick?.(workspace)}
      className={`relative w-full text-left bg-gray-800 rounded-xl p-5 border border-gray-700 hover:border-indigo-500/50 transition-all duration-200 hover:scale-[1.02] hover:shadow-xl hover:shadow-indigo-500/5 overflow-hidden group cursor-pointer`}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-60 group-hover:opacity-80 transition-opacity`} />
      <div className="relative z-10">
        <h3 className="text-lg font-semibold text-gray-100 mb-1 truncate">
          {workspace.name}
        </h3>
        {workspace.description && (
          <p className="text-sm text-gray-400 mb-4 line-clamp-2">
            {workspace.description}
          </p>
        )}
        <div className="flex items-center gap-4 text-xs text-gray-500">
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
