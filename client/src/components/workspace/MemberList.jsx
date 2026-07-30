import { useState } from 'react';
import { FiX, FiSearch, FiUsers } from 'react-icons/fi';
import Avatar from '../common/Avatar';
import Badge from '../common/Badge';

const ROLE_VARIANTS = {
  admin: 'success',
  member: 'info',
  owner: 'warning',
};

const MemberList = ({ members = [], currentUserId, onRemove, onRoleChange, isAdmin }) => {
  const [search, setSearch] = useState('');

  const filtered = members.filter((m) => {
    const name = (m.name || m.user?.name || '').toLowerCase();
    return name.includes(search.toLowerCase());
  });

  return (
    <div className="flex flex-col h-full bg-dark-900 border-l border-dark-700">
      <div className="px-4 py-3 border-b border-dark-700">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-dark-100 flex items-center gap-2">
            <FiUsers size={16} className="text-indigo-400" />
            Members
          </h3>
          <span className="text-xs text-dark-400 bg-dark-700 px-2 py-0.5 rounded-full">
            {members.length}
          </span>
        </div>
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" size={14} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search members..."
            className="w-full bg-dark-800 text-dark-200 placeholder-dark-500 rounded-lg pl-9 pr-3 py-1.5 text-sm border border-dark-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
        {filtered.map((member) => {
          const memberId = member._id || member.id || member.user?._id || member.user?.id;
          const memberName = member.name || member.user?.name || 'Unknown';
          const memberRole = (member.role || member.user?.role || 'member').toLowerCase();
          const isOnline = member.isOnline ?? true;
          const isSelf = memberId === currentUserId;

          return (
            <div
              key={memberId}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-dark-800/60 transition-colors group"
            >
              <div className="relative flex-shrink-0">
                <Avatar
                  src={member.avatar || member.user?.avatar}
                  name={memberName}
                  size="sm"
                />
                <span
                  className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-dark-900 ${
                    isOnline ? 'bg-green-500' : 'bg-dark-500'
                  }`}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm text-dark-100 truncate">{memberName}</p>
                  {isSelf && <span className="text-[10px] text-dark-500">(you)</span>}
                </div>
                <p className="text-xs text-dark-500">{isOnline ? 'Online' : 'Offline'}</p>
              </div>
              <Badge variant={ROLE_VARIANTS[memberRole] || 'default'} size="sm">
                {memberRole}
              </Badge>
              {isAdmin && memberRole !== 'owner' && (
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <select
                    value={memberRole}
                    onChange={(e) => onRoleChange?.(memberId, e.target.value)}
                    className="bg-dark-800 text-dark-200 text-xs rounded border border-dark-600 px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="member">member</option>
                    <option value="admin">admin</option>
                  </select>
                  <button
                    onClick={() => onRemove?.(memberId)}
                    className="p-1 text-dark-500 hover:text-red-400 transition-colors"
                    title="Remove member"
                  >
                    <FiX size={14} />
                  </button>
                </div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-dark-500">
            <FiUsers size={24} className="mb-2" />
            <p className="text-sm">{search ? 'No members match your search' : 'No members'}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MemberList;
