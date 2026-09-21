const Database = require("better-sqlite3");
const path = require("path");

const databasePath = path.join(__dirname, "estoque.db");
const db = new Database(databasePath);

db.pragma("foreign_keys = ON");

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

module.exports = db;