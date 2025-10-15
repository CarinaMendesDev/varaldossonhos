// /api/cartinhas.js
import { conectarAirtable } from "../config/conectarAirtable.js";

export default async function handler(req, res) {
  try {
    const base = await conectarAirtable();
    const tabela = base("cartinhas");

    const registros = await tabela
      .select({
        filterByFormula: "status = 'disponível'"
      })
      .all();

    const cartinhas = registros.map(r => {
      const f = r.fields;
      return {
        id: r.id,
        primeiro_nome: f["primeiro_nome"] || (f["nome_crianca"]?.split(" ")[0] ?? "Anônimo"),
        idade: f["idade"] || "",
        sonho: f["sonho"] || "",
        irmaos: f["tem_irmaos"] || "Não informado",
        imagem_cartinha: f["imagem_cartinha"] ? f["imagem_cartinha"][0].url : "",
        ponto_coleta: f["ponto_coleta"] || "",
        sexo: f["sexo"] || "Menino"
      };
    });

    res.status(200).json(cartinhas);
  } catch (err) {
    console.error("Erro ao buscar cartinhas:", err);
    res.status(500).json({ error: "Erro ao buscar cartinhas" });
  }
}
