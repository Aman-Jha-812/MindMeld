import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import * as userService from '../../services/userService';
import {
  FiSettings,
  FiShield,
  FiBell,
  FiUser,
  FiMail,
  FiLock,
  FiSave,
  FiEye,
  FiEyeOff,
} from 'react-icons/fi';

const tabs = [
  { id: 'general', label: 'General', icon: FiSettings },
  { id: 'security', label: 'Security', icon: FiShield },
  { id: 'notifications', label: 'Notifications', icon: FiBell },
];

const notificationDefaults = {
  newMessage: true,
  taskAssigned: true,
  mentions: true,
  workspaceInvite: true,
  taskDue: true,
  weeklyDigest: false,
  marketingEmails: false,
};

const Settings = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('general');

  const [general, setGeneral] = useState({ name: '', bio: '' });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [showPasswords, setShowPasswords] = useState({});
  const [notifications, setNotifications] = useState(notificationDefaults);

  const [savingGeneral, setSavingGeneral] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setGeneral({ name: user.name || '', bio: user.bio || '' });
    }
  }, [user]);

  const togglePass = (field) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSaveGeneral = async () => {
    setSavingGeneral(true);
    try {
      await userService.updateProfile(general);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSavingGeneral(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmNewPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    setSavingPassword(true);
    try {
      await userService.updatePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success('Password changed');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
      });
    } catch (err) {
      toast.error(
        err.response?.data?.message || 'Failed to change password'
      );
    } finally {
      setSavingPassword(false);
    }
  };

  const toggleNotification = (key) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const renderTab = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className="card">
            <h3 className="text-lg font-semibold text-dark-100 mb-5 flex items-center gap-2">
              <FiUser className="text-primary-400" />
              General Information
            </h3>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400 w-4 h-4" />
                  <input
                    type="text"
                    value={general.name}
                    onChange={(e) =>
                      setGeneral((prev) => ({ ...prev, name: e.target.value }))
                    }
                    className="input-field pl-10"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-1.5">
                  Email
                </label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400 w-4 h-4" />
                  <input
                    type="email"
                    value={user?.email || ''}
                    className="input-field pl-10 opacity-60 cursor-not-allowed"
                    disabled
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-1.5">
                  Bio
                </label>
                <textarea
                  value={general.bio}
                  onChange={(e) =>
                    setGeneral((prev) => ({ ...prev, bio: e.target.value }))
                  }
                  rows={3}
                  className="input-field resize-none"
                  placeholder="Tell us about yourself..."
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleSaveGeneral}
                disabled={savingGeneral}
                className="btn-primary flex items-center gap-2"
              >
                {savingGeneral ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Saving...
                  </>
                ) : (
                  <>
                    <FiSave className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="card">
            <h3 className="text-lg font-semibold text-dark-100 mb-5 flex items-center gap-2">
              <FiLock className="text-primary-400" />
              Change Password
            </h3>
            <form onSubmit={handleChangePassword} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-1.5">
                  Current Password
                </label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400 w-4 h-4" />
                  <input
                    type={showPasswords.current ? 'text' : 'password'}
                    value={passwordForm.currentPassword}
                    onChange={(e) =>
                      setPasswordForm((prev) => ({
                        ...prev,
                        currentPassword: e.target.value,
                      }))
                    }
                    className="input-field pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => togglePass('current')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-300"
                  >
                    {showPasswords.current ? (
                      <FiEyeOff className="w-4 h-4" />
                    ) : (
                      <FiEye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400 w-4 h-4" />
                  <input
                    type={showPasswords.new ? 'text' : 'password'}
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm((prev) => ({
                        ...prev,
                        newPassword: e.target.value,
                      }))
                    }
                    className="input-field pl-10 pr-10"
                    minLength={6}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => togglePass('new')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-300"
                  >
                    {showPasswords.new ? (
                      <FiEyeOff className="w-4 h-4" />
                    ) : (
                      <FiEye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-1.5">
                  Confirm New Password
                </label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400 w-4 h-4" />
                  <input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    value={passwordForm.confirmNewPassword}
                    onChange={(e) =>
                      setPasswordForm((prev) => ({
                        ...prev,
                        confirmNewPassword: e.target.value,
                      }))
                    }
                    className="input-field pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => togglePass('confirm')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-300"
                  >
                    {showPasswords.confirm ? (
                      <FiEyeOff className="w-4 h-4" />
                    ) : (
                      <FiEye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={savingPassword}
                  className="btn-primary flex items-center gap-2"
                >
                  {savingPassword ? (
                    <>
                      <svg
                        className="animate-spin h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                      Updating...
                    </>
                  ) : (
                    <>
                      <FiSave className="w-4 h-4" />
                      Update Password
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        );

      case 'notifications':
        return (
          <div className="card">
            <h3 className="text-lg font-semibold text-dark-100 mb-5 flex items-center gap-2">
              <FiBell className="text-primary-400" />
              Notification Preferences
            </h3>
            <div className="space-y-1">
              {Object.entries(notifications).map(([key, value]) => (
                <div
                  key={key}
                  className="flex items-center justify-between py-3 px-4 rounded-lg hover:bg-dark-700/50 transition-colors"
                >
                  <span className="text-dark-200 text-sm capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleNotification(key)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      value ? 'bg-primary-600' : 'bg-dark-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        value ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-end pt-4 border-t border-dark-700">
              <button
                onClick={() => {
                  toast.success('Notification preferences saved');
                }}
                className="btn-primary flex items-center gap-2"
              >
                <FiSave className="w-4 h-4" />
                Save Preferences
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6">
      <h1 className="text-2xl font-bold text-dark-100 mb-6">Settings</h1>

      <div className="flex gap-1 mb-6 bg-dark-800 rounded-lg p-1 border border-dark-700 w-fit">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                isActive
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'text-dark-300 hover:text-dark-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {renderTab()}
    </div>
  );
};

export default Settings;
