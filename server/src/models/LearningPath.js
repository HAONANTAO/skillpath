import mongoose from 'mongoose'

const resourceSchema = new mongoose.Schema({
  type:  { type: String, enum: ['video', 'article', 'docs', 'exercise'], required: true },
  title: { type: String, required: true },
  url:   { type: String, default: '' },
}, { _id: false })

const learningNodeSchema = new mongoose.Schema({
  week:        { type: Number, required: true },
  title:       { type: String, required: true },
  description: { type: String, default: '' },
  topics:      [String],
  resources:   [resourceSchema],
  quizFocus:   { type: String, default: '' },
  difficulty:  { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
}, { _id: false })

const learningPathSchema = new mongoose.Schema(
  {
    user:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    topic:    { type: String, required: true },
    goal:     { type: String, default: '' },
    weeks:    { type: Number, required: true },
    nodes:    [learningNodeSchema],
    progress: { type: Number, default: 0 },
  },
  { timestamps: true }
)

export default mongoose.model('LearningPath', learningPathSchema)
