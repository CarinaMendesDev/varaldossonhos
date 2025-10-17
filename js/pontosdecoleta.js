// ============================================================
// 💙 VARAL DOS SONHOS — Pontos de Coleta
// Integração com Airtable + Google Maps Modal
// ============================================================

document.addEventListener("DOMContentLoaded", async () => {
  await carregarPontos();
});

// 🔹 Buscar pontos de coleta do Airtable
async function carregarPontos() {
  try {
    const res = await fetch("/api/pontosdecoleta"); // rota da sua API vercel
    const pontos = await res.json();

    const container = document.getElementById("cardsContainer");
    container.innerHTML = "";

    pontos.forEach(ponto => {
      const card = document.createElement("div");
      card.className = "card-coleta";
      card.innerHTML = `
        <h3>${ponto.nome_local}</h3>
        <p><strong>Endereço:</strong> ${ponto.endereco}</p>
        <p><strong>Telefone:</strong> ${ponto.telefone}</p>
        <p><strong>Horário:</strong> ${ponto.horario_funcionamento}</p>
        <button class="btn-mapa" data-endereco="${encodeURIComponent(ponto.endereco)}">
          Ver no mapa
        </button>
      `;
      container.appendChild(card);
    });

    configurarModal();
  } catch (err) {
    console.error("Erro ao carregar pontos de coleta:", err);
  }
}

// 🗺️ Modal do Google Maps
function configurarModal() {
  const modal = document.getElementById("mapModal");
  const iframe = document.getElementById("mapFrame");
  const closeModal = document.getElementById("closeModal");

  document.querySelectorAll(".btn-mapa").forEach(btn => {
    btn.addEventListener("click", () => {
      const endereco = btn.getAttribute("data-endereco");
      iframe.src = `https://www.google.com/maps?q=${endereco}&output=embed`;
      modal.style.display = "block";
    });
  });

  closeModal.addEventListener("click", () => {
    modal.style.display = "none";
    iframe.src = "";
  });

  window.addEventListener("click", e => {
    if (e.target === modal) {
      modal.style.display = "none";
      iframe.src = "";
    }
  });
}
