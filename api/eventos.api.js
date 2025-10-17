// ============================================================
// 🌐 VARAL DOS SONHOS — api/eventos.api.js
// Retorna os eventos do Airtable (somente os com destaque_home = true)
// ============================================================

import Airtable from "airtable";
import { ENV } from "../config/env.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    // 🔑 Conecta à base do Airtable usando as variáveis do .env.local
    const base = new Airtable({ apiKey: ENV.AIRTABLE_API_KEY }).base(ENV.AIRTABLE_BASE_ID);

    // 🔍 Busca os registros da tabela "Eventos"
    // Filtra apenas os que possuem destaque_home = true (checkbox marcado)
    const records = await base(ENV.AIRTABLE_TABLES.eventos)
      .select({
        filterByFormula: "({destaque_home} = 1)",
        sort: [{ field: "data_inicio", direction: "asc" }],
      })
      .all();

    // 🔄 Mapeia os campos retornando apenas o que será usado no front-end
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

    // 🧩 Retorna o JSON com os eventos formatados
    res.status(200).json(eventos);
  } catch (erro) {
    console.error("❌ Erro ao buscar eventos:", erro);
    res.status(500).json({ error: "Erro ao buscar eventos" });
  }
}
