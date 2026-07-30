import mongoose from 'mongoose';
import crypto from 'crypto';

const workspaceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Workspace name is required'],
      trim: true,
    },
    description: {
      type: String,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    channels: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Channel' }],
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    inviteCode: {
      type: String,
      unique: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

workspaceSchema.pre('save', function (next) {
  if (!this.inviteCode) {
    this.inviteCode = crypto.randomBytes(4).toString('hex');
  }
  next();
});

const Workspace = mongoose.model('Workspace', workspaceSchema);
export default Workspace;