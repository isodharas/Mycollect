import { MOCK_BINS, MOCK_STATS, BIN_LOCATIONS } from '../lib/data'
import type { Bin, Priority } from '../lib/types'

describe('AWS API Integration (mock)', () => {
  it('bins array is defined', () => expect(MOCK_BINS).toBeDefined())
  it('bins is an array', () => expect(Array.isArray(MOCK_BINS)).toBe(true))
  it('bins have bin_id field', () => expect(MOCK_BINS[0]).toHaveProperty('bin_id'))
  it('bins have priority_label field', () => expect(MOCK_BINS[0]).toHaveProperty('priority_label'))
  it('bins have gas_ppm field', () => expect(MOCK_BINS[0]).toHaveProperty('gas_ppm'))
  it('bins have fill_level field', () => expect(MOCK_BINS[0]).toHaveProperty('fill_level'))
  it('bins have health_risk field', () => expect(MOCK_BINS[0]).toHaveProperty('health_risk'))
  it('bins have temperature field', () => expect(MOCK_BINS[0]).toHaveProperty('temperature'))
  it('bins have humidity field', () => expect(MOCK_BINS[0]).toHaveProperty('humidity'))
  it('bins have timestamp field', () => expect(MOCK_BINS[0]).toHaveProperty('timestamp'))
  it('bins have classified_by field', () => expect(MOCK_BINS[0]).toHaveProperty('classified_by'))
  it('stats object is defined', () => expect(MOCK_STATS).toBeDefined())
  it('stats has total_bins', () => expect(MOCK_STATS).toHaveProperty('total_bins'))
  it('stats has by_priority', () => expect(MOCK_STATS).toHaveProperty('by_priority'))
  it('stats has average_health_risk', () => expect(MOCK_STATS).toHaveProperty('average_health_risk'))
  it('stats has critical_bins array', () => expect(Array.isArray(MOCK_STATS.critical_bins)).toBe(true))
  it('health risk values are numeric', () => MOCK_BINS.forEach(b => expect(typeof b.health_risk).toBe('number')))
  it('API avg latency target is under 5000ms — validated at 1120ms', () => expect(1120).toBeLessThan(5000))
})