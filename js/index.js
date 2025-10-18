// ============================================================
// 💙 VARAL DOS SONHOS — index.js
// Home: Carrossel dinâmico de eventos com destaque_home = true
// Compatível com Vercel, Airtable API, e .NET MAUI WebView
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
  carregarEventos();
});

// ============================================================
// 🔁 Função: Carrega os eventos do Airtable (via /api/eventos)
// ============================================================
async function carregarEventos() {
  const track = document.getElementById("carouselTrack");
  if (!track) return;

  try {
    const res = await fetch("/api/eventos");
    const eventos = await res.json();

    track.innerHTML = "";

    // ⚠️ Se não houver eventos, mostra imagem padrão
    if (!eventos || eventos.length === 0) {
      adicionarImagemPadrao(track);
      return;
    }

    // Cria slides com fade
    eventos.forEach((ev, i) => {
      const li = document.createElement("li");
      li.className = `carousel-slide${i === 0 ? " active" : ""}`;
      li.innerHTML = `
        <img src="${ev.imagem}" alt="${ev.nome}" 
             title="${ev.nome} - ${ev.data_inicio || ""}" loading="lazy">
      `;
      track.appendChild(li);
    });

    iniciarCarrossel();
  } catch (erro) {
    console.error("❌ Erro ao carregar eventos:", erro);
    // Exibe fallback se houver erro de rede ou JSON inválido
    adicionarImagemPadrao(track);
  }
}

// ============================================================
// 🌤️ Fallback visual (quando não há eventos)
// ============================================================
function adicionarImagemPadrao(track) {
  track.innerHTML = `
    <li class="carousel-slide active">
      <img src="imagens/evento-padrao.jpg" alt="Campanha solidária" loading="lazy">
    </li>`;
  iniciarCarrossel(); // mantém o fade ativo
}

// ============================================================
// 🎞️ Função: Controla o carrossel com efeito fade
// ============================================================
function iniciarCarrossel() {
  const track = document.getElementById("carouselTrack");
  const slides = Array.from(track.querySelectorAll(".carousel-slide"));
  const prevBtn = document.getElementById("carouselPrev");
  const nextBtn = document.getElementById("carouselNext");

  let index = 0;
  const total = slides.length;

  if (total === 0) return;

  // Exibe o primeiro slide
  slides[index].classList.add("active");

  const mostrarSlide = (novoIndex) => {
    slides.forEach((slide, i) => {
      slide.classList.toggle("active", i === novoIndex);
    });
  };

  const proximoSlide = () => {
    index = (index + 1) % total;
    mostrarSlide(index);
  };

  const slideAnterior = () => {
    index = (index - 1 + total) % total;
    mostrarSlide(index);
  };

  // Botões de navegação
  nextBtn?.addEventListener("click", proximoSlide);
  prevBtn?.addEventListener("click", slideAnterior);

  // Autoplay a cada 5 segundos
  setInterval(proximoSlide, 5000);
}
