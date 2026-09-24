# Projeto Integrador — códigos comentados, associações e fotos

Esta versão reúne os códigos comentados e a integração pendente da tela de produtos. O App.jsx agora importa e exibe Produtos.jsx, com formulário, listagem, edição e exclusão. O App.css inclui os estilos de select e textarea, foco e erros de validação.

O App.jsx ficou menor porque a tabela de produtos já existe em Produtos.jsx. A formatação de preços permanece nesse componente. A nova aba Associações permite criar vínculos, consultar nos dois sentidos e remover somente a associação. O backend e as dependências foram preservados.

## Versão pronta para substituir

Use os arquivos deste pacote, inclusive App.jsx e App.css. A ressalva do pacote anterior sobre manter esses dois arquivos não se aplica mais. Não é necessário combinar trechos manualmente.

## Como aplicar no projeto existente

1. Pare os servidores com Ctrl + C e salve os arquivos abertos no VS Code.
2. Faça uma cópia de segurança da pasta do projeto antes de substituir arquivos.
3. Extraia o ZIP em uma pasta separada para conferir o conteúdo.
4. Copie as pastas backend e frontend deste pacote para C:\Users\User\projeto-integrador-estoque, aceitando substituir os arquivos de mesmo nome. A pasta frontend deve ficar ao lado de backend, não dentro dela.
5. Mescle as pastas backend e frontend: não exclua as pastas atuais. O pacote não inclui node_modules, banco, package-lock.json nem todos os arquivos públicos do projeto.
6. Não é necessário reinstalar pacotes: as dependências não foram alteradas.
7. Reinicie backend e frontend, cada um em um terminal, com npm.cmd run dev.

Este pacote é uma revisão dos arquivos enviados, não uma distribuição completa independente.

## Mapa dos arquivos

| Arquivo | Responsabilidade |
| --- | --- |
| backend/app.js | Inicia Express, carrega o banco e registra os prefixos das rotas. |
| backend/src/database/database.js | Abre SQLite e cria tabelas ausentes. |
| backend/src/routes/produtos.routes.js | Consulta, cadastra, atualiza e exclui produtos. |
| backend/src/routes/fornecedores.routes.js | Consulta, cadastra, atualiza e exclui fornecedores. |
| backend/src/routes/associacoes.routes.js | Cria e remove vínculos; consulta nos dois sentidos. |
| frontend/index.html | Define o elemento root onde o React é montado. |
| frontend/src/main.jsx | Inicializa React, estilos globais e StrictMode. |
| frontend/src/App.jsx | Guarda listas compartilhadas, totais e navegação. |
| frontend/src/Produtos.jsx | Implementa formulário e lista de produtos; conectado ao App. |
| frontend/src/Associacoes.jsx | Cria e consulta vínculos, trata duplicidade e confirma a remoção. |
| frontend/src/Fornecedores.jsx | Implementa formulário e lista de fornecedores. |
| frontend/src/index.css | Define os estilos globais. |
| frontend/src/App.css | Define os estilos dos painéis, tabelas e formulários. |
| frontend/vite.config.js | Configura o plugin React no Vite. |

## Como os dados percorrem o sistema

O usuário preenche o formulário. O componente guarda os valores em useState e valida os campos. Ao salvar, fetch envia JSON à API. O Express lê req.body, executa a rota e grava no SQLite. A API responde em JSON; o componente mostra a mensagem e chama aoAtualizar, função recebida do App, para renovar listas e contadores.

- **useState:** mantém valores entre renderizações e fornece uma função para atualizá-los.
- **props:** dados e funções que um componente pai passa a um filho.
- **useEffect:** executa uma ação após a montagem; aqui inicia a consulta. StrictMode pode repetir efeitos em desenvolvimento.
- **event.preventDefault():** evita o envio tradicional do formulário e a recarga da página.
- **async/await:** aguarda operações assíncronas, como receber uma resposta HTTP.
- **Promise.all:** aguarda várias operações iniciadas em paralelo.
- **JSON.stringify / resposta.json:** convertem, respectivamente, objeto em JSON e resposta JSON em dados JavaScript.
- **req.body / req.params:** corpo enviado e parâmetros presentes na URL.
- **prepare e ?:** separam o comando SQL de seus valores. all consulta várias linhas; get consulta uma; run executa gravações.
- **lastInsertRowid / changes:** identificam a linha inserida e a quantidade de linhas alteradas.
- **chave composta:** o par produto_id + fornecedor_id é único na tabela intermediária.
- **ON DELETE CASCADE:** excluir um cadastro remove seus vínculos, mas preserva os cadastros do outro lado.

