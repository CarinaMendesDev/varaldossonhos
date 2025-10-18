// ============================================================
// ☁️ CLOUDINHO ASSISTENTE — Varal dos Sonhos
// ------------------------------------------------------------
// Integra interface flutuante + base de conhecimento (Airtable)
// Comunicação via /api/index.js (rotas: GET e POST /api/cloudinho)
// ------------------------------------------------------------
// Compatível com:
// ✅ Airtable (base cloudinho_kb)
// ✅ Vercel (API unificada)
// ✅ .NET MAUI WebView (WebView injectável)
// ✅ EmailJS (botão de contato)
// ============================================================

export async function carregarCloudinho() {
  await carregarRespostasCloudinho();
  montarInterfaceCloudinho(); // injeta o HTML dinâmico se ainda não existir
  inicializarCloudinho();
}

// ============================================================
// 🔹 Conecta à tabela cloudinho_kb no Airtable (GET /api/cloudinho)
// ============================================================
async function carregarRespostasCloudinho() {
  try {
    const res = await fetch("/api/cloudinho"); // integrado à /api/index.js
    const dados = await res.json();
    window.cloudinhoKB = dados || [];
  } catch (erro) {
    console.error("❌ Erro ao carregar base de conhecimento:", erro);
    window.cloudinhoKB = [];
  }
}

// ============================================================
// 🧩 Injeta a interface visual do Cloudinho
// ============================================================
function montarInterfaceCloudinho() {
  if (document.getElementById("cloudinhoBtn")) return; // evita duplicação

  const container =
    document.getElementById("cloudinho") ||
    document.body.appendChild(document.createElement("div"));
  container.innerHTML = `
    <div id="cloudinhoBtn" class="cloudinho-btn" title="Fale com o Cloudinho ☁️">☁️</div>
    <div id="cloudinhoBubble" class="cloudinho-bubble hide">
      <p id="cloudinhoText">Olá! Sou o Cloudinho ☁️, posso ajudar?</p>
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
// 💬 Inicializa o Cloudinho interativo
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

  // 🔄 Mostrar / ocultar balão
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

  // 📞 Contato (EmailJS)
  btnContato?.addEventListener("click", () => {
    window.open("mailto:contato@varaldossonhos.org", "_blank");
  });
}

// ============================================================
// 🧠 Busca local (memória carregada via GET cloudinho_kb)
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
// 🌐 Busca via API (fallback remoto)
// ============================================================
async function enviarPerguntaAPI(pergunta) {
  const local = buscarRespostaLocal(pergunta);
  if (local) return local;

  try {
    const res = await fetch("/api/cloudinho", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mensagem: pergunta }),
    });
    const data = await res.json();
    return data.resposta;
  } catch {
    return "❌ Erro ao conectar com o servidor.";
  }
}
