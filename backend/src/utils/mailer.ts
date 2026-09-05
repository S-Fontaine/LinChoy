import nodemailer from "nodemailer";
import { getVerificationEmailTemplate } from "./mailTemplates/verificationEmail.template.js";
import { getPasswordResetTemplate } from "./mailTemplates/passwordReset.template.js";

export const transporter = nodemailer.createTransport({
  host: "ssl0.ovh.net",
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export const mailer = {
  async sendVerificationEmail(to: string, token: string, username: string) {
    const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
    const { text, html } = getVerificationEmailTemplate(username, verifyUrl);

    try {
      await transporter.sendMail({
        from: '"LinChoy" <contact@linchoy.com>',
        to,
        subject: "Activez votre compte LinChoy",
        text,
        html,
      });
    } catch (err) {
      console.error("[mail]: Échec d'envoi", err);
      throw err;
    }
  },

  async sendPasswordResetEmail(to: string, token: string, username: string) {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    const { text, html } = getPasswordResetTemplate(username, resetUrl);

    try {
      await transporter.sendMail({
        from: '"LinChoy" <contact@linchoy.com>',
        to,
        subject: "Réinitialise ton mot de passe LinChoy",
        text,
        html,
      });
    } catch (err) {
      console.error("[mail]: Échec d'envoi (reset password)", err);
      throw err;
    }
  },
};
