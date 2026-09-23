import { useEffect, useState } from "react";
import "./App.css";

const API = "http://localhost:3000";

function App() {
  const [pagina, setPagina] = useState("produtos");
  const [produtos, setProdutos] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  async function carregarDados() {
    setCarregando(true);
    setErro("");

    try {
      const [respostaProdutos, respostaFornecedores] = await Promise.all([
        fetch(`${API}/produtos`),
        fetch(`${API}/fornecedores`)
      ]);

      if (!respostaProdutos.ok || !respostaFornecedores.ok) {
        throw new Error("Não foi possível consultar os dados do servidor.");
      }

      const listaProdutos = await respostaProdutos.json();
      const listaFornecedores = await respostaFornecedores.json();

      setProdutos(listaProdutos);
      setFornecedores(listaFornecedores);
    } catch (error) {
      setErro(
        `${error.message} Verifique se o backend está rodando na porta 3000.`
      );
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarDados();
  }, []);

  const moeda = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  });

  return (
    <div className="sistema">
      <header className="cabecalho">
        <div>
          <p className="identificacao">PROJETO INTEGRADOR</p>
          <h1>Controle de Estoque</h1>
          <p>Organize seus produtos e fornecedores.</p>
        </div>

        <button
          className="botao"
          onClick={carregarDados}
          disabled={carregando}
        >
          {carregando ? "Carregando..." : "Atualizar dados"}
        </button>
      </header>

      <main>
        {erro && (
          <div className="erro" role="alert">
            {erro}
          </div>
        )}

        <section className="resumo" aria-label="Resumo dos cadastros">
          <article className="cartao">
            <span>Produtos cadastrados</span>
            <strong>{carregando || erro ? "—" : produtos.length}</strong>
          </article>

          <article className="cartao">
            <span>Fornecedores cadastrados</span>
            <strong>{carregando || erro ? "—" : fornecedores.length}</strong>
          </article>
        </section>

        <nav className="navegacao" aria-label="Cadastros">
          <button
            className={pagina === "produtos" ? "aba ativa" : "aba"}
            aria-pressed={pagina === "produtos"}
            onClick={() => setPagina("produtos")}
          >
            Produtos
          </button>

          <button
            className={pagina === "fornecedores" ? "aba ativa" : "aba"}
            aria-pressed={pagina === "fornecedores"}
            onClick={() => setPagina("fornecedores")}
          >
            Fornecedores
          </button>
        </nav>

        <section className="painel" aria-busy={carregando}>
          <h2>{pagina === "produtos" ? "Produtos" : "Fornecedores"}</h2>

          {carregando ? (
            <p>Consultando os cadastros...</p>
          ) : erro ? (
            <p>Os dados estão indisponíveis. Tente atualizar novamente.</p>
          ) : pagina === "produtos" ? (
            produtos.length === 0 ? (
              <p>Nenhum produto cadastrado.</p>
            ) : (
              <div className="tabela-container">
                <table>
                  <thead>
                    <tr>
                      <th scope="col">Produto</th>
                      <th scope="col">Código de barras</th>
                      <th scope="col">Categoria</th>
                      <th scope="col">Estoque</th>
                      <th scope="col">Preço</th>
                    </tr>
                  </thead>
                  <tbody>
                    {produtos.map((produto) => (
                      <tr key={produto.id}>
                        <td>{produto.nome}</td>
                        <td>{produto.codigo_barras || "Não informado"}</td>
                        <td>{produto.categoria}</td>
                        <td>{produto.quantidade_estoque}</td>
                        <td>{moeda.format(produto.preco)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          ) : fornecedores.length === 0 ? (
            <p>Nenhum fornecedor cadastrado.</p>
          ) : (
            <div className="tabela-container">
              <table>
                <thead>
                  <tr>
                    <th scope="col">Empresa</th>
                    <th scope="col">CNPJ</th>
                    <th scope="col">Contato</th>
                    <th scope="col">Telefone</th>
                    <th scope="col">E-mail</th>
                  </tr>
                </thead>
                <tbody>
                  {fornecedores.map((fornecedor) => (
                    <tr key={fornecedor.id}>
                      <td>{fornecedor.nome_empresa}</td>
                      <td>{fornecedor.cnpj}</td>
                      <td>{fornecedor.contato_principal}</td>
                      <td>{fornecedor.telefone}</td>
                      <td>{fornecedor.email}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;