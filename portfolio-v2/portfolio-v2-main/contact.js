// api/contact.js — Vercel Serverless Function
// Handles contact form submissions.
// No external deps required. Add your email provider of choice below.

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, email, subject, message } = req.body;

    // Validate required fields
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }

    // Sanitize inputs (basic)
    const safe = (str) => String(str).slice(0, 2000).replace(/<[^>]*>/g, '');

    const payload = {
      name:    safe(name),
      email:   safe(email),
      subject: safe(subject || 'No subject'),
      message: safe(message),
      timestamp: new Date().toISOString(),
    };

    // -------------------------------------------------------
    // OPTION A: Forward to a webhook (e.g. Zapier, Make, n8n)
    // Uncomment and set WEBHOOK_URL in Vercel env vars:
    // -------------------------------------------------------
    // if (process.env.WEBHOOK_URL) {
    //   await fetch(process.env.WEBHOOK_URL, {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(payload),
    //   });
    // }

    // -------------------------------------------------------
    // OPTION B: Resend (https://resend.com) — recommended
    // Set RESEND_API_KEY in Vercel env vars:
    // -------------------------------------------------------
    // if (process.env.RESEND_API_KEY) {
    //   await fetch('https://api.resend.com/emails', {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json',
    //       Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
    //     },
    //     body: JSON.stringify({
    //       from: 'portfolio@yourdomain.com',
    //       to: 'you@yourdomain.com',
    //       subject: `[Portfolio] ${payload.subject}`,
    //       html: `
    //         <p><strong>From:</strong> ${payload.name} &lt;${payload.email}&gt;</p>
    //         <p><strong>Subject:</strong> ${payload.subject}</p>
    //         <hr/>
    //         <p>${payload.message.replace(/\n/g, '<br>')}</p>
    //       `,
    //     }),
    //   });
    // }

    // Log submission (visible in Vercel function logs)
    console.log('[contact] New submission:', JSON.stringify({
      name: payload.name,
      email: payload.email,
      subject: payload.subject,
      timestamp: payload.timestamp,
    }));

    return res.status(200).json({
      success: true,
      message: 'Message received. I\'ll be in touch soon.',
    });

  } catch (err) {
    console.error('[contact] Error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
