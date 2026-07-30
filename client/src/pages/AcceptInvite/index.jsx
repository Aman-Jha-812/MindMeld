import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getInvitation, acceptInvitation } from '../../services/invitationService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { FiCheckCircle, FiAlertCircle, FiMail, FiArrowRight } from 'react-icons/fi';

const AcceptInvite = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const { user, isAuthenticated, login } = useAuth();

  const [invitation, setInvitation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [workspaceId, setWorkspaceId] = useState(null);

  useEffect(() => {
    if (!token) {
      setError('No invitation token provided');
      setLoading(false);
      return;
    }

    const fetchInvitation = async () => {
      try {
        const { data } = await getInvitation(token);
        setInvitation(data.data);
      } catch (err) {
        if (isAuthenticated) {
          try {
            const { data } = await acceptInvitation(token);
            setSuccess(true);
            setWorkspaceId(data.data?.workspaceId);
            return;
          } catch {
          }
        }
        setError(err.response?.data?.message || 'Invitation not found or expired');
      } finally {
        setLoading(false);
      }
    };

    fetchInvitation();
  }, [token, isAuthenticated]);

  const handleAccept = async () => {
    if (!isAuthenticated) {
      navigate(`/register?inviteToken=${token}`);
      return;
    }

    setAccepting(true);
    setError(null);
    try {
      const { data } = await acceptInvitation(token);
      setSuccess(true);
      setWorkspaceId(data.data?.workspaceId);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to accept invitation');
    } finally {
      setAccepting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-gray-900 rounded-2xl border border-gray-800 p-8 text-center">
          <div className="w-16 h-16 bg-green-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiCheckCircle size={32} className="text-green-400" />
          </div>
          <h1 className="text-xl font-semibold text-gray-100 mb-2">Invitation Accepted!</h1>
          <p className="text-gray-400 mb-6">You have joined the workspace successfully.</p>
          <button
            onClick={() => navigate(`/chat/${workspaceId}`)}
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-500 transition-colors"
          >
            Go to Workspace
            <FiArrowRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-gray-900 rounded-2xl border border-gray-800 p-8 text-center">
          <div className="w-16 h-16 bg-red-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiAlertCircle size={32} className="text-red-400" />
          </div>
          <h1 className="text-xl font-semibold text-gray-100 mb-2">Invalid Invitation</h1>
          <p className="text-gray-400 mb-6">{error}</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-800 text-gray-200 font-medium rounded-lg hover:bg-gray-700 transition-colors"
          >
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-900 rounded-2xl border border-gray-800 p-8">
        <div className="w-16 h-16 bg-indigo-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <FiMail size={32} className="text-indigo-400" />
        </div>
        <h1 className="text-xl font-semibold text-gray-100 text-center mb-2">You're Invited!</h1>
        <p className="text-gray-400 text-center mb-6">
          You have been invited to join <strong className="text-gray-200">{invitation?.workspace?.name || 'a workspace'}</strong>
        </p>

        {invitation?.invitedBy && (
          <div className="bg-gray-800 rounded-lg p-4 mb-6 text-center">
            <p className="text-sm text-gray-400">Invited by</p>
            <p className="text-gray-200 font-medium">{invitation.invitedBy.name}</p>
            <p className="text-xs text-gray-500">{invitation.invitedBy.email}</p>
          </div>
        )}

        <button
          onClick={handleAccept}
          disabled={accepting}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {accepting ? (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Accepting...
            </>
          ) : (
            <>
              <FiCheckCircle size={18} />
              {isAuthenticated ? 'Accept Invitation' : 'Sign in to Accept'}
            </>
          )}
        </button>

        {error && (
          <div className="mt-4 p-3 bg-red-900/30 border border-red-800 rounded-lg text-sm text-red-200 text-center">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default AcceptInvite;
