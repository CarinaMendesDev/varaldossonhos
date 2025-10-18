// ============================================================
// ☁️ CLOUDINHO ASSISTENTE — Varal dos Sonhos
// Integra interface flutuante + base de conhecimento (Airtable)
// ============================================================

document.addEventListener("DOMContentLoaded", async () => {
  await carregarRespostasCloudinho();
  inicializarCloudinho();
});

// ============================================================
// 🔹 Conecta à tabela cloudinho_kb no Airtable
// ============================================================
async function carregarRespostasCloudinho() {
  try {
    const res = await fetch("/api/cloudinho");
    const dados = await res.json();
    window.cloudinhoKB = dados;
  } catch (erro) {
    console.error("❌ Erro ao carregar base de conhecimento:", erro);
    window.cloudinhoKB = [];
  }
}

// ============================================================
// 💬 Inicializa o Cloudinho interativo
// ============================================================
function inicializarCloudinho() {
  const bubble = document.getElementById("cloudinhoBubble");
  const button = document.getElementById("cloudinhoBtn");
  const text = document.getElementById("cloudinhoText");
  const btnAdotar = document.getElementById("cloudAdotar");
  const btnContato = document.getElementById("cloudContato");

  if (!button || !bubble) return;

  // 🔄 Mostrar/ocultar balão
  button.addEventListener("click", () => {
    bubble.classList.toggle("visivel");
  });

  // 📤 Botão "Quero Adotar"
  btnAdotar.addEventListener("click", () => {
    window.location.href = "cartinhas.html";
  });

  // 📞 Botão "Falar com a equipe"
  btnContato.addEventListener("click", () => {
    window.open("mailto:contato@varaldossonhos.org", "_blank");
  });

  // 🧠 Clique duplo no balão → perguntar
  bubble.addEventListener("dblclick", async () => {
    const pergunta = prompt("Digite sua pergunta para o Cloudinho ☁️");
    if (!pergunta) return;

    text.textContent = "Digitando... ☁️";
    const resposta = buscarResposta(pergunta);
    text.textContent = resposta || "Hmm... não encontrei nada sobre isso 💭";
  });
}

// ============================================================
// 🧠 Busca a resposta por palavras-chave
// ============================================================
function buscarResposta(pergunta) {
  if (!window.cloudinhoKB || window.cloudinhoKB.length === 0) return null;
  pergunta = pergunta.toLowerCase();

  for (const item of window.cloudinhoKB) {
    const palavras = (item.palavras_chave || []).map(p => p.toLowerCase());
    if (palavras.some(p => pergunta.includes(p))) {
      return item.resposta;
    }
  }
  return null;
}
