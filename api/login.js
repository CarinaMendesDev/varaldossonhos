// ============================================================
// 🔐 VARAL DOS SONHOS — api/login.js
// Autenticação simples via Airtable
// ============================================================

import Airtable from "airtable";
import { ENV } from "../config/env.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ error: "Email e senha são obrigatórios." });
    }

    // 🔑 Conexão com o Airtable
    const base = new Airtable({ apiKey: ENV.AIRTABLE_API_KEY }).base(ENV.AIRTABLE_BASE_ID);

    // 🔍 Busca usuário pelo e-mail
    const registros = await base(ENV.AIRTABLE_TABLES.usuarios)
      .select({
        filterByFormula: `{email} = "${email}"`,
        maxRecords: 1
      })
      .firstPage();

    if (registros.length === 0) {
      return res.status(401).json({ error: "Usuário não encontrado." });
    }

    const usuario = registros[0].fields;

    // 🔒 Validação de senha (apenas protótipo)
    if (usuario.senha !== senha) {
      return res.status(401).json({ error: "Senha incorreta." });
    }

    // ✅ Monta objeto com os campos necessários
    const usuarioLogado = {
      id: registros[0].id,
      nome: usuario.nome || "Usuário",
      email: usuario.email,
      tipo: usuario.tipo_usuario || "doador",
      status: usuario.status || "ativo",
      dataCadastro: usuario.data_cadastro
    };

    res.status(200).json({ success: true, usuario: usuarioLogado });

  } catch (erro) {
    console.error("Erro ao autenticar usuário:", erro);
    res.status(500).json({ error: "Erro interno ao autenticar." });
  }
}
