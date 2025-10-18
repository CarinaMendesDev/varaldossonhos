// ============================================================
// 💙 VARAL DOS SONHOS — /api/index.js
// API ÚNICA — compatível com plano gratuito da Vercel
// ------------------------------------------------------------
// Rotas:
//   • GET  /api/eventos             → destaques (Home/carrossel)
//   • GET  /api/eventos-todos       → todos os eventos
//   • GET  /api/evento-detalhe?id=  → detalhe de um evento
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

// 🔑 Conexão com o Airtable
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;

if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
  console.warn("⚠️ Defina AIRTABLE_API_KEY e AIRTABLE_BASE_ID nas variáveis de ambiente da Vercel.");
}

const base = new Airtable({ apiKey: AIRTABLE_API_KEY }).base(AIRTABLE_BASE_ID);

// Utilitário simples
function json(res, status, data) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(data));
}

export default async function handler(req, res) {
  try {
    const { method, url } = req;
    const fullUrl = new URL(url, `http://${req.headers.host}`);

    // ============================================================
    // 🗓️ /api/eventos — destaques Home (carrossel)
    // ============================================================
    if (fullUrl.pathname === "/api/eventos" && method === "GET") {
      const records = await base("eventos")
        .select({
          filterByFormula: "({destaque_home} = TRUE())",
          sort: [{ field: "data_inicio", direction: "asc" }],
        })
        .firstPage();

      const eventos = records.map((r) => ({
        id: r.id,
        nome: r.fields.nome_evento || r.fields.nome || "Evento sem nome",
        imagem:
          r.fields.imagem_evento?.[0]?.url ||
          r.fields.imagem?.[0]?.url ||
          "/imagens/evento-padrao.jpg",
        data_inicio: r.fields.data_inicio || "",
        descricao: r.fields.descricao || "",
      }));

      return json(res, 200, eventos);
    }

    // ============================================================
    // 📅 /api/eventos-todos — lista completa de eventos
    // ============================================================
    if (fullUrl.pathname === "/api/eventos-todos" && method === "GET") {
      const records = await base("eventos")
        .select({ sort: [{ field: "data_inicio", direction: "asc" }] })
        .all();

      const eventos = records.map((rec) => ({
        id: rec.id,
        nome: rec.fields.nome_evento || rec.fields.nome || "Evento sem nome",
        data_inicio: rec.fields.data_inicio || "",
        data_fim: rec.fields.data_fim || "",
        descricao: rec.fields.descricao || "",
        status: rec.fields.status || "",
        responsavel: rec.fields.responsavel || "",
        local: rec.fields.escola_local || rec.fields.local || "",
        endereco: rec.fields.endereco || "",
        imagem:
          rec.fields.imagem_evento?.[0]?.url ||
          rec.fields.imagem?.[0]?.url ||
          "/imagens/evento-padrao.jpg",
      }));

      return json(res, 200, eventos);
    }

    // ============================================================
    // 📝 /api/evento-detalhe?id=...
    // ============================================================
    if (fullUrl.pathname === "/api/evento-detalhe" && method === "GET") {
      const id = fullUrl.searchParams.get("id");
      if (!id) return json(res, 400, { error: "ID do evento não informado" });

      const record = await base("eventos").find(id);

      const evento = {
        id: record.id,
        nome: record.fields.nome_evento || record.fields.nome || "Evento sem nome",
        data_inicio: record.fields.data_inicio || "",
        data_fim: record.fields.data_fim || "",
        descricao: record.fields.descricao || "",
        status: record.fields.status || "",
        responsavel: record.fields.responsavel || "",
        local: record.fields.escola_local || record.fields.local || "",
        endereco: record.fields.endereco || "",
        imagem:
          record.fields.imagem_evento?.[0]?.url ||
          record.fields.imagem?.[0]?.url ||
          "/imagens/evento-padrao.jpg",
      };

      return json(res, 200, evento);
    }

    // ============================================================
    // ☁️ /api/cloudinho (POST)
    // ============================================================
    if (fullUrl.pathname === "/api/cloudinho" && method === "POST") {
      const chunks = [];
      for await (const c of req) chunks.push(c);
      const body = chunks.length ? JSON.parse(Buffer.concat(chunks).toString()) : {};
      const { mensagem } = body;

      const records = await base("cloudinho_kb")
        .select({
          filterByFormula: `FIND(LOWER("${mensagem || ""}"), LOWER({pergunta}))`,
        })
        .firstPage();

      if (records.length > 0) {
        return json(res, 200, {
          resposta: records[0].fields.resposta || "💬 Ainda estou aprendendo sobre isso!",
        });
      }
      return json(res, 200, {
        resposta: "💭 Não encontrei nada sobre isso ainda, mas posso perguntar à equipe!",
      });
    }

    // ============================================================
    // 📍 /api/pontosdecoleta (GET)
    // ============================================================
    if (fullUrl.pathname === "/api/pontosdecoleta" && method === "GET") {
      const records = await base("pontosdecoleta").select({}).all();

      const pontos = records.map((r) => ({
        id: r.id,
        id_ponto: r.fields.id_ponto || "",
        nome_local: r.fields.nome_local || "",
        endereco: r.fields.endereco || "",
        telefone: r.fields.telefone || "",
        email: r.fields.email || "",
        horario_funcionamento:
          r.fields.horario_funcionamento || r.fields["horario_funcionam..."] || "",
        responsavel: r.fields.responsavel || "",
        status: r.fields.status || "",
        data_cadastro: r.fields.data_cadastro || "",
      }));

      return json(res, 200, pontos);
    }

    // ============================================================
    // 💌 /api/cartinhas (GET) — somente status = 'disponível'
    // ============================================================
    if (fullUrl.pathname === "/api/cartinhas" && method === "GET") {
      const registros = await base("cartinhas")
        .select({ filterByFormula: "IF({status}='disponível', TRUE(), FALSE())" })
        .all();

      const cartinhas = registros.map((r) => {
        const f = r.fields || {};
        return {
          id: r.id,
          primeiro_nome:
            f["primeiro_nome"] ||
            (f["nome_crianca"] ? String(f["nome_crianca"]).split(" ")[0] : "Anônimo"),
          idade: f["idade"] || "",
          sonho: f["sonho"] || "",
          irmaos: f["irmaos"] || f["tem_irmaos"] || "Não informado",
          imagem_cartinha:
            Array.isArray(f["imagem_cartinha"]) && f["imagem_cartinha"].length > 0
              ? f["imagem_cartinha"][0].url
              : "",
          ponto_coleta: f["ponto_coleta"] || "",
          sexo: (f["sexo"] || "Menino").toString(),
        };
      });

      return json(res, 200, cartinhas);
    }

    // ============================================================
    // 🧍 /api/cadastro (POST)
    // ============================================================
    if (fullUrl.pathname === "/api/cadastro" && method === "POST") {
      const chunks = [];
      for await (const c of req) chunks.push(c);
      const body = chunks.length ? JSON.parse(Buffer.concat(chunks).toString()) : {};

      const { nome, cep, endereco, cidade, email, telefone, tipo_usuario, senha } = body;

      if (!nome || !email || !senha) {
        return json(res, 400, { error: "Campos obrigatórios faltando." });
      }

      const existentes = await base("usuario")
        .select({ filterByFormula: `{email} = "${email}"`, maxRecords: 1 })
        .firstPage();

      if (existentes.length > 0) {
        return json(res, 409, { error: "E-mail já cadastrado." });
      }

      const novo = await base("usuario").create([
        {
          fields: {
            id_usuario: `u${Date.now().toString().slice(-6)}`,
            nome,
            cep,
            endereco,
            cidade: cidade || "",
            email,
            telefone: telefone || "",
            tipo_usuario: tipo_usuario || "doador",
            senha, // protótipo (sem hash)
            status: "ativo",
            data_cadastro: new Date().toISOString().split("T")[0],
          },
        },
      ]);

      return json(res, 200, { message: "Usuário cadastrado com sucesso.", id: novo[0].id });
    }

    // ============================================================
    // 🔐 /api/login (POST)
    // ============================================================
    if (fullUrl.pathname === "/api/login" && method === "POST") {
      const chunks = [];
      for await (const c of req) chunks.push(c);
      const body = chunks.length ? JSON.parse(Buffer.concat(chunks).toString()) : {};
      const { email, senha } = body;

      if (!email || !senha) {
        return json(res, 400, { error: "Email e senha são obrigatórios." });
      }

      const registros = await base("usuario")
        .select({ filterByFormula: `{email} = "${email}"`, maxRecords: 1 })
        .firstPage();

      if (registros.length === 0) {
        return json(res, 401, { error: "Usuário não encontrado." });
      }

      const usuario = registros[0].fields;
      if (usuario.senha !== senha) {
        return json(res, 401, { error: "Senha incorreta." });
      }

      const usuarioLogado = {
        id: registros[0].id,
        nome: usuario.nome || "Usuário",
        email: usuario.email,
        tipo_usuario: usuario.tipo_usuario || "doador",
        status: usuario.status || "ativo",
        data_cadastro: usuario.data_cadastro || "",
      };

      return json(res, 200, { success: true, usuario: usuarioLogado });
    }

    // ============================================================
    // 💝 /api/adocoes (POST) — registrar doações (+ e-mail opcional)
    // Payload: { usuarioEmail, cartinhas: [{ id, nome, ponto_coleta, ... }] }
    // ============================================================
    if (fullUrl.pathname === "/api/adocoes" && method === "POST") {
      const chunks = [];
      for await (const c of req) chunks.push(c);
      const body = chunks.length ? JSON.parse(Buffer.concat(chunks).toString()) : {};

      const { usuarioEmail, cartinhas } = body;
      if (!usuarioEmail || !Array.isArray(cartinhas) || cartinhas.length === 0) {
        return json(res, 400, { error: "Dados inválidos." });
      }

      for (const item of cartinhas) {
        try {
          // 1) cria registro na tabela doações
          await base("doacoes").create([
            {
              fields: {
                id_doacao: `d${Date.now().toString().slice(-5)}`,
                doador: usuarioEmail,
                cartinha: item.id_cartinha || item.id,
                ponto_coleta: item.ponto_coleta || "Não informado",
                data_doacao: new Date().toISOString().split("T")[0],
                status_doacao: "aguardando_entrega",
                mensagem_confirmacao: `💙 ${item.nome} foi adotado(a) por ${usuarioEmail}!`,
              },
            },
          ]);

          // 2) atualiza status da cartinha para "adotada"
          const registros = await base("cartinhas")
            .select({ filterByFormula: `{id_cartinha} = "${item.id_cartinha || item.id}"`, maxRecords: 1 })
            .firstPage();

          if (registros.length > 0) {
            await base("cartinhas").update(registros[0].id, { status: "adotada" });
          }
        } catch (e) {
          console.error("Erro ao registrar adoção:", e);
        }
      }

      // 3) Email opcional (lado servidor) — respeitando limites
      const EMAIL_ENABLED = process.env.EMAIL_ENABLED === "true";
      if (EMAIL_ENABLED) {
        try {
          await enviarConfirmacaoEmail({
            email: usuarioEmail,
            nomeDoador: usuarioEmail,
            resumo: `${cartinhas.length} adoção(ões) registrada(s).`,
          });
        } catch (e) {
          console.warn("⚠️ Falha ao enviar e-mail (opcional):", e?.message || e);
        }
      }

      return json(res, 200, { success: true, message: "Adoções registradas com sucesso!" });
    }

    // ============================================================
    // 404 — rota não encontrada
    // ============================================================
    return json(res, 404, { erro: "Rota não encontrada." });
  } catch (erro) {
    console.error("❌ Erro na API:", erro);
    return json(res, 500, { erro: "Erro interno no servidor." });
  }
}
