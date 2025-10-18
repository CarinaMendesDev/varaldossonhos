// ============================================================
// 💙 VARAL DOS SONHOS — componentes.js
// Carrega automaticamente header, footer e Cloudinho
// e sincroniza login/logout em todas as páginas
// ============================================================

document.addEventListener("DOMContentLoaded", async () => {
  await carregarComponentes();
  atualizarLogin();
});

// ============================================================
// 🔹 Carregar Header, Footer e Cloudinho
// ============================================================
async function carregarComponentes() {
  try {
    const header = document.getElementById("header");
    if (header) {
      const resp = await fetch("componentes/header.html");
      header.innerHTML = resp.ok ? await resp.text() : "<p>Header não encontrado</p>";
    }

    const footer = document.getElementById("footer");
    if (footer) {
      const resp = await fetch("componentes/footer.html");
      footer.innerHTML = resp.ok ? await resp.text() : "<p>Footer não encontrado</p>";
    }

    const cloudinho = document.getElementById("cloudinho");
    if (cloudinho) {
      const resp = await fetch("componentes/cloudinho.html");
      cloudinho.innerHTML = resp.ok ? await resp.text() : "";
    }

    // Reaplica o login/logout após carregar header
    atualizarLogin();
  } catch (erro) {
    console.error("Erro ao carregar componentes:", erro);
  }
}

// ============================================================
// 👤 Atualiza status do login e botão “Sair”
// ============================================================
function atualizarLogin() {
  const usuarioData = localStorage.getItem("usuario");
  const loginLink = document.getElementById("loginLink");
  const usuarioNome = document.getElementById("usuarioNome");
  const btnLogout = document.getElementById("btnLogout");

  if (!loginLink || !usuarioNome || !btnLogout) return;

  if (usuarioData) {
    const usuario = JSON.parse(usuarioData);
    usuarioNome.textContent = `Olá, ${usuario.nome.split(" ")[0]}!`;
    usuarioNome.style.display = "inline-block";
    loginLink.style.display = "none";
    btnLogout.style.display = "inline-block";

    // Botão sair
    btnLogout.addEventListener("click", () => {
      localStorage.removeItem("usuario");
      alert("Você saiu com sucesso 💙");
      window.location.href = "index.html";
    });
  } else {
    usuarioNome.style.display = "none";
    loginLink.style.display = "inline-block";
    btnLogout.style.display = "none";
  }
}
