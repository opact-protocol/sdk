export const base64urlToBigInt = (base64url: string) => {
  // Passo 1: Converter a string base64-url para a forma padrão de base64
  let base64 = base64url.replace(/-/g, '+').replace(/_/g, '/')
  const padding = '='.repeat((4 - base64.length % 4) % 4)
  base64 += padding

  // Passo 2: Decodificar a string base64 para obter bytes
  const bytes = atob(base64)

  // Passo 3: Converter esses bytes em um bigint
  let bigint = BigInt(0)
  for (let i = 0; i < bytes.length; i++) {
    bigint = (bigint << BigInt(8)) + BigInt(bytes.charCodeAt(i))
  }

  return bigint
}
