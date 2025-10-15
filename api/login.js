// /api/login.js
import Airtable from "airtable";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve("./config/.env.local") });

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Método não permitido." });
  }

  try {
    const apiKey = process.env.AIRTABLE_API_KEY;
    const baseId = process.env.AIRTABLE_BASE_ID;
    const tableName = process.env.AIRTABLE_TABLE_NAME || "usuario";

    if (!apiKey || !baseId) {
      return res.status(500).json({ message: "Erro interno: variáveis de ambiente ausentes." });
    }

    const { email, senha } = req.body;
    if (!email || !senha) {
      return res.status(400).json({ message: "E-mail e senha são obrigatórios." });
    }

    const base = new Airtable({ apiKey }).base(baseId);

    const registros = await base(tableName)
      .select({ filterByFormula: `{email} = "${email}"` })
      .firstPage();

    if (registros.length === 0) {
      return res.status(404).json({ message: "Usuário não encontrado." });
    }

    const usuario = registros[0].fields;

    if (usuario.senha !== senha) {
      return res.status(401).json({ message: "Senha incorreta." });
    }

    // Retorna campos públicos
    return res.status(200).json({
      message: "Login realizado com sucesso!",
      usuario: {
        id_usuario: usuario.id_usuario,
        nome: usuario.nome,
        email: usuario.email,
        tipo_usuario: usuario.tipo_usuario,
        cidade: usuario.cidade
      }
    });
  } catch (err) {
    console.error("Erro no /api/login:", err);
    return res.status(500).json({ message: "Erro no servidor.", detalhe: err.message });
  }
}
