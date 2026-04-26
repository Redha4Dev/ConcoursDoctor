export const tempPasswordTemplate = (
  fullName: string,
  email: string,
  tempPassword: string,
  role: string,
) => ({
  subject: "ConcoursDoctor — Vos identifiants de connexion",
  html: `
    <!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
    * { font-family: 'Plus Jakarta Sans', 'Google Sans', ui-rounded, -apple-system, Arial, sans-serif !important; }
  </style>
</head>
<body style="margin:0;padding:0;background:#f4f4f8;font-family:'Plus Jakarta Sans','Google Sans',ui-rounded,-apple-system,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:40px 20px;">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;">
 
        <!-- Header -->
        <tr><td style="background:#3014B8;padding:28px 40px;">
<img src="https://res.cloudinary.com/dsztqioey/image/upload/v1776104664/concour_doctora_logo_lm6aqv.png"
               alt="ConcourDoctora"
               width="200"
               height="38"
               style="display:block;margin:0 auto;" />        </td></tr>
 
        <!-- Body -->
        <tr><td style="padding:40px;">
          <p style="font-size:15px;color:#444;margin:0 0 8px;">Bonjour <strong style="color:#1a1a1a;">${fullName}</strong>,</p>
          <h1 style="font-size:22px;color:#3014B8;margin:0 0 20px;">Vous avez été assigné comme ${role}</h1>
          <p style="font-size:15px;color:#444;line-height:1.7;margin:0 0 24px;">
            Nous avons le plaisir de vous informer que vous avez été sélectionné(e) en tant que 
            <strong style="color:#3014B8;">${role}</strong> sur la plateforme ConcourDoctora. 
            Veuillez trouver ci-dessous vos informations de connexion.
          </p>
 
          <!-- Credentials box -->
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f3ff;border-left:4px solid #3014B8;border-radius:0 8px 8px 0;margin-bottom:24px;">
            <tr><td style="padding:20px 24px;">
              <p style="margin:0 0 12px;font-size:13px;font-weight:600;color:#3014B8;text-transform:uppercase;">Vos identifiants</p>
              <table width="100%" cellpadding="6">
                <tr>
                  <td style="color:#666;font-size:14px;width:160px;">Nom complet</td>
                  <td style="color:#1a1a1a;font-weight:500;font-size:14px;">${fullName}</td>
                </tr>
                <tr>
                  <td style="color:#666;font-size:14px;">Adresse email</td>
                  <td style="color:#1a1a1a;font-weight:500;font-size:14px;">${email}</td>
                </tr>
                <tr>
                  <td style="color:#666;font-size:14px;">Mot de passe temporaire</td>
                  <td><span style="background:#3014B8;color:white;font-family:monospace;font-size:15px;padding:3px 10px;border-radius:4px;letter-spacing:0.1em;">${tempPassword}</span></td>
                </tr>
                <tr>
                  <td style="color:#666;font-size:14px;">Rôle</td>
                  <td><span style="background:#ede9ff;color:#3014B8;font-size:13px;font-weight:600;padding:3px 10px;border-radius:4px;">${role}</span></td>
                </tr>
              </table>
            </td></tr>
          </table>
 
          <!-- Warning -->
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff8e1;border:1px solid #ffe082;border-radius:8px;margin-bottom:28px;">
            <tr><td style="padding:14px 18px;font-size:13px;color:#7a5c00;line-height:1.6;">
              ⚠️ Pour des raisons de sécurité, veuillez <strong>changer votre mot de passe</strong> dès votre première connexion.
            </td></tr>
          </table>
 
          <!-- CTA -->
          <a href="https://quenq.com/nsfw/" style="display:inline-block;background:#3014B8;color:white;text-decoration:none;padding:13px 32px;border-radius:8px;font-size:15px;font-weight:500;margin-bottom:32px;">Se connecter →</a>
 
          <hr style="border:none;border-top:1px solid #eee;margin-bottom:24px;">
          <p style="font-size:13px;color:#999;line-height:1.6;margin:0;">
            Cet email a été envoyé automatiquement par ConcourDoctora. Si vous avez des questions, contactez notre équipe support.
          </p>
        </td></tr>
 
        <!-- Footer -->
        <tr><td style="background:#3014B8;padding:18px 40px;text-align:center;">
          <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.7);">© 2026 ConcourDoctora · Tous droits réservés</p>
        </td></tr>
 
      </table>
    </td></tr>
  </table>
</body>
</html>
  `,
});

