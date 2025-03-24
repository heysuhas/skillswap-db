import mongoose from 'mongoose';

const quizSchema = new mongoose.Schema({
  skillId: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill', required: true },
  title: { type: String, required: true },
  passingScore: { type: Number, required: true },
});

export default mongoose.model('Quiz', quizSchema);
