// ==============================
// cadastro.js
// Envia dados do formulário de cadastro ao backend (Airtable)
// ==============================

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formCadastro");

  if (!form) {
    console.error("❌ Formulário de cadastro não encontrado!");
    return;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    // 🧩 Coleta os dados do formulário
    const nome = document.getElementById("nome").value.trim();
    const cep = document.getElementById("cep").value.trim();
    const endereco = document.getElementById("endereco").value.trim();
    const cidade = document.getElementById("cidade").value.trim();
    const email = document.getElementById("email").value.trim();
    const telefone = document.getElementById("telefone").value.trim();
    const tipo_usuario = document.getElementById("tipo_usuario").value;
    const senha = document.getElementById("senha").value.trim();

    // ⚠️ Validação básica
    if (!nome || !email || !senha || !tipo_usuario) {
      alert("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    // 🔄 Monta o objeto que será enviado para a API
    const dados = {
      nome,
      cep,
      endereco,
      cidade,
      email,
      telefone,
      tipo_usuario,
      senha,
    };

    try {
      // 📨 Envia via POST para a API
      const resposta = await fetch("/api/cadastro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados),
      });

      const resultado = await resposta.json();

      if (!resposta.ok) {
        console.error("❌ Erro da API:", resultado);
        alert(resultado.error || "Erro ao cadastrar. Tente novamente.");
        return;
      }

      // ✅ Cadastro bem-sucedido
      alert("🎉 Cadastro realizado com sucesso!");
      form.reset();

      // Redireciona para login após 2 segundos
      setTimeout(() => {
        window.location.href = "login.html";
      }, 2000);

    } catch (erro) {
      console.error("❌ Erro na requisição:", erro);
      alert("Erro ao conectar com o servidor. Tente novamente mais tarde.");
    }
  });
});
