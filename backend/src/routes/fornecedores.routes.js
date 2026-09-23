/* Operações de cadastro, consulta, edição e exclusão de fornecedores. */
const express = require("express");
const db = require("../database/database");

// Agrupa rotas; req contém a requisição e res constrói a resposta HTTP.
const router = express.Router();

// Remove a máscara do CNPJ para comparar e armazenar um formato uniforme.
function somenteNumeros(valor = "") {
  return String(valor).replace(/\D/g, "");
}

// Retorna erros por campo, utilizados pela interface para orientar o preenchimento.
function validarFornecedor(dados) {
  const erros = {};

  if (!dados.nome_empresa?.trim()) {
    erros.nome_empresa = "O nome da empresa é obrigatório.";
  }

  // A validação atual verifica presença e 14 números; não calcula dígitos verificadores.
  const cnpj = somenteNumeros(dados.cnpj);

  if (!cnpj) {
    erros.cnpj = "O CNPJ é obrigatório.";
  } else if (cnpj.length !== 14) {
    erros.cnpj = "O CNPJ deve conter 14 números.";
  }

  if (!dados.endereco?.trim()) {
    erros.endereco = "O endereço é obrigatório.";
  }

  if (!dados.telefone?.trim()) {
    erros.telefone = "O telefone é obrigatório.";
  }

  if (!dados.email?.trim()) {
    erros.email = "O e-mail é obrigatório.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(dados.email)) {
    erros.email = "Informe um e-mail válido.";
  }

  if (!dados.contato_principal?.trim()) {
    erros.contato_principal = "O contato principal é obrigatório.";
  }

  return erros;
}

// Listar todos os fornecedores
// GET lista registros: all() retorna um array, inclusive vazio quando não há cadastros.
router.get("/", (req, res) => {
  const fornecedores = db
    .prepare("SELECT * FROM fornecedores ORDER BY nome_empresa")
    .all();

  res.json(fornecedores);
});

// Consultar um fornecedor pelo ID
// O parâmetro :id vem da URL; get() busca um registro e 404 indica ausência.
router.get("/:id", (req, res) => {
  const fornecedor = db
    .prepare("SELECT * FROM fornecedores WHERE id = ?")
    .get(req.params.id);

  if (!fornecedor) {
    return res.status(404).json({
      mensagem: "Fornecedor não encontrado."
    });
  }

  res.json(fornecedor);
});

// Cadastrar fornecedor
// POST cria um registro: 400 indica dados inválidos, 409 duplicidade e 201 criação.
router.post("/", (req, res) => {
  const erros = validarFornecedor(req.body);

  if (Object.keys(erros).length > 0) {
    return res.status(400).json({
      mensagem: "Existem campos inválidos.",
      erros
    });
  }

  const cnpj = somenteNumeros(req.body.cnpj);

  const fornecedorExistente = db
    .prepare("SELECT id FROM fornecedores WHERE cnpj = ?")
    .get(cnpj);

  if (fornecedorExistente) {
    return res.status(409).json({
      mensagem: "Fornecedor com esse CNPJ já está cadastrado!"
    });
  }

  // Os ? recebem valores separados do SQL, evitando concatenar dados do usuário na consulta.
  const comando = db.prepare(`
    INSERT INTO fornecedores (
      nome_empresa,
      cnpj,
      endereco,
      telefone,
      email,
      contato_principal
    ) VALUES (?, ?, ?, ?, ?, ?)
  `);

  const resultado = comando.run(
    req.body.nome_empresa.trim(),
    cnpj,
    req.body.endereco.trim(),
    req.body.telefone.trim(),
    req.body.email.trim().toLowerCase(),
    req.body.contato_principal.trim()
  );

  // lastInsertRowid identifica o cadastro recém-criado para devolvê-lo na resposta.
  const fornecedorCriado = db
    .prepare("SELECT * FROM fornecedores WHERE id = ?")
    .get(resultado.lastInsertRowid);

  res.status(201).json({
    mensagem: "Fornecedor cadastrado com sucesso!",
    fornecedor: fornecedorCriado
  });
});

// Atualizar fornecedor
// PUT recebe todos os campos do cadastro para atualizar o registro existente.
router.put("/:id", (req, res) => {
  const fornecedor = db
    .prepare("SELECT * FROM fornecedores WHERE id = ?")
    .get(req.params.id);

  if (!fornecedor) {
    return res.status(404).json({
      mensagem: "Fornecedor não encontrado."
    });
  }

  const erros = validarFornecedor(req.body);

  if (Object.keys(erros).length > 0) {
    return res.status(400).json({
      mensagem: "Existem campos inválidos.",
      erros
    });
  }

  const cnpj = somenteNumeros(req.body.cnpj);

  // Na edição, id <> ? exclui o próprio fornecedor da busca por CNPJ duplicado.
  const cnpjExistente = db
    .prepare(`
      SELECT id
      FROM fornecedores
      WHERE cnpj = ? AND id <> ?
    `)
    .get(cnpj, req.params.id);

  if (cnpjExistente) {
    return res.status(409).json({
      mensagem: "Fornecedor com esse CNPJ já está cadastrado!"
    });
  }

  db.prepare(`
    UPDATE fornecedores
    SET
      nome_empresa = ?,
      cnpj = ?,
      endereco = ?,
      telefone = ?,
      email = ?,
      contato_principal = ?
    WHERE id = ?
  `).run(
    req.body.nome_empresa.trim(),
    cnpj,
    req.body.endereco.trim(),
    req.body.telefone.trim(),
    req.body.email.trim().toLowerCase(),
    req.body.contato_principal.trim(),
    req.params.id
  );

  const fornecedorAtualizado = db
    .prepare("SELECT * FROM fornecedores WHERE id = ?")
    .get(req.params.id);

  res.json({
    mensagem: "Fornecedor atualizado com sucesso!",
    fornecedor: fornecedorAtualizado
  });
});

// Excluir fornecedor
// DELETE remove o cadastro; changes informa quantas linhas foram afetadas.
router.delete("/:id", (req, res) => {
  const resultado = db
    .prepare("DELETE FROM fornecedores WHERE id = ?")
    .run(req.params.id);

  if (resultado.changes === 0) {
    return res.status(404).json({
      mensagem: "Fornecedor não encontrado."
    });
  }

  res.json({
    mensagem: "Fornecedor excluído com sucesso!"
  });
});

// Disponibiliza estas rotas para registro no app.js.
module.exports = router;