import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { OAuth2Client } from 'google-auth-library'
import User from '../models/User.js'
import { sendPasswordResetEmail } from '../services/emailService.js'

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  })

// Shape returned to the client on every auth handshake.
// Kept in sync with what the frontend stores in localStorage.
const publicUser = (u) => ({
  id:        u._id,
  email:     u.email,
  name:      u.name,
  avatarUrl: u.avatarUrl,
})

// Reused across requests — cheap to keep around
let _googleClient = null
function getGoogleClient() {
  if (!_googleClient) _googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)
  return _googleClient
}

export async function register(req, res) {
  const { email, password, name } = req.body

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

    const user = await User.create({ email, password, name: name || '' })
    const token = signToken(user._id)

    res.status(201).json({
      token,
      user: publicUser(user),
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
      user: publicUser(user),
    })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// Returns the full profile shape used by the Profile page. `hasPassword`
// tells the UI whether to show a "change password" form (Google-only users
// haven't set one yet, so they'd have nothing to compare against).
export async function me(req, res) {
  const u = req.user
  // password is select:false on the schema; do a tiny extra query to know
  // whether to surface the change-password form on the client
  const pwdDoc = await User.findById(u._id).select('+password').lean()
  res.json({
    user: {
      id:              u._id,
      email:           u.email,
      name:            u.name,
      avatarUrl:       u.avatarUrl,
      googleLinked:    Boolean(u.googleId),
      hasPassword:     Boolean(pwdDoc?.password),
      createdAt:       u.createdAt,
      dailyTokensUsed: u.dailyTokensUsed,
    },
  })
}

// PATCH /api/auth/me — currently only name is user-editable
export async function updateMe(req, res) {
  const { name } = req.body
  if (typeof name !== 'string') {
    return res.status(400).json({ message: 'Name must be a string' })
  }
  const trimmed = name.trim()
  if (trimmed.length > 60) {
    return res.status(400).json({ message: 'Name must be 60 characters or fewer' })
  }

  try {
    req.user.name = trimmed
    await req.user.save()
    res.json({
      user: {
        id:        req.user._id,
        email:     req.user.email,
        name:      req.user.name,
        avatarUrl: req.user.avatarUrl,
      },
    })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// POST /api/auth/change-password — requires current password unless the user
// has no password yet (Google-only) in which case this is the first set.
export async function changePassword(req, res) {
  const { currentPassword, newPassword } = req.body
  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ message: 'New password must be at least 6 characters' })
  }

  try {
    const user = await User.findById(req.user._id).select('+password')
    if (!user) return res.status(404).json({ message: 'User not found' })

    if (user.password) {
      if (!currentPassword) {
        return res.status(400).json({ message: 'Current password is required' })
      }
      const ok = await user.comparePassword(currentPassword)
      if (!ok) return res.status(401).json({ message: 'Current password is incorrect' })
    }

    user.password = newPassword
    await user.save()
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// ── Google OAuth ──────────────────────────────────────────────────────────────
// Frontend uses Google's OAuth implicit flow (via useGoogleLogin) and sends us
// an access_token. We:
//   1. Validate that the token was issued for OUR client_id (prevents tokens
//      leaked from other apps being replayed against us)
//   2. Use the access token to fetch the user's profile from Google
//   3. Find-or-create the user (link by googleId, fall back to email)
export async function googleLogin(req, res) {
  const { access_token } = req.body
  if (!access_token) {
    return res.status(400).json({ message: 'Missing access token' })
  }

  try {
    // Step 1: audience check — the access token's `aud` must equal our client_id
    const tokenInfo = await getGoogleClient().getTokenInfo(access_token)
    if (tokenInfo.aud !== process.env.GOOGLE_CLIENT_ID) {
      return res.status(401).json({ message: 'Access token was issued for a different app' })
    }

    // Step 2: fetch profile (sub, email, name, email_verified)
    const profileRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` },
    })
    if (!profileRes.ok) {
      return res.status(401).json({ message: 'Failed to fetch Google profile' })
    }
    const profile = await profileRes.json()
    if (!profile.email_verified) {
      return res.status(401).json({ message: 'Google account email is not verified' })
    }

    const { sub: googleId, email, name, picture } = profile

    // Step 3: lookup by googleId first; fall back to email so existing password
    // users can also sign in with Google (we attach the googleId on first use)
    let user = await User.findOne({ googleId })
    if (!user) {
      user = await User.findOne({ email })
      if (user) {
        user.googleId = googleId
        if (!user.name && name) user.name = name
        if (picture) user.avatarUrl = picture // refresh on every Google sign-in
        await user.save()
      } else {
        user = await User.create({ googleId, email, name: name || '', avatarUrl: picture || '' })
      }
    } else if (picture && user.avatarUrl !== picture) {
      // Refresh Google avatar if it changed since last sign-in
      user.avatarUrl = picture
      await user.save()
    }

    const token = signToken(user._id)
    res.json({
      token,
      user: publicUser(user),
    })
  } catch (err) {
    console.error('[googleLogin]', err.message)
    res.status(401).json({ message: 'Invalid Google credential' })
  }
}

// ── Forgot password ───────────────────────────────────────────────────────────
// Generate a random token, store its SHA-256 hash on the user, email the raw
// token to the user. Always return 200 — never leak whether the email exists.
export async function forgotPassword(req, res) {
  const { email } = req.body
  if (!email) return res.status(400).json({ message: 'Email is required' })

  try {
    const user = await User.findOne({ email })

    if (user) {
      const rawToken = crypto.randomBytes(32).toString('hex')
      user.resetTokenHash    = crypto.createHash('sha256').update(rawToken).digest('hex')
      user.resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000) // 1 hour
      await user.save()

      const appUrl    = process.env.APP_URL || process.env.CLIENT_ORIGIN || 'http://localhost:5173'
      const resetLink = `${appUrl.replace(/\/$/, '')}/reset-password?token=${rawToken}`

      try {
        await sendPasswordResetEmail({ to: user.email, resetLink })
      } catch (mailErr) {
        // Roll back the token so a broken email doesn't leave dangling state
        user.resetTokenHash    = undefined
        user.resetTokenExpires = undefined
        await user.save()
        console.error('[forgotPassword] email send failed:', mailErr.message)
        return res.status(500).json({ message: 'Failed to send reset email' })
      }
    }

    // Intentionally return success even if the user doesn't exist —
    // prevents email enumeration via the forgot-password endpoint
    res.json({ ok: true })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}

// ── Reset password ────────────────────────────────────────────────────────────
export async function resetPassword(req, res) {
  const { token, password } = req.body
  if (!token || !password) {
    return res.status(400).json({ message: 'Token and password are required' })
  }
  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' })
  }

  try {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex')
    const user = await User.findOne({
      resetTokenHash:    tokenHash,
      resetTokenExpires: { $gt: new Date() },
    }).select('+password +resetTokenHash +resetTokenExpires')

    if (!user) {
      return res.status(400).json({ message: 'Reset link is invalid or has expired' })
    }

    user.password          = password
    user.resetTokenHash    = undefined
    user.resetTokenExpires = undefined
    await user.save()

    const authToken = signToken(user._id)
    res.json({
      token: authToken,
      user: publicUser(user),
    })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message })
  }
}
