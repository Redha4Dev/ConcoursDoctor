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
          <img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzQ5IiBoZWlnaHQ9IjY4IiB2aWV3Qm94PSIwIDAgMzQ5IDY4IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cGF0aCBkPSJNMzQ4LjkwNyA2NS4xOUMzNDguOTA3IDY1LjE5IDM0LjY1MjEgNjYuODA1IDI5LjI3MjEgNjcuMjg1QzAuODIyMTA5IDY5LjgyIC0xMC42Mjc5IDM0LjM1IDEyLjA2MjEgMTguNThMMTIuNTY3MSAxNy4wNUMxMi40OTcxIDE2LjI5NSAxMi4yNTcxIDE2LjIxNSAxMS42OTIxIDE1Ljg4QzkuMTY3MTEgMTQuMzggMy4yNTIxMSAxMy4zNTUgMC44NDIxMTEgMTEuNzNDMC4yNzcxMTEgMTEuMzUgLTAuMzc3ODg2IDEwLjk5IDAuMjY3MTE0IDEwLjI4TDI2LjI3NzEgMEw1Mi4yOTcxIDEwLjI4QzUyLjkzMjEgMTAuOTkgNTIuMjg3MSAxMS4zNTUgNTEuNzE3MSAxMS43M0M0OS45MDIxIDEyLjk0IDQwLjgzNzEgMTUuNDE1IDQwLjI1MjEgMTYuMjY1TDQwLjI2NzEgMTguMzA1QzQxLjUzNzEgMTguNjYgNDYuNzE3MSAyMy4wMDUgNDYuNTA3MSAyMy45ODVDNDQuODAyMSAyNC44NDUgNDEuNzQ3MSAyOC40NCA0MC41MjcxIDI5LjA3QzQwLjA0NzEgMjkuMzE1IDQwLjAxNzEgMjkuMzE1IDM5LjUzNzEgMjkuMDdDMzguMzkyMSAyOC40OCAzNi44NzcxIDI2LjE4NSAzNC44NzIxIDI1LjJDMjQuMzQ3MSAyMC4wMyAxMS4xNzcxIDI1LjkzNSA5LjA5NzExIDM3LjZDNy45MDcxMSA0NC4yOCAxMC44NDIxIDUxLjM4NSAxNS44NTcxIDU1LjE5NUMxNi40MDIxIDU1LjYxIDE5LjE2NzEgNTcuNjU1IDIzLjM2NzEgNTguNEMyNC42NjIxIDU4LjYzIDM0OC45MDcgNTkuNDI1IDM0OC45MDcgNTkuNDI1VjY1LjE5WiIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTE4Ny44ODIgNTIuMDFWMTguNTFIMjAyLjYzMkMyMTYuNjY3IDE4LjUxIDIyMy4xOTcgMzcuNTUgMjEzLjM3NyA0Ny4yNTVDMjExLjUyNyA0OS4wOCAyMDUuNjI3IDUyLjAxIDIwMy4xMzIgNTIuMDFIMTg3Ljg4MlpNMTk1LjM4MiA0NS41MUgyMDIuNjMyQzIwMi45NDcgNDUuNTEgMjA2LjYwNyA0My40NyAyMDcuMTI3IDQzLjAwNUMyMTAuMTA3IDQwLjM0NSAyMTAuODY3IDM0LjMxIDIwOS40MDIgMzAuNzRDMjA3LjExMiAyNS4xNjUgMjAwLjY0NyAyNC43NyAxOTUuMzgyIDI1LjAxVjQ1LjUxWiIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTUyLjg4MTkgMjEuNTA5OUw1NC44MTE5IDIyLjA4NDlMNTUuNDg2OSAyOC40MDk5QzY4LjUwNjkgMzAuNjE0OSA2OC4yMTY5IDUwLjQzOTkgNTUuMDAxOSA1Mi4zNzk5QzM4LjE1MTkgNTQuODU0OSAzNC4wMjY5IDMzLjAwNDkgNDkuMzE2OSAyOC40NDQ5QzQ5LjU2MTkgMjYuNTc0OSA0OS4wNzY5IDI0LjUzNDkgNDkuNzkxOSAyMi43MDk5QzUwLjE0NjkgMjEuODA0OSA1MS4zODE5IDIxLjQzNDkgNTEuMzgxOSAyMS4yNjQ5VjExLjI2NDlMNTIuMTMxOSAxMC41MjQ5TDUyLjg4MTkgMTEuMjY0OVYyMS41MTQ5VjIxLjUwOTlaTTUxLjI0NjkgMzQuMTI0OUM0NS43MTY5IDM1LjI0NDkgNDUuNzQ2OSA0NS42Njk5IDUxLjY3MTkgNDYuNDg5OUM2MC4yMTE5IDQ3LjY2OTkgNjAuMDIxOSAzMi4zNDQ5IDUxLjI0NjkgMzQuMTI0OVoiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0yMzEuNzkyIDI4LjE0NDlDMjM3LjgyMiAyNy43NTQ5IDI0NC4xNTIgMzEuMzkgMjQ0Ljg4MiAzNy43NkMyNDUuOTQ3IDQ3LjA3IDI0MC4xODIgNTMuNDkgMjMwLjY4MiA1Mi40NTVDMjE1Ljk1NyA1MC44NSAyMTYuODIyIDI5LjEwOTkgMjMxLjc5MiAyOC4xNDQ5Wk0yMzEuMjM3IDM0LjExNUMyMjUuNTU3IDM1LjQwNSAyMjUuOTM3IDQ2LjAxNDkgMjMxLjYzMiA0Ni41Mjk5QzI0MC40NjIgNDcuMzI5OSAyMzkuNTE3IDMyLjIzNSAyMzEuMjM3IDM0LjExNVoiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0xMjQuNzYyIDI4LjEzOTlDMTQzLjA5NyAyNS44OTk5IDE0My4zNDcgNTUuNDQ5OSAxMjMuMzU3IDUyLjI4NDlDMTA5LjY2MiA1MC4xMTk5IDExMC4zMjIgMjkuOTA0OSAxMjQuNzYyIDI4LjEzOTlaTTEyOS43MjcgMzUuMTY0OUMxMjMuNzkyIDI5LjY3NDkgMTE3LjA2MiA0MS4xNjk5IDEyMi43NTIgNDUuNTE5OUMxMjkuMTA3IDUwLjM3OTkgMTM0LjQ5NyAzOS41Nzk5IDEyOS43MjcgMzUuMTY0OVoiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0yODcuNTU3IDMxLjY4OTlDMjkzLjU1MiAyNS44OTk5IDMwNS42NzcgMjcuNDE5OSAzMDguNDkyIDM1LjY0OTlDMzEyLjM2NyA0Ni45Nzk5IDMwMS4zOTIgNTYuMTU5OSAyOTAuNzYyIDUxLjM3OTlDMjgzLjQ3MiA0OC4xMDQ5IDI4Mi4wMzIgMzcuMDI0OSAyODcuNTYyIDMxLjY4NDlMMjg3LjU1NyAzMS42ODk5Wk0yOTUuNzUyIDM0LjExNDlDMjg5Ljg0MiAzNS4yNTk5IDI4OS44MTcgNDUuNzA5OSAyOTUuNjc3IDQ2LjQ1OTlDMzA0LjA5MiA0Ny41Mzk5IDMwNC4wODcgMzIuNDk5OSAyOTUuNzUyIDM0LjExNDlaIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNMTQ4Ljg4MiAyOS4wMVY0NC4yNkMxNDguODgyIDQ3LjY1NSAxNTYuMzgyIDQ2LjgyNSAxNTYuMzgyIDQyLjc2VjI5LjAxSDE2My4zODJWNTIuMDFIMTU2LjM4MkwxNTYuMTMyIDQ5LjUxQzE1My42MzcgNTMuMjMgMTQ3LjcxMiA1My41ODUgMTQ0LjM2MiA1MC43NzVDMTQzLjc2NyA1MC4yNzUgMTQxLjg3NyA0Ny43NjUgMTQxLjg3NyA0Ny4yNlYyOS4wMUgxNDguODgyWiIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTg5Ljg4MTggNTIuMDEwMUg4Mi44ODE4VjM2Ljc2MDFDODIuODgxOCAzNS41NzUxIDgwLjQ4NjggMzQuMDg1MSA3OS4yMDY4IDM0LjE2MDFDNzcuOTI2OCAzNC4yMzUxIDc1LjM4MTggMzYuMTcwMSA3NS4zODE4IDM3LjI2MDFWNTIuMDEwMUg2OC4zODE4VjI5LjAxMDFINzUuMzgxOEw3NS4xMzE4IDMxLjUxMDFDNzguNDk2OCAyNy41ODAxIDg1LjI2MTggMjYuNDgwMSA4OC4zMDE4IDMxLjM0NTFDODguNjkxOCAzMS45NzAxIDg5Ljg4MTggMzQuNzYwMSA4OS44ODE4IDM1LjI2NTFWNTIuMDE1MVY1Mi4wMTAxWiIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTM0OC44ODIgNTIuMDEwMUgzNDEuODgyTDM0Mi4xMzcgNTAuMDE1MUMzMzYuMTIyIDU1LjQ5NTEgMzI1Ljk0NyA1MS45NTAxIDMyNy45OTIgNDIuODY1MUMzMjkuMTYyIDM3LjY1NTEgMzM3LjYyNyAzNy4xOTAxIDM0MS44ODcgMzcuNTEwMUMzNDIuMjM3IDMzLjQwMDEgMzM4LjYxMiAzMi45NjAxIDMzNS4zNjcgMzMuNzQ1MUwzMzEuODk3IDM2LjAxMDFMMzI5LjQyNyAzMS4zMzAxQzMzMi44NTIgMjcuNDY1MSAzNDIuODgyIDI2Ljk4MDEgMzQ2LjM5NyAzMC43NTUxQzM0Ni44MDIgMzEuMTkwMSAzNDguMzg3IDM0LjQxMDEgMzQ4LjM4NyAzNC43NjUxVjUxLjI2NTFDMzQ4LjM4NyA1MS40MTUxIDM0OS4wMjIgNTEuNjUwMSAzNDguODg3IDUyLjAxNTFIMzQ4Ljg4MlY1Mi4wMTAxWk0zNDEuMjUyIDQ2LjM4NTFDMzQxLjg2MiA0NS43MzAxIDM0My4xMDIgNDEuODgwMSAzNDEuNjUyIDQxLjY0MDFDMzM5Ljc0MiA0Mi40MDUxIDMzNS4yNDcgNDEuMjgwMSAzMzQuNDYyIDQzLjg2NTFDMzMzLjMxMiA0Ny42NjUxIDMzOS4yODIgNDguNTE1MSAzNDEuMjUyIDQ2LjM4NTFaIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNMjU1LjUzNyA0NC44NTVDMjU4LjYyNyA0OC4xOTUgMjYzLjY5MiA0NS4yMjUgMjY0LjMwMiA0NS41OEwyNjYuODIyIDUwLjQ0NUMyNTcuMDIyIDU2LjExNSAyNDUuMDE3IDQ5Ljk5IDI0Ny4xMDcgMzcuOThDMjQ4LjY2MiAyOS4wMzUgMjYwLjU0NyAyNS4wMjUgMjY3LjMzNyAzMC43NTVMMjYzLjg4NyAzNS4yOTVDMjYwLjc0MiAzMi45NSAyNTUuMTA3IDM0LjI0IDI1NC40MTIgMzguMjg1QzI1NC4xMTIgNDAuMDQ1IDI1NC4yNzIgNDMuNDkgMjU1LjUzNyA0NC44NTVaIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNMjc3LjM4MiAyMi41MUwyNzcuNjAyIDI4LjU0TDI4Mi4zODcgMjkuMDA1VjM0LjUxQzI4MC44OTcgMzMuODg1IDI3OC41OTIgMzMuNDM1IDI3Ny4zODcgMzQuNzU1VjQ1LjI1NUMyNzcuMzg3IDQ2LjU2IDI4MS4zNDcgNDYuOTY1IDI4Mi4zODIgNDYuMDA1TDI4Mi44NjcgNTEuOTg1QzI2OC41NTIgNTUuNDEgMjcwLjE5NyA0NC43OCAyNzAuMzY3IDM0LjUyNUwyNjguMzYyIDM0LjI5TDI2Ny44ODIgMjkuMDA1SDI3MC4zODdWMjIuNTFIMjc3LjM4N0gyNzcuMzgyWiIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTExMy44NzcgMzEuNTAwMUMxMTIuMjcyIDMxLjMxNTEgMTExLjEwNyAzNS40MDUxIDExMC4xNDIgMzUuNDA1MUMxMDQuMjk3IDMxLjU0MDEgOTguNDg3MSAzNi43NjAxIDEwMC45ODcgNDMuMTU1MUMxMDMuMzEyIDQ5LjEwMDEgMTEwLjIwMiA0NS4wODUxIDExMC44MzIgNDUuNTUwMUwxMTMuMzc3IDUwLjUwNTFDMTAyLjgzMiA1NS44NzUxIDkxLjM1NzEgNTAuMDkwMSA5My40OTcxIDM3LjM4MDFDOTQuMzY3MSAzMi4yMTUxIDEwMC43MTIgMjguMTQwMSAxMDUuNjU3IDI3Ljk5NTFDMTA2Ljk4MiAyNy45NTUxIDExNS4xODIgMjkuNjgwMSAxMTMuODcyIDMxLjUwMDFIMTEzLjg3N1oiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0zMTkuMzgyIDI5LjAxTDMxOC44ODIgMzIuNTA1TDMyMi41MjIgMjguOTA1QzMyMy45NTIgMjguNDEgMzI1LjQwNyAyNy43OTUgMzI2LjgxNyAyOC41NzVMMzI2Ljg4MiAzNC41MUMzMjQuNzg3IDM0LjM5NSAzMjIuNjA3IDM0LjM2IDMyMC45MTcgMzUuNzk1QzMyMC42OTIgMzUuOTg1IDMxOS4zNzcgMzcuNjM1IDMxOS4zNzcgMzcuNzU1VjUyLjAwNUgzMTIuMzc3VjI5LjAwNUgzMTkuMzgyVjI5LjAxWiIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTE3NC44ODIgMjkuMDA5OUwxNzQuMzg3IDMyLjUwOTlDMTc2LjA0NyAzMC45ODk5IDE3Ni40NjIgMjkuNTA5OSAxNzguNzYyIDI4LjY0NDlDMTg0LjA2MiAyNi42NDk5IDE4Mi4wMzIgMzAuODU0OSAxODIuMzgyIDM0LjUwOTlDMTgwLjQwMiAzMy44MzQ5IDE3NC44NzcgMzUuMzQ0OSAxNzQuODc3IDM3Ljc1OTlWNTIuMDA5OUgxNjcuODc3VjI5LjAwOTlIMTc0Ljg4MloiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPg==" alt="ConcourDoctora" width="349" height="68" style="display:block;max-width:100%;" />
        </td></tr>
 
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
          <a href="https://yourwebsite.com/login" style="display:inline-block;background:#3014B8;color:white;text-decoration:none;padding:13px 32px;border-radius:8px;font-size:15px;font-weight:500;margin-bottom:32px;">Se connecter →</a>
 
          <hr style="border:none;border-top:1px solid #eee;margin-bottom:24px;">
          <p style="font-size:13px;color:#999;line-height:1.6;margin:0;">
            Cet email a été envoyé automatiquement par ConcourDoctora. Si vous avez des questions, contactez notre équipe support.
          </p>
        </td></tr>
 
        <!-- Footer -->
        <tr><td style="background:#3014B8;padding:18px 40px;text-align:center;">
          <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.7);">© 2024 ConcourDoctora · Tous droits réservés</p>
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
              <a href="https://yourwebsite.com/login" style="display:inline-block;background:#3014B8;color:white;text-decoration:none;padding:13px 32px;border-radius:8px;font-size:15px;font-weight:500;">
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