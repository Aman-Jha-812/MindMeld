import Workspace from '../models/Workspace.js';
import WorkspaceMember from '../models/WorkspaceMember.js';
import Channel from '../models/Channel.js';
import Notification from '../models/Notification.js';
import Task from '../models/Task.js';
import Message from '../models/Message.js';
import User from '../models/User.js';
import Invitation from '../models/Invitation.js';
import { sendInviteEmail } from '../services/emailService.js';

const DEFAULT_CHANNELS = [
  { name: 'General', type: 'general' },
  { name: 'Development', type: 'development' },
  { name: 'Design', type: 'design' },
  { name: 'HR', type: 'hr' },
];

export const createWorkspace = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Workspace name is required',
      });
    }

    const workspace = await Workspace.create({
      name,
      description,
      owner: req.user._id,
    });

    const channelDocs = await Channel.insertMany(
      DEFAULT_CHANNELS.map((ch) => ({
        ...ch,
        workspace: workspace._id,
        createdBy: req.user._id,
      }))
    );

    const channelIds = channelDocs.map((ch) => ch._id);
    workspace.channels = channelIds;
    workspace.members = [req.user._id];
    await workspace.save();

    await WorkspaceMember.create({
      workspace: workspace._id,
      user: req.user._id,
      role: 'admin',
    });

    const populatedWorkspace = await Workspace.findById(workspace._id)
      .populate('channels')
      .populate('members', '-password');

    res.status(201).json({
      success: true,
      data: populatedWorkspace,
    });
  } catch (error) {
    console.error('CreateWorkspace error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error creating workspace',
    });
  }
};

export const getWorkspaces = async (req, res) => {
  try {
    const memberships = await WorkspaceMember.find({ user: req.user._id }).select('workspace');
    const workspaceIds = memberships.map((m) => m.workspace);

    const workspaces = await Workspace.find({ _id: { $in: workspaceIds } })
      .populate('channels')
      .populate('members', '-password');

    const workspacesWithCount = workspaces.map((ws) => ({
      ...ws.toObject(),
      memberCount: ws.members.length,
    }));

    res.status(200).json({
      success: true,
      data: workspacesWithCount,
    });
  } catch (error) {
    console.error('GetWorkspaces error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching workspaces',
    });
  }
};

export const getWorkspaceById = async (req, res) => {
  try {
    const workspace = await Workspace.findById(req.params.id)
      .populate({
        path: 'members',
        select: '-password',
      })
      .populate('channels');

    if (!workspace) {
      return res.status(404).json({
        success: false,
        message: 'Workspace not found',
      });
    }

    const currentMember = await WorkspaceMember.findOne({
      workspace: req.params.id,
      user: req.user._id,
    });

    const memberDetails = await WorkspaceMember.find({ workspace: req.params.id })
      .populate('user', '-password');

    const tasks = await Task.find({ workspace: req.params.id });
    const taskStats = {
      total: tasks.length,
      todo: tasks.filter((t) => t.status === 'todo').length,
      inProgress: tasks.filter((t) => t.status === 'in_progress').length,
      completed: tasks.filter((t) => t.status === 'completed').length,
    };

    res.status(200).json({
      success: true,
      data: {
        ...workspace.toObject(),
        role: currentMember?.role || 'member',
        memberDetails,
        taskStats,
      },
    });
  } catch (error) {
    console.error('GetWorkspaceById error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching workspace',
    });
  }
};

export const updateWorkspace = async (req, res) => {
  try {
    const { name, description } = req.body;

    const member = await WorkspaceMember.findOne({
      workspace: req.params.id,
      user: req.user._id,
    });

    if (!member || member.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can update the workspace',
      });
    }

    const updateFields = {};
    if (name !== undefined) updateFields.name = name;
    if (description !== undefined) updateFields.description = description;

    const workspace = await Workspace.findByIdAndUpdate(req.params.id, updateFields, {
      new: true,
      runValidators: true,
    })
      .populate('channels')
      .populate('members', '-password');

    if (!workspace) {
      return res.status(404).json({
        success: false,
        message: 'Workspace not found',
      });
    }

    res.status(200).json({
      success: true,
      data: workspace,
    });
  } catch (error) {
    console.error('UpdateWorkspace error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error updating workspace',
    });
  }
};

export const deleteWorkspace = async (req, res) => {
  try {
    const member = await WorkspaceMember.findOne({
      workspace: req.params.id,
      user: req.user._id,
    });

    if (!member || member.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can delete the workspace',
      });
    }

    const workspace = await Workspace.findById(req.params.id);
    if (!workspace) {
      return res.status(404).json({
        success: false,
        message: 'Workspace not found',
      });
    }

    const channels = await Channel.find({ workspace: req.params.id });
    const channelIds = channels.map((c) => c._id);

    if (channelIds.length > 0) {
      await Message.deleteMany({ channel: { $in: channelIds } });
    }

    await Channel.deleteMany({ workspace: req.params.id });
    await Task.deleteMany({ workspace: req.params.id });

    await WorkspaceMember.deleteMany({ workspace: req.params.id });
    await Notification.deleteMany({ workspace: req.params.id });
    await Workspace.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Workspace deleted successfully',
    });
  } catch (error) {
    console.error('DeleteWorkspace error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error deleting workspace',
    });
  }
};

