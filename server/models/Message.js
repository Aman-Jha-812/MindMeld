import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    channel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Channel',
      required: true,
    },
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: { type: String },
    messageType: {
      type: String,
      enum: ['text', 'image', 'file', 'system'],
      default: 'text',
    },
    file: {
      url: { type: String },
      publicId: { type: String },
      name: { type: String },
      size: { type: Number },
      mimeType: { type: String },
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
    editedAt: { type: Date },
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
    },
    mentions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

messageSchema.index({ channel: 1, createdAt: -1 });

const Message = mongoose.model('Message', messageSchema);
export default Message;