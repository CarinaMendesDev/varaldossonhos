// /js/cartinhas.js
document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("varal");
  if (!container) {
    console.error("Elemento #varal não encontrado no DOM.");
    return;
  }

  try {
    const resp = await fetch("/api/cartinhas");
    // primeiro verifique se a resposta foi OK
    if (!resp.ok) {
      // tenta ler texto de erro (pode ser JSON ou HTML)
      const text = await resp.text();
      console.error("API /api/cartinhas retornou erro:", resp.status, resp.statusText, text);
      container.innerHTML = `<p>Erro ao carregar cartinhas. Tente novamente mais tarde.</p>`;
      return;
    }

    // agora parse como JSON (já que resp.ok)
    const cartinhas = await resp.json();

    if (!Array.isArray(cartinhas) || cartinhas.length === 0) {
      container.innerHTML = "<p>Nenhuma cartinha disponível no momento 💌</p>";
      return;
    }

    cartinhas.forEach((c, index) => {
      const cartaImg = c.imagem_cartinha || "imagens/placeholder.jpg";
      const sexo = (c.sexo || "").toLowerCase();
      const avatar = sexo.includes("menina") || sexo.includes("f") ? "imagens/menina.jpg" : "imagens/menino.jpg";

      const div = document.createElement("div");
      div.className = "cartinha";
      div.innerHTML = `
        <img src="imagens/prendedor.png" alt="Prendedor" class="prendedor">
        <img src="${cartaImg}" alt="Cartinha de ${c.primeiro_nome}" class="cartinha-foto" data-index="${index}">
        <img src="${avatar}" alt="Avatar" class="personagem">
        <div class="cartinha-info">
          <strong>${escapeHtml(c.primeiro_nome)}</strong> - ${escapeHtml(c.idade)} anos<br>
          Sonho: ${escapeHtml(c.sonho)}<br>
          Irmãos: ${escapeHtml(c.irmaos)}
        </div>
        <button class="botao-adotar" data-id="${c.id}">Adotar 💙</button>
      `;
      container.appendChild(div);
    });
  } catch (err) {
    console.error("Erro ao carregar cartinhas:", err);
    container.innerHTML = "<p>Erro ao carregar cartinhas. Verifique os logs do servidor.</p>";
  }

  // Zoom overlay
  const overlay = document.createElement("div");
  overlay.id = "zoomOverlay";
  overlay.style = "display:none;position:fixed;top:0;left:0;width:100vw;height:100vh;align-items:center;justify-content:center;background:rgba(0,0,0,0.8);z-index:9999;";
  const overlayImg = document.createElement("img");
  overlayImg.style = "max-width:90%;max-height:90%;border-radius:10px;cursor:zoom-out;";
  overlay.appendChild(overlayImg);
  document.body.appendChild(overlay);

  // Delegation
  document.getElementById("varal").addEventListener("click", (e) => {
    const t = e.target;

    // abrir zoom
    if (t.classList.contains("cartinha-foto")) {
      overlayImg.src = t.src;
      overlay.style.display = "flex";
      return;
    }

    // adotar: guarda somente o id da cartinha
    if (t.classList.contains("botao-adotar")) {
      const id = t.dataset.id;
      adicionarAoCarrinho(id);
      t.textContent = "Adotada 💙";
      t.disabled = true;
    }
  });

  overlay.addEventListener("click", () => {
    overlay.style.display = "none";
    overlayImg.src = "";
  });

  function adicionarAoCarrinho(idCartinha) {
    const carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
    if (!carrinho.includes(idCartinha)) {
      carrinho.push(idCartinha);
      localStorage.setItem("carrinho", JSON.stringify(carrinho));
    }
  }

  // simples escapador para evitar injeção na innerHTML (nomes/sonhos vindos do Airtable)
  function escapeHtml(str) {
    if (!str && str !== 0) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
});
