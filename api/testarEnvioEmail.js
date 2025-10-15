// api/testarEnvioEmail.js
import { enviarConfirmacaoEmail } from "./enviarEmail.js";
import dotenv from "dotenv";

// 🔹 Carrega variáveis do .env.local
dotenv.config({ path: "./config/.env.local" });

console.log("📤 Testando envio de e-mail com EmailJS...\n");

// 🔹 Dados de teste simulados
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

console.log("\n✅ Teste concluído!");
