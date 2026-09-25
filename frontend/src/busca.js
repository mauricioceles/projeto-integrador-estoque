// Compara nomes sem diferenciar maiúsculas ou acentos; não modifica o cadastro.
export function normalizarBusca(valor) {
  return String(valor ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

export function correspondeBusca(nome, codigo, busca) {
  const termo = normalizarBusca(busca);
  if (!termo) return true;
  if (normalizarBusca(nome).includes(termo)) return true;
  // Permite procurar CNPJ com ou sem a máscara de pontos, barra e hífen.
  const numerico = /^[\d./\s-]+$/.test(termo) ? termo.replace(/\D/g, "") : "";
  return Boolean(numerico) && String(codigo ?? "").replace(/\D/g, "").includes(numerico);
}
