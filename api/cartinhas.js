// /api/cartinhas.js
import Airtable from "airtable";

export default async function handler(req, res) {
  try {
    const apiKey = process.env.AIRTABLE_API_KEY;
    const baseId = process.env.AIRTABLE_BASE_ID;

    if (!apiKey || !baseId) {
      console.error("Variáveis de ambiente AIRTABLE_API_KEY ou AIRTABLE_BASE_ID faltando:", { apiKey, baseId });
      return res.status(500).json({ error: "Configuração do servidor incompleta." });
    }

    const tableName = "cartinhas"; // use exatamente o nome que está no Airtable (case-sensitive)
    const base = new Airtable({ apiKey }).base(baseId);

    // Seleciona apenas as cartinhas com status = 'disponível'
    const registros = await base(tableName)
      .select({ filterByFormula: "IF({status}='disponível', TRUE(), FALSE())" })
      .all();

    const cartinhas = registros.map((r) => {
      const f = r.fields || {};
      return {
        id: r.id,
        primeiro_nome: f["primeiro_nome"] || (f["nome_crianca"] ? String(f["nome_crianca"]).split(" ")[0] : "Anônimo"),
        idade: f["idade"] || "",
        sonho: f["sonho"] || "",
        irmaos: f["irmaos"] || f["tem_irmaos"] || "Não informado",
        imagem_cartinha: Array.isArray(f["imagem_cartinha"]) && f["imagem_cartinha"].length > 0
          ? f["imagem_cartinha"][0].url
          : "",
        ponto_coleta: f["ponto_coleta"] || "",
        sexo: (f["sexo"] || "Menino").toString()
      };
    });

    return res.status(200).json(cartinhas);
  } catch (err) {
    // log detalhado para ver no Vercel logs
    console.error("Erro em /api/cartinhas:", err && err.stack ? err.stack : err);
    // retornamos JSON claro para o frontend (sem HTML)
    return res.status(500).json({ error: "Erro ao buscar cartinhas no Airtable.", detalhe: err?.message || String(err) });
  }
}
