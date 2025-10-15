document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("btnCloudinho");
  const bubble = document.getElementById("bubbleCloudinho");
  const label = document.getElementById("labelCloudinho");

  // Mostrar balão inicial por 10 segundos
  setTimeout(() => {
    label.style.opacity = "0";
    label.style.transition = "opacity 1s ease";
  }, 10000);

  // Clique no Cloudinho → alterna o chat
  btn.addEventListener("click", () => {
    const isHidden = bubble.getAttribute("aria-hidden") === "true";
    bubble.setAttribute("aria-hidden", !isHidden);
  });
});
