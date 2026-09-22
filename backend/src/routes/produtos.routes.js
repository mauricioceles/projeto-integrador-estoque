const express = require("express");
const db = require("../database/database");

const router = express.Router();

function validarProduto(dados) {
  const erros = {};

  if (!dados.nome?.trim()) {
    erros.nome = "O nome do produto é obrigatório.";
  }

  if (!dados.descricao?.trim()) {
    erros.descricao = "A descrição é obrigatória.";
  }

  if (!dados.categoria?.trim()) {
    erros.categoria = "A categoria é obrigatória.";
  }

  const quantidade = Number(dados.quantidade_estoque);

  if (
    dados.quantidade_estoque === "" ||
    dados.quantidade_estoque === undefined ||
    !Number.isInteger(quantidade) ||
    quantidade < 0
  ) {
    erros.quantidade_estoque =
      "A quantidade deve ser um número inteiro igual ou maior que zero.";
  }

  const preco = Number(dados.preco);

  if (
    dados.preco === "" ||
    dados.preco === undefined ||
    Number.isNaN(preco) ||
    preco < 0
  ) {
    erros.preco = "O preço deve ser um número igual ou maior que zero.";
  }

  return erros;
}

// Listar produtos
router.get("/", (req, res) => {
  const produtos = db
    .prepare("SELECT * FROM produtos ORDER BY nome")
    .all();

  res.json(produtos);
});

// Consultar produto pelo ID
router.get("/:id", (req, res) => {
  const produto = db
    .prepare("SELECT * FROM produtos WHERE id = ?")
    .get(req.params.id);

  if (!produto) {
    return res.status(404).json({
      mensagem: "Produto não encontrado."
    });
  }

  res.json(produto);
});

// Cadastrar produto
router.post("/", (req, res) => {
  const erros = validarProduto(req.body);

  if (Object.keys(erros).length > 0) {
    return res.status(400).json({
      mensagem: "Existem campos inválidos.",
      erros
    });
  }

  const codigoBarras = req.body.codigo_barras?.trim() || null;

  if (codigoBarras) {
    const produtoExistente = db
      .prepare("SELECT id FROM produtos WHERE codigo_barras = ?")
      .get(codigoBarras);

    if (produtoExistente) {
      return res.status(409).json({
        mensagem: "Produto com este código de barras já está cadastrado!"
      });
    }
  }

  const resultado = db.prepare(`
    INSERT INTO produtos (
      nome,
      codigo_barras,
      descricao,
      preco,
      quantidade_estoque,
      categoria,
      data_validade,
      imagem
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    req.body.nome.trim(),
    codigoBarras,
    req.body.descricao.trim(),
    Number(req.body.preco),
    Number(req.body.quantidade_estoque),
    req.body.categoria.trim(),
    req.body.data_validade || null,
    req.body.imagem || null
  );

  const produtoCriado = db
    .prepare("SELECT * FROM produtos WHERE id = ?")
    .get(resultado.lastInsertRowid);

  res.status(201).json({
    mensagem: "Produto cadastrado com sucesso!",
    produto: produtoCriado
  });
});

// Atualizar produto
router.put("/:id", (req, res) => {
  const produto = db
    .prepare("SELECT * FROM produtos WHERE id = ?")
    .get(req.params.id);

  if (!produto) {
    return res.status(404).json({
      mensagem: "Produto não encontrado."
    });
  }

  const erros = validarProduto(req.body);

  if (Object.keys(erros).length > 0) {
    return res.status(400).json({
      mensagem: "Existem campos inválidos.",
      erros
    });
  }

  const codigoBarras = req.body.codigo_barras?.trim() || null;

  if (codigoBarras) {
    const codigoExistente = db.prepare(`
      SELECT id
      FROM produtos
      WHERE codigo_barras = ? AND id <> ?
    `).get(codigoBarras, req.params.id);

    if (codigoExistente) {
      return res.status(409).json({
        mensagem: "Produto com este código de barras já está cadastrado!"
      });
    }
  }

  db.prepare(`
    UPDATE produtos
    SET
      nome = ?,
      codigo_barras = ?,
      descricao = ?,
      preco = ?,
      quantidade_estoque = ?,
      categoria = ?,
      data_validade = ?,
      imagem = ?
    WHERE id = ?
  `).run(
    req.body.nome.trim(),
    codigoBarras,
    req.body.descricao.trim(),
    Number(req.body.preco),
    Number(req.body.quantidade_estoque),
    req.body.categoria.trim(),
    req.body.data_validade || null,
    req.body.imagem || null,
    req.params.id
  );

  const produtoAtualizado = db
    .prepare("SELECT * FROM produtos WHERE id = ?")
    .get(req.params.id);

  res.json({
    mensagem: "Produto atualizado com sucesso!",
    produto: produtoAtualizado
  });
});

// Excluir produto
router.delete("/:id", (req, res) => {
  const resultado = db
    .prepare("DELETE FROM produtos WHERE id = ?")
    .run(req.params.id);

  if (resultado.changes === 0) {
    return res.status(404).json({
      mensagem: "Produto não encontrado."
    });
  }

  res.json({
    mensagem: "Produto excluído com sucesso!"
  });
});

module.exports = router;