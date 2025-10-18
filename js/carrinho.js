// ============================================================
// 💙 VARAL DOS SONHOS — js/carrinho.js (versão final com API)
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
  const carrinhoLista = document.getElementById("carrinhoLista");
  const btnLimpar = document.getElementById("btnLimpar");
  const btnConfirmar = document.getElementById("btnConfirmar");
  const usuarioLogado = document.getElementById("usuarioLogado");
  const loginLink = document.getElementById("loginLink");

  // 🔐 Verifica login
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  if (!usuario) {
    alert("Você precisa estar logado para acessar o carrinho.");
    window.location.href = "login.html";
    return;
  } else {
    usuarioLogado.textContent = `Olá, ${usuario.nome}!`;
    usuarioLogado.style.display = "inline-block";
    loginLink.style.display = "none";
  }

  // 🛒 Carrega itens do carrinho
  const carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];

  if (carrinho.length === 0) {
    carrinhoLista.innerHTML = "<p>Seu carrinho está vazio 😢</p>";
  } else {
    carrinhoLista.innerHTML = "";
    carrinho.forEach((item, index) => {
      const div = document.createElement("div");
      div.className = "carrinho-item";
      div.innerHTML = `
        <img src="${item.imagem}" alt="${item.nome}" class="cartinha-foto">
        <h3>${item.nome}</h3>
        <p><strong>Idade:</strong> ${item.idade} anos</p>
        <p><strong>Sexo:</strong> ${item.sexo}</p>
        <button class="remover" data-index="${index}">Remover</button>
      `;
      carrinhoLista.appendChild(div);
    });
  }

  // ❌ Remover item
  carrinhoLista.addEventListener("click", (e) => {
    if (e.target.classList.contains("remover")) {
      const index = e.target.getAttribute("data-index");
      carrinho.splice(index, 1);
      localStorage.setItem("carrinho", JSON.stringify(carrinho));
      location.reload();
    }
  });

  // 🗑️ Limpar carrinho
  btnLimpar.addEventListener("click", () => {
    if (confirm("Tem certeza que deseja limpar o carrinho?")) {
      localStorage.removeItem("carrinho");
      location.reload();
    }
  });

  // 💝 Confirmar adoção (envia para API)
  btnConfirmar.addEventListener("click", async () => {
    if (carrinho.length === 0) {
      alert("Seu carrinho está vazio!");
      return;
    }

    try {
      const resposta = await fetch("/api/adocoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usuarioEmail: usuario.email,
          cartinhas: carrinho
        })
      });

      const dados = await resposta.json();

      if (resposta.ok && dados.success) {
        alert("💙 Adoção confirmada com sucesso! Obrigado por fazer a diferença!");
        localStorage.removeItem("carrinho");
        window.location.href = "index.html";
      } else {
        alert("⚠️ Erro ao registrar adoção: " + (dados.error || "tente novamente."));
      }
    } catch (erro) {
      console.error("Erro ao confirmar adoção:", erro);
      alert("❌ Erro de conexão com o servidor.");
    }
  });
});
