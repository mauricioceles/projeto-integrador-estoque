/* Operações de cadastro, consulta, edição e exclusão de produtos. */
const express = require("express");
const db = require("../database/database");
const imagens = require("../services/imagens");

// Agrupa rotas; req contém a requisição e res constrói a resposta HTTP.
const router = express.Router();

// Retorna erros por campo, utilizados pela interface para orientar o preenchimento.
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

  // Converte a quantidade para verificar se é inteira e não negativa.
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
// GET lista registros: all() retorna um array, inclusive vazio quando não há cadastros.
router.get("/", (req, res) => {
  const produtos = db
    .prepare("SELECT * FROM produtos ORDER BY nome")
    .all();

  res.json(produtos);
});

// Consultar produto pelo ID
// O parâmetro :id vem da URL; get() busca um registro e 404 indica ausência.
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
// POST cria um registro: 400 indica dados inválidos, 409 duplicidade e 201 criação.
router.post("/", (req, res) => {
  const erros = validarProduto(req.body);

  if (Object.keys(erros).length > 0) {
    return res.status(400).json({
      mensagem: "Existem campos inválidos.",
      erros
    });
  }

  // Código vazio vira null: o SQLite permite vários valores NULL numa coluna UNIQUE.
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

  // Os ? são parâmetros; run() grava os dados sem concatená-los ao comando SQL.
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
    null
  );

  // lastInsertRowid permite consultar o produto que acabou de ser inserido.
  const produtoCriado = db
    .prepare("SELECT * FROM produtos WHERE id = ?")
    .get(resultado.lastInsertRowid);

  res.status(201).json({
    mensagem: "Produto cadastrado com sucesso!",
    produto: produtoCriado
  });
});

// Atualizar produto
// PUT recebe todos os campos do cadastro para atualizar o registro existente.
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
    // Exclui o próprio produto da verificação de duplicidade durante a edição.
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
    produto.imagem,
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
// DELETE remove o cadastro; changes informa quantas linhas foram afetadas.
router.delete("/:id", (req, res) => {
  const produto = db.prepare("SELECT * FROM produtos WHERE id = ?").get(req.params.id);
  const resultado = db
    .prepare("DELETE FROM produtos WHERE id = ?")
    .run(req.params.id);

  if (resultado.changes === 0) {
    return res.status(404).json({
      mensagem: "Produto não encontrado."
    });
  }

  imagens.remover(produto.imagem);
  res.json({
    mensagem: "Produto excluído com sucesso!"
  });
});

// Disponibiliza estas rotas para registro no app.js.
module.exports = router;