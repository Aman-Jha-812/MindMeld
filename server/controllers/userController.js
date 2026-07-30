import User from '../models/User.js';
import Workspace from '../models/Workspace.js';
import WorkspaceMember from '../models/WorkspaceMember.js';
import { uploadAvatar } from '../services/storageService.js';

export const getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';

    const filter = search
      ? {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
          ],
        }
      : {};

    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .select('-password')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('GetUsers error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching users',
    });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const workspaceCount = await WorkspaceMember.countDocuments({ user: req.params.id });

    res.status(200).json({
      success: true,
      data: { ...user.toObject(), workspaceCount },
    });
  } catch (error) {
    console.error('GetUserById error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching user',
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, bio, skills, socialLinks } = req.body;

    const updateFields = {};
    if (name !== undefined) updateFields.name = name;
    if (bio !== undefined) updateFields.bio = bio;
    if (skills !== undefined) updateFields.skills = skills;
    if (socialLinks !== undefined) updateFields.socialLinks = socialLinks;

    const user = await User.findByIdAndUpdate(req.user._id, updateFields, {
      new: true,
      runValidators: true,
    }).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('UpdateProfile error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error updating profile',
    });
  }
};

export const updateAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image file',
      });
    }

    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataUri = `data:${req.file.mimetype};base64,${b64}`;

    const { url, publicId } = await uploadAvatar(dataUri, req.user._id);

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: { url, publicId } },
      { new: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('UpdateAvatar error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error updating avatar',
    });
  }
};

export const deleteAccount = async (req, res) => {
  try {
    const userId = req.user._id;

    await WorkspaceMember.deleteMany({ user: userId });

    await Workspace.deleteMany({ owner: userId });

    await User.findByIdAndDelete(userId);

    res.cookie('refreshToken', '', {
      httpOnly: true,
      expires: new Date(0),
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    res.status(200).json({
      success: true,
      message: 'Account deleted successfully',
    });
  } catch (error) {
    console.error('DeleteAccount error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error deleting account',
    });
  }
};
