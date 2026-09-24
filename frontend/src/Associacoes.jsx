/* Relaciona cadastros existentes: um produto pode ter vários fornecedores e vice-versa. */
import { useState } from "react";

const API = "http://localhost:3000/associacoes";

export default function Associacoes({ produtos, fornecedores, carregando }) {
  const [produtoId, setProdutoId] = useState("");
  const [fornecedorId, setFornecedorId] = useState("");
  // O tipo define o sentido da consulta; o ID identifica o cadastro escolhido.
  const [tipo, setTipo] = useState("produto");
  const [consultaId, setConsultaId] = useState("");
  const [resultado, setResultado] = useState(null);
  const [ocupado, setOcupado] = useState(false);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");
  const bloqueado = ocupado || carregando;
  const opcoes = tipo === "produto" ? produtos : fornecedores;

  // Centraliza a leitura do JSON e transforma erros HTTP em mensagens da API.
  async function requisitar(caminho, opcoes = {}) {
    const resposta = await fetch(`${API}${caminho}`, opcoes);
    const dados = await resposta.json();
    if (!resposta.ok) throw new Error(dados.mensagem || "Não foi possível concluir a operação.");
    return dados;
  }

  async function carregarConsulta() {
    setResultado(null);
    const dados = await requisitar(`/${tipo}/${consultaId}`);
    setResultado(dados);
  }

  async function consultar(evento) {
    evento.preventDefault();
    setErro("");
    setMensagem("");
    if (!consultaId) {
      setErro("Selecione um cadastro para consultar.");
      return;
    }
    setOcupado(true);
    try {
      await carregarConsulta();
    } catch (falha) {
      setErro(falha instanceof TypeError ? "Não foi possível consultar. Verifique o backend e tente novamente." : falha.message);
    } finally {
      setOcupado(false);
    }
  }

  // Após uma gravação confirmada, renova a consulta sem confundir falha de leitura com falha de gravação.
  async function renovarConsulta() {
    if (!consultaId) return;
    try {
      await carregarConsulta();
    } catch {
      setErro("O vínculo foi alterado, mas a consulta não pôde ser atualizada. Clique em Consultar novamente.");
    }
  }

  async function associar(evento) {
    evento.preventDefault();
    setErro("");
    setMensagem("");
    if (!produtoId || !fornecedorId) {
      setErro("Selecione um produto e um fornecedor.");
      return;
    }
    setOcupado(true);
    try {
      // Select fornece texto; o backend espera IDs numéricos no corpo JSON.
      const dados = await requisitar("", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ produto_id: Number(produtoId), fornecedor_id: Number(fornecedorId) })
      });
      setMensagem(dados.mensagem);
      await renovarConsulta();
    } catch (falha) {
      setErro(falha instanceof TypeError ? "Não foi possível confirmar a operação. Consulte os vínculos antes de repetir." : falha.message);
    } finally {
      setOcupado(false);
    }
  }

  async function remover(item) {
    // A consulta inversa muda a origem de cada ID, mas a URL sempre recebe produto/fornecedor.
    const produto = tipo === "produto" ? resultado.produto : item;
    const fornecedor = tipo === "produto" ? item : resultado.fornecedor;
    if (!window.confirm(`Remover o vínculo entre "${produto.nome}" e "${fornecedor.nome_empresa}"? Os cadastros serão mantidos.`)) return;
    setOcupado(true);
    setErro("");
    setMensagem("");
    try {
      const dados = await requisitar(`/${produto.id}/${fornecedor.id}`, { method: "DELETE" });
      setMensagem(dados.mensagem);
      await renovarConsulta();
    } catch (falha) {
      setErro(falha instanceof TypeError ? "Não foi possível confirmar a remoção. Consulte os vínculos antes de repetir." : falha.message);
    } finally {
      setOcupado(false);
    }
  }

  // Limpa o resultado ao mudar a seleção para não mostrar vínculos do cadastro anterior.
  function mudarConsulta(valor, novoTipo = tipo) {
    setTipo(novoTipo);
    setConsultaId(valor);
    setResultado(null);
    setErro("");
    setMensagem("");
  }

  const vinculados = resultado ? (tipo === "produto" ? resultado.fornecedores : resultado.produtos) : [];

  return (
    <section className="painel" aria-busy={bloqueado}>
      <h2>Associações entre produtos e fornecedores</h2>
      <p>Vincule os fornecedores que atendem cada produto e consulte essas relações.</p>
      {mensagem && <div className="sucesso" role="status">{mensagem}</div>}
      {erro && <div className="erro" role="alert">{erro}</div>}
      {carregando && <p role="status">Atualizando cadastros...</p>}
      {!carregando && (!produtos.length || !fornecedores.length) && (
        <p>Cadastre pelo menos um produto e um fornecedor para criar um vínculo.</p>
      )}

      <form onSubmit={associar} noValidate>
        <fieldset className="formulario-grid" disabled={bloqueado}>
          <legend className="legenda-formulario">Novo vínculo — selecione os dois cadastros.</legend>
          <div className="campo">
            <label htmlFor="associacao-produto">Produto *</label>
            <select id="associacao-produto" value={produtoId} onChange={(e) => setProdutoId(e.target.value)} required>
              <option value="">Selecione um produto</option>
              {produtos.map((p) => <option key={p.id} value={p.id}>{p.nome} — ID {p.id}</option>)}
            </select>
          </div>
          <div className="campo">
            <label htmlFor="associacao-fornecedor">Fornecedor *</label>
            <select id="associacao-fornecedor" value={fornecedorId} onChange={(e) => setFornecedorId(e.target.value)} required>
              <option value="">Selecione um fornecedor</option>
              {fornecedores.map((f) => <option key={f.id} value={f.id}>{f.nome_empresa} — ID {f.id}</option>)}
            </select>
          </div>
          <div className="acoes formulario-acoes">
            <button className="botao" type="submit" disabled={!produtos.length || !fornecedores.length}>Associar fornecedor</button>
          </div>
        </fieldset>
      </form>

      <h2 className="titulo-lista">Consultar vínculos</h2>
      <form onSubmit={consultar} noValidate>
        <fieldset className="formulario-grid" disabled={bloqueado}>
          <legend className="legenda-formulario">Escolha o sentido da consulta e o cadastro.</legend>
          <div className="campo">
            <label htmlFor="consulta-tipo">Consultar por</label>
            <select id="consulta-tipo" value={tipo} onChange={(e) => mudarConsulta("", e.target.value)}>
              <option value="produto">Produto — ver fornecedores</option>
              <option value="fornecedor">Fornecedor — ver produtos</option>
            </select>
          </div>
          <div className="campo">
            <label htmlFor="consulta-cadastro">{tipo === "produto" ? "Produto" : "Fornecedor"} *</label>
            <select id="consulta-cadastro" value={consultaId} onChange={(e) => mudarConsulta(e.target.value)} required>
              <option value="">Selecione um cadastro</option>
              {opcoes.map((item) => <option key={item.id} value={item.id}>{tipo === "produto" ? item.nome : item.nome_empresa} — ID {item.id}</option>)}
            </select>
          </div>
          <div className="acoes formulario-acoes">
            <button className="botao" type="submit">Consultar</button>
          </div>
        </fieldset>
      </form>

      {/* null representa ausência de consulta; uma lista vazia significa consulta concluída sem vínculos. */}
      {resultado && (
        <div className="resultado-associacoes">
          <h3>{tipo === "produto" ? `Fornecedores de ${resultado.produto.nome}` : `Produtos de ${resultado.fornecedor.nome_empresa}`}</h3>
          {vinculados.length === 0 ? <p role="status">Nenhum vínculo encontrado.</p> : (
            <div className="tabela-container">
              <table>
                <thead><tr>
                  <th scope="col">{tipo === "produto" ? "Fornecedor" : "Produto"}</th>
                  <th scope="col">{tipo === "produto" ? "CNPJ" : "Código de barras"}</th>
                  <th scope="col">Ação</th>
                </tr></thead>
                <tbody>{vinculados.map((item) => (
                  <tr key={item.id}>
                    <td>{tipo === "produto" ? item.nome_empresa : item.nome}</td>
                    <td>{tipo === "produto" ? item.cnpj : item.codigo_barras || "Não informado"}</td>
                    <td><button className="botao-excluir" type="button" disabled={bloqueado} onClick={() => remover(item)}>Remover vínculo</button></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
