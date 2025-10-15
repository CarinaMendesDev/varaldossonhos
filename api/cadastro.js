// /api/cadastro.js
import Airtable from "airtable";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve("./config/.env.local") });

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido." });
  }

  try {
    const apiKey = process.env.AIRTABLE_API_KEY;
    const baseId = process.env.AIRTABLE_BASE_ID;
    const tableName = process.env.AIRTABLE_TABLE_NAME || "usuario";

    if (!apiKey || !baseId) {
      console.error("❌ Variáveis de ambiente ausentes:", { apiKey, baseId });
      return res.status(500).json({ error: "Variáveis de ambiente ausentes." });
    }

    const base = new Airtable({ apiKey }).base(baseId);

    // Campos esperados do front
    const {
      nome,
      cep,
      endereco,               // string composta enviada pelo front (logradouro, numero, complemento, bairro)
      endereco_logradouro,
      endereco_numero,
      endereco_complemento,
      endereco_bairro,
      cidade,
      email,
      telefone,
      tipo_usuario,
      senha
    } = req.body;

    // Validações básicas
    if (!nome || !email || !senha) {
      return res.status(400).json({ error: "Campos obrigatórios faltando." });
    }

    // Verifica email existente
    const existentes = await base(tableName)
      .select({ filterByFormula: `{email} = "${email}"` })
      .firstPage();

    if (existentes.length > 0) {
      return res.status(409).json({ error: "E-mail já cadastrado." });
    }

    const novo = await base(tableName).create([
      {
        fields: {
          id_usuario: `u${Date.now().toString().slice(-6)}`,
          nome,
          cep,
          endereco,
          endereco_logradouro,
          endereco_numero,
          endereco_complemento,
          endereco_bairro,
          cidade: cidade || "",
          email,
          telefone: telefone || "",
          tipo_usuario: tipo_usuario || "doador",
          senha,
          status: "ativo",
          data_cadastro: new Date().toISOString().split("T")[0]
        }
      }
    ]);

    return res.status(200).json({ message: "Usuário cadastrado com sucesso.", id: novo[0].id });
  } catch (err) {
    console.error("Erro no /api/cadastro:", err);
    return res.status(500).json({ error: "Erro ao cadastrar usuário.", detalhe: err.message });
  }
}
