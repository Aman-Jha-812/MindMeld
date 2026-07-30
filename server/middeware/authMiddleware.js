import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import WorkspaceMember from '../models/WorkspaceMember.js';

export const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, no token provided',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, user not found',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, token invalid',
    });
  }
};

export const authorize = (...roles) => {
  return async (req, res, next) => {
    try {
      const workspaceId =
        req.params.workspaceId ||
        req.params.id ||
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
          message: 'Not authorized, not a member of this workspace',
        });
      }

      if (!roles.includes(member.role)) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized, insufficient permissions',
        });
      }

      next();
    } catch (error) {
      return res.status(403).json({
        success: false,
        message: 'Authorization failed',
      });
    }
  };
};
