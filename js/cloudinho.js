// ============================================================
// ☁️ CLOUDINHO — Widget Profissional Auto-Curativo (2025)
// Integração: Airtable (Tabela cloudinho_kb)
// Funções principais:
//  - Renderiza o Cloudinho no canto da tela
//  - Busca respostas na tabela cloudinho_kb (pergunta / resposta)
//  - Se a base ou a chave estiverem ausentes → responde com fallback
// ============================================================

(() => {
  const ROOT_ID = "cloudinho";
  const IMG_SRC = "imagens/cloudinho.png";
  const ZMAX = 2147483647;

  let inactivityTimer = null;
  let observer = null;

  // ⚙️ Configurações de integração
  const AIRTABLE_BASE = "appyvOQnd9A8YOrMn"; // substitua se mudou no Airtable
  const AIRTABLE_TABLE = "cloudinho_kb";
  const AIRTABLE_KEY = typeof process !== "undefined" && process.env ? process.env.AIRTABLE_API_KEY : "SUA_CHAVE_AQUI";

  // ============================================================
  // 🔹 1. Cria ou restaura o container principal
  // ============================================================
  function ensureRoot() {
    let root = document.getElementById(ROOT_ID);
    if (!root) {
      root = document.createElement("div");
      root.id = ROOT_ID;
      Object.assign(root.style, {
        position: "fixed",
        bottom: "20px",
        right: "20px",
        zIndex: ZMAX,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        gap: "8px",
        opacity: "1",
        transition: "opacity .8s ease"
      });
      document.body.appendChild(root);
    }
    return root;
  }

  // ============================================================
  // 🔹 2. Renderiza o botão e o balão de fala
  // ============================================================
  function render() {
    const root = ensureRoot();

    if (root.querySelector("#cloudinhoBtn") && root.querySelector("#cloudinhoBubble")) return;

    root.innerHTML = `
      <button id="cloudinhoBtn" title="Fale com o Cloudinho" style="background:none;border:none;cursor:pointer;padding:0;">
        <img src="${IMG_SRC}" alt="Cloudinho" class="cloudinho-img">
      </button>
      <div id="cloudinhoBubble" class="cloudinho-bubble hidden">
        <div id="cloudinhoMessage">Oi! Eu sou o Cloudinho ☁️<br>Como posso te ajudar hoje?</div>
        <input type="text" id="cloudinhoInput" placeholder="Pergunte aqui..." style="margin-top:8px;width:100%;padding:6px;border-radius:8px;border:1px solid #ccc;">
      </div>
    `;

    attachBehavior();
    setTimeout(() => showBubble("Olá! 👋 Sou o Cloudinho — posso te ajudar com o Varal dos Sonhos?"), 1200);
  }

  // ============================================================
  // 🔹 3. Controla cliques, envio e comportamento do chat
  // ============================================================
  function attachBehavior() {
    const btn = document.getElementById("cloudinhoBtn");
    const bubble = document.getElementById("cloudinhoBubble");
    const input = document.getElementById("cloudinhoInput");

    if (!btn || !bubble || !input) return;

    const freshBtn = btn.cloneNode(true);
    btn.replaceWith(freshBtn);

    freshBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (bubble.classList.contains("show")) hideBubble();
      else showBubble("Oi! Eu sou o Cloudinho ☁️<br>Como posso te ajudar hoje?");
    });

    input.addEventListener("keypress", async (e) => {
      if (e.key === "Enter") {
        const pergunta = input.value.trim();
        if (!pergunta) return;
        input.value = "";
        showBubble("⏳ Consultando meus arquivos mágicos...");
        const resposta = await buscarResposta(pergunta);
        showBubble(resposta);
      }
    });

    document.addEventListener("click", outsideHandler);
  }

  // ============================================================
  // 🔹 4. Integração com Airtable — busca resposta
  // ============================================================
  async function buscarResposta(pergunta) {
    try {
      const url = `https://api.airtable.com/v0/${AIRTABLE_BASE}/${AIRTABLE_TABLE}?filterByFormula=SEARCH("${pergunta}", {pergunta})`;
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${AIRTABLE_KEY}` }
      });

      if (!response.ok) {
        console.error("Erro na API do Airtable:", response.status);
        return "⚠️ Estou sem conexão com a Fábrica de Sonhos agora. Tente mais tarde!";
      }

      const dados = await response.json();
      if (dados.records && dados.records.length > 0) {
        return dados.records[0].fields.resposta;
      } else {
        return "Não encontrei essa resposta ainda 😅, mas posso pedir ajuda ao Time dos Sonhos!";
      }
    } catch (err) {
      console.error("Falha ao buscar resposta:", err);
      return "❌ Oops! Houve um problema ao acessar a base. Tente novamente em instantes.";
    }
  }

  // ============================================================
  // 🔹 5. Controle do balão e tempo de inatividade
  // ============================================================
  function outsideHandler(e) {
    const root = document.getElementById(ROOT_ID);
    const bubble = document.getElementById("cloudinhoBubble");
    if (root && bubble && !root.contains(e.target)) hideBubble();
  }

  function showBubble(text) {
    const bubble = document.getElementById("cloudinhoBubble");
    const msg = document.getElementById("cloudinhoMessage");
    if (!bubble || !msg) return;
    msg.innerHTML = text;
    bubble.classList.remove("hidden");
    bubble.classList.add("show");
    resetInactivity();
  }

  function hideBubble() {
    const bubble = document.getElementById("cloudinhoBubble");
    if (!bubble) return;
    bubble.classList.remove("show");
    setTimeout(() => bubble.classList.add("hidden"), 350);
    clearTimeout(inactivityTimer);
  }

  function resetInactivity() {
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(hideBubble, 9000);
  }

  // ============================================================
  // 🔹 6. Observador automático (cura DOM)
  // ============================================================
  function startObserver() {
    if (observer) observer.disconnect();
    observer = new MutationObserver(() => {
      const root = document.getElementById(ROOT_ID);
      const hasBtn = root && root.querySelector("#cloudinhoBtn");
      const hasBubble = root && root.querySelector("#cloudinhoBubble");
      if (!root || !hasBtn || !hasBubble) render();
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  // ============================================================
  // 🔹 7. Inicialização
  // ============================================================
  function init() {
    render();
    startObserver();
    let tries = 0;
    const retry = setInterval(() => {
      tries++;
      render();
      if (tries >= 5) clearInterval(retry);
    }, 700);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
