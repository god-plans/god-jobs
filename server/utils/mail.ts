import nodemailer from 'nodemailer'

export function isMailConfigured() {
  const c = useRuntimeConfig()
  return Boolean(
    String(c.smtpHost ?? '').trim()
      && String(c.mailFrom ?? '').trim()
      && String(c.smtpUser ?? '').trim()
      && String(c.smtpPass ?? '').trim(),
  )
}

export async function sendMail(msg: { to: string; subject: string; text: string; html?: string }) {
  if (!isMailConfigured()) {
    throw new Error(
      'Mail is not configured. Set smtpHost, smtpUser, smtpPass, mailFrom in config/static-public-env.ts or NUXT_* / SMTP_* env.',
    )
  }
  const c = useRuntimeConfig()
  const transport = nodemailer.createTransport({
    host: String(c.smtpHost),
    port: Number(c.smtpPort || 587),
    secure: Boolean(c.smtpSecure),
    auth: {
      user: String(c.smtpUser),
      pass: String(c.smtpPass),
    },
  })
  await transport.sendMail({
    from: String(c.mailFrom),
    to: msg.to,
    subject: msg.subject,
    text: msg.text,
    html: msg.html,
  })
}
