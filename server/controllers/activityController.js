import WorkspaceMember from '../models/WorkspaceMember.js';
import Task from '../models/Task.js';
import Message from '../models/Message.js';
import File from '../models/File.js';
import Channel from '../models/Channel.js';
import Workspace from '../models/Workspace.js';

export const getRecentActivity = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 10;

    const memberships = await WorkspaceMember.find({ user: req.user._id }).select('workspace');
    const workspaceIds = memberships.map((m) => m.workspace);

    const tasks = await Task.find({ workspace: { $in: workspaceIds } })
      .populate('createdBy', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(limit);

    const messages = await Message.find({ workspace: { $in: workspaceIds }, messageType: { $ne: 'system' } })
      .populate('sender', 'name avatar')
      .populate('channel', 'name')
      .sort({ createdAt: -1 })
      .limit(limit);

    const files = await File.find({ workspace: { $in: workspaceIds } })
      .populate('uploadedBy', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(limit);

    const joins = await WorkspaceMember.find({ workspace: { $in: workspaceIds } })
      .populate('user', 'name avatar')
      .sort({ joinedAt: -1 })
      .limit(limit);

    const workspaces = await Workspace.find({ _id: { $in: workspaceIds } }).select('name');

    const wsName = new Map(workspaces.map((w) => [w._id.toString(), w.name]));

    const activities = [
      ...tasks.map((t) => ({
        type: t.status === 'completed' ? 'task_completed' : 'task_created',
        user: t.createdBy,
        target: t.title,
        createdAt: t.createdAt,
      })),
      ...messages.map((m) => ({
        type: 'message_sent',
        user: m.sender,
        target: m.channel?.name || 'general',
        createdAt: m.createdAt,
      })),
      ...files.map((f) => ({
        type: 'file_uploaded',
        user: f.uploadedBy,
        target: f.originalName,
        createdAt: f.createdAt,
      })),
      ...joins.map((jm) => ({
        type: 'member_joined',
        user: jm.user,
        target: wsName.get(jm.workspace.toString()) || 'the workspace',
        createdAt: jm.joinedAt || jm.createdAt,
      })),
    ];

    activities.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.status(200).json({
      success: true,
      data: activities.slice(0, limit),
    });
  } catch (error) {
    console.error('GetRecentActivity error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching recent activity',
    });
  }
};
