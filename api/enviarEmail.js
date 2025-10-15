// api/enviarEmail.js
import { SMTPClient } from 'emailjs';
import dotenv from 'dotenv';

dotenv.config({ path: './config/.env.local' });

export async function enviarConfirmacaoEmail(dados) {
  const client = new SMTPClient({
    user: process.env.EMAILJS_USER_ID,
    password: process.env.EMAILJS_PUBLIC_KEY,
    host: 'smtp.gmail.com',
    ssl: true,
  });

  const mensagemHTML = `
    <h2>💙 Adoção Confirmada!</h2>
    <p>Olá, <b>${dados.nomeDoador}</b>!</p>
    <p>Sua adoção foi confirmada com sucesso. Veja os detalhes:</p>
    <ul>
      <li><b>Criança:</b> ${dados.nomeCrianca}</li>
      <li><b>Presente Desejado:</b> ${dados.presente}</li>
      <li><b>Entregar até:</b> ${dados.dataEntrega}</li>
      <li><b>Ponto de Coleta:</b> ${dados.localColeta}</li>
      <li><b>Endereço:</b> ${dados.endereco}</li>
      <li><b>Telefone:</b> ${dados.telefone}</li>
    </ul>
    <p><b>Pontuação:</b> ${dados.pontos} pontos — <b>Nível:</b> ${dados.nivel}</p>
    <p>💌 Obrigado por espalhar amor e realizar sonhos!</p>
  `;

  try {
    await client.sendAsync({
      text: 'Confirmação de adoção - Varal dos Sonhos',
      from: 'Varal dos Sonhos <varaldossonhossp@gmail.com>',
      to: dados.email || 'carinamendes2013@gmail.com',
      subject: '💙 Confirmação de Adoção - Varal dos Sonhos',
      attachment: [{ data: mensagemHTML, alternative: true }],
    });

    console.log('✅ E-mail enviado com sucesso!');
    return { success: true };
  } catch (error) {
    console.error('❌ Erro ao enviar e-mail:', error);
    return { success: false, error };
  }
}

// 🔔 WhatsApp
export async function enviarWhatsApp(numero, mensagem) {
  const url = `https://api.whatsapp.com/send?phone=${numero}&text=${encodeURIComponent(mensagem)}`;
  console.log(`📱 Link de WhatsApp: ${url}`);
  return url;
}
