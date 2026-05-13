require("dotenv").config();
const express = require("express");
const path = require("path");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());

// Serve os arquivos estáticos da pasta public
app.use(express.static(path.join(__dirname, "public")));

// Rota para forçar o carregamento do HTML na página inicial
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Rota principal da API
app.get("/api/receitas", async (req, res) => {
  const ingredientes = req.query.ingredientes;

  // ESPIÃO 1: Vendo se o pedido chegou
  console.log("1. Pedido recebido para:", ingredientes);

  // ESPIÃO 2: Vendo se a chave existe (Cuidado: vai mostrar a chave nos logs)
  console.log("2. Minha chave é:", process.env.SPOONACULAR_API_KEY);

  if (!ingredientes) {
    return res.status(400).json({ error: "Por favor, forneça ingredientes." });
  }

  try {
    const response = await axios.get(
      "https://api.spoonacular.com/recipes/findByIngredients",
      {
        params: {
          ingredients: ingredientes,
          number: 5,
          apiKey: process.env.SPOONACULAR_API_KEY,
          ranking: 1,
        },
      },
    );

    // ESPIÃO 3: Vendo o que a API respondeu
    console.log(
      "3. A API respondeu com quantas receitas?:",
      response.data.length,
    );

    res.json(response.data);
  } catch (error) {
    // ESPIÃO 4: Vendo o erro real e detalhado
    console.error(
      "4. DEU RUIM NA API:",
      error.response ? error.response.data : error.message,
    );

    // Mantemos a resposta genérica pro usuário, mas no log saberemos a verdade
    res.status(500).json({ error: "Erro ao buscar receitas." });
  }
});

// Rota: Busca detalhes de UMA receita específica pelo ID
app.get("/detalhes/:id", async (req, res) => {
  const { id } = req.params; // Pega o ID que veio na URL

  try {
    const response = await axios.get(
      `https://api.spoonacular.com/recipes/${id}/information`,
      {
        params: {
          apiKey: process.env.SPOONACULAR_API_KEY,
        },
      },
    );

    // Retorna só o link da receita original para ser mais rápido
    res.json({ sourceUrl: response.data.sourceUrl });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar detalhes." });
  }
});

// O segredo é esse "process.env.PORT"
const port = process.env.PORT || 3000;

// Liga o servidor (Apenas UMA vez no final do arquivo)
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});

// Adicione esta linha aqui para o Vercel entender a sua API!
module.exports = app;
