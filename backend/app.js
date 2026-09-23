/* Ponto de entrada da API: prepara o banco, configura o Express e registra as rotas. */
const express = require("express");
const cors = require("cors");

// Executar este módulo abre o SQLite e cria as tabelas ausentes.
require("./src/database/database");

const fornecedoresRoutes = require("./src/routes/fornecedores.routes");
const produtosRoutes = require("./src/routes/produtos.routes");
const associacoesRoutes = require("./src/routes/associacoes.routes");

// A aplicação precisa existir antes de receber configurações com app.use.
const app = express();
const PORT = 3000;

// Permite chamadas do frontend, que usa outra porta (origem). Não é autenticação.
app.use(cors());
// Converte o corpo JSON da requisição em req.body antes de executar as rotas.
app.use(express.json());
// Cada prefixo encaminha a requisição ao módulo correspondente.
app.use("/fornecedores", fornecedoresRoutes);
app.use("/produtos", produtosRoutes);
app.use("/associacoes", associacoesRoutes);


app.get("/", (req, res) => {
  res.json({
    mensagem: "API do sistema de controle de estoque funcionando!"
  });
});

// Esta rota informa que a API respondeu; não realiza um diagnóstico completo do banco.
app.get("/status", (req, res) => {
  res.json({
    sistema: "Projeto Integrador - Controle de Estoque",
    status: "online"
  });
});

// Inicia a escuta de requisições HTTP na porta configurada.
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});