/* Envio binário separado: primeiro salva o produto, depois envia sua foto. */
const express = require("express");
const db = require("../database/database");
const imagens = require("../services/imagens");
const router = express.Router();

function localizar(req, res, next) {
  const id = Number(req.params.id);
  if (!Number.isSafeInteger(id) || id <= 0) return res.status(400).json({ mensagem: "ID inválido." });
  req.produto = db.prepare("SELECT * FROM produtos WHERE id = ?").get(id);
  if (!req.produto) return res.status(404).json({ mensagem: "Produto não encontrado." });
  next();
}

// express.raw recebe os bytes com limite de 2 MiB; não utiliza multipart/form-data.
router.put("/:id/imagem", localizar, express.raw({ type: ["image/png", "image/jpeg"], limit: "2mb" }), (req, res, next) => {
  let novaImagem;
  try {
    if (!Buffer.isBuffer(req.body) || !req.body.length) return res.status(400).json({ mensagem: "Envie uma imagem PNG ou JPEG." });
    novaImagem = imagens.salvar(req.body, req.get("Content-Type").split(";")[0].trim().toLowerCase());
    if (!novaImagem) return res.status(400).json({ mensagem: "O conteúdo não corresponde a uma imagem PNG ou JPEG." });
    db.prepare("UPDATE produtos SET imagem = ? WHERE id = ?").run(novaImagem, req.produto.id);
    // Só apaga a foto anterior após confirmar a gravação no banco.
    imagens.remover(req.produto.imagem);
    res.json({ mensagem: "Foto salva com sucesso!", imagem: novaImagem });
  } catch (erro) {
    if (novaImagem) imagens.remover(novaImagem);
    next(erro);
  }
});

router.delete("/:id/imagem", localizar, (req, res) => {
  db.prepare("UPDATE produtos SET imagem = NULL WHERE id = ?").run(req.produto.id);
  imagens.remover(req.produto.imagem);
  res.json({ mensagem: "Foto removida.", imagem: null });
});

// Converte falhas do leitor binário em respostas JSON para a interface.
router.use((erro, req, res, next) => {
  if (erro.type === "entity.too.large") return res.status(413).json({ mensagem: "A foto deve ter até 2 MB." });
  console.error("Falha na imagem:", erro.message);
  res.status(500).json({ mensagem: "Não foi possível salvar a foto. Tente novamente." });
});
module.exports = router;
