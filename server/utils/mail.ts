import nodemailer from 'nodemailer'

export function isMailConfigured() {
  return Boolean(
    process.env.SMTP_HOST && process.env.MAIL_FROM && process.env.SMTP_USER && process.env.SMTP_PASS,
  )
}

export async function sendMail(msg: { to: string; subject: string; text: string; html?: string }) {
  if (!isMailConfigured()) {
    throw new Error(
      'Mail is not configured. Set SMTP_HOST, SMTP_PORT (optional), SMTP_USER, SMTP_PASS, MAIL_FROM in .env',
    )
  }
  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
  await transport.sendMail({
    from: process.env.MAIL_FROM,
    to: msg.to,
    subject: msg.subject,
    text: msg.text,
    html: msg.html,
  })
}
