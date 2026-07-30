import { useState } from 'react';
import toast from 'react-hot-toast';
import { FiHash } from 'react-icons/fi';
import Modal from '../common/Modal';
import * as chatService from '../../services/chatService';

const CHANNEL_TYPE_OPTIONS = [
  { value: 'general', label: 'General' },
  { value: 'development', label: 'Development' },
  { value: 'design', label: 'Design' },
  { value: 'hr', label: 'HR' },
  { value: 'custom', label: 'Custom' },
];

const TYPE_NAME_MAP = {
  general: 'general',
  development: 'development',
  design: 'design',
  hr: 'hr',
};

const CreateChannelModal = ({ isOpen, onClose, workspaceId, onCreated }) => {
  const [type, setType] = useState('general');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);

  const isCustom = type === 'custom';

  const handleTypeChange = (newType) => {
    setType(newType);
    if (TYPE_NAME_MAP[newType]) {
      setName(TYPE_NAME_MAP[newType]);
    } else {
      setName('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const finalName = name.trim().toLowerCase().replace(/\s+/g, '-');
    if (!finalName) return;
    setCreating(true);
    try {
      const { data } = await chatService.createChannel(workspaceId, {
        name: finalName,
        description: description.trim(),
        type,
      });
      const channel = data.channel || data;
      toast.success(`Channel #${channel.name} created`);
      onCreated?.(channel);
      handleClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create channel');
    } finally {
      setCreating(false);
    }
  };

  const handleClose = () => {
    setType('general');
    setName('');
    setDescription('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create Channel" size="sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-dark-200 mb-1.5">Type</label>
          <select
            value={type}
            onChange={(e) => handleTypeChange(e.target.value)}
            className="w-full bg-dark-800 text-dark-100 rounded-lg px-3 py-2 text-sm border border-dark-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            {CHANNEL_TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-dark-200 mb-1.5">
            Channel Name {isCustom ? '' : '(auto-set)'}
          </label>
          <div className="relative">
            <FiHash className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" size={16} />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={isCustom ? 'e.g. project-alpha' : ''}
              className="w-full bg-dark-800 text-dark-100 placeholder-dark-500 rounded-lg pl-10 pr-3 py-2 text-sm border border-dark-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
              readOnly={!isCustom}
              required
              autoFocus
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-dark-200 mb-1.5">Description</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What's this channel about?"
            className="w-full bg-dark-800 text-dark-100 placeholder-dark-500 rounded-lg px-3 py-2 text-sm border border-dark-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-sm text-dark-400 hover:text-dark-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={creating || !name.trim()}
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {creating ? 'Creating...' : 'Create Channel'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateChannelModal;
