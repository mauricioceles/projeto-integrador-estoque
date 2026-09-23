/* Tela de fornecedores: formulário e lista compartilham as operações da API. */
import { useState } from "react";

// Base da API usada por fetch para enviar os dados do formulário.
const API = "http://localhost:3000";

// Valores iniciais; uma cópia é usada ao limpar o formulário.
const formularioVazio = {
  nome_empresa: "",
  cnpj: "",
  endereco: "",
  telefone: "",
  email: "",
  contato_principal: ""
};

// Cada entrada define a chave enviada à API, o rótulo e o tipo de input.
const campos = [
  ["nome_empresa", "Nome da empresa", "text"],
  ["cnpj", "CNPJ", "text"],
  ["endereco", "Endereço completo", "text"],
  ["telefone", "Telefone", "tel"],
  ["email", "E-mail", "email"],
  ["contato_principal", "Contato principal", "text"]
];

// Recebe a lista por props e uma função do App para atualizar os dados após gravações.
export default function Fornecedores({ fornecedores, aoAtualizar }) {
  // Campos controlados: o estado guarda os valores que aparecem nos inputs.
  const [formulario, setFormulario] = useState({ ...formularioVazio });
  // null significa novo cadastro; um ID indica edição de um registro existente.
  const [editandoId, setEditandoId] = useState(null);
  // Separa erros de campos, mensagem de sucesso e erro geral de comunicação.
  const [erros, setErros] = useState({});
  const [mensagem, setMensagem] = useState("");
  const [erroGeral, setErroGeral] = useState("");
  // Desabilita o formulário e ações desta tela durante uma operação.
  const [ocupado, setOcupado] = useState(false);

  // Volta ao modo de cadastro, sem alterar registros já salvos no banco.
  function limparFormulario() {
    setFormulario({ ...formularioVazio });
    setEditandoId(null);
    setErros({});
  }

  // name identifica o campo; ...atual preserva os demais valores sem modificar o objeto anterior.
  function alterarCampo(evento) {
    const { name, value } = evento.target;

    setFormulario((atual) => ({
      ...atual,
      [name]: value
    }));

    setErros((atuais) => ({
      ...atuais,
      [name]: ""
    }));
  }

  // Impede o envio tradicional do formulário para manter a página aberta e usar fetch.
  async function salvar(evento) {
    evento.preventDefault();
    setMensagem("");
    setErroGeral("");
    setErros({});

    // Validação local melhora o retorno ao usuário; a API também precisa validar os dados.
    const errosLocais = {};

    for (const [nome, rotulo] of campos) {
      if (!formulario[nome].trim()) {
        errosLocais[nome] = `${rotulo} é obrigatório.`;
      }
    }

    if (Object.keys(errosLocais).length > 0) {
      setErros(errosLocais);
      return;
    }

    setOcupado(true);

    // POST cria e PUT atualiza. JSON.stringify transforma o objeto no corpo JSON da requisição.
    try {
      const endereco = editandoId
        ? `${API}/fornecedores/${editandoId}`
        : `${API}/fornecedores`;

      const resposta = await fetch(endereco, {
        method: editandoId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formulario)
      });

      const dados = await resposta.json();

      // Trata respostas de erro da API; 409 é exibido junto ao campo que causou duplicidade.
      if (!resposta.ok) {
        setErros(
          dados.erros ||
          (resposta.status === 409 ? { cnpj: dados.mensagem } : {})
        );
        setErroGeral(dados.mensagem || "Não foi possível salvar.");
        return;
      }

      limparFormulario();
      setMensagem(dados.mensagem);
      // Após a confirmação da API, consulta novamente as listas e os contadores no App.
      await aoAtualizar();
    // Falha de comunicação não prova que a gravação falhou: consulte a lista antes de repetir.
    } catch {
      setErroGeral(
        "Não foi possível confirmar o salvamento. Atualize a lista antes de tentar novamente."
      );
    // Libera as ações mesmo quando a operação termina com erro.
    } finally {
      setOcupado(false);
    }
  }

  // Preenche o formulário com o registro escolhido; a alteração só é enviada ao salvar.
  function editar(fornecedor) {
    const dados = {};

    for (const [nome] of campos) {
      dados[nome] = fornecedor[nome] || "";
    }

    setFormulario(dados);
    setEditandoId(fornecedor.id);
    setErros({});
    setMensagem("");
    setErroGeral("");
  }

  // Pede confirmação antes de remover o cadastro e seus vínculos.
  async function excluir(fornecedor) {
    const confirmou = window.confirm(
      `Excluir "${fornecedor.nome_empresa}"? As associações desse fornecedor com produtos também serão removidas.`
    );

    if (!confirmou) return;

    setOcupado(true);
    setMensagem("");
    setErroGeral("");

    try {
      const resposta = await fetch(
        `${API}/fornecedores/${fornecedor.id}`,
        { method: "DELETE" }
      );

      const dados = await resposta.json();

      if (!resposta.ok) {
        setErroGeral(dados.mensagem || "Não foi possível excluir.");
        return;
      }

      if (editandoId === fornecedor.id) {
        limparFormulario();
      }

      setMensagem(dados.mensagem);
      await aoAtualizar();
    } catch {
      setErroGeral(
        "Não foi possível confirmar a exclusão. Atualize a lista para conferir."
      );
    } finally {
      setOcupado(false);
    }
  }

  return (
    <section className="painel">
      <h2>
        {editandoId ? "Editar fornecedor" : "Cadastro de fornecedor"}
      </h2>

      {mensagem && (
        <div className="sucesso" role="status">{mensagem}</div>
      )}

      {erroGeral && (
        <div className="erro" role="alert">{erroGeral}</div>
      )}

      {/* noValidate usa nossas mensagens; disabled bloqueia o fieldset durante o envio. */}
      <form onSubmit={salvar} noValidate>
        <fieldset className="formulario-grid" disabled={ocupado}>
          <legend className="legenda-formulario">
            Todos os campos são obrigatórios.
          </legend>

          {campos.map(([nome, rotulo, tipo]) => (
            <div className="campo" key={nome}>
              <label htmlFor={`fornecedor-${nome}`}>{rotulo}</label>
              <input
                id={`fornecedor-${nome}`}
                name={nome}
                type={tipo}
                value={formulario[nome]}
                onChange={alterarCampo}
                required
                aria-invalid={Boolean(erros[nome])}
                aria-describedby={
                  erros[nome] ? `erro-${nome}` : undefined
                }
              />

              {erros[nome] && (
                <small className="erro-campo" id={`erro-${nome}`}>
                  {erros[nome]}
                </small>
              )}
            </div>
          ))}

          <div className="acoes formulario-acoes">
            <button className="botao" type="submit">
              {ocupado
                ? "Aguarde..."
                : editandoId
                  ? "Salvar alterações"
                  : "Cadastrar fornecedor"}
            </button>

            {editandoId && (
              <button
                className="aba"
                type="button"
                onClick={limparFormulario}
              >
                Cancelar edição
              </button>
            )}
          </div>
        </fieldset>
      </form>

      <h2 className="titulo-lista">Fornecedores cadastrados</h2>

      {fornecedores.length === 0 ? (
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
                <th scope="col">Ações</th>
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
                  <td>
                    <div className="acoes">
                      <button
                        className="aba"
                        disabled={ocupado}
                        onClick={() => editar(fornecedor)}
                      >
                        Editar
                      </button>
                      <button
                        className="botao-excluir"
                        disabled={ocupado}
                        onClick={() => excluir(fornecedor)}
                      >
                        Excluir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}