// js/login.js
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("btnLogin");
  if (!btn) return;

  btn.addEventListener("click", async (e) => {
    e.preventDefault();
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
      console.log("POST /api/login", { email });
      const resposta = await fetch('/api/login', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha })
      });

      const dados = await resposta.json();

      if (resposta.ok) {
        mensagem.textContent = "✅ Login realizado com sucesso!";
        mensagem.style.color = "green";

        localStorage.setItem("usuario", JSON.stringify(dados.usuario));
        // Redireciona por tipo de usuário
        const tipo = (dados.usuario.tipo_usuario || "").toLowerCase();
        if (tipo === "doador") {
          window.location.href = "cartinhas.html";
        } else if (tipo === "voluntario") {
          window.location.href = "admin_voluntario.html";
        } else if (tipo === "administrador") {
          window.location.href = "admin_geral.html";
        } else {
          window.location.href = "index.html";
        }
      } else {
        mensagem.textContent = dados.message || dados.error || "❌ Falha ao fazer login.";
        mensagem.style.color = "red";
      }
    } catch (erro) {
      console.error("❌ Erro de conexão:", erro);
      mensagem.textContent = "Erro no servidor. Tente novamente mais tarde.";
      mensagem.style.color = "red";
    }
  });
});
