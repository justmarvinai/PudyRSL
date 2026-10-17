const nf = new Intl.NumberFormat('en-US')

export const fmt = (n: number) => nf.format(Math.round(n))

/** 63000000 → "63M", 1410000 → "1.41M", 28000 → "28k". */
export function compact(n: number): string {
  const abs = Math.abs(n)
  if (abs >= 1_000_000) return `${trim(n / 1_000_000)}M`
  if (abs >= 10_000) return `${trim(n / 1_000)}k`
  return fmt(n)
}

function trim(v: number): string {
  const s = v.toFixed(v >= 100 ? 0 : 2)
  return s.replace(/\.?0+$/, '')
}

export const pct = (done: number, total: number) => (total <= 0 ? 0 : Math.round((done / total) * 100))

export const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))

export const plural = (n: number, one: string, many = `${one}s`) => `${fmt(n)} ${n === 1 ? one : many}`
