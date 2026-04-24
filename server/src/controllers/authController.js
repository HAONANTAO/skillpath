import jwt from 'jsonwebtoken'
import User from '../models/User.js'

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  })

export async function register(req, res) {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' })
  }
  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' })
  }

  try {
    const existing = await User.findOne({ email })
    if (existing) {
      return res.status(409).json({ message: 'Email already in use' })
    }

    const user = await User.create({ email, password })
    const token = signToken(user._id)

    res.status(201).json({
      token,
      user: { id: user._id, email: user.email },
    })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

export async function login(req, res) {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' })
  }

  try {
    const user = await User.findOne({ email }).select('+password')
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    const token = signToken(user._id)

    res.json({
      token,
      user: { id: user._id, email: user.email },
    })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

export async function me(req, res) {
  res.json({ user: { id: req.user._id, email: req.user.email, dailyTokensUsed: req.user.dailyTokensUsed } })
}
