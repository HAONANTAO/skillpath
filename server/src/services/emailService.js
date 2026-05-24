import { Resend } from 'resend'

let _resend = null
function getResend() {
  if (!_resend) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not set — emails cannot be sent')
    }
    _resend = new Resend(process.env.RESEND_API_KEY)
  }
  return _resend
}

const FROM = process.env.EMAIL_FROM || 'SkillPath <onboarding@resend.dev>'

export async function sendPasswordResetEmail({ to, resetLink }) {
  const { data, error } = await getResend().emails.send({
    from:    FROM,
    to:      [to],
    subject: 'Reset your SkillPath password',
    html: `
      <div style="font-family:-apple-system,system-ui,'Segoe UI',sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#1a1a2e;background:#fafafa;border-radius:12px;">
        <div style="font-size:20px;font-weight:700;color:#7C6AF7;margin-bottom:16px;">SkillPath</div>
        <h2 style="font-size:22px;margin:0 0 12px 0;color:#1a1a2e;">Reset your password</h2>
        <p style="font-size:15px;line-height:1.55;color:#3a3a52;margin:0 0 20px 0;">
          We received a request to reset the password for your SkillPath account.
          Click the button below to choose a new one. This link expires in 1 hour.
        </p>
        <a href="${resetLink}" style="display:inline-block;background:#7C6AF7;color:#fff;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600;font-size:15px;">Reset password</a>
        <p style="font-size:13px;color:#7a7a94;margin:24px 0 0 0;line-height:1.5;">
          If you didn't request this, you can safely ignore this email — your password won't change.
        </p>
        <p style="font-size:12px;color:#9a9aaf;margin:24px 0 0 0;word-break:break-all;">
          Or copy this link into your browser:<br/>${resetLink}
        </p>
      </div>
    `,
    text: `Reset your SkillPath password\n\nWe received a request to reset your password. Open this link to set a new one (expires in 1 hour):\n\n${resetLink}\n\nIf you didn't request this, ignore this email.`,
  })

  if (error) {
    throw new Error(`Resend failed: ${error.message || JSON.stringify(error)}`)
  }
  return data
}
