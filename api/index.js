// api/index.js
// Serverless handler — retorne cartinhas e eventos
import Airtable from "airtable";
import dotenv from "dotenv";
import path from "path";

// tenta carregar variáveis localmente de config/.env.local
dotenv.config({ path: path.resolve("./config/.env.local") });

export default async function handler(req, res) {
  try {
    const apiKey = process.env.AIRTABLE_API_KEY;
    const baseId = process.env.AIRTABLE_BASE_ID;
    const cartinhasTable = process.env.AIRTABLE_CARTINHAS_TABLE || "cartinhas";
    const eventosTable = process.env.AIRTABLE_EVENTOS_TABLE || "eventos";

    if (!apiKey || !baseId) {
      return res.status(500).json({ error: "Variáveis de ambiente Airtable ausentes." });
    }

    const base = new Airtable({ apiKey }).base(baseId);

    // pega cartinhas (apenas status disponivel)
    const cartinhasRecords = await base(cartinhasTable)
      .select({ view: "Grid view", filterByFormula: `{status} = "disponivel"` , pageSize: 40 })
      .all();

    const cartinhas = cartinhasRecords.map(r => {
      const f = r.fields;
      return {
        id: r.id,
        id_cartinha: f.id_cartinha || f.id || "",
        nome_crianca: f.nome_crianca || f.nome || "",
        primeiro_nome: f.primeiro_nome || (f.nome_crianca ? String(f.nome_crianca).split(" ")[0] : ""),
        sexo: f.sexo || "",
        idade: f.idade || "",
        sonho: f.sonho || "",
        escola: f.escola || "",
        cidade: f.cidade || "",
        telefone_contato: f.telefone_contato || "",
        imagem_cartinha: (Array.isArray(f.imagem_cartinha) && f.imagem_cartinha[0] && f.imagem_cartinha[0].url) ? f.imagem_cartinha[0].url : (f.imagem_cartinha || ""),
        status: f.status || ""
      };
    });

    // pega eventos (para carrossel)
    const eventosRecords = await base(eventosTable)
      .select({ view: "Grid view", pageSize: 20 })
      .all();

    const eventos = eventosRecords.map(r => {
      const f = r.fields;
      return {
        id: r.id,
        titulo: f.titulo || "",
        data: f.data || "",
        imagem: (Array.isArray(f.imagem) && f.imagem[0] && f.imagem[0].url) ? f.imagem[0].url : (f.imagem || "")
      };
    });

    return res.status(200).json({ cartinhas, eventos });
  } catch (err) {
    console.error("Erro /api/index:", err);
    return res.status(500).send("A server error occurred while fetching data from Airtable.");
  }
}