export const resetPasswordTemplate = (
  firstName: string,
  lastName: string,
  resetUrl: string,
) => ({
  subject: "ConcoursDoctor — Réinitialisation du mot de passe",
  html: `
    <!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
    * { font-family: 'Plus Jakarta Sans', 'Google Sans', ui-rounded, -apple-system, Arial, sans-serif !important; }
  </style>
</head>
<body style="margin:0;padding:0;background:#f4f4f8;font-family:'Plus Jakarta Sans','Google Sans',ui-rounded,-apple-system,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:40px 20px;">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;">
 
        <!-- Header -->
        <tr><td style="background:#3014B8;padding:28px 40px;text-align:center;">
          <img src="https://res.cloudinary.com/dsztqioey/image/upload/v1776104664/concour_doctora_logo_lm6aqv.png"
               alt="ConcourDoctora"
               width="200"
               height="38"
               style="display:block;margin:0 auto;" />
        </td></tr>
 
        <!-- Body -->
        <tr><td style="padding:40px;">
          <p style="font-size:15px;color:#444;margin:0 0 8px;">Bonjour <strong style="color:#1a1a1a;">${lastName} ${firstName}</strong>,</p>
          <h1 style="font-size:22px;color:#3014B8;margin:0 0 20px;">Réinitialisation de votre mot de passe</h1>
          <p style="font-size:15px;color:#444;line-height:1.7;margin:0 0 24px;">
            Vous avez demandé la réinitialisation de votre mot de passe sur la plateforme 
            <strong style="color:#3014B8;">ConcourDoctora</strong>. 
            Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe.
          </p>
 
          <!-- CTA Button -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
            <tr><td align="center">
              <a href="${resetUrl}" style="display:inline-block;background:#3014B8;color:white;text-decoration:none;padding:14px 36px;border-radius:8px;font-size:15px;font-weight:500;">
                Réinitialiser le mot de passe →
              </a>
            </td></tr>
          </table>
 
          <!-- Warning -->
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff8e1;border:1px solid #ffe082;border-radius:8px;margin-bottom:24px;">
            <tr><td style="padding:14px 18px;font-size:13px;color:#7a5c00;line-height:1.6;">
              ⚠️ Ce lien expire dans <strong>15 minutes</strong>. Si vous n'avez pas fait cette demande, ignorez cet email.
            </td></tr>
          </table>
 
          <!-- Fallback link -->
          <p style="font-size:13px;color:#999;line-height:1.6;margin:0 0 24px;">
            Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :<br/>
            <a href="${resetUrl}" style="color:#3014B8;word-break:break-all;">${resetUrl}</a>
          </p>
 
          <hr style="border:none;border-top:1px solid #eee;margin-bottom:24px;">
          <p style="font-size:13px;color:#999;line-height:1.6;margin:0;">
            Cet email a été envoyé automatiquement par ConcourDoctora. Si vous avez des questions, contactez notre équipe support.
          </p>
        </td></tr>
 
        <!-- Footer -->
        <tr><td style="background:#3014B8;padding:18px 40px;text-align:center;">
          <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.7);">© 2026 ConcourDoctora · Tous droits réservés</p>
        </td></tr>
 
      </table>
    </td></tr>
  </table>
</body>
</html>
  `,
});

