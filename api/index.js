// ============================================================
// 💙 VARAL DOS SONHOS — /api/index.js
// API ÚNICA — compatível com plano gratuito da Vercel
// ------------------------------------------------------------
// Rotas internas:
//   • GET  /api/eventos             → destaques (Home/carrossel)
//   • GET  /api/eventos-todos       → todos os eventos
//   • GET  /api/evento-detalhe?id=  → detalhe de um evento
//   • GET  /api/cloudinho           → base de conhecimento (assistente)
//   • POST /api/cloudinho           → respostas automáticas
//   • GET  /api/pontosdecoleta      → locais de coleta
//   • GET  /api/cartinhas           → lista de cartinhas disponíveis
//   • POST /api/cadastro            → novo usuário
//   • POST /api/login               → autenticação
//   • POST /api/adocoes             → registrar adoções (+ e-mail opcional)
// ------------------------------------------------------------
// Airtable: tabelas esperadas:
//   - eventos, cloudinho_kb, pontosdecoleta, cartinhas, usuario, doacoes
// ------------------------------------------------------------
// E-mail opcional (server): /lib/enviarEmail.js + variáveis EMAIL_*
// ============================================================

import Airtable from "airtable";
import { enviarConfirmacaoEmail } from "../lib/enviarEmail.js";

// ============================================================
// 🔑 Conexão com o Airtable
// ============================================================
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;

if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
  console.warn("⚠️ Defina AIRTABLE_API_KEY e AIRTABLE_BASE_ID nas variáveis da Vercel.");
}

const base = new Airtable({ apiKey: AIRTABLE_API_KEY }).base(AIRTABLE_BASE_ID);

// ============================================================
// ⚙️ Helper de resposta JSON
// ============================================================
function json(res, status, data) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(data, null, 2));
}

