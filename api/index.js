// ============================================================
// 💙 VARAL DOS SONHOS — /api/index.js
// API ÚNICA — Vercel Free (agrupa todas as rotas principais)
// ------------------------------------------------------------
// 🔹 Contém:
//    - /api/eventos     → carrossel e agenda de eventos
//    - /api/cloudinho   → respostas automáticas do mascote
// ------------------------------------------------------------
// 🔹 Integração: Airtable (tabelas: eventos, cloudinho_kb)
// ============================================================

import Airtable from "airtable";

// ============================================================
// 🔐 Conexão central com o Airtable
// (mantém compatibilidade com conectarAirtable.js, se quiser usar em outros)
// ============================================================
const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY })
  .base(process.env.AIRTABLE_BASE_ID);

// ============================================================
// 🚪 Handler principal (único ponto de entrada da API)
// ============================================================
export default async function handler(req, res) {
  try {
    // ============================================================
    // 🧩 ROTA 1 — /api/eventos
    // Carrega os eventos com destaque_home = true
    // ============================================================
    if (req.url.startsWith("/api/eventos")) {
      const records = await base("eventos")
        .select({
          filterByFormula: "({destaque_home} = TRUE())",
          sort: [{ field: "data_inicio", direction: "asc" }],
        })
        .firstPage();

      const eventos = records.map((r) => ({
        id: r.id,
        nome: r.fields.nome || "Evento sem nome",
        imagem:
          r.fields.imagem?.[0]?.url ||
          "https://via.placeholder.com/600x400?text=Evento",
        data_inicio: r.fields.data_inicio || "",
        descricao: r.fields.descricao || "",
      }));

      return res.status(200).json(eventos);
    }

    // ============================================================
    // ☁️ ROTA 2 — /api/cloudinho
    // Responde a mensagens automáticas do mascote
    // ============================================================
    if (req.url.startsWith("/api/cloudinho")) {
      if (req.method !== "POST") {
        return res.status(405).json({ erro: "Método não permitido." });
      }

      const { mensagem } = req.body;

      // Busca na base "cloudinho_kb" (FAQ/IA básica)
      const records = await base("cloudinho_kb")
        .select({
          filterByFormula: `FIND(LOWER("${mensagem}"), LOWER({pergunta}))`,
        })
        .firstPage();

      if (records.length > 0) {
        return res.status(200).json({
          resposta: records[0].fields.resposta || "💬 Ainda estou aprendendo sobre isso!",
        });
      }

      // Caso não encontre resposta
      return res.status(200).json({
        resposta: "💭 Não encontrei nada sobre isso ainda, mas posso perguntar à equipe!",
      });
    }

    // ============================================================
    // 🚫 Nenhuma rota correspondente
    // ============================================================
    return res.status(404).json({ erro: "Rota não encontrada." });
  } catch (erro) {
    console.error("❌ Erro na API:", erro);
    return res.status(500).json({ erro: "Erro interno no servidor." });
  }
}
