// ============================================================
// ☁️ API — Cloudinho (Airtable cloudinho_kb)
// ============================================================
import Airtable from "airtable";

export default async function handler(req, res) {
  try {
    const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY })
      .base(process.env.AIRTABLE_BASE_ID);

    const registros = await base("cloudinho_kb").select().all();

    const dados = registros.map((r) => ({
      pergunta: r.fields.pergunta || "",
      palavras_chave: r.fields.palavras_chave || [],
      resposta: r.fields.resposta || "",
    }));

    res.status(200).json(dados);
  } catch (erro) {
    console.error("Erro Cloudinho:", erro);
    res.status(500).json({ erro: "Erro ao acessar Airtable" });
  }
}
