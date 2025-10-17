// ============================================================
// 🌐 VARAL DOS SONHOS — api/eventos-todos.api.js
// Retorna TODOS os eventos do Airtable (ativos e planejados)
// ============================================================

import Airtable from "airtable";
import { ENV } from "../config/env.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    // 🔑 Conexão com a base Airtable
    const base = new Airtable({ apiKey: ENV.AIRTABLE_API_KEY }).base(ENV.AIRTABLE_BASE_ID);

    // 🔍 Busca todos os registros da tabela "eventos"
    const records = await base(ENV.AIRTABLE_TABLES.eventos)
      .select({
        sort: [{ field: "data_inicio", direction: "asc" }],
      })
      .all();

    // 🔄 Mapeia os campos para o formato que o front usa
    const eventos = records.map((rec) => ({
      id: rec.id,
      nome: rec.fields.nome_evento || "Evento sem nome",
      data_inicio: rec.fields.data_inicio || "",
      data_fim: rec.fields.data_fim || "",
      descricao: rec.fields.descricao || "",
      status: rec.fields.status || "",
      responsavel: rec.fields.responsavel || "",
      local: rec.fields.escola_local || "",
      endereco: rec.fields.endereco || "",
      imagem:
        rec.fields.imagem_evento && rec.fields.imagem_evento.length > 0
          ? rec.fields.imagem_evento[0].url
          : "/imagens/evento-padrao.jpg",
    }));

    // 📦 Retorna a lista em JSON
    res.status(200).json(eventos);
  } catch (erro) {
    console.error("❌ Erro ao buscar todos os eventos:", erro);
    res.status(500).json({ error: "Erro ao buscar eventos" });
  }
}
