import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
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

    try {
      await transporter.sendMail({
        from: '"LinChoy" <contact@linchoy.com>',
        to,
        subject: "Activez votre compte LinChoy",
        text: `Bonjour ${username},\n\nBienvenue chez LinChoy ! Veuillez confirmer votre adresse email en copiant-collant le lien suivant dans votre navigateur : ${verifyUrl}\n\nCe lien expire dans 24 heures.\n\nÀ très vite !`,
        html: `
       <!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Vérification LinChoy</title>
  <style>
    .btn-orange:hover {
      background-color: #ffb366 !important;
      border-color: #ffb366 !important;
    }
  </style>
</head>
<body style="margin: 0; padding: 40px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
    <tr>
      <td align="center">

        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; background-color: #1a1a1c; border: 1px solid #2d2d30; border-radius: 12px; overflow: hidden;">
          
          <tr>
            <td style="padding: 40px 40px 20px 40px; text-align: center; border-bottom: 1px solid #2d2d30;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">
                <span style="color: #ff8c00;">Lin</span><span style="color: #32cd32;">Choy</span>
              </h1>
            </td>
          </tr>

          <tr>
            <td style="padding: 30px 40px; text-align: left; color: #b3b3b3; line-height: 1.6; font-size: 15px;">
              <p style="margin: 0 0 16px 0; font-size: 18px; color: #ffffff; font-weight: 600;">
                Bonjour <span style="color: #ff8c00;">${username}</span>,
              </p>
              <p style="margin: 0 0 24px 0;">Bienvenue dans l'aventure !<br/> Pour valider définitivement la création de ton compte et sécuriser tes accès, clique simplement sur le bouton ci-dessous :</p>
              
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin: 30px auto;">
                <tr>
                  <td style="border-radius: 8px; background-color: #ff8c00; text-align: center; box-shadow: 0 4px 14px rgba(255, 140, 0, 0.3);">
                    <a href="${verifyUrl}" class="btn-orange" target="_blank" style="background-color: #ff8c00; border: 1px solid #ff8c00; border-radius: 8px; color: #1A1A1C; display: inline-block; font-size: 16px; font-weight: 700; padding: 14px 32px; text-decoration: none; user-select: none; transition: all 0.3s ease;">
                      Vérifier mon adresse email
                    </a>
                  </td>
                </tr>
              </table>

              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-top: 24px; background-color: #242426; border-left: 4px solid #32cd32; border-radius: 4px;">
                <tr>
                  <td style="padding: 14px; font-size: 13px; color: #b3b3b3; text-align: center;">
                    ⏳ Sécurité : Ce lien est temporaire et expirera dans <strong style="color: #70ffad;">24 heures</strong>.
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding: 20px 40px 40px 40px; border-top: 1px solid #2d2d30; text-align: center; font-size: 12px; color: #666666; line-height: 1.5;">
              <p style="margin: 0 0 8px 0;">Si tu n'es pas à l'origine de la création de ce compte, tu peux ignorer cet e-mail en toute sécurité.</p>
              <p style="margin: 0;">&copy; ${new Date().getFullYear()} LinChoy. Tous droits réservés.</p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>`,
      });
    } catch (err) {
      console.error("[mail]: Échec d'envoi", err);
      throw err;
    }
  },

  async sendPasswordResetEmail(to: string, token: string, username: string) {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    try {
      await transporter.sendMail({
        from: '"LinChoy" <contact@linchoy.com>',
        to,
        subject: "Réinitialise ton mot de passe LinChoy",
        text: `Bonjour ${username},\n\nUne demande de réinitialisation de mot de passe a été effectuée. Copie-colle ce lien dans ton navigateur pour choisir un nouveau mot de passe : ${resetUrl}\n\nCe lien expire dans 1 heure. Si tu n'es pas à l'origine de cette demande, ignore cet email.`,
        html: `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Réinitialisation LinChoy</title>
</head>
<body style="margin: 0; padding: 40px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
    <tr>
      <td align="center">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; background-color: #1a1a1c; border: 1px solid #2d2d30; border-radius: 12px; overflow: hidden;">
          <tr>
            <td style="padding: 40px 40px 20px 40px; text-align: center; border-bottom: 1px solid #2d2d30;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">
                <span style="color: #ff8c00;">Lin</span><span style="color: #32cd32;">Choy</span>
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding: 30px 40px; text-align: left; color: #b3b3b3; line-height: 1.6; font-size: 15px;">
              <p style="margin: 0 0 16px 0; font-size: 18px; color: #ffffff; font-weight: 600;">
                Bonjour <span style="color: #ff8c00;">${username}</span>,
              </p>
              <p style="margin: 0 0 24px 0;">Tu as demandé à réinitialiser ton mot de passe. Clique sur le bouton ci-dessous pour en choisir un nouveau :</p>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin: 30px auto;">
                <tr>
                  <td style="border-radius: 8px; background-color: #ff8c00; text-align: center; box-shadow: 0 4px 14px rgba(255, 140, 0, 0.3);">
                    <a href="${resetUrl}" target="_blank" style="background-color: #ff8c00; border: 1px solid #ff8c00; border-radius: 8px; color: #1A1A1C; display: inline-block; font-size: 16px; font-weight: 700; padding: 14px 32px; text-decoration: none;">
                      Réinitialiser mon mot de passe
                    </a>
                  </td>
                </tr>
              </table>
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-top: 24px; background-color: #242426; border-left: 4px solid #32cd32; border-radius: 4px;">
                <tr>
                  <td style="padding: 14px; font-size: 13px; color: #b3b3b3; text-align: center;">
                    ⏳ Ce lien est valable <strong style="color: #70ffad;">1 heure</strong>. Si tu n'es pas à l'origine de cette demande, ignore cet email.
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 40px 40px 40px; border-top: 1px solid #2d2d30; text-align: center; font-size: 12px; color: #666666;">
              &copy; ${new Date().getFullYear()} LinChoy. Tous droits réservés.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
      });
    } catch (err) {
      console.error("[mail]: Échec d'envoi (reset password)", err);
      throw err;
    }
  },
};
