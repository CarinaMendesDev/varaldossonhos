// ============================================================
// ☁️ VARAL DOS SONHOS — api/cloudinho.api.js
// Integra o mascote Cloudinho com a base de conhecimento do Airtable
// ============================================================

import Airtable from "airtable";
import { ENV } from "../config/env.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    const { pergunta } = req.body;

    if (!pergunta || pergunta.trim() === "") {
      return res.status(400).json({ error: "Pergunta inválida." });
    }

    // 🔑 Conexão com o Airtable
    const base = new Airtable({ apiKey: ENV.AIRTABLE_API_KEY }).base(ENV.AIRTABLE_BASE_ID);

    // 🔍 Busca registros na tabela cloudinho_kb
    const records = await base("cloudinho_kb").select().all();

    // Normaliza texto
    const perguntaMin = pergunta.toLowerCase();

    // 🔎 Tenta encontrar resposta com base nas palavras-chave
    let respostaEncontrada = null;
    for (const rec of records) {
      const palavras = (rec.fields.palavras_chave || []).map(p => p.toLowerCase());
      if (palavras.some(p => perguntaMin.includes(p))) {
        respostaEncontrada = rec.fields.resposta;
        break;
      }
    }

    // 🔄 Caso não encontre correspondência direta
    if (!respostaEncontrada) {
      respostaEncontrada = "Desculpe, eu ainda não sei responder isso 😅. Pergunte algo sobre a Fantástica Fábrica de Sonhos 💙";
    }

    res.status(200).json({ resposta: respostaEncontrada });

  } catch (erro) {
    console.error("Erro no assistente Cloudinho:", erro);
    res.status(500).json({ error: "Erro ao buscar resposta no Cloudinho." });
  }
}