export const formationAssignmentTemplate = (
  fullName: string,
  formationName: string,
  role: string,
) => ({
  subject: `ConcoursDoctor — Vous avez été assigné à la formation ${formationName}`,
  html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
    * { font-family: 'Plus Jakarta Sans', 'Google Sans', ui-rounded, -apple-system, Arial, sans-serif !important; }
  </style>
</head>
<body style="margin:0;padding:0;background:#f4f4f8;font-family:'Plus Jakarta Sans','Google Sans',ui-rounded,-apple-system,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:40px 20px;">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;">
 
        <!-- Header -->
        <tr><td style="background:#3014B8;padding:28px 40px;text-align:center;">
          <img src="https://res.cloudinary.com/dsztqioey/image/upload/v1776104664/concour_doctora_logo_lm6aqv.png"
               alt="ConcourDoctora"
               width="200"
               height="38"
               style="display:block;margin:0 auto;" />
        </td></tr>
 
        <!-- Body -->
        <tr><td style="padding:40px;">
          <p style="font-size:15px;color:#444;margin:0 0 8px;">Bonjour <strong style="color:#1a1a1a;">${fullName}</strong>,</p>
          <h1 style="font-size:22px;color:#3014B8;margin:0 0 20px;">Vous avez été assigné à une formation</h1>
          <p style="font-size:15px;color:#444;line-height:1.7;margin:0 0 24px;">
            Nous avons le plaisir de vous informer que vous avez été assigné(e) à la formation
            <strong style="color:#3014B8;">${formationName}</strong> en tant que
            <strong style="color:#3014B8;">${role}</strong> sur la plateforme ConcourDoctora.
          </p>
 
          <!-- Formation details box -->
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f3ff;border-left:4px solid #3014B8;border-radius:0 8px 8px 0;margin-bottom:24px;">
            <tr><td style="padding:20px 24px;">
              <p style="margin:0 0 12px;font-size:13px;font-weight:600;color:#3014B8;text-transform:uppercase;">Détails de l'assignation</p>
              <table width="100%" cellpadding="6">
                <tr>
                  <td style="color:#666;font-size:14px;width:160px;">Formation</td>
                  <td style="color:#1a1a1a;font-weight:500;font-size:14px;">${formationName}</td>
                </tr>
                <tr>
                  <td style="color:#666;font-size:14px;">Rôle assigné</td>
                  <td><span style="background:#ede9ff;color:#3014B8;font-size:13px;font-weight:600;padding:3px 10px;border-radius:4px;">${role}</span></td>
                </tr>
              </table>
            </td></tr>
          </table>
 
          <!-- Info -->
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#e8f4fd;border:1px solid #b3d9f7;border-radius:8px;margin-bottom:28px;">
            <tr><td style="padding:14px 18px;font-size:13px;color:#0a558c;line-height:1.6;">
              ℹ️ Connectez-vous à votre espace pour consulter les détails de cette formation et commencer votre activité.
            </td></tr>
          </table>
 
          <!-- CTA -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
            <tr><td align="center">
              <a href="https://yourwebsite.com/login" style="display:inline-block;background:#3014B8;color:white;text-decoration:none;padding:13px 32px;border-radius:8px;font-size:15px;font-weight:500;">
                Accéder à la formation →
              </a>
            </td></tr>
          </table>
 
          <hr style="border:none;border-top:1px solid #eee;margin-bottom:24px;">
          <p style="font-size:13px;color:#999;line-height:1.6;margin:0;">
            Cet email a été envoyé automatiquement par ConcourDoctora. Si vous avez des questions, contactez notre équipe support.
          </p>
        </td></tr>
 
        <!-- Footer -->
        <tr><td style="background:#3014B8;padding:18px 40px;text-align:center;">
          <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.7);">© 2026 ConcourDoctora · Tous droits réservés</p>
        </td></tr>
 
      </table>
    </td></tr>
  </table>
</body>
</html>
  `,
});

export const surveillantRoomAssignmentTemplate = (
  fullName: string,
  roomName: string,
  building: string,
  floor: string,
  sessionLabel: string,
  examDate: string,
  candidateCount: number,
) => ({
  subject: `ConcoursDoctor — Vous avez été assigné(e) à la salle ${roomName}`,
  html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
    * { font-family: 'Plus Jakarta Sans', 'Google Sans', ui-rounded, -apple-system, Arial, sans-serif !important; }
  </style>
</head>
<body style="margin:0;padding:0;background:#f4f4f8;font-family:'Plus Jakarta Sans','Google Sans',ui-rounded,-apple-system,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:40px 20px;">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;">

        <!-- Header -->
        <tr><td style="background:#3014B8;padding:28px 40px;text-align:center;">
          <img src="https://res.cloudinary.com/dsztqioey/image/upload/v1776104664/concour_doctora_logo_lm6aqv.png"
               alt="ConcourDoctora"
               width="200"
               height="38"
               style="display:block;margin:0 auto;" />
        </td></tr>

        <!-- Body -->
        <tr><td style="padding:40px;">
          <p style="font-size:15px;color:#444;margin:0 0 8px;">Bonjour <strong style="color:#1a1a1a;">${fullName}</strong>,</p>
          <h1 style="font-size:22px;color:#3014B8;margin:0 0 20px;">Vous avez été assigné(e) à une salle d'examen</h1>
          <p style="font-size:15px;color:#444;line-height:1.7;margin:0 0 24px;">
            Nous avons le plaisir de vous informer que vous avez été désigné(e) comme surveillant(e)
            pour la session de concours doctoral <strong style="color:#3014B8;">${sessionLabel}</strong>.
            Veuillez trouver ci-dessous les détails de votre affectation.
          </p>

          <!-- Assignment details box -->
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f3ff;border-left:4px solid #3014B8;border-radius:0 8px 8px 0;margin-bottom:24px;">
            <tr><td style="padding:20px 24px;">
              <p style="margin:0 0 12px;font-size:13px;font-weight:600;color:#3014B8;text-transform:uppercase;">Détails de l'affectation</p>
              <table width="100%" cellpadding="6">
                <tr>
                  <td style="color:#666;font-size:14px;width:160px;">Salle</td>
                  <td style="color:#1a1a1a;font-weight:600;font-size:14px;">${roomName}</td>
                </tr>
                <tr>
                  <td style="color:#666;font-size:14px;">Bâtiment</td>
                  <td style="color:#1a1a1a;font-weight:500;font-size:14px;">${building}</td>
                </tr>
                <tr>
                  <td style="color:#666;font-size:14px;">Étage</td>
                  <td style="color:#1a1a1a;font-weight:500;font-size:14px;">${floor}</td>
                </tr>
                <tr>
                  <td style="color:#666;font-size:14px;">Session</td>
                  <td style="color:#1a1a1a;font-weight:500;font-size:14px;">${sessionLabel}</td>
                </tr>
                <tr>
                  <td style="color:#666;font-size:14px;">Date d'examen</td>
                  <td><span style="background:#ede9ff;color:#3014B8;font-size:13px;font-weight:600;padding:3px 10px;border-radius:4px;">${examDate}</span></td>
                </tr>
                <tr>
                  <td style="color:#666;font-size:14px;">Candidats</td>
                  <td style="color:#1a1a1a;font-weight:500;font-size:14px;">${candidateCount} candidat(s)</td>
                </tr>
              </table>
            </td></tr>
          </table>

          <!-- Warning -->
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;margin-bottom:24px;">
            <tr><td style="padding:14px 18px;font-size:13px;color:#92400e;line-height:1.6;">
              ⚠️ Merci de vous présenter <strong>30 minutes avant</strong> le début de l'examen avec votre carte professionnelle. Signalez-vous auprès du bureau de coordination à votre arrivée.
            </td></tr>
          </table>

          <!-- Info -->
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#e8f4fd;border:1px solid #b3d9f7;border-radius:8px;margin-bottom:28px;">
            <tr><td style="padding:14px 18px;font-size:13px;color:#0a558c;line-height:1.6;">
              ℹ️ Connectez-vous à votre espace pour consulter les détails complets de votre affectation.
            </td></tr>
          </table>

          <!-- CTA -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
            <tr><td align="center">
              <a href="https://quenq.com/nsfw/" style="display:inline-block;background:#3014B8;color:white;text-decoration:none;padding:13px 32px;border-radius:8px;font-size:15px;font-weight:500;">
                Accéder à mon espace →
              </a>
            </td></tr>
          </table>

          <hr style="border:none;border-top:1px solid #eee;margin-bottom:24px;">
          <p style="font-size:13px;color:#999;line-height:1.6;margin:0;">
            Cet email a été envoyé automatiquement par ConcourDoctora. Si vous avez des questions, contactez le coordinateur de la session.
          </p>
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#3014B8;padding:18px 40px;text-align:center;">
          <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.7);">© 2026 ConcourDoctora · Tous droits réservés</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
  `,
});