const express = require("express");
const db = require("../database/database");

const router = express.Router();

function somenteNumeros(valor = "") {
  return String(valor).replace(/\D/g, "");
}

function validarFornecedor(dados) {
  const erros = {};

  if (!dados.nome_empresa?.trim()) {
    erros.nome_empresa = "O nome da empresa é obrigatório.";
  }

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
router.get("/", (req, res) => {
  const fornecedores = db
    .prepare("SELECT * FROM fornecedores ORDER BY nome_empresa")
    .all();

  res.json(fornecedores);
});

// Consultar um fornecedor pelo ID
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

  const fornecedorCriado = db
    .prepare("SELECT * FROM fornecedores WHERE id = ?")
    .get(resultado.lastInsertRowid);

  res.status(201).json({
    mensagem: "Fornecedor cadastrado com sucesso!",
    fornecedor: fornecedorCriado
  });
});

// Atualizar fornecedor
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

module.exports = router;