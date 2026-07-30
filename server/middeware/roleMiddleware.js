import WorkspaceMember from '../models/WorkspaceMember.js';

export const checkWorkspaceRole = (requiredRole) => {
  return async (req, res, next) => {
    try {
      const workspaceId =
        req.params.workspaceId ||
        req.body.workspace ||
        req.query.workspace;

      if (!workspaceId) {
        return res.status(403).json({
          success: false,
          message: 'Workspace identifier required',
        });
      }

      const member = await WorkspaceMember.findOne({
        workspace: workspaceId,
        user: req.user.id,
      });

      if (!member) {
        return res.status(403).json({
          success: false,
          message: 'Not a member',
        });
      }

      if (member.role !== requiredRole) {
        const message =
          requiredRole === 'admin'
            ? 'Admin access required'
            : `Role ${requiredRole} required`;

        return res.status(403).json({
          success: false,
          message,
        });
      }

      req.workspaceMember = member;
      next();
    } catch (error) {
      return res.status(403).json({
        success: false,
        message: 'Role check failed',
      });
    }
  };
};
