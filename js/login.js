// ===============================
// 💙 Login de Usuários — Varal dos Sonhos
// ===============================

document.getElementById("btnLogin").addEventListener("click", async () => {
  const email = document.getElementById("email").value.trim();
  const senha = document.getElementById("senha").value.trim();
  const mensagem = document.getElementById("mensagem");

  mensagem.textContent = "";

  if (!email || !senha) {
    mensagem.textContent = "⚠️ Por favor, preencha todos os campos.";
    mensagem.style.color = "red";
    return;
  }

  try {
    // 🚀 Quando hospedado na Vercel, o domínio é o mesmo
    const baseURL = "";

    const resposta = await fetch(`${baseURL}/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, senha }),
    });

    const dados = await resposta.json();

    if (resposta.ok) {
      mensagem.textContent = "✅ Login realizado com sucesso!";
      mensagem.style.color = "green";

      // Salva no localStorage para usar nas próximas telas
      localStorage.setItem("usuario", JSON.stringify(dados.usuario));

      const tipo = dados.usuario.tipo_usuario?.toLowerCase();

      // Redireciona conforme o tipo de usuário
      if (tipo === "doador") {
        window.location.href = "cartinhas.html";
      } else if (tipo === "voluntario") {
        window.location.href = "admin_voluntario.html";
      } else if (tipo === "administrador") {
        window.location.href = "admin_geral.html";
      } else {
        mensagem.textContent = "Tipo de usuário desconhecido.";
        mensagem.style.color = "red";
      }
    } else {
      mensagem.textContent = dados.message || "❌ Falha ao fazer login.";
      mensagem.style.color = "red";
    }
  } catch (erro) {
    console.error("❌ Erro de conexão:", erro);
    mensagem.textContent = "Erro no servidor. Tente novamente mais tarde.";
    mensagem.style.color = "red";
  }
});
