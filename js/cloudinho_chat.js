// ============================================================
// ☁️ VARAL DOS SONHOS — js/cloudinho_chat.js
// Chat do Cloudinho: envia perguntas e exibe respostas
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
  const bubble = document.getElementById("cloudinhoBubble");
  const button = document.getElementById("cloudinhoBtn");
  const text = document.getElementById("cloudinhoText");
  const input = document.getElementById("cloudinhoInput");
  const enviarBtn = document.getElementById("cloudinhoEnviar");

  // 🔄 Mostra e oculta o balão
  button.addEventListener("click", () => {
    bubble.classList.toggle("visivel");
    input.focus();
  });

  // 🧠 Envia pergunta para o backend
  async function enviarPergunta() {
    const pergunta = input.value.trim();
    if (!pergunta) return;

    text.textContent = "Digitando... ☁️";
    input.value = "";

    try {
      const resposta = await fetch("/api/cloudinho.api.js", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pergunta })
      });

      const dados = await resposta.json();
      text.textContent = dados.resposta || "Desculpe, não consegui entender 😅";
    } catch (erro) {
      console.error("Erro ao falar com o Cloudinho:", erro);
      text.textContent = "Ops! Tô com a cabeça nas nuvens... tente de novo ☁️😅";
    }
  }

  // ⌨️ Envia ao pressionar Enter
  input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") enviarPergunta();
  });

  // 📤 Envia ao clicar no botão
  enviarBtn.addEventListener("click", enviarPergunta);
});
