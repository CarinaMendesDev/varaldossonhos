// ============================================================
// 💙 VARAL DOS SONHOS — index.js
// ------------------------------------------------------------
// Página inicial — controla o carrossel dinâmico de eventos
// com destaque_home = true (vitrine de campanhas solidárias).
// ------------------------------------------------------------
// 🔗 API utilizada: /api/eventos  (ou /api/index?rota=eventos)
// ------------------------------------------------------------
// Compatível com Airtable, Vercel e .NET MAUI WebView.
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
  carregarEventos(); // inicia o carregamento assim que a página abre
});

// ============================================================
// 🔁 Carrega os eventos do Airtable (via API)
// ------------------------------------------------------------
// A função busca somente os eventos com destaque_home = TRUE()
// e monta o carrossel visual na área "Momentos que inspiram ✨"
// ============================================================
async function carregarEventos() {
  const track = document.getElementById("carouselTrack"); // trilha de slides
  if (!track) return;

  try {
    // Detecta se estamos em Vercel (produção) ou local (MAUI / localhost)
    const baseURL = window.location.hostname.includes("vercel.app")
      ? "" // ✅ usa o mesmo domínio (Vercel)
      : "https://varaldossonhos-sp.vercel.app"; // fallback para deploy oficial

    // 🔗 Chamada à API de eventos — agora centralizada no /api/index.js
    const resposta = await fetch(`${baseURL}/api/eventos`);
    const eventos = await resposta.json();

    // Limpa o conteúdo antigo
    track.innerHTML = "";

    // Se não houver eventos, mostra imagem padrão
    if (!eventos || eventos.length === 0) {
      adicionarImagemPadrao(track);
      return;
    }

    // ------------------------------------------------------------
    // Cria cada slide com imagem, nome e data
    // ------------------------------------------------------------
    eventos.forEach((ev, i) => {
      // Garantia de fallback para imagem (mantido igual)
      const imagem =
        ev.imagem_evento?.[0]?.url || // campo array no Airtable
        ev.imagem ||                  // campo único (string)
        "imagens/evento-padrao.jpg";  // fallback final local

      const nome = ev.nome || "Evento Solidário";
      const data = ev.data_inicio || "";

      // Cria elemento <li> com a classe ativa no primeiro
      const li = document.createElement("li");
      li.className = `carousel-slide${i === 0 ? " active" : ""}`;
      li.innerHTML = `
        <img src="${imagem}" alt="${nome}" title="${nome} - ${data}" loading="lazy">
      `;
      track.appendChild(li);
    });

    // Inicia o controle automático de slides
    iniciarCarrossel();
  } catch (erro) {
    console.error("❌ Erro ao carregar eventos:", erro);
    adicionarImagemPadrao(track);
  }
}

// ============================================================
// 🌤️ Exibe imagem padrão quando não há eventos disponíveis
// ============================================================
function adicionarImagemPadrao(track) {
  track.innerHTML = `
    <li class="carousel-slide active">
      <img src="imagens/evento-padrao.jpg" alt="Campanha solidária" loading="lazy">
    </li>`;
  iniciarCarrossel();
}

// ============================================================
// 🎞️ Controle do carrossel com fade automático
// ------------------------------------------------------------
// Alterna as imagens a cada 5 segundos e permite navegação
// manual com os botões "Anterior" e "Próximo".
// ------------------------------------------------------------
// 🔧 MELHORIA : uso de clearInterval() para evitar múltiplos
// temporizadores ao alternar páginas no .NET MAUI WebView.
// ============================================================
let intervaloCarrossel; // variável global para controlar o setInterval

function iniciarCarrossel() {
  const track = document.getElementById("carouselTrack");
  const slides = Array.from(track.querySelectorAll(".carousel-slide"));
  const prevBtn = document.getElementById("carouselPrev");
  const nextBtn = document.getElementById("carouselNext");

  let index = 0;
  const total = slides.length;
  if (total === 0) return;

  // 🧼 Garante que não haja múltiplos intervalos ativos (MAUI / Vercel)
  if (intervaloCarrossel) {
    clearInterval(intervaloCarrossel);
  }

  // Ativa o primeiro slide
  slides[index].classList.add("active");

  // ------------------------------------------------------------
  // Funções internas para alternar slides
  // ------------------------------------------------------------
  const mostrarSlide = (novoIndex) => {
    slides.forEach((slide, i) =>
      slide.classList.toggle("active", i === novoIndex)
    );
  };

  const proximoSlide = () => {
    index = (index + 1) % total;
    mostrarSlide(index);
  };

  const slideAnterior = () => {
    index = (index - 1 + total) % total;
    mostrarSlide(index);
  };

  // ------------------------------------------------------------
  // Botões de navegação e rotação automática
  // ------------------------------------------------------------
  nextBtn?.addEventListener("click", proximoSlide);
  prevBtn?.addEventListener("click", slideAnterior);

  // 🔁 Intervalo com controle de reinício (5 segundos)
  intervaloCarrossel = setInterval(proximoSlide, 5000);

  // 💡 Compatível com .NET MAUI:
  // se a página sair de foco, pausa o carrossel automaticamente
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      clearInterval(intervaloCarrossel);
    } else {
      intervaloCarrossel = setInterval(proximoSlide, 5000);
    }
  });
}
