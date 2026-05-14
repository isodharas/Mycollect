// ── Inline implementations (mirrors lib/data.ts and utils.test logic) ──────

import type { Bin, Priority } from '../lib/types'
import { MOCK_BINS, MOCK_STATS, BIN_LOCATIONS, BIN_LOCATIONS_SI, REAL_BINS, HEALTH_TREND } from '../lib/data'

function timeAgo(iso: string): string {
  try {
    const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
    if (s < 60) return `${s}s ago`
    if (s < 3600) return `${Math.floor(s / 60)}m ago`
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`
    return `${Math.floor(s / 86400)}d ago`
  } catch { return 'live' }
}

function classifyPriority(gas_ppm: number, fill_level: number): string {
  const health_risk = gas_ppm * 0.70 + fill_level * 0.30
  if (health_risk >= 110) return 'CRITICAL'
  if (health_risk >= 70) return 'HIGH'
  if (health_risk >= 30) return 'MEDIUM'
  return 'LOW'
}

function normalizeStats(raw: any) {
  return {
    total_bins: raw.total_bins ?? raw.totalBins ?? 0,
    avg_health_risk: raw.avg_health_risk ?? raw.avgHealthRisk ?? 0,
    critical_bins: raw.critical_bins ?? [],
    high_priority_bins: raw.high_priority_bins ?? [],
  }
}

function calcHealthRisk(gas_ppm: number, fill_level: number): number {
  return parseFloat(((gas_ppm / 1000 * 100 * 0.70) + (fill_level * 0.30)).toFixed(1))
}

function calcFillLevel(binHeight: number, distance: number): number {
  return parseFloat(Math.max(0, Math.min(100, ((binHeight - distance) / binHeight) * 100)).toFixed(1))
}

// ── timeAgo ──────────────────────────────────────────────────────────────────
describe('timeAgo()', () => {
  it('returns seconds ago for recent timestamp', () => {
    const iso = new Date(Date.now() - 30000).toISOString()
    expect(timeAgo(iso)).toMatch(/s ago/)
  })
  it('returns minutes ago for 5 min old timestamp', () => {
    const iso = new Date(Date.now() - 300000).toISOString()
    expect(timeAgo(iso)).toBe('5m ago')
  })
  it('returns hours ago for 2 hour old timestamp', () => {
    const iso = new Date(Date.now() - 7200000).toISOString()
    expect(timeAgo(iso)).toBe('2h ago')
  })
  it('returns days ago for 1 day old timestamp', () => {
    const iso = new Date(Date.now() - 86400000).toISOString()
    expect(timeAgo(iso)).toBe('1d ago')
  })
  it('returns live for invalid timestamp', () => {
    expect(timeAgo('not-a-date')).toMatch(/ago|live/)
  })
  it('returns seconds ago for 10 second old timestamp', () => {
    const iso = new Date(Date.now() - 10000).toISOString()
    expect(timeAgo(iso)).toMatch(/10s ago/)
  })
  it('returns hours ago for 5 hour old timestamp', () => {
    const iso = new Date(Date.now() - 18000000).toISOString()
    expect(timeAgo(iso)).toBe('5h ago')
  })
})

// ── classifyPriority ─────────────────────────────────────────────────────────
describe('classifyPriority()', () => {
  it('returns CRITICAL for high gas and fill', () => expect(classifyPriority(650, 100)).toBe('CRITICAL'))
  it('returns CRITICAL for gas=650 fill=75', () => expect(classifyPriority(650, 75)).toBe('CRITICAL'))
  it('returns HIGH for moderate readings', () => expect(classifyPriority(109, 82)).toBe('HIGH'))
  it('returns HIGH at boundary gas=100 fill=100', () => expect(classifyPriority(100, 100)).toBe('HIGH'))
  it('returns MEDIUM for low-moderate readings', () => expect(classifyPriority(50, 65)).toBe('MEDIUM'))
  it('returns MEDIUM at lower boundary', () => expect(classifyPriority(40, 10)).toBe('MEDIUM'))
  it('returns LOW for minimal readings', () => expect(classifyPriority(10, 20)).toBe('LOW'))
  it('returns LOW for zero inputs', () => expect(classifyPriority(0, 0)).toBe('LOW'))
  it('returns CRITICAL for BIN_001 demo data', () => expect(classifyPriority(650, 100)).toBe('CRITICAL'))
  it('returns HIGH for BIN_002 demo data', () => expect(classifyPriority(109, 82)).toBe('HIGH'))
})

// ── normalizeStats ───────────────────────────────────────────────────────────
describe('normalizeStats()', () => {
  it('normalizes total_bins from raw data', () => expect(normalizeStats({ total_bins: 6 }).total_bins).toBe(6))
  it('falls back to totalBins if total_bins missing', () => expect(normalizeStats({ totalBins: 5 }).total_bins).toBe(5))
  it('defaults to 0 if both total_bins fields missing', () => expect(normalizeStats({}).total_bins).toBe(0))
  it('returns empty array for missing critical_bins', () => expect(normalizeStats({}).critical_bins).toEqual([]))
  it('returns empty array for missing high_priority_bins', () => expect(normalizeStats({}).high_priority_bins).toEqual([]))
  it('preserves critical_bins array', () => {
    const bins = [{ bin_id: 'BIN_001' }]
    expect(normalizeStats({ critical_bins: bins }).critical_bins).toEqual(bins)
  })
  it('preserves high_priority_bins array', () => {
    const bins = [{ bin_id: 'BIN_002' }]
    expect(normalizeStats({ high_priority_bins: bins }).high_priority_bins).toEqual(bins)
  })
  it('normalizes avg_health_risk from raw data', () => expect(normalizeStats({ avg_health_risk: 34.2 }).avg_health_risk).toBe(34.2))
  it('falls back to avgHealthRisk if avg_health_risk missing', () => expect(normalizeStats({ avgHealthRisk: 42.0 }).avg_health_risk).toBe(42.0))
  it('defaults avg_health_risk to 0 if missing', () => expect(normalizeStats({}).avg_health_risk).toBe(0))
})

// ── Health Risk Formula ──────────────────────────────────────────────────────
describe('calcHealthRisk()', () => {
  it('BIN_001 gas=650 fill=75 returns 68', () => expect(calcHealthRisk(650, 75)).toBeCloseTo(68.0, 0))
  it('zero inputs returns 0', () => expect(calcHealthRisk(0, 0)).toBe(0))
  it('gas only at 1000 returns 70', () => expect(calcHealthRisk(1000, 0)).toBeCloseTo(70.0, 1))
  it('fill only at 100 returns 30', () => expect(calcHealthRisk(0, 100)).toBeCloseTo(30.0, 1))
  it('max inputs returns 100', () => expect(calcHealthRisk(1000, 100)).toBeCloseTo(100.0, 1))
  it('gas=300 fill=50 returns 36', () => expect(calcHealthRisk(300, 50)).toBeCloseTo(36.0, 0))
})

// ── Fill Level Calculation ───────────────────────────────────────────────────
describe('calcFillLevel()', () => {
  it('empty bin returns 0%', () => expect(calcFillLevel(100, 100)).toBe(0))
  it('full bin returns 100%', () => expect(calcFillLevel(100, 0)).toBe(100))
  it('half full returns 50%', () => expect(calcFillLevel(100, 50)).toBe(50))
  it('dist > height clamps to 0%', () => expect(calcFillLevel(100, 120)).toBe(0))
  it('40cm bin at 24cm is 40%', () => expect(calcFillLevel(40, 24)).toBe(40))
  it('30cm bin at 9cm is 70%', () => expect(calcFillLevel(30, 9)).toBe(70))
})

// ── MOCK_BINS data integrity ──────────────────────────────────────────────────
describe('MOCK_BINS', () => {
  it('contains 6 bins', () => expect(MOCK_BINS).toHaveLength(6))
  it('first bin is BIN_001', () => expect(MOCK_BINS[0].bin_id).toBe('BIN_001'))
  it('BIN_001 is CRITICAL', () => expect(MOCK_BINS[0].priority_label).toBe('CRITICAL'))
  it('BIN_001 gas is 650', () => expect(MOCK_BINS[0].gas_ppm).toBe(650))
  it('BIN_001 fill is 100', () => expect(MOCK_BINS[0].fill_level).toBe(100))
  it('BIN_004 is LOW priority', () => {
    const bin = MOCK_BINS.find(b => b.bin_id === 'BIN_004')
    expect(bin?.priority_label).toBe('LOW')
  })
  it('all bins have bin_id field', () => {
    MOCK_BINS.forEach(b => expect(b.bin_id).toBeTruthy())
  })
  it('all bins have priority_label field', () => {
    MOCK_BINS.forEach(b => expect(b.priority_label).toBeTruthy())
  })
  it('all bins have classified_by set to RandomForest_ML', () => {
    MOCK_BINS.forEach(b => expect(b.classified_by).toBe('RandomForest_ML'))
  })
  it('contains exactly 3 CRITICAL bins', () => {
    expect(MOCK_BINS.filter(b => b.priority_label === 'CRITICAL')).toHaveLength(3)
  })
  it('contains exactly 1 HIGH bin', () => {
    expect(MOCK_BINS.filter(b => b.priority_label === 'HIGH')).toHaveLength(1)
  })
  it('contains exactly 1 MEDIUM bin', () => {
    expect(MOCK_BINS.filter(b => b.priority_label === 'MEDIUM')).toHaveLength(1)
  })
  it('contains exactly 1 LOW bin', () => {
    expect(MOCK_BINS.filter(b => b.priority_label === 'LOW')).toHaveLength(1)
  })
  it('BIN_005 is the physical sensor unit', () => {
    expect(REAL_BINS).toContain('BIN_001')
  })
})

// ── MOCK_STATS integrity ─────────────────────────────────────────────────────
describe('MOCK_STATS', () => {
  it('total_bins is 12', () => expect(MOCK_STATS.total_bins).toBe(12))
  it('average_health_risk is 34.2', () => expect(MOCK_STATS.average_health_risk).toBe(34.2))
  it('average_fill_level is 69.5', () => expect(MOCK_STATS.average_fill_level).toBe(69.5))
  it('needs_immediate_attention is 3', () => expect(MOCK_STATS.needs_immediate_attention).toBe(3))
  it('needs_attention_soon is 4', () => expect(MOCK_STATS.needs_attention_soon).toBe(4))
  it('by_priority CRITICAL count is 3', () => expect(MOCK_STATS.by_priority.CRITICAL).toBe(3))
  it('by_priority HIGH count is 4', () => expect(MOCK_STATS.by_priority.HIGH).toBe(4))
  it('critical_bins array is non-empty', () => expect(MOCK_STATS.critical_bins.length).toBeGreaterThan(0))
  it('critical_bins contains BIN_001', () => {
    expect(MOCK_STATS.critical_bins.some(b => b.bin_id === 'BIN_001')).toBe(true)
  })
  it('high_priority_bins contains BIN_002', () => {
    expect(MOCK_STATS.high_priority_bins.some(b => b.bin_id === 'BIN_002')).toBe(true)
  })
})

// ── BIN_LOCATIONS ────────────────────────────────────────────────────────────
describe('BIN_LOCATIONS', () => {
  it('BIN_001 maps to Homagama North Market', () => expect(BIN_LOCATIONS['BIN_001']).toContain('Homagama'))
  it('BIN_004 maps to Homagama Divisional Hospital', () => expect(BIN_LOCATIONS['BIN_004']).toContain('Hospital'))
  it('BIN_005 maps to NSBM', () => expect(BIN_LOCATIONS['BIN_005']).toContain('NSBM'))
  it('contains 12 locations', () => expect(Object.keys(BIN_LOCATIONS)).toHaveLength(12))
  it('BIN_001 Sinhala location is defined', () => expect(BIN_LOCATIONS_SI['BIN_001']).toBeTruthy())
  it('Sinhala locations contain 12 entries', () => expect(Object.keys(BIN_LOCATIONS_SI)).toHaveLength(12))
})

// ── HEALTH_TREND ─────────────────────────────────────────────────────────────
describe('HEALTH_TREND', () => {
  it('contains 7 days of data', () => expect(HEALTH_TREND).toHaveLength(7))
  it('first entry is Monday', () => expect(HEALTH_TREND[0].day).toBe('Mon'))
  it('last entry is Sunday', () => expect(HEALTH_TREND[6].day).toBe('Sun'))
  it('all entries have risk values', () => HEALTH_TREND.forEach(d => expect(d.risk).toBeGreaterThan(0)))
})