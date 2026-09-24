/* O banco guarda o caminho público; o arquivo fica na pasta uploads do backend. */
const fs = require("node:fs");
const path = require("node:path");
const { randomUUID } = require("node:crypto");
const pasta = path.resolve(__dirname, "../../uploads");
fs.mkdirSync(pasta, { recursive: true });

function salvar(buffer, tipo) {
  // Confere a assinatura binária: extensão e MIME enviados pelo cliente não bastam.
  const png = buffer.length >= 24 && buffer.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]));
  const jpg = buffer.length >= 4 && buffer[0] === 255 && buffer[1] === 216 && buffer[2] === 255;
  const extensao = tipo === "image/png" && png ? "png" : tipo === "image/jpeg" && jpg ? "jpg" : null;
  if (!extensao) return null;
  const nome = `${randomUUID()}.${extensao}`;
  fs.writeFileSync(path.join(pasta, nome), buffer, { flag: "wx" });
  return `/uploads/${nome}`;
}

function remover(url) {
  // Só remove nomes gerados por este módulo, nunca caminhos recebidos livremente.
  if (typeof url !== "string" || !/^\/uploads\/[0-9a-f-]{36}\.(png|jpg)$/.test(url)) return;
  try { fs.unlinkSync(path.join(pasta, path.basename(url))); }
  catch (erro) { if (erro.code !== "ENOENT") console.error("Falha ao limpar imagem:", erro.message); }
}
module.exports = { pasta, salvar, remover };
