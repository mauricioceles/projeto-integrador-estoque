/* Tela de produtos: formulário e lista compartilham as operações da API. */
import { useEffect, useRef, useState } from "react";

// Base da API usada por fetch para enviar os dados do formulário.
const API = "http://localhost:3000";

// Valores iniciais; uma cópia é usada ao limpar o formulário.
const vazio = {
  nome: "",
  codigo_barras: "",
  descricao: "",
  preco: "0",
  quantidade_estoque: "0",
  categoria: "Eletrônicos",
  data_validade: ""
};

const categorias = ["Eletrônicos", "Alimentos", "Vestuário"];

const moeda = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL"
});

// Recebe a lista por props e uma função do App para atualizar os dados após gravações.
export default function Produtos({ produtos, aoAtualizar }) {
  // Campos controlados: o estado guarda os valores que aparecem nos inputs.
  const [formulario, setFormulario] = useState({ ...vazio });
  // null significa novo cadastro; um ID indica edição de um registro existente.
  const [editandoId, setEditandoId] = useState(null);
  // A foto atual vem do banco; o arquivo selecionado só é enviado ao salvar.
  const [imagemAtual, setImagemAtual] = useState(null);
  const [arquivoFoto, setArquivoFoto] = useState(null);
  const [previaFoto, setPreviaFoto] = useState("");
  const [removerFoto, setRemoverFoto] = useState(false);
  const entradaFoto = useRef(null);

  // Libera a URL temporária ao trocar a foto ou sair da tela.
  useEffect(() => {
    if (!arquivoFoto) { setPreviaFoto(""); return; }
    const url = URL.createObjectURL(arquivoFoto);
    setPreviaFoto(url);
    return () => URL.revokeObjectURL(url);
  }, [arquivoFoto]);

  function limparSelecaoFoto() {
    setArquivoFoto(null);
    setRemoverFoto(false);
    if (entradaFoto.current) entradaFoto.current.value = "";
  }

  function selecionarFoto(evento) {
    const arquivo = evento.target.files?.[0];
    setArquivoFoto(null);
    setErros((atuais) => ({ ...atuais, imagem: "" }));
    if (!arquivo) return;
    if (!["image/png", "image/jpeg"].includes(arquivo.type) || arquivo.size > 2 * 1024 * 1024) {
      setErros((atuais) => ({ ...atuais, imagem: "Escolha PNG ou JPEG de até 2 MB." }));
      evento.target.value = "";
      return;
    }
    setArquivoFoto(arquivo);
    setRemoverFoto(false);
  }

  function enderecoFoto(caminho) {
    return typeof caminho === "string" && caminho.startsWith("/uploads/") ? `${API}${caminho}` : "";
  }
  const [categoriaSelecionada, setCategoriaSelecionada] =
    useState("Eletrônicos");
  // Separa erros de campos, mensagem de sucesso e erro geral de comunicação.
  const [erros, setErros] = useState({});
  const [mensagem, setMensagem] = useState("");
  const [erroGeral, setErroGeral] = useState("");
  // Desabilita o formulário e ações desta tela durante uma operação.
  const [ocupado, setOcupado] = useState(false);

  // Volta ao modo de cadastro, sem alterar registros já salvos no banco.
  function limpar() {
    limparSelecaoFoto();
    setFormulario({ ...vazio });
    setEditandoId(null);
    setImagemAtual(null);
    setCategoriaSelecionada("Eletrônicos");
    setErros({});
  }

  // name identifica o campo; ...atual preserva os demais valores sem modificar o objeto anterior.
  function alterar(evento) {
    const { name, value } = evento.target;
    setFormulario((atual) => ({ ...atual, [name]: value }));
    setErros((atuais) => ({ ...atuais, [name]: "" }));
  }

  // A opção Outro abre espaço para uma categoria digitada pelo usuário.
  function trocarCategoria(evento) {
    const valor = evento.target.value;
    setCategoriaSelecionada(valor);
    setFormulario((atual) => ({
      ...atual,
      categoria: valor === "Outro" ? "" : valor
    }));
    setErros((atuais) => ({ ...atuais, categoria: "" }));
  }

  // Impede o envio tradicional do formulário para manter a página aberta e usar fetch.
  async function salvar(evento) {
    evento.preventDefault();
    setMensagem("");
    setErroGeral("");

    // Validação local melhora o retorno ao usuário; a API também precisa validar os dados.
    const falhas = {};

    for (const campo of ["nome", "descricao", "categoria"]) {
      if (!formulario[campo].trim()) {
        falhas[campo] = "Preencha este campo.";
      }
    }

    if (
      formulario.codigo_barras.trim() &&
      !/^\d+$/.test(formulario.codigo_barras.trim())
    ) {
      falhas.codigo_barras = "Use somente números.";
    }

    // Inputs fornecem texto; convertemos os valores numéricos antes de validar e enviar.
    const preco = Number(formulario.preco);
    const quantidade = Number(formulario.quantidade_estoque);

    if (
      !formulario.preco.trim() ||
      !Number.isFinite(preco) ||
      preco < 0
    ) {
      falhas.preco = "Informe um preço igual ou maior que zero.";
    }

    if (
      !formulario.quantidade_estoque.trim() ||
      !Number.isSafeInteger(quantidade) ||
      quantidade < 0
    ) {
      falhas.quantidade_estoque =
        "Informe uma quantidade inteira igual ou maior que zero.";
    }

    setErros(falhas);
    if (Object.keys(falhas).length > 0) return;

    setOcupado(true);

    // POST cria e PUT atualiza. JSON.stringify transforma o objeto no corpo JSON da requisição.
    try {
      const resposta = await fetch(
        editandoId ? `${API}/produtos/${editandoId}` : `${API}/produtos`,
        {
          method: editandoId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formulario,
            preco,
            quantidade_estoque: quantidade,
            data_validade: formulario.data_validade || null,
            imagem: imagemAtual
          })
        }
      );

      const dados = await resposta.json();

      // Trata respostas de erro da API; 409 é exibido junto ao campo que causou duplicidade.
      if (!resposta.ok) {
        setErros(
          dados.erros ||
          (resposta.status === 409
            ? { codigo_barras: dados.mensagem }
            : {})
        );
        setErroGeral(dados.mensagem || "Não foi possível salvar.");
        return;
      }

      // O produto já foi salvo. Se a foto falhar, mantemos o ID para evitar um cadastro duplicado.
      if (arquivoFoto || removerFoto) {
        try {
          const respostaFoto = await fetch(`${API}/produtos/${dados.produto.id}/imagem`, {
            method: removerFoto ? "DELETE" : "PUT",
            ...(removerFoto ? {} : { headers: { "Content-Type": arquivoFoto.type }, body: arquivoFoto })
          });
          const foto = await respostaFoto.json();
          if (!respostaFoto.ok) throw new Error(foto.mensagem || "Falha no envio da foto.");
        } catch (falha) {
          setEditandoId(dados.produto.id);
          setImagemAtual(dados.produto.imagem || null);
          setMensagem("Os dados do produto foram salvos.");
          setErroGeral(`Não foi possível confirmar a alteração da foto. ${falha.message} Confira a lista antes de tentar novamente.`);
          await aoAtualizar();
          return;
        }
      }
      limpar();
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
  function editar(produto) {
    limparSelecaoFoto();
    setFormulario({
      nome: produto.nome,
      codigo_barras: produto.codigo_barras || "",
      descricao: produto.descricao,
      preco: String(produto.preco),
      quantidade_estoque: String(produto.quantidade_estoque),
      categoria: produto.categoria,
      data_validade: produto.data_validade || ""
    });

    setCategoriaSelecionada(
      categorias.includes(produto.categoria) ? produto.categoria : "Outro"
    );
    setImagemAtual(produto.imagem || null);
    setEditandoId(produto.id);
    setErros({});
    setMensagem("");
    setErroGeral("");
  }

  // Pede confirmação antes de remover o cadastro e seus vínculos.
  async function excluir(produto) {
    if (!window.confirm(
      `Excluir "${produto.nome}"? As associações com fornecedores também serão removidas.`
    )) return;

    setOcupado(true);
    setMensagem("");
    setErroGeral("");

    try {
      const resposta = await fetch(`${API}/produtos/${produto.id}`, {
        method: "DELETE"
      });
      const dados = await resposta.json();

      if (!resposta.ok) {
        setErroGeral(dados.mensagem || "Não foi possível excluir.");
        return;
      }

      if (editandoId === produto.id) limpar();
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

  // Reutiliza a estrutura label/input/erro. Atributos aria relacionam o campo à mensagem.
  // extras permite configurar min, step e required conforme o campo.
  function campo(nome, rotulo, tipo = "text", extras = {}) {
    return (
      <div className="campo">
        <label htmlFor={`produto-${nome}`}>{rotulo}</label>
        <input
          id={`produto-${nome}`}
          name={nome}
          type={tipo}
          value={formulario[nome]}
          onChange={alterar}
          aria-invalid={Boolean(erros[nome])}
          aria-describedby={erros[nome] ? `produto-erro-${nome}` : undefined}
          {...extras}
        />
        {erros[nome] && (
          <small className="erro-campo" id={`produto-erro-${nome}`}>
            {erros[nome]}
          </small>
        )}
      </div>
    );
  }

  return (
    <section className="painel">
      <h2>{editandoId ? "Editar produto" : "Cadastro de produto"}</h2>

      {mensagem && <div className="sucesso" role="status">{mensagem}</div>}
      {erroGeral && <div className="erro" role="alert">{erroGeral}</div>}

      {/* noValidate usa nossas mensagens; disabled bloqueia o fieldset durante o envio. */}
      <form onSubmit={salvar} noValidate>
        <fieldset className="formulario-grid" disabled={ocupado}>
          <legend className="legenda-formulario">
            Campos com * são obrigatórios.
          </legend>

          {campo("nome", "Nome do produto *", "text", { required: true })}
          {campo("codigo_barras", "Código de barras", "text", {
            inputMode: "numeric"
          })}
          {campo("preco", "Preço (R$) *", "number", {
            min: "0", step: "0.01", required: true
          })}
          {campo("quantidade_estoque", "Quantidade em estoque *", "number", {
            min: "0", step: "1", required: true
          })}

          <div className="campo">
            <label htmlFor="categoria-selecao">Categoria *</label>
            <select
              id="categoria-selecao"
              value={categoriaSelecionada}
              onChange={trocarCategoria}
            >
              {categorias.map((categoria) => (
                <option key={categoria}>{categoria}</option>
              ))}
              <option>Outro</option>
            </select>
          </div>

          {categoriaSelecionada === "Outro" &&
            campo("categoria", "Informe a categoria *", "text", {
              required: true
            })}

          {campo("data_validade", "Data de validade (se aplicável)", "date")}

          <div className="campo formulario-acoes">
            <label htmlFor="produto-descricao">Descrição *</label>
            <textarea
              id="produto-descricao"
              name="descricao"
              rows={3}
              value={formulario.descricao}
              onChange={alterar}
              required
              aria-invalid={Boolean(erros.descricao)}
              aria-describedby={erros.descricao ? "erro-descricao" : undefined}
            />
            {erros.descricao && (
              <small className="erro-campo" id="erro-descricao">
                {erros.descricao}
              </small>
            )}
          </div>

          <div className="campo formulario-acoes">
            <label htmlFor="produto-foto">Foto do produto (opcional)</label>
            <input id="produto-foto" ref={entradaFoto} type="file" accept="image/png,image/jpeg"
              onChange={selecionarFoto} aria-describedby="foto-ajuda foto-erro" aria-invalid={Boolean(erros.imagem)} />
            <small id="foto-ajuda">PNG ou JPEG de até 2 MB. A foto será enviada ao salvar.</small>
            <small id="foto-erro" className="erro-campo">{erros.imagem}</small>
            {!removerFoto && (previaFoto || enderecoFoto(imagemAtual)) && (
              <img className="foto-previa" src={previaFoto || enderecoFoto(imagemAtual)} alt="Prévia da foto do produto" />
            )}
            {arquivoFoto && <button type="button" className="aba" onClick={limparSelecaoFoto}>Cancelar seleção da foto</button>}
            {imagemAtual && <label>
              <input type="checkbox" checked={removerFoto} onChange={(e) => {
                setRemoverFoto(e.target.checked);
                setArquivoFoto(null);
                if (entradaFoto.current) entradaFoto.current.value = "";
              }} /> Remover foto ao salvar
            </label>}
          </div>

          <div className="acoes formulario-acoes">
            <button className="botao" type="submit">
              {ocupado
                ? "Aguarde..."
                : editandoId ? "Salvar alterações" : "Cadastrar produto"}
            </button>
            {editandoId && (
              <button className="aba" type="button" onClick={limpar}>
                Cancelar edição
              </button>
            )}
          </div>
        </fieldset>
      </form>

      <h2 className="titulo-lista">Produtos cadastrados</h2>

      {produtos.length === 0 ? (
        <p>Nenhum produto cadastrado.</p>
      ) : (
        <div className="tabela-container">
          <table>
            <thead>
              <tr>
                <th scope="col">Foto</th>
                <th scope="col">Produto</th>
                <th scope="col">Código de barras</th>
                <th scope="col">Categoria</th>
                <th scope="col">Estoque</th>
                <th scope="col">Preço</th>
                <th scope="col">Ações</th>
              </tr>
            </thead>
            <tbody>
              {produtos.map((produto) => (
                <tr key={produto.id}>
                  <td>{enderecoFoto(produto.imagem) ? (
                    <img className="foto-miniatura" src={enderecoFoto(produto.imagem)} alt={`Foto de ${produto.nome}`} loading="lazy" />
                  ) : "Sem foto"}</td>
                  <td>{produto.nome}</td>
                  <td>{produto.codigo_barras || "Não informado"}</td>
                  <td>{produto.categoria}</td>
                  <td>{produto.quantidade_estoque}</td>
                  <td>{moeda.format(produto.preco)}</td>
                  <td>
                    <div className="acoes">
                      <button
                        className="aba"
                        disabled={ocupado}
                        onClick={() => editar(produto)}
                      >
                        Editar
                      </button>
                      <button
                        className="botao-excluir"
                        disabled={ocupado}
                        onClick={() => excluir(produto)}
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