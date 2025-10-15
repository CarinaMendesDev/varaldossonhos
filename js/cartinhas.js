document.addEventListener("DOMContentLoaded", async () => {
  const lista = document.getElementById("cartinhasList");
  const loginLink = document.getElementById("loginLink");

  // ====== Mostra nome do usuário logado ======
  const usuario = JSON.parse(localStorage.getItem("usuarioLogado"));
  if (usuario && usuario.nome) {
    loginLink.textContent = usuario.nome.split(" ")[0];
    loginLink.href = "#";
    loginLink.classList.add("usuario-logado");
  }

  // ====== Carrega as cartinhas ======
  try {
    const resposta = await fetch("/api/cartinhas");
    if (!resposta.ok) throw new Error("Erro ao carregar cartinhas");
    const cartinhas = await resposta.json();

    cartinhas.forEach((c) => {
      const nome = c.fields.primeiro_nome || "Criança";
      const idade = c.fields.idade || "—";
      const sonho = c.fields.sonho || "Não informado";
      const irmaos = c.fields.irmaos || "Não informado";
      const imagem = c.fields.imagem_cartinha?.[0]?.url || "imagens/placeholder.png";
      const sexo = c.fields.sexo?.toLowerCase() || "menino";

      const avatar = sexo === "menina"
        ? "imagens/menina.png"
        : "imagens/menino.png";

      const item = document.createElement("div");
      item.className = "cartinha-item";
      item.innerHTML = `
        <img src="imagens/pregador.png" alt="Pregador" class="pregador" />
        <img src="${imagem}" alt="Cartinha de ${nome}" class="cartinha-foto" />
        <img src="${avatar}" alt="Avatar da criança" class="cartinha-avatar" />
        <h3>${nome}</h3>
        <p>${idade} anos</p>
        <p><strong>Sonho:</strong> ${sonho}</p>
        <p><strong>Irmãos:</strong> ${irmaos}</p>
        <button class="adotar-btn">Adotar 💙</button>
      `;
      lista.appendChild(item);
    });
  } catch (err) {
    console.error("Erro ao carregar cartinhas:", err);
  }

  // ====== Carrossel ======
  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");

  prevBtn.addEventListener("click", () => {
    lista.scrollBy({ left: -300, behavior: "smooth" });
  });

  nextBtn.addEventListener("click", () => {
    lista.scrollBy({ left: 300, behavior: "smooth" });
  });
});
