import { useState } from 'react';
import toast from 'react-hot-toast';
import { FiSave, FiTrash2, FiLogOut } from 'react-icons/fi';
import Modal from '../common/Modal';
import ConfirmDialog from '../common/ConfirmDialog';
import * as workspaceService from '../../services/workspaceService';

const WorkspaceSettings = ({ workspace, isOpen, onClose }) => {
  const [name, setName] = useState(workspace?.name || '');
  const [description, setDescription] = useState(workspace?.description || '');
  const [saving, setSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const workspaceId = workspace?._id || workspace?.id;

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      await workspaceService.updateWorkspace(workspaceId, {
        name: name.trim(),
        description: description.trim(),
      });
      toast.success('Workspace updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update workspace');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await workspaceService.deleteWorkspace(workspaceId);
      toast.success('Workspace deleted');
      setShowDeleteConfirm(false);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete workspace');
    } finally {
      setDeleting(false);
    }
  };

  const handleLeave = async () => {
    setLeaving(true);
    try {
      await workspaceService.leaveWorkspace(workspaceId);
      toast.success('Left workspace');
      setShowLeaveConfirm(false);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to leave workspace');
    } finally {
      setLeaving(false);
    }
  };

  const role = (workspace?.role || '').toLowerCase();
  const isAdmin = role === 'admin' || role === 'owner';

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Workspace Settings" size="lg">
        <div className="space-y-8">
          <section>
            <h3 className="text-sm font-semibold text-dark-100 uppercase tracking-wider mb-4">
              General
            </h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-dark-200 mb-1.5">
                  Workspace Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-dark-800 text-dark-100 placeholder-dark-500 rounded-lg px-3 py-2 text-sm border border-dark-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-200 mb-1.5">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full bg-dark-800 text-dark-100 placeholder-dark-500 rounded-lg px-3 py-2 text-sm border border-dark-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
                />
              </div>
              <button
                type="submit"
                disabled={saving || !name.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <FiSave size={16} />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </section>

          <section className="border-t border-dark-700 pt-6">
            <h3 className="text-sm font-semibold text-red-400 uppercase tracking-wider mb-4">
              Danger Zone
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-dark-800/50 border border-dark-700">
                <div>
                  <p className="text-sm font-medium text-dark-100">Delete Workspace</p>
                  <p className="text-xs text-dark-400 mt-0.5">
                    Permanently delete this workspace and all its data
                  </p>
                </div>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={!isAdmin}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <FiTrash2 size={14} />
                  Delete
                </button>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-dark-800/50 border border-dark-700">
                <div>
                  <p className="text-sm font-medium text-dark-100">Leave Workspace</p>
                  <p className="text-xs text-dark-400 mt-0.5">
                    Remove yourself from this workspace
                  </p>
                </div>
                <button
                  onClick={() => setShowLeaveConfirm(true)}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm text-yellow-400 border border-yellow-500/30 rounded-lg hover:bg-yellow-500/10 transition-colors"
                >
                  <FiLogOut size={14} />
                  Leave
                </button>
              </div>
            </div>
          </section>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Workspace"
        message="Are you sure you want to delete this workspace? This action cannot be undone. All channels, messages, and files will be permanently removed."
        confirmText={deleting ? 'Deleting...' : 'Delete'}
        variant="danger"
      />

      <ConfirmDialog
        isOpen={showLeaveConfirm}
        onClose={() => setShowLeaveConfirm(false)}
        onConfirm={handleLeave}
        title="Leave Workspace"
        message="Are you sure you want to leave this workspace? You will lose access to all channels and messages."
        confirmText={leaving ? 'Leaving...' : 'Leave'}
        variant="danger"
      />
    </>
  );
};

export default WorkspaceSettings;
