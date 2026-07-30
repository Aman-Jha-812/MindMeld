import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
    },
    type: {
      type: String,
      enum: [
        'new_message',
        'new_member',
        'task_assigned',
        'ai_summary',
        'mention',
        'invitation',
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: { type: String },
    data: { type: mongoose.Schema.Types.Mixed },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;