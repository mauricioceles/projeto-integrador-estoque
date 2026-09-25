// Máscaras alteram a apresentação. A API continua normalizando o CNPJ para números.
export function formatarCnpj(valor) {
  return String(valor ?? "").replace(/\D/g, "").slice(0, 14)
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2}\.\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{2}\.\d{3}\.\d{3})(\d)/, "$1/$2")
    .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
}

export function formatarTelefone(valor) {
  const numeros = String(valor ?? "").replace(/\D/g, "").slice(0, 11);
  if (!numeros) return "";
  if (numeros.length <= 2) return `(${numeros}`;
  const ddd = numeros.slice(0, 2);
  const local = numeros.slice(2);
  const corte = local.length > 8 ? 5 : 4;
  return `(${ddd}) ${local.slice(0, corte)}${local.length > corte ? `-${local.slice(corte)}` : ""}`;
}
