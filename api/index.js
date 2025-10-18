// ============================================================
// 💙 VARAL DOS SONHOS — /api/index.js (CORRIGIDO)
// Arquivo único de API — versão limpa, comentada e pronta para Vercel
// ------------------------------------------------------------
// Rotas suportadas (GET/POST):
//   • GET  /api/eventos
//   • GET  /api/eventos-todos
//   • GET  /api/evento-detalhe?id=
//   • GET  /api/cloudinho
//   • POST /api/cloudinho
//   • GET  /api/pontosdecoleta
//   • GET  /api/cartinhas
//   • POST /api/cadastro
//   • POST /api/login
//   • POST /api/adocoes
// ------------------------------------------------------------
// Observações importantes sobre integrações:
// - Airtable: variáveis AIRTABLE_API_KEY e AIRTABLE_BASE_ID devem estar
//   definidas nas variáveis de ambiente da Vercel.
// - Email (server): há um import para ../lib/enviarEmail.js (opcional).
//   É responsabilidade do servidor enviar e-mails (ex: confirmação de adoção)
//   — para integração com .NET MAUI, o app pode chamar as rotas HTTP deste
//   arquivo para registrar/doações, login, etc.
// - Google Maps / Geocoding: recomenda-se gravar latitude/longitude na tabela
//   pontosdecoleta (colunas lat e lng). Se não houver, exponha a rota para
//   geocodificar (server-side) usando a API do Google e salve as coordenadas.
// - emailjs: normalmente é usado no cliente; para operações sensíveis use
//   envio server-side (enviarConfirmacaoEmail) e apenas acione a partir do
//   endpoint POST /api/adocoes ou /api/cadastro.
// ------------------------------------------------------------

import Airtable from "airtable";
import { enviarConfirmacaoEmail } from "../lib/enviarEmail.js"; // opcional: verifique existência

// ============================================================
// 🔑 Configuração Airtable
// ============================================================
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;

if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
  console.warn("⚠️ Defina AIRTABLE_API_KEY e AIRTABLE_BASE_ID nas variáveis da Vercel.");
}

const base = new Airtable({ apiKey: AIRTABLE_API_KEY }).base(AIRTABLE_BASE_ID);

// ============================================================
// ⚙️ Helper de resposta JSON + CORS
// ============================================================
function sendJson(res, status, data) {
  res.statusCode = status;
  // permitir chamadas do client (ex: localhost durante desenvolvimento)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(data, null, 2));
}

// lê o body de forma robusta e segura
async function parseJsonBody(req) {
  const chunks = [];
  for await (const c of req) chunks.push(c);
  if (!chunks.length) return {};
  try {
    return JSON.parse(Buffer.concat(chunks).toString());
  } catch (err) {
    // body inválido
    return null;
  }
}

// helper: extrai rota via query param ?rota= (compatibilidade com chamadas locais)
function getRotaFromUrl(reqUrl) {
  try {
    const u = new URL(reqUrl, `http://${req.headers.host}`);
    return { fullUrl: u, rota: u.searchParams.get("rota") };
  } catch (err) {
    // fallback simples
    const parts = reqUrl.split("?rota=");
    return { fullUrl: null, rota: parts[1] || null };
  }
}

