/* Conexão compartilhada com SQLite e definição das três tabelas do sistema. */
const Database = require("better-sqlite3");
const path = require("path");
const fs = require("node:fs");

// __dirname fixa o banco nesta pasta, independentemente de onde o Node foi iniciado.
// DATA_DIR deve apontar para um volume persistente na hospedagem.
// Sem essa variável, mantém o mesmo banco usado no computador do autor.
const pastaDados = process.env.DATA_DIR ? path.resolve(process.env.DATA_DIR) : __dirname;
fs.mkdirSync(pastaDados, { recursive: true });
const databasePath = path.join(pastaDados, "estoque.db");
// Abre o arquivo existente ou cria um novo banco se ele ainda não existir.
const db = new Database(databasePath);

// Ativa a verificação de chaves estrangeiras e as exclusões em cascata.
db.pragma("foreign_keys = ON");

// IF NOT EXISTS preserva tabelas existentes; não atualiza sua estrutura automaticamente.
// NOT NULL exige valor; UNIQUE impede duplicidade; CURRENT_TIMESTAMP registra a criação em UTC.
// A tabela intermediária representa a relação muitos-para-muitos. Sua chave composta
// impede repetir o mesmo par. CASCADE remove vínculos, não o outro cadastro.
db.exec(`
  CREATE TABLE IF NOT EXISTS fornecedores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome_empresa TEXT NOT NULL,
    cnpj TEXT NOT NULL UNIQUE,
    endereco TEXT NOT NULL,
    telefone TEXT NOT NULL,
    email TEXT NOT NULL,
    contato_principal TEXT NOT NULL,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS produtos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    codigo_barras TEXT UNIQUE,
    descricao TEXT NOT NULL,
    preco REAL NOT NULL DEFAULT 0,
    quantidade_estoque INTEGER NOT NULL DEFAULT 0,
    categoria TEXT NOT NULL,
    data_validade TEXT,
    imagem TEXT,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS produto_fornecedor (
    produto_id INTEGER NOT NULL,
    fornecedor_id INTEGER NOT NULL,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (produto_id, fornecedor_id),

    FOREIGN KEY (produto_id)
      REFERENCES produtos(id)
      ON DELETE CASCADE,

    FOREIGN KEY (fornecedor_id)
      REFERENCES fornecedores(id)
      ON DELETE CASCADE
  );
`);

// Exporta a mesma conexão para as rotas que acessam o banco.
module.exports = db;