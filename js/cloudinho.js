document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("cloudinhoBtn");
  const bubble = document.getElementById("cloudinhoBubble");
  const label = document.getElementById("cloudinhoLabel");
  const text = document.getElementById("cloudinhoText");
  const botoes = document.querySelectorAll(".bubble-actions button");

  // Mostrar mensagem inicial por 10s
  setTimeout(() => {
    label.style.opacity = "0";
    label.style.transition = "opacity 1s ease";
  }, 10000);

  // Clique no Cloudinho → mostra/esconde balão
  btn.addEventListener("click", () => {
    const isHidden = bubble.getAttribute("aria-hidden") === "true";
    bubble.setAttribute("aria-hidden", !isHidden);
    bubble.style.display = isHidden ? "block" : "none";
  });

  // Ações dos botões dentro do balão
  botoes.forEach(btn => {
    btn.addEventListener("click", (e) => {
      const acao = e.target.dataset.action;
      if (acao === "adotar") {
        text.innerText = "💌 Que legal! Vá até a aba 'Varal Virtual' para escolher uma cartinha.";
      } else if (acao === "contato") {
        text.innerText = "📩 Você pode nos mandar um e-mail ou falar pelo WhatsApp!";
      }
    });
  });
});