// ============================================================
// 🌈 Handler principal (APENAS UM export default)
// ============================================================
export default async function handler(req, res) {
  // Preflight CORS
  if (req.method === "OPTIONS") {
    // devolve cabeçalhos CORS e encerra
    res.statusCode = 204;
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
    res.end();
    return;
  }

  const { method, url } = req;
  const { fullUrl, rota } = getRotaFromUrl(url);
  const pathname = fullUrl ? fullUrl.pathname : url.split("?")[0];

  try {
    // ============================================================
    // 🗓️ EVENTOS — destaques (Home/carrossel)
    // GET /api/eventos
    // ============================================================
    if ((pathname === "/api/eventos" || rota === "eventos") && method === "GET") {
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
          r.fields.imagem_evento?.[0]?.url || r.fields.imagem?.[0]?.url || "/imagens/evento-padrao.jpg",
      }));

      return sendJson(res, 200, eventos);
    }

    // ============================================================
    // 📅 EVENTOS-TODOS — lista completa
    // GET /api/eventos-todos
    // ============================================================
    if ((pathname === "/api/eventos-todos" || rota === "eventos-todos") && method === "GET") {
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
          r.fields.imagem_evento?.[0]?.url || r.fields.imagem?.[0]?.url || "/imagens/evento-padrao.jpg",
      }));
      return sendJson(res, 200, eventos);
    }

    // ============================================================
    // 📝 EVENTO-DETALHE — detalhe individual
    // GET /api/evento-detalhe?id=
    // ============================================================
    if ((pathname === "/api/evento-detalhe" || rota === "evento-detalhe") && method === "GET") {
      const id = fullUrl ? fullUrl.searchParams.get("id") : new URL("http://localhost" + url).searchParams.get("id");
      if (!id) return sendJson(res, 400, { error: "ID do evento não informado" });

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
          r.fields.imagem_evento?.[0]?.url || r.fields.imagem?.[0]?.url || "/imagens/evento-padrao.jpg",
      };
      return sendJson(res, 200, evento);
    }

    // ============================================================
    // ☁️ CLOUDINHO (GET) — carrega base de conhecimento
    // GET /api/cloudinho
    // ============================================================
    if ((pathname === "/api/cloudinho" || rota === "cloudinho") && method === "GET") {
      const registros = await base("cloudinho_kb").select().all();
      const dados = registros.map((r) => ({
        pergunta: r.fields.pergunta || "",
        palavras_chave: r.fields.palavras_chave || [],
        resposta: r.fields.resposta || "",
      }));
      return sendJson(res, 200, dados);
    }

    // ============================================================
    // ☁️ CLOUDINHO (POST) — busca resposta automática
    // POST /api/cloudinho { mensagem }
    // ============================================================
    if ((pathname === "/api/cloudinho" || rota === "cloudinho") && method === "POST") {
      const body = await parseJsonBody(req);
      if (body === null) return sendJson(res, 400, { error: "Corpo inválido" });
      const { mensagem } = body || {};

      const registros = await base("cloudinho_kb")
        .select({ filterByFormula: `FIND(LOWER("${mensagem || ""}"), LOWER({pergunta}))` })
        .firstPage();

      if (registros.length > 0) {
        return sendJson(res, 200, { resposta: registros[0].fields.resposta || "💬 Ainda estou aprendendo sobre isso!" });
      }

      return sendJson(res, 200, { resposta: "💭 Não encontrei nada sobre isso ainda, mas posso perguntar à equipe!" });
    }

    // ============================================================
    // 📍 PONTOS DE COLETA — locais cadastrados (inclui lat/lng se existir)
    // GET /api/pontosdecoleta
    // ============================================================
    if ((pathname === "/api/pontosdecoleta" || rota === "pontosdecoleta") && method === "GET") {
      const registros = await base("pontosdecoleta").select().all();
      // normaliza o retorno incluindo latitude/longitude se presentes
      const pontos = registros.map((r) => ({
        id: r.id,
        nome_local: r.fields.nome_local || "",
        endereco: r.fields.endereco || "",
        telefone: r.fields.telefone || "",
        email: r.fields.email || "",
        horario_funcionamento: r.fields.horario_funcionamento || "",
        responsavel: r.fields.responsavel || "",
        // campos opcionais: lat e lng podem vir como number ou texto
        lat: r.fields.lat || r.fields.latitude || null,
        lng: r.fields.lng || r.fields.longitude || null,
      }));
      return sendJson(res, 200, pontos);
    }

    // ============================================================
    // 💌 CARTINHAS — status “disponível”
    // GET /api/cartinhas
    // ============================================================
    if ((pathname === "/api/cartinhas" || rota === "cartinhas") && method === "GET") {
      const registros = await base("cartinhas").select({ filterByFormula: "IF({status}='disponível', TRUE(), FALSE())" }).all();
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
      return sendJson(res, 200, cartinhas);
    }

    // ============================================================
    // 🧍 CADASTRO — cria novo usuário
    // POST /api/cadastro { nome, email, senha }
    // ============================================================
    if ((pathname === "/api/cadastro" || rota === "cadastro") && method === "POST") {
      const body = await parseJsonBody(req);
      if (body === null) return sendJson(res, 400, { error: "Corpo inválido" });
      const { nome, email, senha } = body;
      if (!nome || !email || !senha) return sendJson(res, 400, { error: "Campos obrigatórios faltando." });

      const existentes = await base("usuario").select({ filterByFormula: `{email} = "${email}"`, maxRecords: 1 }).firstPage();
      if (existentes.length > 0) return sendJson(res, 409, { error: "E-mail já cadastrado." });

      const novo = await base("usuario").create([ { fields: { nome, email, senha, tipo_usuario: "doador", status: "ativo", data_cadastro: new Date().toISOString().split("T")[0] } } ]);

      // opcional: enviar e-mail de boas-vindas (se lib estiver configurada)
      try {
        if (typeof enviarConfirmacaoEmail === "function") {
          // enviarConfirmacaoEmail pode esperar (email, assunto, texto)
          await enviarConfirmacaoEmail(email, "Obrigado pelo cadastro", `Olá ${nome}, bem-vindo!`);
        }
      } catch (err) {
        console.warn("Falha ao enviar e-mail de confirmação:", err.message || err);
      }

      return sendJson(res, 200, { message: "Usuário cadastrado com sucesso.", id: novo[0].id });
    }

    // ============================================================
    // 🔐 LOGIN — autentica usuário
    // POST /api/login { email, senha }
    // ============================================================
    if ((pathname === "/api/login" || rota === "login") && method === "POST") {
      const body = await parseJsonBody(req);
      if (body === null) return sendJson(res, 400, { error: "Corpo inválido" });
      const { email, senha } = body;
      if (!email || !senha) return sendJson(res, 400, { error: "Email e senha obrigatórios." });

      const registros = await base("usuario").select({ filterByFormula: `{email} = "${email}"`, maxRecords: 1 }).firstPage();
      if (registros.length === 0) return sendJson(res, 401, { error: "Usuário não encontrado." });

      const usuario = registros[0].fields;
      if (usuario.senha !== senha) return sendJson(res, 401, { error: "Senha incorreta." });

      return sendJson(res, 200, { success: true, usuario: { id: registros[0].id, nome: usuario.nome, email: usuario.email, tipo_usuario: usuario.tipo_usuario || "doador" } });
    }

    // ============================================================
    // 💝 ADOÇÕES — registra novas doações e opcionalmente envia e-mail
    // POST /api/adocoes { usuarioEmail, cartinhas }
    // ============================================================
    if ((pathname === "/api/adocoes" || rota === "adocoes") && method === "POST") {
      const body = await parseJsonBody(req);
      if (body === null) return sendJson(res, 400, { error: "Corpo inválido" });
      const { usuarioEmail, cartinhas } = body;
      if (!usuarioEmail || !Array.isArray(cartinhas)) return sendJson(res, 400, { error: "Dados inválidos." });

      for (const c of cartinhas) {
        await base("doacoes").create([ { fields: {
          doador: usuarioEmail,
          cartinha: c.id_cartinha || c.id || "",
          ponto_coleta: c.ponto_coleta || "",
          data_doacao: new Date().toISOString().split("T")[0],
          status_doacao: "aguardando_entrega",
        } } ]);
      }

      // tentar enviar e-mail de confirmação via lib server-side (se disponível)
      try {
        if (typeof enviarConfirmacaoEmail === "function") {
          await enviarConfirmacaoEmail(usuarioEmail, "Confirmação de Adoção", `Recebemos sua adoção de ${cartinhas.length} cartinha(s). Obrigado!`);
        }
      } catch (err) {
        console.warn("Falha ao enviar e-mail de confirmação:", err.message || err);
      }

      return sendJson(res, 200, { success: true, message: "Adoções registradas com sucesso!" });
    }

    // ============================================================
    // 🚫 Rota não encontrada
    // ============================================================
    return sendJson(res, 404, { erro: "Rota não encontrada." });
  } catch (erro) {
    console.error("❌ Erro interno:", erro);
    return sendJson(res, 500, { erro: "Erro interno no servidor.", detalhe: erro.message || String(erro) });
  }
}
