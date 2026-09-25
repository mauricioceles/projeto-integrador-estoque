/* Componente principal: mantém listas compartilhadas e escolhe a tela exibida. */
import { useEffect, useState } from "react";
import Fornecedores from "./Fornecedores";
import Produtos from "./Produtos";
import Associacoes from "./Associacoes";
import "./App.css";

// Endereço do backend local; a interface roda em uma porta diferente.
const API = "http://localhost:3000";

export default function App() {
  // useState guarda dados da tela; chamar o setter solicita uma nova renderização.
  const [pagina, setPagina] = useState("produtos");
  const [produtoConsulta, setProdutoConsulta] = useState(null);

  // O atalho leva o ID do produto à tela que já consulta as associações.
  function verFornecedores(id) {
    setProdutoConsulta(id);
    setPagina("associacoes");
  }
  // Estas listas alimentam os contadores e as telas de cadastros.
  const [produtos, setProdutos] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);
  // Controla o aviso de carregamento e evita novos cliques no botão de atualização.
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  // Consulta novamente a API ao abrir a aplicação ou após uma alteração de cadastro.
  async function carregarDados() {
    setCarregando(true);
    setErro("");

    try {
      // Promise.all aguarda as duas consultas iniciadas em paralelo.
      const respostas = await Promise.all([
        fetch(`${API}/produtos`),
        fetch(`${API}/fornecedores`)
      ]);

      // fetch não lança erro por status HTTP 4xx/5xx; por isso verificamos resposta.ok.
      if (respostas.some((resposta) => !resposta.ok)) {
        throw new Error("Falha ao consultar os cadastros.");
      }

      // Converte as respostas JSON em objetos e arrays JavaScript.
      const [listaProdutos, listaFornecedores] = await Promise.all(
        respostas.map((resposta) => resposta.json())
      );

      setProdutos(listaProdutos);
      setFornecedores(listaFornecedores);
    } catch {
      setErro(
        "Não foi possível atualizar os dados. Verifique o backend na porta 3000. As listas podem estar desatualizadas."
      );
    // Executa tanto em caso de sucesso quanto de erro, encerrando o carregamento.
    } finally {
      setCarregando(false);
    }
  }

  // Carrega dados na montagem. No StrictMode de desenvolvimento, o efeito pode repetir.
  useEffect(() => {
    carregarDados();
  }, []);

  // Cada componente organiza seu formulário e sua tabela; o App coordena a navegação.
  // aoAtualizar é uma função passada ao componente filho para renovar as listas do pai.
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
        {erro && <div className="erro" role="alert">{erro}</div>}

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
          <button
            className={pagina === "associacoes" ? "aba ativa" : "aba"}
            aria-pressed={pagina === "associacoes"}
            onClick={() => { setProdutoConsulta(null); setPagina("associacoes"); }}
          >
            Associações
          </button>
        </nav>

        {pagina === "associacoes" ? (
          <Associacoes
            produtoInicial={produtoConsulta}
            produtos={produtos}
            fornecedores={fornecedores}
            carregando={carregando}
          />
        ) : pagina === "fornecedores" ? (
          <Fornecedores
            fornecedores={fornecedores}
            aoAtualizar={carregarDados}
          />
        ) : (
          <Produtos
            aoVerFornecedores={verFornecedores}
            produtos={produtos}
            aoAtualizar={carregarDados}
          />
        )}
      </main>
    </div>
  );
}
