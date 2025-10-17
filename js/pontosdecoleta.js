// ============================================================
// 💙 VARAL DOS SONHOS — Pontos de Coleta (Front-end)
// - Busca dados via /api/pontosdecoleta (Airtable)
// - Monta os cards ("varal")
// - Abre Google Maps em modal
// - Compatível com Vercel (rota sem .js) e com WebView do .NET MAUI
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
  carregarPontos();
  configurarModal();
  configurarCloudinhoAtalho();
});

// 🔁 Busca os pontos no backend (Airtable)
async function carregarPontos() {
  const container = document.getElementById("cardsContainer");
  try {
    const res = await fetch("/api/pontosdecoleta"); // 🔗 Vercel resolve sem a extensão .js
    if (!res.ok) throw new Error("Falha ao buscar pontos");
    const pontos = await res.json();

    if (!Array.isArray(pontos) || pontos.length === 0) {
      container.innerHTML = `<div class="placeholder">Nenhum ponto de coleta disponível no momento.</div>`;
      return;
    }

    container.innerHTML = ""; // limpa o placeholder

    pontos.forEach((p) => {
      // alguns campos comuns na sua base: nome_local, endereco, telefone, horario_funcionamento
      const card = document.createElement("article");
      card.className = "card-coleta";
      card.innerHTML = `
        <h3>${safe(p.nome_local)}</h3>
        <p><strong>Endereço:</strong> ${safe(p.endereco)}</p>
        ${p.telefone ? `<p><strong>Telefone:</strong> ${safe(p.telefone)}</p>` : ""}
        ${p.horario_funcionamento ? `<p><strong>Horário:</strong> ${safe(p.horario_funcionamento)}</p>` : ""}
        <button class="btn-mapa" data-end="${encodeURIComponent(p.endereco || "")}">
          Ver no mapa
        </button>
      `;
      container.appendChild(card);
    });

    // liga eventos do botão "Ver no mapa"
    document.querySelectorAll(".btn-mapa").forEach((btn) => {
      btn.addEventListener("click", () => {
        const end = btn.getAttribute("data-end");
        abrirMapa(end);
      });
    });

  } catch (e) {
    console.error(e);
    container.innerHTML = `<div class="placeholder">❌ Erro ao carregar pontos. Tente novamente mais tarde.</div>`;
  }
}

// 🔒 pequena sanitarização para prevenir layout quebrado
function safe(v) {
  return String(v ?? "").replace(/[<>&"]/g, (m) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" }[m]));
}

// 🗺️ Modal do Google Maps
function configurarModal() {
  const modal = document.getElementById("mapModal");
  const frame = document.getElementById("mapFrame");
  const close = document.getElementById("closeModal");

  close.addEventListener("click", () => fecharModal());
  window.addEventListener("click", (ev) => {
    if (ev.target === modal) fecharModal();
  });

  function fecharModal() {
    modal.style.display = "none";
    frame.src = "";
    modal.setAttribute("aria-hidden", "true");
  }

  // deixa acessível para abrir
  window.abrirMapa = (end) => {
    // embed sem necessidade de API key (para endereço textual)
    frame.src = `https://www.google.com/maps?q=${end}&output=embed`;
    modal.style.display = "block";
    modal.setAttribute("aria-hidden", "false");
  };
}

// ☁️ Atalho no Cloudinho para focar na lista
function configurarCloudinhoAtalho() {
  const btn = document.getElementById("cloudVerPontos");
  if (!btn) return;
  btn.addEventListener("click", () => {
    document.getElementById("cardsContainer")?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
}
