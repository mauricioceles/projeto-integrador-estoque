# Controle de Estoque — Projeto Integrador

**FACULDADE GRAN** — https://faculdade.grancursosonline.com.br/

**Projeto Disciplina Projeto Integrador**

Autor: Maurício Celes.

Sistema acadêmico para cadastrar produtos e fornecedores e gerenciar a relação muitos para muitos entre eles.

## Funcionalidades

- Criar, listar, editar e excluir produtos e fornecedores.
- Impedir duplicidade de código de barras e CNPJ; apresentar erros por campo.
- Categorias predefinidas e opção Outro, quantidade, preço, descrição e validade opcional.
- Enviar, substituir e remover fotos PNG/JPEG de até 2 MiB.
- Associar e desassociar fornecedores; consultar os vínculos nos dois sentidos.
- Ver nome, código, descrição e foto do produto na tela de associações.
- Buscar produtos por nome/código e fornecedores por empresa/CNPJ.
- Abrir os fornecedores de um produto diretamente pela lista de produtos.

## Tecnologias e organização

Backend: Node.js, Express e better-sqlite3 (SQLite). Frontend: React e Vite. O Vite foi adotado como ferramenta de desenvolvimento e compilação do React, em lugar do Create React App exemplificado no roteiro. Não foi adotado Nest.js ou Next.js, que são opcionais no enunciado.

| Caminho | Responsabilidade |
| --- | --- |
| backend/app.js | Configura Express e inicia a API na porta 3000 |
| backend/src/routes/ | Rotas de produtos, fornecedores, associações e imagens |
| backend/src/database/database.js | Abre o banco e cria tabelas ausentes |
| backend/src/services/imagens.js | Armazena e remove fotos locais |
| backend/uploads/ | Fotos cadastradas; ignoradas pelo Git |
| frontend/src/App.jsx | Navegação, listas compartilhadas e contadores |
| frontend/src/Produtos.jsx | Formulário, fotos e lista de produtos |
| frontend/src/Fornecedores.jsx | Formulário e lista de fornecedores |
| frontend/src/Associacoes.jsx | Detalhes dos produtos e gestão dos vínculos |
| frontend/src/busca.js | Comparações para busca sem acentos |
| frontend/src/formatacao.js | Máscaras de CNPJ e telefone |
| LEIA-ME.md | Guia didático e histórico das alterações |

A relação usa a tabela produto_fornecedor com chave composta (produto_id, fornecedor_id). Excluir um cadastro remove os seus vínculos; não exclui os cadastros do outro lado.

## Como executar no Windows

Pré-requisito: Node.js com npm. O projeto foi executado pelo autor com Node 24.19.0. No PowerShell usamos npm.cmd para evitar o bloqueio de npm.ps1 observado na máquina de desenvolvimento.

Abra um terminal na pasta backend:

```powershell
npm.cmd install
npm.cmd run dev
```

Abra outro terminal na pasta frontend:

```powershell
npm.cmd install
npm.cmd run dev
```

As instalações são necessárias na primeira execução. Atualizações que não alterem as dependências dispensam reinstalação. Mantenha os dois servidores em execução. Abra no navegador o endereço indicado pelo Vite (normalmente http://localhost:5173). API: http://localhost:3000/status.

O banco backend/src/database/estoque.db e as tabelas são criados automaticamente se não existirem. Nesse caso as listas começam vazias. A pasta de fotos também é criada automaticamente.

## Compilar a interface

Dentro de frontend:

```powershell
npm.cmd run build
```

O resultado fica em frontend/dist. O comando npm.cmd run preview permite conferir esse build localmente; o backend precisa continuar ligado. Esta configuração usa localhost e destina-se a execução local; não é uma publicação de produção na internet.

## API e testes no Insomnia

| Recurso | Métodos e caminhos |
| --- | --- |
| Produtos | GET/POST /produtos; GET/PUT/DELETE /produtos/:id |
| Fornecedores | GET/POST /fornecedores; GET/PUT/DELETE /fornecedores/:id |
| Vínculos | POST /associacoes; DELETE /associacoes/:produtoId/:fornecedorId |
| Consultas | GET /associacoes/produto/:id; GET /associacoes/fornecedor/:id |
| Foto | PUT/DELETE /produtos/:id/imagem |

Cadastros e associações recebem JSON. A criação do vínculo recebe produto_id e fornecedor_id numéricos. A foto usa corpo binário com Content-Type image/png ou image/jpeg, não multipart/form-data.

Teste cadastro válido, campos obrigatórios, preço/estoque inválidos, chaves duplicadas, edição e exclusão. Nas associações, teste múltiplos fornecedores para o mesmo produto, consulta inversa, vínculo duplicado e remoção. Na interface, teste máscara, busca, categoria Outro, detalhes do produto, upload e persistência após recarregar.

O script popular-estoque.cjs, entregue separadamente, cadastra 12 produtos, 6 fornecedores e 18 vínculos fictícios; com --testar verifica dez cenários de validação e consultas bidirecionais. Ele usa a API em execução e preserva os cadastros anteriores. O autor confirmou que esses testes e a compilação Vite passaram antes dos últimos ajustes visuais. Esta revisão passou pela compilação esbuild e testes React em DOM/API simulados; a conferência visual e o novo build Vite devem ser executados após a instalação.

Não há uma suíte npm test configurada no backend. Os testes temporários usados durante o desenvolvimento não estão incluídos neste pacote de código.

## Dados e limites

- Para backup, pare o backend e copie estoque.db e a pasta uploads juntos. Não envie dados pessoais ou fotos ao repositório público.
- CNPJ: máscara e validação de presença/tamanho/duplicidade; não há validação de dígitos verificadores. As máscaras atuais são numéricas e o telefone usa DDD com 10 ou 11 dígitos.
- Fotos: há limite de tamanho e verificação de assinatura binária, mas não decodificação completa nem antivírus.
- A busca filtra os dados já carregados, sem paginação.
- O sistema não implementa autenticação ou controle de acesso.

## GitHub e entrega

O endereço do repositório remoto ainda precisa ser confirmado no computador do autor com git remote -v. Commits locais não comprovam publicação. Antes da entrega, conferir o repositório, os arquivos exigidos no ambiente acadêmico e os testes visuais. O roteiro sugere repositório público, mas a visibilidade deve ser escolhida pelo autor.
