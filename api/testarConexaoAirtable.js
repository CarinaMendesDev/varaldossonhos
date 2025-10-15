// api/testarConexaoAirtable.js
import Airtable from "airtable";
import { ENV } from "../config/env.js";

// Inicializa o Airtable com sua chave e base
const base = new Airtable({ apiKey: ENV.AIRTABLE_API_KEY }).base(ENV.AIRTABLE_BASE_ID);

// Lista das tabelas que queremos testar
const tabelas = [
  "Usuarios",
  "Administradores",
  "Doadores",
  "Voluntarios",
  "Cartinhas",
  "Doacoes",
  "PontosDeColeta",
  "Eventos",
  "Gamificacao",
  "Newsletter"
];

async function testarConexao() {
  console.log("🔍 Testando conexão com o Airtable...\n");

  for (const tabela of tabelas) {
    try {
      const registros = await base(tabela).select({ maxRecords: 1 }).firstPage();
      if (registros.length > 0) {
        console.log(`✅ Conectado com sucesso à tabela: ${tabela} (${registros.length} registro encontrado)`);
      } else {
        console.log(`⚠️ Conectado à tabela: ${tabela}, mas ela está vazia.`);
      }
    } catch (erro) {
      console.error(`❌ Erro ao conectar à tabela: ${tabela}`);
      console.error("Detalhes:", erro.message);
    }
  }

  console.log("\n🧠 Teste concluído!");
}

// Executa o teste
testarConexao();
