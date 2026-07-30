import { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import * as userService from '../../services/userService';
import Avatar from '../../components/common/Avatar';
import {
  FiUser,
  FiMail,
  FiEdit2,
  FiCamera,
  FiGithub,
  FiLinkedin,
  FiGlobe,
  FiSave,
  FiX,
  FiPlus,
} from 'react-icons/fi';
import { FaTwitter } from 'react-icons/fa';

const SocialLinkIcon = ({ url, children }) => {
  if (!url) return null;
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="text-dark-400 hover:text-primary-400 transition-colors"
    >
      {children}
    </a>
  );
};

const Profile = () => {
  const { user, updateUser } = useAuth();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    github: '',
    linkedin: '',
    twitter: '',
    website: '',
  });
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        bio: user.bio || '',
        github: user.github || '',
        linkedin: user.linkedin || '',
        twitter: user.twitter || '',
        website: user.website || '',
      });
      setSkills(user.skills || []);
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const { data: res } = await userService.updateProfile({
        name: formData.name,
        bio: formData.bio,
        skills,
        socialLinks: {
          github: formData.github,
          linkedin: formData.linkedin,
          twitter: formData.twitter,
          website: formData.website,
        },
      });
      updateUser(res.data);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    const form = new FormData();
    form.append('file', file);

    setUploading(true);
    try {
      const { data: res } = await userService.updateAvatar(form);
      updateUser(res.data);
      toast.success('Avatar updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload avatar');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const addSkill = () => {
    const trimmed = skillInput.trim();
    if (!trimmed) return;
    if (skills.includes(trimmed)) {
      toast('Skill already added');
      return;
    }
    setSkills((prev) => [...prev, trimmed]);
    setSkillInput('');
  };

  const removeSkill = (skill) => {
    setSkills((prev) => prev.filter((s) => s !== skill));
  };

  if (!user) return null;

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 space-y-6">
      <h1 className="text-2xl font-bold text-dark-100">Profile</h1>

      <div className="card">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="relative group">
            <Avatar
              src={user.avatar}
              name={user.name}
              size="xl"
              className="ring-2 ring-dark-700"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="absolute inset-0 bg-dark-900/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              {uploading ? (
                <svg
                  className="animate-spin h-6 w-6 text-white"
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
              ) : (
                <FiCamera className="text-white w-6 h-6" />
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarUpload}
            />
          </div>
          <div className="text-center sm:text-left flex-1">
            <h2 className="text-xl font-semibold text-dark-100">
              {user.name || 'User'}
            </h2>
            <p className="text-dark-400 text-sm mt-1">{user.email}</p>
            {user.bio && (
              <p className="text-dark-300 text-sm mt-2 max-w-md">{user.bio}</p>
            )}
            <div className="flex items-center justify-center sm:justify-start gap-4 mt-3">
              <SocialLinkIcon url={formData.github}>
                <FiGithub className="w-5 h-5" />
              </SocialLinkIcon>
              <SocialLinkIcon url={formData.linkedin}>
                <FiLinkedin className="w-5 h-5" />
              </SocialLinkIcon>
              <SocialLinkIcon url={formData.twitter}>
                <FaTwitter className="w-5 h-5" />
              </SocialLinkIcon>
              <SocialLinkIcon url={formData.website}>
                <FiGlobe className="w-5 h-5" />
              </SocialLinkIcon>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-dark-100 flex items-center gap-2">
            <FiEdit2 className="text-primary-400" />
            Edit Profile
          </h3>
        </div>
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400 w-4 h-4" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
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
                value={user.email}
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
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows={3}
              className="input-field resize-none"
              placeholder="Tell us about yourself..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1.5">
              Skills
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1.5 bg-primary-600/10 text-primary-400 text-sm px-3 py-1 rounded-full"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    className="hover:text-primary-300"
                  >
                    <FiX className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addSkill();
                  }
                }}
                className="input-field flex-1"
                placeholder="Type a skill and press Enter"
              />
              <button
                type="button"
                onClick={addSkill}
                className="btn-secondary px-3"
              >
                <FiPlus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold text-dark-100 mb-5 flex items-center gap-2">
          <FiGlobe className="text-primary-400" />
          Social Links
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1.5">
              GitHub
            </label>
            <div className="relative">
              <FiGithub className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400 w-4 h-4" />
              <input
                type="url"
                name="github"
                value={formData.github}
                onChange={handleChange}
                className="input-field pl-10"
                placeholder="https://github.com/username"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1.5">
              LinkedIn
            </label>
            <div className="relative">
              <FiLinkedin className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400 w-4 h-4" />
              <input
                type="url"
                name="linkedin"
                value={formData.linkedin}
                onChange={handleChange}
                className="input-field pl-10"
                placeholder="https://linkedin.com/in/username"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1.5">
              Twitter
            </label>
            <div className="relative">
              <FaTwitter className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400 w-4 h-4" />
              <input
                type="url"
                name="twitter"
                value={formData.twitter}
                onChange={handleChange}
                className="input-field pl-10"
                placeholder="https://twitter.com/username"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-300 mb-1.5">
              Website
            </label>
            <div className="relative">
              <FiGlobe className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400 w-4 h-4" />
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleChange}
                className="input-field pl-10"
                placeholder="https://yoursite.com"
              />
            </div>
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSaveProfile}
            disabled={saving}
            className="btn-primary flex items-center gap-2"
          >
            {saving ? (
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
    </div>
  );
};

export default Profile;
