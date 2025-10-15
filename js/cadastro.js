// js/cadastro.js

document.getElementById("formCadastro").addEventListener("submit", async (e) => {
  e.preventDefault();

  const nome = document.getElementById("nome").value.trim();
  const email = document.getElementById("email").value.trim();
  const senha = document.getElementById("senha").value.trim();
  const tipoUsuario = document.getElementById("tipo_usuario").value; // Novo campo
  const cidade = document.getElementById("cidade").value.trim();

  if (!nome || !email || !senha || !tipoUsuario) {
    alert("Por favor, preencha todos os campos obrigatórios.");
    return;
  }

  try {
    const resposta = await fetch("/api/cadastro", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, email, senha, tipoUsuario, cidade }),
    });

    const data = await resposta.json();

    if (resposta.ok) {
      alert("🎉 Cadastro realizado com sucesso! Faça login para continuar.");
      window.location.href = "login.html";
    } else {
      alert(`⚠️ Erro: ${data.error}`);
    }
  } catch (erro) {
    console.error("Erro ao cadastrar:", erro);
    alert("Erro ao conectar com o servidor. Tente novamente.");
  }
});
