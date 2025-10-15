// js/cadastro.js
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formCadastro");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nome = document.getElementById("nome").value.trim();
    const cep = document.getElementById("cep").value.trim();
    const logradouro = document.getElementById("endereco_logradouro").value.trim();
    const numero = document.getElementById("endereco_numero").value.trim();
    const complemento = document.getElementById("endereco_complemento").value.trim();
    const bairro = document.getElementById("endereco_bairro").value.trim();
    const cidade = document.getElementById("cidade").value.trim();
    const email = document.getElementById("email").value.trim();
    const telefone = document.getElementById("telefone").value.trim();
    const tipo_usuario = document.getElementById("tipo_usuario").value;
    const senha = document.getElementById("senha").value.trim();

    if (!nome || !email || !senha || !tipo_usuario || !logradouro || !numero || !cidade) {
      alert("Por favor, preencha todos os campos obrigatórios (incluindo número).");
      return;
    }

    const endereco = `${logradouro}, ${numero}${complemento ? " — " + complemento : ""}${bairro ? " — " + bairro : ""}`;

    const payload = {
      nome,
      cep,
      endereco,
      endereco_logradouro: logradouro,
      endereco_numero: numero,
      endereco_complemento: complemento,
      endereco_bairro: bairro,
      cidade,
      email,
      telefone,
      tipo_usuario,
      senha
    };

    try {
      console.log("Enviando para /api/cadastro:", payload);
      const resp = await fetch("/api/cadastro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await resp.json();

      if (!resp.ok) {
        console.error("API retornou erro:", data);
        alert(data.error || data.message || "Erro ao cadastrar.");
        return;
      }

      alert("Cadastro realizado com sucesso!");
      form.reset();
      setTimeout(() => { window.location.href = "login.html"; }, 1200);
    } catch (err) {
      console.error("Erro ao conectar com o servidor:", err);
      alert("Erro de conexão. Tente novamente mais tarde.");
    }
  });
});
