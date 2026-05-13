async function buscarReceitas() {
  const input = document.getElementById("ingredientes").value;
  const divResultados = document.getElementById("resultados");

  if (!input) return alert("Digite algum ingrediente!");

  divResultados.innerHTML =
    '<p style="text-align:center">Procurando no livro de receitas...</p>';

  try {
    const resposta = await fetch("/receitas?ingredientes=" + input);
    const receitas = await resposta.json();

    divResultados.innerHTML = "";

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
