import mongoose from 'mongoose';
import crypto from 'crypto';

const invitationSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, lowercase: true },
    workspace: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true },
    invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    token: { type: String, required: true, unique: true },
    status: { type: String, enum: ['pending', 'accepted', 'declined', 'expired'], default: 'pending' },
    acceptedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

invitationSchema.index({ email: 1, workspace: 1 });
invitationSchema.index({ token: 1 });

invitationSchema.pre('save', function (next) {
  if (!this.token) {
    this.token = crypto.randomBytes(24).toString('hex');
  }
  next();
});

const Invitation = mongoose.model('Invitation', invitationSchema);
export default Invitation;
