const express = require("express");
const db = require("../database/database");

const router = express.Router();

function idValido(valor) {
  return Number.isSafeInteger(valor) && valor > 0;
}

// Associar fornecedor a produto
router.post("/", (req, res) => {
  const { produto_id, fornecedor_id } = req.body || {};

  if (!idValido(produto_id) || !idValido(fornecedor_id)) {
    return res.status(400).json({
      mensagem: "Informe produto_id e fornecedor_id como números inteiros positivos."
    });
  }

  const produto = db
    .prepare("SELECT id FROM produtos WHERE id = ?")
    .get(produto_id);

  if (!produto) {
    return res.status(404).json({
      mensagem: "Produto não encontrado."
    });
  }

  const fornecedor = db
    .prepare("SELECT id FROM fornecedores WHERE id = ?")
    .get(fornecedor_id);

  if (!fornecedor) {
    return res.status(404).json({
      mensagem: "Fornecedor não encontrado."
    });
  }

  const associacao = db.prepare(`
    SELECT produto_id
    FROM produto_fornecedor
    WHERE produto_id = ? AND fornecedor_id = ?
  `).get(produto_id, fornecedor_id);

  if (associacao) {
    return res.status(409).json({
      mensagem: "Fornecedor já está associado a este produto!"
    });
  }

  db.prepare(`
    INSERT INTO produto_fornecedor (produto_id, fornecedor_id)
    VALUES (?, ?)
  `).run(produto_id, fornecedor_id);

  res.status(201).json({
    mensagem: "Fornecedor associado com sucesso ao produto!",
    associacao: { produto_id, fornecedor_id }
  });
});

// Consultar os fornecedores de um produto
router.get("/produto/:id", (req, res) => {
  const id = Number(req.params.id);

  if (!idValido(id)) {
    return res.status(400).json({
      mensagem: "ID do produto inválido."
    });
  }

  const produto = db
    .prepare("SELECT * FROM produtos WHERE id = ?")
    .get(id);

  if (!produto) {
    return res.status(404).json({
      mensagem: "Produto não encontrado."
    });
  }

  const fornecedores = db.prepare(`
    SELECT f.*
    FROM fornecedores AS f
    INNER JOIN produto_fornecedor AS pf
      ON pf.fornecedor_id = f.id
    WHERE pf.produto_id = ?
    ORDER BY f.nome_empresa
  `).all(id);

  res.json({ produto, fornecedores });
});

// Consultar os produtos de um fornecedor
router.get("/fornecedor/:id", (req, res) => {
  const id = Number(req.params.id);

  if (!idValido(id)) {
    return res.status(400).json({
      mensagem: "ID do fornecedor inválido."
    });
  }

  const fornecedor = db
    .prepare("SELECT * FROM fornecedores WHERE id = ?")
    .get(id);

  if (!fornecedor) {
    return res.status(404).json({
      mensagem: "Fornecedor não encontrado."
    });
  }

  const produtos = db.prepare(`
    SELECT p.*
    FROM produtos AS p
    INNER JOIN produto_fornecedor AS pf
      ON pf.produto_id = p.id
    WHERE pf.fornecedor_id = ?
    ORDER BY p.nome
  `).all(id);

  res.json({ fornecedor, produtos });
});

// Remover apenas a associação
router.delete("/:produtoId/:fornecedorId", (req, res) => {
  const produtoId = Number(req.params.produtoId);
  const fornecedorId = Number(req.params.fornecedorId);

  if (!idValido(produtoId) || !idValido(fornecedorId)) {
    return res.status(400).json({
      mensagem: "IDs de produto e fornecedor inválidos."
    });
  }

  const resultado = db.prepare(`
    DELETE FROM produto_fornecedor
    WHERE produto_id = ? AND fornecedor_id = ?
  `).run(produtoId, fornecedorId);

  if (resultado.changes === 0) {
    return res.status(404).json({
      mensagem: "Associação não encontrada."
    });
  }

  res.json({
    mensagem: "Fornecedor desassociado com sucesso!"
  });
});

module.exports = router;