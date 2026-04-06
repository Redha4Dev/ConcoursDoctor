export const tempPasswordTemplate = (
  fullName: string,
  email: string,
  tempPassword: string,
  role: string,
) => ({
  subject: "ConcoursDoctor — Vos identifiants de connexion",
  html: `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
      <h2 style="color:#1F4E79;">ConcoursDoctor — ESI-SBA</h2>
      <p>Bonjour <strong>${fullName}</strong>,</p>
      <p>Un compte a été créé avec le rôle <strong>${role}</strong>.</p>
      <div style="background:#f4f4f4;padding:16px;border-radius:8px;margin:20px 0;">
        <p style="margin:0"><strong>Email :</strong> ${email}</p>
        <p style="margin:8px 0 0"><strong>Mot de passe temporaire :</strong>
          <span style="font-family:monospace;font-size:16px;color:#1F4E79;">
            ${tempPassword}
          </span>
        </p>
      </div>
      <p style="color:#e74c3c;">
        ⚠️ Changez ce mot de passe lors de votre première connexion.
      </p>
      <p>Connectez-vous : <a href="${process.env.FRONTEND_URL}">${process.env.FRONTEND_URL}</a></p>
      <hr/>
      <p style="color:#999;font-size:12px;">ESI-SBA — ConcoursDoctor</p>
    </div>
  `,
});

export const resetPasswordTemplate = (
  firstName: string,
  lastName: string,
  resetUrl: string,
) => ({
  subject: "ConcoursDoctor — Réinitialisation du mot de passe",
  html: `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
      <h2 style="color:#1F4E79;">ConcoursDoctor — ESI-SBA</h2>
      <p>Bonjour <strong>${lastName} ${firstName}</strong>,</p>
      <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
      <div style="text-align:center;margin:30px 0;">
        <a href="${resetUrl}"
           style="background:#1F4E79;color:white;padding:14px 28px;
                  text-decoration:none;border-radius:6px;font-size:16px;">
          Réinitialiser le mot de passe
        </a>
      </div>
      <p style="color:#999;font-size:13px;">
        Ce lien expire dans <strong>15 minutes</strong>.<br/>
        Si vous n'avez pas fait cette demande, ignorez cet email.
      </p>
      <hr/>
      <p style="color:#999;font-size:12px;">ESI-SBA — ConcoursDoctor</p>
    </div>
  `,
});
