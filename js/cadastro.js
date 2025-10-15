// === Configurações do Airtable ===
const AIRTABLE_API_KEY = "SUA_API_KEY_AQUI";
const AIRTABLE_BASE_ID = "SEU_BASE_ID_AQUI";
const AIRTABLE_TABLE_NAME = "Cadastro"; // altere se o nome da sua tabela for diferente

// === Função de envio do formulário ===
document.getElementById("formCadastro").addEventListener("submit", async function (e) {
  e.preventDefault();

  const nome = document.getElementById("nome").value.trim();
  const cep = document.getElementById("cep").value.trim();
  const endereco = document.getElementById("endereco").value.trim();
  const cidade = document.getElementById("cidade").value.trim();
  const email = document.getElementById("email").value.trim();
  const telefone = document.getElementById("telefone").value.trim();
  const tipo_usuario = document.getElementById("tipo_usuario").value;
  const senha = document.getElementById("senha").value;

  if (!nome || !email || !senha) {
    alert("Por favor, preencha todos os campos obrigatórios.");
    return;
  }

  const dados = {
    fields: {
      "Nome completo": nome,
      "CEP": cep,
      "Endereço": endereco,
      "Cidade": cidade,
      "E-mail": email,
      "Telefone": telefone,
      "Tipo de Usuário": tipo_usuario,
      "Senha": senha
    }
  };

  try {
    const resposta = await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${AIRTABLE_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(dados)
    });

    if (!resposta.ok) {
      throw new Error(`Erro ao enviar para Airtable: ${resposta.status}`);
    }

    alert("🎉 Cadastro realizado com sucesso!");
    document.getElementById("formCadastro").reset();

  } catch (erro) {
    console.error(erro);
    alert("❌ Ocorreu um erro ao enviar o cadastro. Verifique sua conexão e tente novamente.");
  }
});
