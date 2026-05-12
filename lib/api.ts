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
    const realMap = new Map(realBins.map((b: Bin) => [b.bin_id, {...b, is_real: true}]))
    const REAL_SENSOR_BINS = ["BIN_005"]
    const merged = MOCK_BINS.map(mock => {
      const real = realMap.get(mock.bin_id)
      if (real && REAL_SENSOR_BINS.includes(mock.bin_id)) {
        return {...mock, ...real, is_real: true}  // real AWS data wins for BIN_005
      }
      return mock  // all others keep mock CRITICAL/HIGH values for demo
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
