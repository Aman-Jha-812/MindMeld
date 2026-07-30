import { useState } from 'react';
import toast from 'react-hot-toast';
import * as workspaceService from '../../../services/workspaceService';
import Modal from '../../../components/common/Modal';
import { FiMail, FiSend, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const InviteModal = ({ isOpen, onClose, workspaceId }) => {
  const [emails, setEmails] = useState('');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);

  const handleSendInvite = async (e) => {
    e.preventDefault();
    const emailList = emails
      .split(/[,;\n\r]+/)
      .map((e) => e.trim())
      .filter(Boolean);

    if (emailList.length === 0) {
      toast.error('Please enter at least one email address');
      return;
    }

    const invalidEmails = emailList.filter((e) => !EMAIL_REGEX.test(e));
    if (invalidEmails.length > 0) {
      toast.error(`Invalid email${invalidEmails.length > 1 ? 's' : ''}: ${invalidEmails.join(', ')}`);
      return;
    }

    setSending(true);
    setResult(null);
    try {
      const results = [];
      for (const email of emailList) {
        try {
          await workspaceService.inviteMember(workspaceId, { email });
          results.push({ email, success: true });
        } catch {
          results.push({ email, success: false });
        }
      }
      setResult(results);
      const successCount = results.filter((r) => r.success).length;
      const failCount = results.filter((r) => !r.success).length;
      if (successCount > 0) {
        toast.success(`Invitation${successCount > 1 ? 's' : ''} sent to ${successCount} ${successCount === 1 ? 'member' : 'members'}`);
      }
      if (failCount > 0) {
        toast.error(`Failed to invite ${failCount} ${failCount === 1 ? 'member' : 'members'}`);
      }
      if (failCount === 0) {
        setEmails('');
        onClose();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send invitation');
    } finally {
      setSending(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Invite Members" size="sm">
      <form onSubmit={handleSendInvite} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">
            Email Addresses
          </label>
          <div className="relative">
            <FiMail className="absolute left-3 top-3 text-gray-500 w-4 h-4" />
            <textarea
              value={emails}
              onChange={(e) => setEmails(e.target.value)}
              placeholder="you@example.com"
              rows={3}
              className="w-full bg-gray-800 text-gray-100 placeholder-gray-500 rounded-lg pl-10 pr-3 py-2 text-sm border border-gray-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1.5">
            Separate multiple emails with commas, semicolons, or new lines.
          </p>
        </div>

        {result && result.length > 0 && (
          <div className="space-y-1.5 bg-gray-800/50 rounded-lg p-3 max-h-32 overflow-y-auto">
            {result.map((r, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                {r.success ? (
                  <FiCheckCircle size={14} className="text-green-400 flex-shrink-0" />
                ) : (
                  <FiAlertCircle size={14} className="text-red-400 flex-shrink-0" />
                )}
                <span className={`truncate ${r.success ? 'text-gray-300' : 'text-red-300'}`}>
                  {r.email}
                </span>
                {!r.success && (
                  <span className="text-xs text-red-400 flex-shrink-0">Failed</span>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-400 hover:text-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={sending || !emails.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {sending ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Sending...
              </>
            ) : (
              <>
                <FiSend size={14} />
                Send Invite
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default InviteModal;
