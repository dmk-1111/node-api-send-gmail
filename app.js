const express = require('express');
require('dotenv').config();
const nodemailer = require('nodemailer');

const app = express();
app.use(express.json());

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

app.post('/send', async (req, res) => {
    try {
        const { to, subject, text, html } = req.body;

        if (
            !to ||
            (Array.isArray(to) && to.length === 0) ||
            (!Array.isArray(to) && !String(to).trim()) ||
            !subject?.trim() ||
            !text?.trim()
        ) {
            return res.status(400).json({
                error: 'Provide non-empty to, subject, and text fields.'
            });
        }

        const result = await transporter.sendMail({
            from: process.env.GMAIL_USER,

            // Multiple recipients
            to: Array.isArray(to) ? to.join(',') : to,
            subject,
            text,
            ...(typeof html === 'string' && html.trim()
                ? { html }
                : {}),
        });

        return res.json({
            message: 'Email sent successfully',
            messageId: result.messageId,
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            error: 'Failed to send email'
        });
    }

});

if (require.main === module) {
  const port = Number(process.env.PORT) || 3000;
  app.listen(port, () => {
    console.log(`Email API listening on port ${port}`);
  });
}

module.exports = app;