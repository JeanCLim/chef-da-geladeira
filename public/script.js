// 1. O que acontece quando o formulário é enviado
document
  .getElementById("form-busca")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const input = document.getElementById("ingredientes").value;

    // CORREÇÃO: Agora usamos a raiz '/' para a URL do navegador.
    // Isso evita que o reload chame o JSON puro.
    window.history.pushState(
      {},
      "",
      `/?ingredientes=${encodeURIComponent(input)}`,
    );

    buscarEExibirReceitas(input);
  });

// 2. A função que faz a busca real
async function buscarEExibirReceitas(ingredientes) {
  const divResultados = document.getElementById("resultados");
  divResultados.innerHTML =
    '<p style="text-align:center">Procurando no livro de receitas...</p>';

  try {
    // CORREÇÃO: O fetch agora chama a rota da API '/api/receitas'
    const resposta = await fetch("/api/receitas?ingredientes=" + ingredientes);
    const receitas = await resposta.json();

    divResultados.innerHTML = "";

    if (receitas.length === 0) {
      divResultados.innerHTML =
        "<p>Nenhuma receita encontrada com esses ingredientes :(</p>";
      return;
    }

    // Salvamos no histórico (localStorage) após uma busca com sucesso
    salvarNoHistorico(ingredientes);

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

// 3. O Detetive da URL (Quando a página carrega ou dá F5)
window.addEventListener("DOMContentLoaded", () => {
  carregarHistorico(); // Carrega as tags do histórico salvas

  const parametrosUrl = new URLSearchParams(window.location.search);
  const ingredientesDaUrl = parametrosUrl.get("ingredientes");

  if (ingredientesDaUrl) {
    document.getElementById("ingredientes").value = ingredientesDaUrl;
    buscarEExibirReceitas(ingredientesDaUrl);
  }
});

// --- FUNÇÕES AUXILIARES ---

async function verDetalhes(id) {
  try {
    const novaAba = window.open("", "_blank");
    novaAba.document.write("<h1>Carregando a receita...</h1>");

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

function salvarNoHistorico(ingredientes) {
  let historico = JSON.parse(localStorage.getItem("historicoChef")) || [];
  historico = historico.filter((item) => item !== ingredientes);
  historico.unshift(ingredientes);
  if (historico.length > 5) historico.pop();
  localStorage.setItem("historicoChef", JSON.stringify(historico));
  carregarHistorico();
}

function carregarHistorico() {
  const divHistorico = document.getElementById("historico-buscas");
  if (!divHistorico) return;

  let historico = JSON.parse(localStorage.getItem("historicoChef")) || [];
  if (historico.length === 0) return;

  let html = "<p>Últimas buscas:</p><div class='tags-container'>";
  historico.forEach((item) => {
    html += `<span class="tag-historico" onclick="refazerBusca('${item}')">${item}</span>`;
  });
  html += "</div>";
  divHistorico.innerHTML = html;
}

function refazerBusca(ingredientes) {
  document.getElementById("ingredientes").value = ingredientes;
  window.history.pushState(
    {},
    "",
    `/?ingredientes=${encodeURIComponent(ingredientes)}`,
  );
  buscarEExibirReceitas(ingredientes);
}
