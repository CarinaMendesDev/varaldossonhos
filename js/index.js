// ============================================================
// 💙 VARAL DOS SONHOS — index.js
// Home: Carrossel dinâmico de eventos com destaque_home = true
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
  carregarEventos();
});

// ============================================================
// 🔁 Função: Carrega os eventos do Airtable
// ============================================================
async function carregarEventos() {
  try {
    const track = document.getElementById("carouselTrack");
    const res = await fetch("/api/eventos");
    const eventos = await res.json();

    track.innerHTML = "";

    // Garante que há eventos válidos
    if (!eventos || eventos.length === 0) {
      track.innerHTML = `<li class="carousel-slide active"><img src="imagens/evento-padrao.jpg" alt="Nenhum evento disponível"></li>`;
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
  }
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

  // Ativa o primeiro slide
  slides[index].classList.add("active");

  // Exibe um slide e esconde os outros
  const mostrarSlide = (novoIndex) => {
    slides.forEach((slide, i) => {
      slide.classList.toggle("active", i === novoIndex);
    });
  };

  // 👉 Avançar
  const proximoSlide = () => {
    index = (index + 1) % total;
    mostrarSlide(index);
  };

  // 👈 Voltar
  const slideAnterior = () => {
    index = (index - 1 + total) % total;
    mostrarSlide(index);
  };

  // Botões de navegação
  nextBtn.addEventListener("click", proximoSlide);
  prevBtn.addEventListener("click", slideAnterior);

  // Autoplay a cada 5 segundos
  setInterval(proximoSlide, 5000);
}
