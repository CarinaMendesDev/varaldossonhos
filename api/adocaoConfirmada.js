import { enviarConfirmacaoEmail } from "./enviarEmail.js";

await enviarConfirmacaoEmail({
  nomeDoador: "Carina Mendes",
  nomeCrianca: "João Pereira",
  presente: "Bola de Futebol",
  dataEntrega: "2025-12-15",
  codigo: "CART123",
  localColeta: "Ponto Central",
  endereco: "Av. Paulista, 1000 – São Paulo",
  telefone: "(11) 91234-5678",
  pontos: 50,
  nivel: "Sonhador 🌈"
});