## Métodos e respostas da API

| Método ou status | Papel neste projeto |
| --- | --- |
| GET | Consultar cadastros ou associações. |
| POST | Criar cadastro ou associação. |
| PUT | Enviar os campos para atualizar um cadastro. |
| DELETE | Excluir cadastro ou vínculo. |
| 200 | Operação concluída, como consulta ou atualização. |
| 201 | Novo registro criado. |
| 400 | Dados enviados não passaram na validação. |
| 404 | Registro ou associação não encontrado. |
| 409 | Duplicidade de código, CNPJ ou vínculo. |

## package.json — explicações sem comentários no JSON

JSON não aceita comentários. Por isso os arquivos foram mantidos intactos e documentados aqui.

### Backend

- name e version: identificação do pacote.
- main: arquivo de entrada declarado (app.js).
- type: commonjs usa require e module.exports.
- scripts.start: node app.js inicia o servidor.
- scripts.dev: nodemon app.js reinicia o servidor ao editar código.
- scripts.test: ainda é o comando padrão que informa não haver teste configurado; não representa uma suíte de testes.
- express: servidor e rotas HTTP; cors: configuração de acesso entre origens; better-sqlite3: acesso ao SQLite.
- nodemon em devDependencies: ferramenta usada durante o desenvolvimento.
- description, keywords e author: metadados ainda não preenchidos; license: declaração de licença do pacote.

### Frontend

- private: impede publicação acidental deste pacote pelo npm.
- type: module usa import e export.
- scripts.dev: vite inicia o servidor da interface.
- scripts.build: vite build gera a versão de distribuição em dist.
- scripts.preview: vite preview serve o resultado do build para conferência local.
- scripts.lint: oxlint faz análise estática do código.
- react e react-dom: componentes e renderização no navegador.
- vite e @vitejs/plugin-react: ferramentas para desenvolvimento e build.
- @types/react e @types/react-dom: definições de tipos para ferramentas de edição e análise.
- O prefixo ^ nas versões permite atualizações dentro de uma faixa compatível; package-lock.json, que não veio no ZIP, registra a resolução exata instalada.

## Limites atuais para entender e apresentar o código

Esta revisão comenta o código e integra a tela de produtos. Estas funcionalidades continuam pendentes no projeto:

- CNPJ é normalizado e verificado pelo tamanho, sem cálculo dos dígitos verificadores.
- Há validações de campos, mas não uma validação completa de todos os tipos e formatos recebidos pela API.
- Produtos verifica código numérico no formulário; essa mesma regra ainda não está implementada no backend.
- Fotos PNG e JPEG de até 2 MiB podem ser enviadas, substituídas e removidas. A API confere MIME e assinatura binária; não realiza decodificação completa da imagem nem varredura antivírus.
- Associações estão disponíveis na API e na interface, nos dois sentidos de consulta.
- CREATE TABLE IF NOT EXISTS não migra estruturas de tabelas existentes.
- Não há autenticação nesta versão; CORS não é controle de login.

## Verificação desta revisão

Os arquivos JavaScript passaram na verificação de sintaxe do Node. A integração JSX e as regras CSS alteradas foram revisadas no código; os JSON foram validados e o SQL executado em memória. Também foi conferido que o App importa e renderiza Produtos com a lista e o callback de atualização, e que os estilos contemplam select e textarea. Nesta etapa foram alterados App.jsx e App.css, adicionado Associacoes.jsx e atualizado este guia. Não houve mudança no backend nem nas dependências.

O frontend foi compilado com esbuild em um ambiente temporário. Testes React em DOM simulado, com API simulada, passaram para campos obrigatórios, IDs numéricos, duplicidade, consultas nos dois sentidos, cancelamento e remoção, lista vazia, falha e recuperação da consulta. O build Vite com as versões exatas do projeto e a execução integrada ao banco real ainda precisam ser conferidos no seu computador. Nenhuma dependência de teste foi adicionada ao projeto entregue. O pacote não inclui dependências instaladas nem lockfiles.

### Conferência no seu computador

