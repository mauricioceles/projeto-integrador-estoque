const express = require("express");
const cors = require("cors");

require("./src/database/database");

const fornecedoresRoutes = require("./src/routes/fornecedores.routes");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.use("/fornecedores", fornecedoresRoutes);


app.get("/", (req, res) => {
  res.json({
    mensagem: "API do sistema de controle de estoque funcionando!"
  });
});

app.get("/status", (req, res) => {
  res.json({
    sistema: "Projeto Integrador - Controle de Estoque",
    status: "online"
  });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});