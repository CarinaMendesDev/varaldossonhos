import { enviarEmail, enviarWhatsApp } from "./notificar.js";

(async () => {
  console.log("🔔 Testando notificações...");

  // E-mail
  await enviarEmail(
    "carinamendes2013@gmail.com",
    "💙 Confirmação de Adoção - Varal dos Sonhos",
    "Olá, Carina! ☁️ Sua adoção foi confirmada com sucesso!"
  );

  // WhatsApp
  await enviarWhatsApp(
    "11999999999",
    "💙 Oi! Sua adoção foi confirmada! Obrigado por espalhar sonhos!"
  );
})();
