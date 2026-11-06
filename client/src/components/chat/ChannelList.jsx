import { useState } from 'react';
import { FiHash, FiPlus, FiX } from 'react-icons/fi';

const CHANNEL_TYPES = {
  general: { label: 'General', color: 'bg-success-soft text-success' },
  development: { label: 'Development', color: 'bg-info-soft text-info' },
  design: { label: 'Design', color: 'bg-accent-soft text-accent' },
  hr: { label: 'HR', color: 'bg-accent-soft text-accent' },
};

const ChannelList = ({ channels, activeChannelId, onSelectChannel, onCreateChannel, workspaceId }) => {
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');

  const handleCreate = () => {
    if (!newName.trim()) return;
    if (onCreateChannel) {
      onCreateChannel({ name: newName.trim(), description: newDescription.trim(), workspaceId });
    }
    setNewName('');
    setNewDescription('');
    setShowCreate(false);
  };

  return (
    <div className="flex flex-col h-full bg-sidebar">
      <div className="px-4 py-3 border-b border-line">
        <h2 className="text-sm font-semibold text-ink-secondary uppercase tracking-wider">Channels</h2>
      </div>
      <div className="flex-1 overflow-y-auto py-1">
        {channels?.map((channel) => {
          const typeKey = channel.type?.toLowerCase();
          const typeInfo = CHANNEL_TYPES[typeKey];
          return (
            <button
              key={channel._id || channel.id}
              onClick={() => onSelectChannel?.(channel)}
              className={`w-full flex items-center gap-2 px-4 py-2 text-left transition-colors ${
                (channel._id || channel.id) === activeChannelId
                  ? 'bg-brand-soft text-brand border-r-2 border-brand'
                  : 'text-ink-secondary hover:bg-hover hover:text-ink'
              }`}
            >
              <FiHash size={16} className="flex-shrink-0" />
              <span className="text-sm truncate flex-1">{channel.name}</span>
              {typeInfo && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${typeInfo.color}`}>
                  {typeInfo.label}
                </span>
              )}
            </button>
          );
        })}
        {(!channels || channels.length === 0) && (
          <p className="px-4 py-3 text-xs text-ink-muted">No channels yet</p>
        )}
      </div>
      <div className="p-3 border-t border-line">
        {showCreate ? (
          <div className="space-y-2">
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Channel name"
              className="w-full text-sm bg-card text-ink placeholder-ink-muted rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand"
              autoFocus
            />
            <input
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="Description (optional)"
              className="w-full text-sm bg-card text-ink placeholder-ink-muted rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand"
            />
            <div className="flex gap-2">
              <button
                onClick={handleCreate}
                disabled={!newName.trim()}
                className="flex-1 text-xs bg-brand text-white rounded py-1.5 hover:bg-brand-hover transition-colors disabled:opacity-40"
              >
                Create
              </button>
              <button
                onClick={() => setShowCreate(false)}
                className="p-1.5 text-ink-secondary hover:text-ink transition-colors"
              >
                <FiX size={16} />
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowCreate(true)}
            className="w-full flex items-center gap-2 text-sm text-ink-secondary hover:text-ink transition-colors px-2 py-1.5 rounded hover:bg-hover"
          >
            <FiPlus size={16} />
            <span>Create Channel</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default ChannelList;
