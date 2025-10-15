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

    const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY })
      .base(process.env.AIRTABLE_BASE_ID);

    // 🔍 Verifica duplicidade
    const existentes = await base("Usuarios")
      .select({ filterByFormula: `{Email} = "${email}"` })
      .firstPage();

    if (existentes.length > 0) {
      return res.status(409).json({ error: "E-mail já cadastrado." });
    }

    // 🔢 Gerar id_usuario automático (u011, u012, etc.)
    const todosUsuarios = await base("Usuarios").select().firstPage();
    const ultimoNumero =
      todosUsuarios.length > 0
        ? Math.max(
            ...todosUsuarios.map((r) =>
              parseInt((r.fields["id_usuario"] || "u000").replace("u", ""))
            )
          )
        : 0;
    const novoId = `u${String(ultimoNumero + 1).padStart(3, "0")}`;

    // 🧱 Cria novo usuário
    await base("Usuarios").create([
      {
        fields: {
          id_usuario: novoId,
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

    res.status(200).json({ message: "Usuário cadastrado com sucesso!" });
  } catch (erro) {
    console.error("Erro ao cadastrar usuário:", erro);
    res.status(500).json({ error: "Erro ao cadastrar usuário." });
  }
}
