import type { Bin, DashboardStats } from './types'
import { MOCK_BINS } from './data'

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`/api/proxy/catchall?path=${encodeURIComponent(path)}`, { cache:'no-store' })
  if (!res.ok) throw new Error(`API error ${res.status}`)
  return res.json()
}

export async function getAllBins(): Promise<Bin[]> {
  try {
    const data = await apiFetch<any>('bin')
    const realBins: Bin[] = Array.isArray(data) ? data : (data.bins ?? data.items ?? [])

    if (!realBins.length) return MOCK_BINS

    // BIN_005 is the real sensor — use real AWS data for it only
    // All other bins keep mock data (so CRITICAL/HIGH routes work in demo)
    // Return only properly formatted bins (BIN_XXX format), no test/duplicate entries
    const validBins = realBins.filter((b: Bin) => /^BIN_\d+$/.test(b.bin_id))
    const mapped = validBins.map((b: Bin) => ({...b, is_real: true}))
    // Merge with MOCK_BINS: use real data if it has readings, else keep mock values for demo
    return MOCK_BINS.map(mock => {
      const real = mapped.find(r => r.bin_id === mock.bin_id)
      if (real && (Number(real.gas_ppm) > 0 || Number(real.fill_level) > 0)) return real
      return mock
    })
  } catch {
    return MOCK_BINS
  }
}

export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    return await apiFetch<DashboardStats>('dashboard/stats')
  } catch {
    const { MOCK_STATS } = await import('./data')
    return MOCK_STATS
  }
}

export async function getBinById(binId: string): Promise<Bin> {
  return apiFetch<Bin>(`bin/${binId}`)
}


export async function collectBin(binId: string): Promise<any> {
  const res = await fetch('/api/collect', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ bin_id: binId }),
  })
  return res.json()
}
