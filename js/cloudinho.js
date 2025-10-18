// ============================================================
// ☁️ CLOUDINHO ASSISTENTE — Fantástica Fábrica de Sonhos
// ------------------------------------------------------------
// Interface flutuante + base de conhecimento (Airtable)
// Comunicação via /api/index.js (rotas: GET e POST /api/cloudinho)
// ------------------------------------------------------------
// Compatível com:
// ✅ Airtable (base cloudinho_kb)
// ✅ Vercel (API unificada)
// ✅ .NET MAUI WebView (injetável)
// ✅ EmailJS (botão de contato)
// ============================================================

document.addEventListener("DOMContentLoaded", async () => {
  await carregarRespostasCloudinho(); // carrega base Airtable
  montarInterfaceCloudinho();         // injeta HTML dinâmico
  inicializarCloudinho();             // ativa interação
  mostrarMensagemInicial();           // fala automaticamente
});

// ============================================================
// 🔹 Carrega respostas do Airtable (GET /api/cloudinho)
// ============================================================
async function carregarRespostasCloudinho() {
  try {
    const res = await fetch("/api/cloudinho");
    const dados = await res.json();
    window.cloudinhoKB = dados || [];
  } catch (erro) {
    console.error("❌ Erro ao carregar base de conhecimento:", erro);
    window.cloudinhoKB = [];
  }
}

// ============================================================
// 🧩 Cria o HTML do Cloudinho dinamicamente (usa imagem PNG)
// ============================================================
function montarInterfaceCloudinho() {
  if (document.getElementById("cloudinhoBtn")) return; // evita duplicação

  const container =
    document.getElementById("cloudinho") ||
    document.body.appendChild(document.createElement("div"));

  container.innerHTML = `
    <div id="cloudinhoBtn" class="cloudinho-btn" title="Fale com o Cloudinho ☁️">
      <img src="imagens/cloudinho.png" alt="Cloudinho mascote" class="cloudinho-img" />
    </div>
    <div id="cloudinhoBubble" class="cloudinho-bubble">
      <p id="cloudinhoText">Olá! ☁️ Sou o Cloudinho 💙</p>
      <input id="cloudinhoInput" type="text" placeholder="Digite sua pergunta..." />
      <div class="cloudinho-actions">
        <button id="cloudSend" class="btn-cloud">Enviar</button>
        <button id="cloudAdotar" class="btn-cloud">💌 Adotar</button>
        <button id="cloudContato" class="btn-cloud">📩 Contato</button>
      </div>
    </div>
  `;
}

// ============================================================
// 💬 Inicializa eventos e interação
// ============================================================
function inicializarCloudinho() {
  const bubble = document.getElementById("cloudinhoBubble");
  const button = document.getElementById("cloudinhoBtn");
  const text = document.getElementById("cloudinhoText");
  const input = document.getElementById("cloudinhoInput");
  const btnSend = document.getElementById("cloudSend");
  const btnAdotar = document.getElementById("cloudAdotar");
  const btnContato = document.getElementById("cloudContato");

  if (!button || !bubble) return;

  // 🔄 Mostrar / ocultar balão manualmente
  button.addEventListener("click", () => {
    bubble.classList.toggle("show");
  });

  // 💬 Enviar pergunta
  let debounceTimer;
  const enviarPergunta = async () => {
    const pergunta = input.value.trim();
    if (!pergunta) return;

    text.textContent = "Digitando... ☁️";
    input.value = "";

    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(async () => {
      const resposta = await enviarPerguntaAPI(pergunta);
      text.textContent = resposta || "Hmm... não encontrei nada sobre isso 💭";
    }, 400);
  };

  btnSend.addEventListener("click", enviarPergunta);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") enviarPergunta();
  });

  // 📤 Adotar
  btnAdotar?.addEventListener("click", () => {
    window.location.href = "cartinhas.html";
  });

  // 📞 Contato (via EmailJS ou fallback mailto)
  btnContato?.addEventListener("click", () => {
    if (typeof emailjs !== "undefined") {
      emailjs.send("service_varaldossonhos", "template_contato", {
        to_name: "Equipe Varal dos Sonhos",
        message: "Contato via Cloudinho ☁️",
      });
      text.textContent = "📩 Mensagem enviada! Obrigado 💙";
    } else {
      window.open("mailto:contato@varaldossonhos.org", "_blank");
    }
  });
}

// ============================================================
// 💬 Mostra mensagem inicial e recolhe se não houver interação
// ============================================================
function mostrarMensagemInicial() {
  const bubble = document.getElementById("cloudinhoBubble");
  const text = document.getElementById("cloudinhoText");
  const input = document.getElementById("cloudinhoInput");

  if (!bubble || !text) return;

  // Mostra o balão 1s após carregar
  setTimeout(() => {
    bubble.classList.add("show");
    text.textContent = "Olá! ☁️ Sou o Cloudinho, seu assistente dos sonhos 💙";
  }, 1000);

  // Depois de 3s, complementa
  setTimeout(() => {
    text.textContent += " Quer adotar um sonho hoje?";
  }, 3000);

  // ⏰ Recolhe se não houver interação
  let interagiu = false;
  input?.addEventListener("input", () => (interagiu = true));
  bubble?.addEventListener("click", () => (interagiu = true));

  setTimeout(() => {
    if (!interagiu) bubble.classList.remove("show");
  }, 10000); // 10 segundos
}

// ============================================================
// 🧠 Busca local (cache do Airtable)
// ============================================================
function buscarRespostaLocal(pergunta) {
  if (!window.cloudinhoKB || window.cloudinhoKB.length === 0) return null;
  pergunta = pergunta.toLowerCase();

  for (const item of window.cloudinhoKB) {
    const palavras = (item.palavras_chave || []).map((p) => p.toLowerCase());
    if (palavras.some((p) => pergunta.includes(p))) {
      return item.resposta;
    }
  }
  return null;
}

// ============================================================
// 🌐 Busca via API (fallback remoto + log)
// ============================================================
async function enviarPerguntaAPI(pergunta) {
  const local = buscarRespostaLocal(pergunta);
  const origem = detectarOrigem();

  try {
    const res = await fetch("/api/cloudinho", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mensagem: pergunta, origem }),
    });
    const data = await res.json();

    // 💾 registra log da interação
    registrarInteracao(pergunta, data.resposta, origem);

    return data.resposta;
  } catch {
    return "❌ Erro ao conectar com o servidor.";
  }
}

// ============================================================
// 💾 Registro da interação (para tabela interacoes_log)
// ============================================================
async function registrarInteracao(pergunta, resposta, origem = "Web") {
  try {
    await fetch("/api/interacoes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pergunta,
        resposta,
        origem,
        data: new Date().toISOString(),
      }),
    });
  } catch (e) {
    console.warn("⚠️ Não foi possível registrar interação:", e);
  }
}

// ============================================================
// 📱 Detecta origem do acesso
// ============================================================
function detectarOrigem() {
  if (window?.navigator?.userAgent?.includes("MAUI")) return ".NET MAUI";
  if (/Android|iPhone|iPad/i.test(navigator.userAgent)) return "Mobile";
  return "Web";
}

// ============================================================
// 🌈 Exportações globais (.NET MAUI / Vercel)
// ============================================================
if (typeof window !== "undefined") {
  window.inicializarCloudinho = inicializarCloudinho;
  window.montarInterfaceCloudinho = montarInterfaceCloudinho;
  window.carregarRespostasCloudinho = carregarRespostasCloudinho;
}
