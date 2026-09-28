/** Aplica a máscara dd/mm/aaaa enquanto o usuário digita */
export const maskDateString = (value: string) => {
  const v = value.replace(/\D/g, "").slice(0, 8)
  if (v.length >= 5) return `${v.slice(0, 2)}/${v.slice(2, 4)}/${v.slice(4)}`
  if (v.length >= 3) return `${v.slice(0, 2)}/${v.slice(2)}`
  return v
}

export const formatDateToPTBR = (date: Date | undefined) => {
  if (!date) return ""
  const d = date.getDate().toString().padStart(2, "0")
  const m = (date.getMonth() + 1).toString().padStart(2, "0")
  const y = date.getFullYear()
  return `${d}/${m}/${y}`
}

export const parseDateFromPTBR = (str: string) => {
  if (str.length !== 10) return undefined
  const [d, m, y] = str.split("/")
  const date = new Date(Number(y), Number(m) - 1, Number(d))
  if (date.getDate() === Number(d) && date.getMonth() === Number(m) - 1) {
    return date
  }
  return undefined
}