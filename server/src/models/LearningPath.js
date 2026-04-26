import mongoose from 'mongoose'

const resourceSchema = new mongoose.Schema({
  type:  { type: String, enum: ['video', 'article', 'docs', 'exercise'], required: true },
  title: { type: String, required: true },
  url:   { type: String, default: '' },
}, { _id: false })

const learningNodeSchema = new mongoose.Schema({
  week:          { type: Number, required: true },
  title:         { type: String, required: true },
  description:   { type: String, default: '' },
  topics:        [String],
  resources:     [resourceSchema],
  quizFocus:     { type: String, default: '' },
  difficulty:    { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
  quizQuestions: { type: [mongoose.Schema.Types.Mixed], default: undefined },
  status:        { type: String, enum: ['locked', 'unlocked', 'complete'], default: 'locked' },
  quizScore:     { type: Number, default: null },
  wrongConcepts: [String],
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

// Unlock the first node whenever a path is first created
learningPathSchema.pre('save', function (next) {
  if (this.isNew && this.nodes.length > 0) {
    this.nodes[0].status = 'unlocked'
  }
  next()
})

export default mongoose.model('LearningPath', learningPathSchema)
