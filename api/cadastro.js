// api/cadastro.js
import Airtable from "airtable";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    const { nome, email, senha, tipoUsuario, cidade } = req.body;

    if (!nome || !email || !senha || !tipoUsuario) {
      return res.status(400).json({ error: "Todos os campos são obrigatórios." });
    }

    // 🔑 Conecta com o Airtable usando variáveis do ambiente da Vercel
    const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY })
      .base(process.env.AIRTABLE_BASE_ID);

    // 🔍 Verifica se já existe e-mail cadastrado
    const existentes = await base("Usuarios")
      .select({ filterByFormula: `{Email} = "${email}"` })
      .firstPage();

    if (existentes.length > 0) {
      return res.status(409).json({ error: "E-mail já cadastrado." });
    }

    // 🧱 Cria novo registro no Airtable
    await base("Usuarios").create([
      {
        fields: {
          Nome: nome,
          Email: email,
          Senha: senha,
          Tipo: tipoUsuario,
          Cidade: cidade || "São Paulo",
          DataCadastro: new Date().toISOString().split("T")[0],
          Status: "ativo",
        },
      },
    ]);

    res.status(200).json({ message: "Usuário cadastrado com sucesso!" });
  } catch (erro) {
    console.error("❌ Erro ao cadastrar:", erro);
    res.status(500).json({ error: "Erro ao conectar com o Airtable." });
  }
}
