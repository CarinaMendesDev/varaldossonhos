// /lib/enviarEmail.js
export default async function enviarEmail(dados) {
  console.log("Função enviarEmail chamada com:", dados);
  // Aqui você integrará depois com EmailJS ou outra API
  return { status: "ok", mensagem: "Email simulado com sucesso." };
}
