import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  matchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Match', required: true },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  messageType: { type: String, enum: ['text', 'image', 'voice'], default: 'text' },
  mediaUrl: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Message', messageSchema);
