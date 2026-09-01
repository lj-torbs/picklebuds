const pesoFormatter = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
})

export const pesoSymbol = "₱"

export function formatCurrency(value: number) {
  return pesoFormatter.format(value)
}
