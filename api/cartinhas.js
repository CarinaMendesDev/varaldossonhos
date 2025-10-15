// api/cartinhas.js
import Airtable from "airtable";

export default async function handler(req, res) {
  // Permitir apenas requisições GET
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    // Conexão com o Airtable
    const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY })
      .base(process.env.AIRTABLE_BASE_ID);

    // Busca na tabela "Cartinhas"
    const records = await base("Cartinhas")
      .select({
        fields: [
          "NomeCrianca",
          "Idade",
          "Sonho",
          "TemIrmaos",
          "IdadeIrmaos",
          "FotoCartinha",
          "Status",
          "Cidade",
          "Escola"
        ],
        filterByFormula: "{Status} = 'Disponível'"
      })
      .all();

    // Formatar a resposta
    const cartinhas = records.map(record => ({
      id: record.id,
      nome: record.fields.NomeCrianca,
      idade: record.fields.Idade,
      sonho: record.fields.Sonho,
      temIrmaos: record.fields.TemIrmaos,
      idadeIrmaos: record.fields.IdadeIrmaos,
      foto: record.fields.FotoCartinha?.[0]?.url || null,
      cidade: record.fields.Cidade,
      escola: record.fields.Escola,
      status: record.fields.Status
    }));

    // Retorna em JSON
    return res.status(200).json({ sucesso: true, dados: cartinhas });
  } catch (erro) {
    console.error("Erro ao buscar cartinhas:", erro);
    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro interno ao buscar cartinhas."
    });
  }
}
