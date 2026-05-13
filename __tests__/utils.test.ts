// Unit tests for utility functions

// ── timeAgo ──
function timeAgo(ts: string): string {
  const s = Math.floor((Date.now() - parseInt(ts)*1000) / 1000)
  if (s < 60) return `${s}s ago`
  if (s < 3600) return `${Math.floor(s/60)}m ago`
  if (s < 86400) return `${Math.floor(s/3600)}h ago`
  return `${Math.floor(s/86400)}d ago`
}

// ── Priority classification ──
function classifyPriority(gas_ppm: number, fill_level: number): string {
  const health_risk = gas_ppm * 0.70 + fill_level * 0.30
  if (health_risk >= 110) return 'CRITICAL'
  if (health_risk >= 70) return 'HIGH'
  if (health_risk >= 30) return 'MEDIUM'
  return 'LOW'
}

// ── normalizeStats ──
function normalizeStats(raw: any) {
  return {
    total_bins: raw.total_bins ?? raw.totalBins ?? 0,
    avg_health_risk: raw.avg_health_risk ?? raw.avgHealthRisk ?? 0,
    critical_bins: raw.critical_bins ?? [],
    high_priority_bins: raw.high_priority_bins ?? [],
  }
}

describe('timeAgo()', () => {
  it('returns seconds ago for recent timestamp', () => {
    const ts = String(Math.floor(Date.now()/1000) - 30)
    expect(timeAgo(ts)).toMatch(/s ago/)
  })

  it('returns minutes ago for 5 min old timestamp', () => {
    const ts = String(Math.floor(Date.now()/1000) - 300)
    expect(timeAgo(ts)).toBe('5m ago')
  })

  it('returns hours ago for 2 hour old timestamp', () => {
    const ts = String(Math.floor(Date.now()/1000) - 7200)
    expect(timeAgo(ts)).toBe('2h ago')
  })

  it('returns days ago for old timestamp', () => {
    const ts = String(Math.floor(Date.now()/1000) - 86400)
    expect(timeAgo(ts)).toBe('1d ago')
  })
})

describe('classifyPriority()', () => {
  it('returns CRITICAL for high gas and fill', () => {
    expect(classifyPriority(650, 100)).toBe('CRITICAL')
  })

  it('returns HIGH for moderate readings', () => {
    expect(classifyPriority(109, 82)).toBe('HIGH')
  })

  it('returns MEDIUM for low-moderate readings', () => {
    expect(classifyPriority(50, 65)).toBe('MEDIUM')
  })

  it('returns LOW for minimal readings', () => {
    expect(classifyPriority(10, 20)).toBe('LOW')
  })
})

describe('normalizeStats()', () => {
  it('normalizes total_bins from raw data', () => {
    const result = normalizeStats({ total_bins: 6 })
    expect(result.total_bins).toBe(6)
  })

  it('falls back to totalBins if total_bins missing', () => {
    const result = normalizeStats({ totalBins: 5 })
    expect(result.total_bins).toBe(5)
  })

  it('returns empty arrays for missing bin lists', () => {
    const result = normalizeStats({})
    expect(result.critical_bins).toEqual([])
    expect(result.high_priority_bins).toEqual([])
  })

  it('preserves critical_bins array', () => {
    const bins = [{ bin_id: 'BIN_001' }]
    const result = normalizeStats({ critical_bins: bins })
    expect(result.critical_bins).toEqual(bins)
  })
})
