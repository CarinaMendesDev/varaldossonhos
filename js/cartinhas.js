// /js/cartinhas.js
document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("varal");

  try {
    const resp = await fetch("/api/cartinhas");
    const cartinhas = await resp.json();

    cartinhas.forEach((c, index) => {
      const div = document.createElement("div");
      div.classList.add("cartinha");
      div.innerHTML = `
        <img src="imagens/prendedor.png" alt="Prendedor" class="prendedor">
        <img src="${c.imagem_cartinha}" alt="Cartinha de ${c.primeiro_nome}" class="cartinha-foto" id="foto-${index}">
        <img src="imagens/${c.sexo === 'Menina' ? 'menina.jpg' : 'menino.jpg'}" alt="Avatar" class="personagem">
        <div class="cartinha-info">
          <strong>${c.primeiro_nome}</strong> - ${c.idade} anos<br>
          Sonho: ${c.sonho}<br>
          Irmãos: ${c.irmaos}
        </div>
        <button class="botao-adotar" data-id="${c.id}">Adotar 💙</button>
      `;
      container.appendChild(div);
    });
  } catch (err) {
    console.error("Erro ao carregar cartinhas:", err);
    container.innerHTML = "<p>Erro ao carregar cartinhas 😢</p>";
  }

  // Zoom da imagem
  const overlay = document.createElement("div");
  overlay.id = "zoomOverlay";
  overlay.innerHTML = `<img src="" alt="Zoom da cartinha">`;
  document.body.appendChild(overlay);

  container.addEventListener("click", e => {
    // Zoom
    if (e.target.classList.contains("cartinha-foto")) {
      overlay.style.display = "flex";
      overlay.querySelector("img").src = e.target.src;
    }

    // Adotar
    if (e.target.classList.contains("botao-adotar")) {
      const id = e.target.dataset.id;
      adicionarAoCarrinho(id);
      e.target.textContent = "Adotada 💙";
      e.target.disabled = true;
    }
  });

  overlay.addEventListener("click", () => {
    overlay.style.display = "none";
  });
});

// === Função de Carrinho ===
function adicionarAoCarrinho(idCartinha) {
  const carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
  if (!carrinho.includes(idCartinha)) {
    carrinho.push(idCartinha);
    localStorage.setItem("carrinho", JSON.stringify(carrinho));
  }
}
