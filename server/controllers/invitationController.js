import Invitation from '../models/Invitation.js';
import Workspace from '../models/Workspace.js';
import WorkspaceMember from '../models/WorkspaceMember.js';

export const getInvitation = async (req, res) => {
  try {
    const { token } = req.params;
    const invitation = await Invitation.findOne({ token, status: 'pending' })
      .populate('workspace', 'name')
      .populate('invitedBy', 'name email');

    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: 'Invitation not found or already used',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        email: invitation.email,
        workspace: invitation.workspace,
        invitedBy: invitation.invitedBy,
      },
    });
  } catch (error) {
    console.error('GetInvitation error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

export const acceptInvitation = async (req, res) => {
  try {
    const { token } = req.params;
    const userId = req.user._id;

    const invitation = await Invitation.findOne({ token, status: 'pending' })
      .populate('workspace');

    if (!invitation) {
      return res.status(404).json({
        success: false,
        message: 'Invitation not found or already used',
      });
    }

    if (invitation.email !== req.user.email.toLowerCase()) {
      return res.status(403).json({
        success: false,
        message: 'This invitation was sent to a different email address',
      });
    }

    const existingMember = await WorkspaceMember.findOne({
      workspace: invitation.workspace._id,
      user: userId,
    });

    if (existingMember) {
      invitation.status = 'accepted';
      invitation.acceptedBy = userId;
      await invitation.save();
      return res.status(200).json({
        success: true,
        message: 'You are already a member of this workspace',
        data: { workspaceId: invitation.workspace._id },
      });
    }

    await WorkspaceMember.create({
      workspace: invitation.workspace._id,
      user: userId,
      role: 'member',
    });

    await Workspace.findByIdAndUpdate(invitation.workspace._id, {
      $addToSet: { members: userId },
    });

    invitation.status = 'accepted';
    invitation.acceptedBy = userId;
    await invitation.save();

    res.status(200).json({
      success: true,
      message: 'Invitation accepted successfully',
      data: { workspaceId: invitation.workspace._id },
    });
  } catch (error) {
    console.error('AcceptInvitation error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error accepting invitation',
    });
  }
};
