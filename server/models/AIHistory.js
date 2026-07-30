import mongoose from 'mongoose';

const aiHistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    workspace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
    },
    prompt: {
      type: String,
      required: true,
    },
    response: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: [
        'chat_summary',
        'code_generate',
        'code_debug',
        'code_explain',
        'meeting_notes',
        'action_items',
        'technical_question',
        'documentation',
        'commit_message',
        'task_suggestion',
        'code_review',
        'general',
      ],
      default: 'general',
    },
    metadata: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

const AIHistory = mongoose.model('AIHistory', aiHistorySchema);
export default AIHistory;