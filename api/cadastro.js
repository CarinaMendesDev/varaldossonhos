import Airtable from "airtable";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido." });
  }

  try {
    const apiKey = process.env.AIRTABLE_API_KEY;
    const baseId = process.env.AIRTABLE_BASE_ID;

    if (!apiKey || !baseId) {
      console.error("❌ Variáveis de ambiente ausentes:", { apiKey, baseId });
      return res.status(500).json({ error: "Variáveis de ambiente ausentes." });
    }

    console.log("🔑 Conectando ao Airtable com base:", baseId);
    const base = new Airtable({ apiKey }).base(baseId);

    const { nome, email, telefone, cidade, tipo_usuario, senha } = req.body;
    console.log("📨 Dados recebidos:", { nome, email, telefone, cidade, tipo_usuario, senha });

    // 🔍 Verifica se o e-mail já existe
    const existentes = await base("usuario")
      .select({ filterByFormula: `{email} = "${email}"` })
      .firstPage();

    if (existentes.length > 0) {
      console.log("⚠️ E-mail já existente:", email);
      return res.status(409).json({ error: "E-mail já cadastrado." });
    }

    // 🔢 Cria registro
    const novo = await base("usuario").create([
      {
        fields: {
          id_usuario: `u${Date.now().toString().slice(-6)}`,
          nome: nome,
          email: email,
          telefone: telefone || "00000-0000",
          cidade: cidade || "São Paulo",
          tipo_usuario: tipo_usuario,
          senha: senha,
          status: "ativo",
          data_cadastro: new Date().toISOString().split("T")[0],
        },
      },
    ]);

    console.log("✅ Novo usuário criado:", novo[0].id);
    res.status(200).json({ message: "Usuário cadastrado com sucesso!" });
  } catch (erro) {
    console.error("❌ Erro detalhado:", erro);
    res
      .status(500)
      .json({ error: "Erro ao conectar com o Airtable.", detalhe: erro.message });
  }
}
