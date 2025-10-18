// api/lib/enviarEmail.js
// ============================================================
// 💌 Simulação de envio de e-mails
// ------------------------------------------------------------
// - Pode ser substituído por integração real com EmailJS,
//   SendGrid, Resend ou SMTP.
// - Já preparado para uso no .NET MAUI (via API HTTP).
// ============================================================

export default async function enviarEmail(destinatario, assunto, mensagem) {
  console.log("📧 Simulando envio de e-mail:");
  console.log("Para:", destinatario);
  console.log("Assunto:", assunto);
  console.log("Mensagem:", mensagem);

  // Futuro: integrar EmailJS aqui
  // await fetch('https://api.emailjs.com/api/v1.0/email/send', {...});

  return {
    status: "ok",
    mensagem: "E-mail simulado com sucesso (modo teste).",
  };
}
