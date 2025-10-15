// api/conectarAirtable.js
import Airtable from "airtable";
import dotenv from "dotenv";

dotenv.config({ path: "./config/.env.local" });

// 🔗 Conexão principal
const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY })
  .base(process.env.AIRTABLE_BASE_ID);

// 🔍 Função genérica para listar registros de qualquer tabela
export async function listarRegistros(tabela) {
  try {
    const registros = await base(tabela).select({ view: "Grid view" }).firstPage();
    return registros.map((r) => ({
      id: r.id,
      ...r.fields
    }));
  } catch (erro) {
    console.error(`❌ Erro ao listar ${tabela}:`, erro.message);
    return [];
  }
}

// 🧪 Função de teste da conexão
export async function testarConexao() {
  console.log("🌤️ Testando conexão com o Airtable...\n");

  const tabelas = [
    "usuario",        // ✅ corrigido (tudo minúsculo)
    "cartinhas",
    "doacoes",
    "eventos",
    "gamificacao",
    "ia_assistente",
    "newsletter",
    "pontosdecoleta",
  ];

  for (const tabela of tabelas) {
    try {
      const registros = await base(tabela).select({ maxRecords: 1 }).firstPage();
      console.log(`✅ ${tabela}: ${registros.length} registro(s) encontrado(s)`);
    } catch (err) {
      console.log(`⚠️ Tabela ${tabela} não encontrada (sem problema se ainda não criada)`);
    }
  }

  console.log("\n🎯 Teste concluído!");
}

export default base;