export const inviteMember = async (req, res) => {
  try {
    const { email } = req.body;
    const workspaceId = req.params.id;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      });
    }

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({
        success: false,
        message: 'Workspace not found',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    const inviteLink = `${process.env.CLIENT_URL || 'http://localhost:3000'}/accept-invite?token=`;

    if (user) {
      const existingMember = await WorkspaceMember.findOne({
        workspace: workspaceId,
        user: user._id,
      });

      if (existingMember) {
        return res.status(400).json({
          success: false,
          message: 'User is already a member of this workspace',
        });
      }

      await WorkspaceMember.create({
        workspace: workspaceId,
        user: user._id,
        role: 'member',
      });

      await Workspace.findByIdAndUpdate(workspaceId, {
        $addToSet: { members: user._id },
      });

      await Notification.create({
        recipient: user._id,
        workspace: workspaceId,
        type: 'invitation',
        title: `Invited to ${workspace.name}`,
        message: `You have been invited to join ${workspace.name}`,
        data: { workspaceId, workspaceName: workspace.name },
      });

      sendInviteEmail(user.email, workspace.name, `${inviteLink}none`).catch((err) =>
        console.error('Invite email failed:', err.message)
      );
    } else {
      const invitation = await Invitation.create({
        email,
        workspace: workspaceId,
        invitedBy: req.user._id,
      });

      sendInviteEmail(email, workspace.name, `${inviteLink}${invitation.token}`).catch((err) =>
        console.error('Invite email failed:', err.message)
      );
    }

    res.status(200).json({
      success: true,
      message: 'Invitation sent successfully',
    });
  } catch (error) {
    console.error('InviteMember error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error inviting member',
    });
  }
};

export const removeMember = async (req, res) => {
  try {
    const { memberId } = req.params;
    const workspaceId = req.params.id;

    const member = await WorkspaceMember.findOne({
      workspace: workspaceId,
      user: req.user._id,
    });

    if (!member || member.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can remove members',
      });
    }

    const targetMember = await WorkspaceMember.findOne({
      workspace: workspaceId,
      user: memberId,
    });

    if (!targetMember) {
      return res.status(404).json({
        success: false,
        message: 'Member not found',
      });
    }

    await Workspace.findByIdAndUpdate(workspaceId, {
      $pull: { members: memberId },
    });

    await WorkspaceMember.deleteOne({ _id: targetMember._id });

    res.status(200).json({
      success: true,
      message: 'Member removed successfully',
    });
  } catch (error) {
    console.error('RemoveMember error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error removing member',
    });
  }
};

export const leaveWorkspace = async (req, res) => {
  try {
    const workspaceId = req.params.id;
    const userId = req.user._id;

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({
        success: false,
        message: 'Workspace not found',
      });
    }

    if (workspace.owner.toString() === userId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Workspace owner cannot leave. Transfer ownership or delete the workspace.',
      });
    }

    await WorkspaceMember.deleteOne({ workspace: workspaceId, user: userId });

    await Workspace.findByIdAndUpdate(workspaceId, {
      $pull: { members: userId },
    });

    res.status(200).json({
      success: true,
      message: 'Left workspace successfully',
    });
  } catch (error) {
    console.error('LeaveWorkspace error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error leaving workspace',
    });
  }
};

export const updateMemberRole = async (req, res) => {
  try {
    const { memberId } = req.params;
    const { role } = req.body;
    const workspaceId = req.params.id;

    if (!role || !['admin', 'member'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Role must be either admin or member',
      });
    }

    const adminMember = await WorkspaceMember.findOne({
      workspace: workspaceId,
      user: req.user._id,
    });

    if (!adminMember || adminMember.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can update member roles',
      });
    }

    const workspaceMember = await WorkspaceMember.findOne({
      workspace: workspaceId,
      user: memberId,
    });

    if (!workspaceMember) {
      return res.status(404).json({
        success: false,
        message: 'Member not found',
      });
    }

    workspaceMember.role = role;
    await workspaceMember.save();

    res.status(200).json({
      success: true,
      message: `Member role updated to ${role}`,
    });
  } catch (error) {
    console.error('UpdateMemberRole error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error updating member role',
    });
  }
};

export const getMembers = async (req, res) => {
  try {
    const workspaceId = req.params.id;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const total = await WorkspaceMember.countDocuments({ workspace: workspaceId });

    const members = await WorkspaceMember.find({ workspace: workspaceId })
      .populate('user', '-password')
      .skip(skip)
      .limit(limit)
      .sort({ joinedAt: 1 });

    res.status(200).json({
      success: true,
      data: members,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('GetMembers error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching members',
    });
  }
};