// ============================================================
// 🌈 Handler principal
// ============================================================
export default async function handler(req, res) {
  try {
    const { method, url } = req;
    const fullUrl = new URL(url, `http://${req.headers.host}`);
    const rota = fullUrl.searchParams.get("rota"); // permite chamadas via /api/index?rota=...

    // ============================================================
    // 🗓️ EVENTOS — carrossel da Home (destaques)
    // ============================================================
    if ((fullUrl.pathname === "/api/eventos" || rota === "eventos") && method === "GET") {
      const records = await base("eventos")
        .select({
          filterByFormula: "({destaque_home} = TRUE())",
          sort: [{ field: "data_inicio", direction: "asc" }],
        })
        .firstPage();

      const eventos = records.map((r) => ({
        id: r.id,
        nome: r.fields.nome_evento || r.fields.nome || "Evento sem nome",
        data_inicio: r.fields.data_inicio || "",
        descricao: r.fields.descricao || "",
        imagem:
          r.fields.imagem_evento?.[0]?.url ||
          r.fields.imagem?.[0]?.url ||
          "/imagens/evento-padrao.jpg",
      }));

      return json(res, 200, eventos);
    }

    // ============================================================
    // 📅 EVENTOS-TODOS — lista completa
    // ============================================================
    if ((fullUrl.pathname === "/api/eventos-todos" || rota === "eventos-todos") && method === "GET") {
      const records = await base("eventos").select().all();
      const eventos = records.map((r) => ({
        id: r.id,
        nome: r.fields.nome_evento || r.fields.nome || "Evento sem nome",
        data_inicio: r.fields.data_inicio || "",
        data_fim: r.fields.data_fim || "",
        descricao: r.fields.descricao || "",
        local: r.fields.local || r.fields.escola_local || "",
        responsavel: r.fields.responsavel || "",
        status: r.fields.status || "",
        imagem:
          r.fields.imagem_evento?.[0]?.url ||
          r.fields.imagem?.[0]?.url ||
          "/imagens/evento-padrao.jpg",
      }));
      return json(res, 200, eventos);
    }

    // ============================================================
    // 📝 EVENTO-DETALHE — detalhe individual
    // ============================================================
    if ((fullUrl.pathname === "/api/evento-detalhe" || rota === "evento-detalhe") && method === "GET") {
      const id = fullUrl.searchParams.get("id");
      if (!id) return json(res, 400, { error: "ID do evento não informado" });

      const r = await base("eventos").find(id);
      const evento = {
        id: r.id,
        nome: r.fields.nome_evento || r.fields.nome || "Evento sem nome",
        data_inicio: r.fields.data_inicio || "",
        data_fim: r.fields.data_fim || "",
        descricao: r.fields.descricao || "",
        local: r.fields.local || "",
        status: r.fields.status || "",
        imagem:
          r.fields.imagem_evento?.[0]?.url ||
          r.fields.imagem?.[0]?.url ||
          "/imagens/evento-padrao.jpg",
      };
      return json(res, 200, evento);
    }

    // ============================================================
    // ☁️ CLOUDINHO (GET) — carrega base de conhecimento
    // ============================================================
    if ((fullUrl.pathname === "/api/cloudinho" || rota === "cloudinho") && method === "GET") {
      const registros = await base("cloudinho_kb").select().all();
      const dados = registros.map((r) => ({
        pergunta: r.fields.pergunta || "",
        palavras_chave: r.fields.palavras_chave || [],
        resposta: r.fields.resposta || "",
      }));
      return json(res, 200, dados);
    }

    // ============================================================
    // ☁️ CLOUDINHO (POST) — busca resposta automática
    // ============================================================
    if ((fullUrl.pathname === "/api/cloudinho" || rota === "cloudinho") && method === "POST") {
      const chunks = [];
      for await (const c of req) chunks.push(c);
      const body = chunks.length ? JSON.parse(Buffer.concat(chunks).toString()) : {};
      const { mensagem } = body;

      const registros = await base("cloudinho_kb")
        .select({
          filterByFormula: `FIND(LOWER("${mensagem || ""}"), LOWER({pergunta}))`,
        })
        .firstPage();

      if (registros.length > 0) {
        return json(res, 200, {
          resposta: registros[0].fields.resposta || "💬 Ainda estou aprendendo sobre isso!",
        });
      }

      return json(res, 200, {
        resposta: "💭 Não encontrei nada sobre isso ainda, mas posso perguntar à equipe!",
      });
    }

    // ============================================================
    // 📍 PONTOS DE COLETA — locais cadastrados
    // ============================================================
    if ((fullUrl.pathname === "/api/pontosdecoleta" || rota === "pontosdecoleta") && method === "GET") {
      const registros = await base("pontosdecoleta").select().all();
      const pontos = registros.map((r) => ({
        id: r.id,
        nome_local: r.fields.nome_local || "",
        endereco: r.fields.endereco || "",
        telefone: r.fields.telefone || "",
        email: r.fields.email || "",
        horario_funcionamento: r.fields.horario_funcionamento || "",
        responsavel: r.fields.responsavel || "",
      }));
      return json(res, 200, pontos);
    }

    // ============================================================
    // 💌 CARTINHAS — status “disponível”
    // ============================================================
    if ((fullUrl.pathname === "/api/cartinhas" || rota === "cartinhas") && method === "GET") {
      const registros = await base("cartinhas")
        .select({ filterByFormula: "IF({status}='disponível', TRUE(), FALSE())" })
        .all();

      const cartinhas = registros.map((r) => {
        const f = r.fields;
        return {
          id: r.id,
          nome: f.nome_crianca || f.primeiro_nome || "Anônimo",
          idade: f.idade || "",
          sonho: f.sonho || "",
          ponto_coleta: f.ponto_coleta || "",
          imagem_cartinha: f.imagem_cartinha?.[0]?.url || "",
          status: f.status || "disponível",
        };
      });
      return json(res, 200, cartinhas);
    }

    // ============================================================
    // 🧍 CADASTRO — cria novo usuário
    // ============================================================
    if ((fullUrl.pathname === "/api/cadastro" || rota === "cadastro") && method === "POST") {
      const chunks = [];
      for await (const c of req) chunks.push(c);
      const body = chunks.length ? JSON.parse(Buffer.concat(chunks).toString()) : {};

      const { nome, email, senha } = body;
      if (!nome || !email || !senha)
        return json(res, 400, { error: "Campos obrigatórios faltando." });

      const existentes = await base("usuario")
        .select({ filterByFormula: `{email} = "${email}"`, maxRecords: 1 })
        .firstPage();

      if (existentes.length > 0)
        return json(res, 409, { error: "E-mail já cadastrado." });

      const novo = await base("usuario").create([
        {
          fields: {
            nome,
            email,
            senha,
            tipo_usuario: "doador",
            status: "ativo",
            data_cadastro: new Date().toISOString().split("T")[0],
          },
        },
      ]);

      return json(res, 200, {
        message: "Usuário cadastrado com sucesso.",
        id: novo[0].id,
      });
    }

    // ============================================================
    // 🔐 LOGIN — autentica usuário
    // ============================================================
    if ((fullUrl.pathname === "/api/login" || rota === "login") && method === "POST") {
      const chunks = [];
      for await (const c of req) chunks.push(c);
      const body = chunks.length ? JSON.parse(Buffer.concat(chunks).toString()) : {};
      const { email, senha } = body;

      if (!email || !senha)
        return json(res, 400, { error: "Email e senha obrigatórios." });

      const registros = await base("usuario")
        .select({ filterByFormula: `{email} = "${email}"`, maxRecords: 1 })
        .firstPage();

      if (registros.length === 0)
        return json(res, 401, { error: "Usuário não encontrado." });

      const usuario = registros[0].fields;
      if (usuario.senha !== senha)
        return json(res, 401, { error: "Senha incorreta." });

      return json(res, 200, {
        success: true,
        usuario: {
          id: registros[0].id,
          nome: usuario.nome,
          email: usuario.email,
          tipo_usuario: usuario.tipo_usuario || "doador",
        },
      });
    }

    // ============================================================
    // 💝 ADOÇÕES — registra novas doações
    // ============================================================
    if ((fullUrl.pathname === "/api/adocoes" || rota === "adocoes") && method === "POST") {
      const chunks = [];
      for await (const c of req) chunks.push(c);
      const body = chunks.length ? JSON.parse(Buffer.concat(chunks).toString()) : {};

      const { usuarioEmail, cartinhas } = body;
      if (!usuarioEmail || !Array.isArray(cartinhas))
        return json(res, 400, { error: "Dados inválidos." });

      for (const c of cartinhas) {
        await base("doacoes").create([
          {
            fields: {
              doador: usuarioEmail,
              cartinha: c.id_cartinha || c.id,
              ponto_coleta: c.ponto_coleta || "",
              data_doacao: new Date().toISOString().split("T")[0],
              status_doacao: "aguardando_entrega",
            },
          },
        ]);
      }

      return json(res, 200, { success: true, message: "Adoções registradas com sucesso!" });
    }

    // ============================================================
    // 🚫 Rota não encontrada
    // ============================================================
    return json(res, 404, { erro: "Rota não encontrada." });
  } catch (erro) {
    console.error("❌ Erro interno:", erro);
    return json(res, 500, { erro: "Erro interno no servidor." });
  }
}