1. Inicie o backend em um terminal, dentro de backend, com npm.cmd run dev.
2. Inicie o frontend em outro terminal, dentro de frontend, com npm.cmd run dev.
3. Abra o endereço mostrado pelo Vite. A aba Produtos deve mostrar o formulário e a lista.
4. Cadastre um produto de teste, edite seu preço e confira a tabela e o contador.
5. Escolha Outro na categoria e confirme que aparece o campo para digitá-la.
6. Exclua o produto de teste e confira se o contador volta ao valor anterior.
7. Abra Fornecedores e confira se o formulário e a lista continuam aparecendo.

### Como testar Associações

1. Mantenha pelo menos um produto e um fornecedor cadastrados.
2. Abra a aba Associações, selecione os dois cadastros e clique em Associar fornecedor.
3. Repita o mesmo vínculo: a API deverá informar que ele já existe.
4. Em Consultar vínculos, escolha Produto, selecione o produto e clique em Consultar.
5. Mude para Fornecedor e confirme a consulta inversa.
6. Clique em Remover vínculo e teste primeiro Cancelar. O vínculo deve permanecer.
7. Remova confirmando. A associação deve desaparecer; produto e fornecedor continuam cadastrados.

O formulário de consulta usa envio explícito: mudar uma seleção limpa o resultado anterior, e Consultar busca os dados atuais. Durante uma requisição, os controles da tela ficam bloqueados para evitar operações sobrepostas. Uma falha ao recarregar a lista após uma gravação é comunicada separadamente do sucesso da gravação.

## Ordem sugerida de estudo

Leia backend/app.js, database.js e uma rota de cadastro. Depois leia main.jsx, App.jsx e Fornecedores.jsx. Por fim, compare Produtos.jsx com Fornecedores.jsx e estude as consultas INNER JOIN em associacoes.routes.js.

## Fotos dos produtos

O formulário permite selecionar PNG ou JPEG de até 2 MiB (2.097.152 bytes), visualizar e salvar. O cadastro continua funcionando sem foto. Para alterar uma foto existente, edite o produto e selecione outro arquivo; para removê-la, marque Remover foto ao salvar. Cancelar edição descarta a seleção local.

O fluxo tem duas requisições: primeiro POST/PUT com os dados em JSON, depois PUT /produtos/:id/imagem com o arquivo binário e Content-Type image/png ou image/jpeg. Não é usado multipart/form-data. DELETE /produtos/:id/imagem remove somente a foto. O cadastro JSON não aceita mais alterar o caminho da imagem: no cadastro ele começa nulo e, na edição, é preservado.

A API cria a pasta backend/uploads, gera nomes UUID e guarda no banco um caminho como /uploads/UUID.png. Express disponibiliza essa pasta. O serviço imagens.js confere a assinatura e grava o arquivo; imagens.routes.js limita o tamanho, atualiza o banco e remove a foto antiga após o sucesso. A exclusão do produto limpa sua foto. Não há alteração na estrutura do banco nem novas dependências.

Se o cadastro for salvo mas o upload falhar, o formulário fica em edição e avisa que os dados já foram gravados. Assim, uma nova tentativa não cria outro produto.

### Instalação desta etapa

Pare os dois servidores. A atualização desta etapa substitui backend/app.js, backend/src/routes/produtos.routes.js, frontend/src/Produtos.jsx, frontend/src/App.css e este guia; adiciona backend/src/routes/imagens.routes.js, backend/src/services/imagens.js e backend/uploads/.gitignore. Use o comando PowerShell fornecido na conversa, que cria backup antes de copiar. Reinicie backend e frontend com npm.cmd run dev em terminais separados. Não é necessário npm install.

As fotos são ignoradas pelo Git. Para transferir os dados para outro computador ou fazer backup, copie tanto estoque.db quanto backend/uploads, com o servidor parado. O ZIP de código não contém seus dados pessoais nem fotos cadastradas.

### Verificação desta etapa

Os testes HTTP passaram com Express e SQLite temporário: cadastro, envio e acesso à foto, preservação ao editar, rejeição de formato e tamanho, substituição, remoção, limpeza ao excluir produto e produto inexistente. O frontend compilou com esbuild; testes React com DOM/API simulados verificaram prévia e recuperação de falha de upload sem duplicar cadastro. Esses testes usaram dependências temporárias, não alteraram os package.json entregues. O Vite com seu lockfile e a aparência no navegador devem ser conferidos no seu computador.

Para conferir localmente: cadastre com foto, recarregue a página, edite apenas o preço, substitua a foto, remova a foto e exclua um produto de teste. Confirme as miniaturas e as mensagens em cada etapa.
