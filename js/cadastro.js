// ===============================
// 📘 Cadastro de Usuários — Varal dos Sonhos
// Integração com API hospedada no Vercel (Airtable)
// ===============================

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formCadastro");

  if (!form) {
    console.error("⚠️ Formulário de cadastro não encontrado.");
    return;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Coleta dos dados do formulário
    const nome = document.getElementById("nome").value.trim();
    const email = document.getElementById("email").value.trim();
    const senha = document.getElementById("senha").value.trim();
    const tipoUsuario = document.getElementById("tipo_usuario").value;
    const cidade = document.getElementById("cidade").value.trim();

    // Validação simples
    if (!nome || !email || !senha || !tipoUsuario) {
      alert("⚠️ Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    const botao = form.querySelector("button[type='submit']");
    const textoOriginal = botao.textContent;
    botao.disabled = true;
    botao.textContent = "Enviando...";

    try {
      // 🔗 Detecta automaticamente se está no Vercel ou local
      const baseURL = window.location.hostname.includes("vercel.app")
        ? "" // se já estiver no domínio da Vercel
        : "https://varaldossonhos-sp.vercel.app"; // para testes locais

      const resposta = await fetch(`${baseURL}/api/cadastro`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, email, senha, tipoUsuario, cidade }),
      });

      const data = await resposta.json();

      if (resposta.ok) {
        alert("🎉 Cadastro realizado com sucesso! Faça login para continuar.");
        form.reset();
        window.location.href = "login.html";
      } else {
        alert(`⚠️ Erro: ${data.error || "Falha ao cadastrar usuário."}`);
      }
    } catch (erro) {
      console.error("❌ Erro de conexão:", erro);
      alert("❌ Falha na conexão com o servidor. Tente novamente mais tarde.");
    } finally {
      botao.disabled = false;
      botao.textContent = textoOriginal;
    }
  });
});
