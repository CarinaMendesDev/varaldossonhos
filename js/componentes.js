// ============================================================
// 🌐 VARAL DOS SONHOS — componentes.js
// Carrega automaticamente o cabeçalho, rodapé e Cloudinho
// em todas as páginas do site (index, eventos, cartinhas etc.)
// ============================================================

export async function carregarComponentes() {
  try {
    // 🔹 Carrega o Cabeçalho
    const header = document.getElementById("header");
    if (header) {
      const respHeader = await fetch("componentes/header.html");
      if (respHeader.ok) {
        header.innerHTML = await respHeader.text();
      } else {
        console.warn("⚠️ Cabeçalho não encontrado.");
      }
    }

    // 🔹 Carrega o Rodapé
    const footer = document.getElementById("footer");
    if (footer) {
      const respFooter = await fetch("componentes/footer.html");
      if (respFooter.ok) {
        footer.innerHTML = await respFooter.text();
      } else {
        console.warn("⚠️ Rodapé não encontrado.");
      }
    }

    // 🔹 Carrega o Cloudinho
    const cloudinho = document.getElementById("cloudinho");
    if (cloudinho) {
      const respCloudinho = await fetch("componentes/cloudinho.html");
      if (respCloudinho.ok) {
        cloudinho.innerHTML = await respCloudinho.text();
      } else {
        console.warn("⚠️ Cloudinho não encontrado.");
      }
    }
  } catch (erro) {
    console.error("❌ Erro ao carregar componentes:", erro);
  }
}

// ============================================================
// 👤 Atualiza o login do usuário (opcional para páginas com login)
// ============================================================
export function atualizarLogin() {
  const usuarioJSON = localStorage.getItem("usuario");
  const menu = document.querySelector(".menu");
  if (!menu) return;

  if (usuarioJSON) {
    const usuario = JSON.parse(usuarioJSON);
    const nome = usuario.nome || "Usuário";

    // Substitui o botão Login por saudação
    const loginBtn = menu.querySelector('a[href="login.html"]');
    if (loginBtn) {
      loginBtn.textContent = `Olá, ${nome}!`;
      loginBtn.href = "#";
    }
  }
}

// ============================================================
// 🚀 Inicializa automaticamente os componentes
// ============================================================
document.addEventListener("DOMContentLoaded", async () => {
  await carregarComponentes();
  atualizarLogin();
});
