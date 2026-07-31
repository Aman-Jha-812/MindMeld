import Message from '../models/Message.js';
import Channel from '../models/Channel.js';
import Workspace from '../models/Workspace.js';
import WorkspaceMember from '../models/WorkspaceMember.js';
import Notification from '../models/Notification.js';
import { emitToChannel, sendNotification } from '../services/socketService.js';

export const getMessages = async (req, res) => {
  try {
    const { channelId } = req.params;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    const skip = (page - 1) * limit;
    const before = req.query.before;
    const since = req.query.since;

    const filter = { channel: channelId };
    if (before) {
      filter.createdAt = { $lt: new Date(before) };
    }
    if (since) {
      filter.createdAt = { $gt: new Date(since) };
    }

    const total = await Message.countDocuments(filter);

    const messages = await Message.find(filter)
      .populate('sender', 'name avatar')
      .populate('replyTo')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      data: messages.reverse(),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasMore: skip + limit < total,
      },
    });
  } catch (error) {
    console.error('GetMessages error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching messages',
    });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { channelId } = req.params;
    const { content, messageType, file, replyTo, mentions } = req.body;

    if (!content && !file) {
      return res.status(400).json({
        success: false,
        message: 'Message content or file is required',
      });
    }

    const channel = await Channel.findById(channelId);
    if (!channel) {
      return res.status(404).json({
        success: false,
        message: 'Channel not found',
      });
    }

    const message = await Message.create({
      channel: channelId,
      workspace: channel.workspace,
      sender: req.user._id,
      content: content || '',
      messageType: messageType || 'text',
      file,
      replyTo,
      mentions: mentions || [],
    });

    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'name avatar')
      .populate('replyTo');

    emitToChannel(channelId, 'new_message', populatedMessage);

    const senderId = req.user._id.toString();
    const mentionIds = (mentions || []).map((m) => m.toString());

    const memberships = await WorkspaceMember.find({ workspace: channel.workspace }).select('user');
    const messageNotifications = memberships
      .map((m) => m.user.toString())
      .filter((memberId) =>
        memberId !== senderId &&
        !mentionIds.includes(memberId)
      )
      .map((memberId) =>
        Notification.create({
          recipient: memberId,
          workspace: channel.workspace,
          type: 'new_message',
          title: `New message in #${channel.name}`,
          message: content || (file ? 'Sent a file' : ''),
          data: { channelId, workspaceId: channel.workspace, messageId: message._id },
        })
      );

    const createdNotifications = await Promise.all(messageNotifications);
    createdNotifications.forEach((notification) => {
      sendNotification(notification.recipient.toString(), notification);
    });

    if (mentions && mentions.length > 0) {
      const mentionNotifications = mentions.map((userId) =>
        Notification.create({
          recipient: userId,
          workspace: channel.workspace,
          type: 'mention',
          title: `You were mentioned in #${channel.name}`,
          message: content,
          data: { channelId, workspaceId: channel.workspace, messageId: message._id },
        })
      );

      const notifications = await Promise.all(mentionNotifications);

      mentions.forEach((userId, index) => {
        sendNotification(userId, notifications[index]);
      });
    }

    res.status(201).json({
      success: true,
      data: populatedMessage,
    });
  } catch (error) {
    console.error('SendMessage error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error sending message',
    });
  }
};

export const editMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'Message content is required',
      });
    }

    const message = await Message.findById(id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found',
      });
    }

    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only edit your own messages',
      });
    }

    message.content = content;
    message.isEdited = true;
    message.editedAt = new Date();
    await message.save();

    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'name avatar')
      .populate('replyTo');

    emitToChannel(message.channel.toString(), 'message_edited', populatedMessage);

    res.status(200).json({
      success: true,
      data: populatedMessage,
    });
  } catch (error) {
    console.error('EditMessage error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error editing message',
    });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;

    const message = await Message.findById(id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found',
      });
    }

    const isSender = message.sender.toString() === req.user._id.toString();

    const member = await WorkspaceMember.findOne({
      workspace: message.workspace,
      user: req.user._id,
    });
    const isAdmin = member && member.role === 'admin';

    if (!isSender && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own messages',
      });
    }

    const channelId = message.channel.toString();
    await Message.findByIdAndDelete(id);

    emitToChannel(channelId, 'message_deleted', { messageId: id, channelId });

    res.status(200).json({
      success: true,
      message: 'Message deleted',
    });
  } catch (error) {
    console.error('DeleteMessage error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error deleting message',
    });
  }
};

export const getChannels = async (req, res) => {
  try {
    const { workspaceId } = req.params;

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({
        success: false,
        message: 'Workspace not found',
      });
    }

    const channels = await Channel.find({ workspace: workspaceId }).sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      data: channels,
    });
  } catch (error) {
    console.error('GetChannels error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching channels',
    });
  }
};

export const createChannel = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const { name, description, type, isPrivate } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Channel name is required',
      });
    }

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({
        success: false,
        message: 'Workspace not found',
      });
    }

    const channel = await Channel.create({
      name,
      description,
      workspace: workspaceId,
      type: type || 'custom',
      isPrivate: isPrivate || false,
      createdBy: req.user._id,
    });

    workspace.channels.push(channel._id);
    await workspace.save();

    res.status(201).json({
      success: true,
      data: channel,
    });
  } catch (error) {
    console.error('CreateChannel error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error creating channel',
    });
  }
};

export const updateChannel = async (req, res) => {
  try {
    const { channelId } = req.params;
    const { name, description } = req.body;

    const updateFields = {};
    if (name !== undefined) updateFields.name = name;
    if (description !== undefined) updateFields.description = description;

    const channel = await Channel.findByIdAndUpdate(channelId, updateFields, {
      new: true,
      runValidators: true,
    });

    if (!channel) {
      return res.status(404).json({
        success: false,
        message: 'Channel not found',
      });
    }

    res.status(200).json({
      success: true,
      data: channel,
    });
  } catch (error) {
    console.error('UpdateChannel error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error updating channel',
    });
  }
};

export const deleteChannel = async (req, res) => {
  try {
    const { channelId } = req.params;

    const channel = await Channel.findById(channelId);
    if (!channel) {
      return res.status(404).json({
        success: false,
        message: 'Channel not found',
      });
    }

    await Message.deleteMany({ channel: channelId });

    await Workspace.findByIdAndUpdate(channel.workspace, {
      $pull: { channels: channelId },
    });

    await Channel.findByIdAndDelete(channelId);

    res.status(200).json({
      success: true,
      message: 'Channel deleted',
    });
  } catch (error) {
    console.error('DeleteChannel error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error deleting channel',
    });
  }
};
