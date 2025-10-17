import Airtable from "airtable";

export default async function handler(req, res) {
  try {
    const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY })
      .base(process.env.AIRTABLE_BASE_ID);

    const records = await base("pontodecoleta").select().all();

    const pontos = records.map(r => ({
      id: r.id,
      nome_local: r.fields.nome_local,
      endereco: r.fields.endereco,
      telefone: r.fields.telefone,
      horario_funcionamento: r.fields.horario_funcionamento,
      responsavel: r.fields.responsavel,
      email: r.fields.email,
    }));

    res.status(200).json(pontos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar pontos de coleta" });
  }
}
