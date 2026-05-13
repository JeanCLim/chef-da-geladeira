// 1. O que acontece quando o formulário é enviado
document
  .getElementById("form-busca")
  .addEventListener("submit", function (event) {
    event.preventDefault(); // Impede a página de piscar

    const input = document.getElementById("ingredientes").value;

    // Muda a URL do navegador na mesma hora, sem recarregar a página inteira
    // Ficará: /receitas?ingredientes=tomato
    window.history.pushState(
      {},
      "",
      `/receitas?ingredientes=${encodeURIComponent(input)}`,
    );

    // Chama a função que busca no backend
    buscarEExibirReceitas(input);
  });

// 2. A função que faz a busca real
async function buscarEExibirReceitas(ingredientes) {
  const divResultados = document.getElementById("resultados");
  divResultados.innerHTML =
    '<p style="text-align:center">Procurando no livro de receitas...</p>';

  try {
    // Nós já criamos essa rota '/receitas' no seu server.js!
    const resposta = await fetch("/receitas?ingredientes=" + ingredientes);
    const receitas = await resposta.json();

    divResultados.innerHTML = "";

    // O código de montar as 'cards' que você já tinha vai aqui...
    if (receitas.length === 0) {
      divResultados.innerHTML =
        "<p>Nenhuma receita encontrada com esses ingredientes :(</p>";
      return;
    }

    receitas.forEach((receita) => {
      const card = `
          <div class="card">
              <img src="${receita.image}" alt="${receita.title}">
              <h3>${receita.title}</h3>
              <p>Usa: ${receita.usedIngredientCount} ingredientes seus</p>
              <div class="action-area">
                  <button onclick="verDetalhes(${receita.id})" class="btn-ver">Ver Receita Completa</button>
              </div>
          </div>
      `;
      divResultados.innerHTML += card;
    });
  } catch (erro) {
    console.error(erro);
    divResultados.innerHTML = "<p>Ops, algo deu errado!</p>";
  }
}

// 3. O Detetive da URL (Quando a página carrega)
window.addEventListener("DOMContentLoaded", () => {
  // Lê a URL do navegador. Ex: /receitas?ingredientes=tomato
  const parametrosUrl = new URLSearchParams(window.location.search);
  const ingredientesDaUrl = parametrosUrl.get("ingredientes");

  // Se a pessoa entrou pelo link já pesquisando algo...
  if (ingredientesDaUrl) {
    document.getElementById("ingredientes").value = ingredientesDaUrl; // Preenche o campo
    buscarEExibirReceitas(ingredientesDaUrl); // Busca automaticamente
  }
});

// A sua função de verDetalhes(id) continua aqui embaixo normal...

// Nova função que chama a rota de detalhes
async function verDetalhes(id) {
  try {
    const novaAba = window.open("", "_blank");
    novaAba.document.write("<h1>Carregando a receita...</h1>");

    // CORREÇÃO AQUI: Chama a rota certa usando o ID
    const resposta = await fetch("/detalhes/" + id);
    const dados = await resposta.json();

    if (dados.sourceUrl) {
      novaAba.location.href = dados.sourceUrl;
    } else {
      novaAba.close();
      alert("Link da receita não encontrado.");
    }
  } catch (erro) {
    console.error(erro);
    alert("Erro ao abrir a receita.");
  }
}
