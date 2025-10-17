// ============================================================
// 🌐 VARAL DOS SONHOS — api/evento-detalhe.js
// Retorna um evento específico pelo ID (para página de detalhes)
// ============================================================

import Airtable from "airtable";
import { ENV } from "../config/env.js";

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  if (!id) {
    return res.status(400).json({ error: "ID do evento não informado" });
  }

  try {
    const base = new Airtable({ apiKey: ENV.AIRTABLE_API_KEY }).base(ENV.AIRTABLE_BASE_ID);
    const record = await base(ENV.AIRTABLE_TABLES.eventos).find(id);

    const evento = {
      id: record.id,
      nome: record.fields.nome_evento || "Evento sem nome",
      data_inicio: record.fields.data_inicio || "",
      data_fim: record.fields.data_fim || "",
      descricao: record.fields.descricao || "",
      status: record.fields.status || "",
      responsavel: record.fields.responsavel || "",
      local: record.fields.escola_local || "",
      endereco: record.fields.endereco || "",
      imagem:
        record.fields.imagem_evento && record.fields.imagem_evento.length > 0
          ? record.fields.imagem_evento[0].url
          : "/imagens/evento-padrao.jpg",
    };

    res.status(200).json(evento);
  } catch (erro) {
    console.error("Erro ao buscar evento:", erro);
    res.status(500).json({ error: "Erro ao buscar evento" });
  }
}
