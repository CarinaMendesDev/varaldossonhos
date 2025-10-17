// ============================================================
// 💙 VARAL DOS SONHOS — API: Pontos de Coleta (Airtable -> JSON)
// - Use variáveis de ambiente na Vercel:
//   AIRTABLE_API_KEY, AIRTABLE_BASE_ID
// - Nome da tabela: "pontosdecoleta" (ajuste aqui se seu nome for outro)
// - Compatível com a estrutura mostrada nas suas capturas de tela
// ============================================================

import Airtable from "airtable";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY })
      .base(process.env.AIRTABLE_BASE_ID);

    // 🔁 busca todos os registros da tabela
    const records = await base("pontosdecoleta")
      .select({
        // se quiser, filtre apenas status = "ativo":
        // filterByFormula: "LOWER({status}) = 'ativo'"
      })
      .all();

    // 🔄 normaliza campos esperados pelo front
    const pontos = records.map((r) => ({
      id: r.id,
      id_ponto: r.fields.id_ponto || "",
      nome_local: r.fields.nome_local || "",
      endereco: r.fields.endereco || "",
      telefone: r.fields.telefone || "",
      email: r.fields.email || "",
      horario_funcionamento: r.fields.horario_funcionamento || r.fields["horario_funcionam..."] || "",
      responsavel: r.fields.responsavel || "",
      status: r.fields.status || "",
      data_cadastro: r.fields.data_cadastro || "",
    }));

    return res.status(200).json(pontos);
  } catch (err) {
    console.error("Airtable pontosdecoleta error:", err);
    return res.status(500).json({ error: "Erro ao buscar pontos de coleta" });
  }
}
