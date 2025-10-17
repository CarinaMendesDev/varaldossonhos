// ============================================================
// ☁️ VARAL DOS SONHOS — Cloudinho.js (versão final com IA gratuita)
// Mascote flutuante + frases rotativas + respostas Airtable
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
  const bubble = document.getElementById("cloudinhoBubble");
  const button = document.getElementById("cloudinhoBtn");
  const text = document.getElementById("cloudinhoText");
  const btnAdotar = document.getElementById("cloudAdotar");
  const btnContato = document.getElementById("cloudContato");

  // ✨ Frases rotativas
  const mensagens = [
    "Oi! Eu sou o Cloudinho ☁️",
    "Quer ajuda para adotar uma cartinha?",
    "Cada cartinha é um sonho esperando por você 💙",
    "Clique aqui para começar a espalhar sorrisos 🌈"
  ];
  let index = 0;

  function trocarMensagem() {
    text.textContent = mensagens[index];
    index = (index + 1) % mensagens.length;
  }

  // 💬 Alterna exibição automática do balão
  function animarBubble() {
    bubble.classList.add("visivel");
    setTimeout(() => bubble.classList.remove("visivel"), 6000);
  }

  // Intervalos rotativos
  setInterval(trocarMensagem, 5000);
  setInterval(animarBubble, 15000);

  // Mostra/oculta manualmente ao clicar no Cloudinho
  button.addEventListener("click", () => {
    bubble.classList.toggle("visivel");
  });

  // Ações rápidas (mantidas)
  btnAdotar.addEventListener("click", () => {
    enviarMensagemCloudinho("Como adotar uma cartinha?");
  });

  btnContato.addEventListener("click", () => {
    enviarMensagemCloudinho("Quero falar com a equipe.");
  });

  // ============================================================
  // 🔗 Integração com API do Cloudinho (gratuita via Airtable KB)
  // ============================================================

  async function enviarMensagemCloudinho(mensagem) {
    try {
      text.textContent = "☁️ Pensando...";
      const resposta = await fetch("/api/cloudinho.api.js", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mensagem })
      });
      const data = await resposta.json();
      text.textContent = data.resposta || "💭 Não encontrei nada sobre isso ainda.";
      bubble.classList.add("visivel");
    } catch (erro) {
      console.error("Erro no Cloudinho:", erro);
      text.textContent = "💙 Ops! Parece que perdi a conexão...";
    }
  }
});
