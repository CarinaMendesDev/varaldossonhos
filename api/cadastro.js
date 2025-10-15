// ===============================
// 📘 API de Cadastro - Varal dos Sonhos
// ===============================
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
      return res.status(500).json({ error: "Configuração do servidor incorreta." });
    }

    const base = new Airtable({ apiKey }).base(baseId);

    const { nome, email, senha, tipoUsuario, cidade } = req.body;
    console.log("📨 Dados recebidos:", { nome, email, tipoUsuario, cidade });

    if (!nome || !email || !senha || !tipoUsuario) {
      return res.status(400).json({ error: "Campos obrigatórios ausentes." });
    }

    // 🔍 Verifica se o e-mail já existe
    const existentes = await base("Usuarios")
      .select({ filterByFormula: `{Email} = "${email}"` })
      .firstPage();

    if (existentes.length > 0) {
      console.warn("⚠️ E-mail já existente:", email);
      return res.status(409).json({ error: "E-mail já cadastrado." });
    }

    // 🔢 Cria registro
    const novo = await base("Usuarios").create([
      {
        fields: {
          id_usuario: `u${Date.now().toString().slice(-6)}`,
          Nome: nome,
          Email: email,
          Senha: senha,
          tipo_usuario: tipoUsuario,
          cidade: cidade || "São Paulo",
          status: "ativo",
          data_cadastro: new Date().toISOString().split("T")[0],
        },
      },
    ]);

    console.log("✅ Usuário criado com sucesso:", novo[0].id);
    res.status(200).json({ message: "Usuário cadastrado com sucesso!" });
  } catch (erro) {
    console.error("❌ Erro detalhado:", erro);
    res.status(500).json({ error: "Erro ao conectar com o Airtable.", detalhe: erro.message });
  }
}
