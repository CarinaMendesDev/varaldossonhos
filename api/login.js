import Airtable from "airtable";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Método não permitido." });
  }

  try {
    const apiKey = process.env.AIRTABLE_API_KEY;
    const baseId = process.env.AIRTABLE_BASE_ID;

    if (!apiKey || !baseId) {
      console.error("❌ Variáveis de ambiente ausentes:", { apiKey, baseId });
      return res.status(500).json({ message: "Erro interno: variáveis de ambiente ausentes." });
    }

    const base = new Airtable({ apiKey }).base(baseId);
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ message: "E-mail e senha são obrigatórios." });
    }

    console.log("🔍 Verificando login para:", email);

    const registros = await base("usuario")
      .select({ filterByFormula: `{email} = "${email}"` })
      .firstPage();

    if (registros.length === 0) {
      return res.status(404).json({ message: "Usuário não encontrado." });
    }

    const usuario = registros[0].fields;

    if (usuario.senha !== senha) {
      return res.status(401).json({ message: "Senha incorreta." });
    }

    console.log("✅ Login bem-sucedido:", usuario.nome);

    res.status(200).json({
      message: "Login realizado com sucesso!",
      usuario: {
        id_usuario: usuario.id_usuario,
        nome: usuario.nome,
        email: usuario.email,
        tipo_usuario: usuario.tipo_usuario,
        cidade: usuario.cidade,
      },
    });
  } catch (erro) {
    console.error("❌ Erro ao processar login:", erro);
    res.status(500).json({ message: "Erro no servidor.", detalhe: erro.message });
  }
}
