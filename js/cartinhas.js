document.addEventListener("DOMContentLoaded", async () => {
  const cartinhasContainer = document.getElementById("cartinhasContainer");
  const usuarioLogado = document.getElementById("usuarioLogado");
  const loginLink = document.getElementById("loginLink");

  // ===== MOSTRAR USUÁRIO LOGADO NO CABEÇALHO =====
  const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));
  if (usuario) {
    usuarioLogado.textContent = `Olá, ${usuario.nome}!`;
    usuarioLogado.style.display = "inline-block";
    loginLink.style.display = "none";
  }

  // ===== FUNÇÃO PARA CARREGAR CARTINHAS =====
  async function carregarCartinhas() {
    try {
      const resposta = await fetch("/api/cartinhas");
      if (!resposta.ok) {
        throw new Error(`Erro ao buscar cartinhas: ${resposta.statusText}`);
      }

      const cartinhas = await resposta.json();
      cartinhasContainer.innerHTML = "";

      if (cartinhas.length === 0) {
        cartinhasContainer.innerHTML = `<p>Nenhuma cartinha disponível no momento 💌</p>`;
        return;
      }

      cartinhas.forEach((cartinha) => {
        const item = document.createElement("div");
        item.classList.add("cartinha-item");

        const foto = cartinha.imagem_cartinha?.[0]?.url || "imagens/cartinha.png";
        const sexo = cartinha.sexo === "Feminino" ? "imagens/avatar-menina.png" : "imagens/avatar-menino.png";

        item.innerHTML = `
          <img src="${foto}" alt="Cartinha de ${cartinha.primeiro_nome}" class="cartinha-foto" />
          <img src="imagens/pregador.png" class="pregador" alt="Pregador" />
          <img src="${sexo}" alt="Avatar da criança" class="cartinha-avatar" />
          <h3>${cartinha.primeiro_nome}</h3>
          <p>${cartinha.idade} anos</p>
          <p><strong>Sonho:</strong> ${cartinha.sonho || "Não informado"}</p>
          <p><strong>Irmãos:</strong> ${cartinha.irmaos || "Não informado"}</p>
          <button class="adotar-btn" data-id="${cartinha.id_cartinha}">Adotar 💙</button>
        `;

        cartinhasContainer.appendChild(item);
      });

      // ===== EVENTO PARA ADICIONAR AO CARRINHO =====
      document.querySelectorAll(".adotar-btn").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          if (!usuario) {
            alert("Você precisa estar logado para adotar uma cartinha 💙");
            window.location.href = "login.html";
            return;
          }

          const idCartinha = e.target.getAttribute("data-id");
          adicionarAoCarrinho(idCartinha);
        });
      });
    } catch (error) {
      console.error("Erro ao carregar cartinhas:", error);
      cartinhasContainer.innerHTML = `<p>Erro ao carregar as cartinhas 😢</p>`;
    }
  }

  // ===== FUNÇÃO PARA ADICIONAR CARTINHA AO CARRINHO =====
  function adicionarAoCarrinho(idCartinha) {
    let carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
    if (carrinho.includes(idCartinha)) {
      alert("Essa cartinha já está no seu carrinho 💙");
      return;
    }
    carrinho.push(idCartinha);
    localStorage.setItem("carrinho", JSON.stringify(carrinho));
    alert("Cartinha adicionada ao carrinho com sucesso! 💌");
  }

  // ===== EXECUTA =====
  carregarCartinhas();
});
