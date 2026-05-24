import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      trim: true,
      default: '',
    },
    // Optional: users created via Google OAuth have no password
    password: {
      type: String,
      minlength: 6,
      select: false,
    },
    // Google OAuth users: stable Google subject ID (the `sub` claim)
    googleId: {
      type: String,
      unique: true,
      sparse: true, // allow multiple null values (email-only users)
    },
    // Password reset: SHA-256 hash of the random token (never store raw)
    resetTokenHash: {
      type: String,
      select: false,
    },
    resetTokenExpires: {
      type: Date,
      select: false,
    },
    dailyTokensUsed: {
      type: Number,
      default: 0,
    },
    dailyTokensResetAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
)

userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next()
  this.password = await bcrypt.hash(this.password, 12)
  next()
})

userSchema.methods.comparePassword = function (candidate) {
  if (!this.password) return false
  return bcrypt.compare(candidate, this.password)
}

export default mongoose.model('User', userSchema)
