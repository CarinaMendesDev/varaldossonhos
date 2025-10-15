// ===============================
// 📘 Cadastro de Usuários — Varal dos Sonhos
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formCadastro");

  if (!form) {
    console.error("⚠️ Formulário de cadastro não encontrado.");
    return;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nome = document.getElementById("nome").value.trim();
    const email = document.getElementById("email").value.trim();
    const telefone = document.getElementById("telefone").value.trim();
    const cidade = document.getElementById("cidade").value.trim();
    const tipo_usuario = document.getElementById("tipo_usuario").value;
    const senha = document.getElementById("senha").value.trim();

    if (!nome || !email || !telefone || !cidade || !tipo_usuario || !senha) {
      alert("⚠️ Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    const botao = form.querySelector("button[type='submit']");
    const textoOriginal = botao.textContent;
    botao.disabled = true;
    botao.textContent = "Enviando...";

    try {
      const baseURL = window.location.hostname.includes("vercel.app")
        ? ""
        : "https://varaldossonhos-sp.vercel.app/cadastro.html";

      const resposta = await fetch(`${baseURL}/api/cadastro`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, email, telefone, cidade, tipo_usuario, senha }),
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
