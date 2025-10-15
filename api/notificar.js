import fetch from "node-fetch";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Garantir que dotenv carregue o arquivo .env.local corretamente
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../config/.env.local") });

/* =====================================
   📧 Envio de E-mail com EmailJS
   ===================================== */
export async function enviarEmail(destinatario, assunto, mensagem) {
  try {
    const EMAIL_API = "https://api.emailjs.com/api/v1.0/email/send";

    const body = {
      service_id: process.env.EMAILJS_SERVICE_ID,
      template_id: process.env.EMAILJS_TEMPLATE_ID,
      user_id: process.env.EMAILJS_PUBLIC_KEY, // ✅ EmailJS ainda espera este campo como user_id
      template_params: {
        to_email: destinatario,
        subject: assunto,
        message: mensagem,
      },
    };

    console.log("🔑 Dados carregados:", {
      service_id: body.service_id,
      template_id: body.template_id,
      user_id: body.user_id ? "OK" : "❌ vazio",
    });

    const resposta = await fetch(EMAIL_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const resultado = await resposta.text();

    if (!resposta.ok) {
      throw new Error(`Erro HTTP ${resposta.status}: ${resultado}`);
    }

    console.log("✅ E-mail enviado com sucesso para:", destinatario);
    console.log("🧾 Retorno do EmailJS:", resultado);
  } catch (erro) {
    console.error("❌ Erro ao enviar e-mail:", erro.message);
  }
}

/* =====================================
   💬 Envio de WhatsApp (link público)
   ===================================== */
export async function enviarWhatsApp(telefone, mensagem) {
  try {
    const numeroLimpo = telefone.replace(/\D/g, "");
    const link = `https://api.whatsapp.com/send?phone=55${numeroLimpo}&text=${encodeURIComponent(
      mensagem
    )}`;

    console.log("📱 Link gerado:", link);

    if (typeof window !== "undefined") {
      window.open(link, "_blank");
    }

    return link;
  } catch (erro) {
    console.error("❌ Erro ao gerar link do WhatsApp:", erro.message);
  }
}
