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

    // Merge: real bins override mock, mock fills the rest
    const realMap = new Map(realBins.map((b: Bin) => [b.bin_id, {...b, is_real: true}]))
    const merged = MOCK_BINS.map(mock => {
      const real = realMap.get(mock.bin_id)
      return real ? {...mock, ...real, is_real: true} : mock
    })
    return merged
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
