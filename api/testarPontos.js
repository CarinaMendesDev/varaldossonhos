// api/testarPontos.js
import { listarRegistros } from "./conectarAirtable.js";

(async () => {
  console.log("📦 Lendo dados da tabela PontosDeColeta...\n");
  const pontos = await listarRegistros("PontosDeColeta");
  console.table(pontos);
})();
