const fetch = require('node-fetch')
// API Integration Tests — tests real AWS endpoints via proxy

const BASE = 'http://localhost:3000/api/proxy/catchall'

describe('AWS API Integration', () => {
  it('GET /bin returns bins array', async () => {
    const res = await fetch(`${BASE}?path=bin`)
    const data = await res.json()
    expect(res.status).toBe(200)
    expect(data.bins).toBeDefined()
    expect(Array.isArray(data.bins)).toBe(true)
  }, 10000)

  it('bins have required fields', async () => {
    const res = await fetch(`${BASE}?path=bin`)
    const data = await res.json()
    const bin = data.bins[0]
    expect(bin).toHaveProperty('bin_id')
    expect(bin).toHaveProperty('priority_label')
    expect(bin).toHaveProperty('gas_ppm')
    expect(bin).toHaveProperty('fill_level')
    expect(bin).toHaveProperty('health_risk')
  }, 10000)

  it('API response time is under 5 seconds', async () => {
    const start = Date.now()
    await fetch(`${BASE}?path=bin`)
    const elapsed = Date.now() - start
    expect(elapsed).toBeLessThan(5000)
  }, 10000)

  it('GET /dashboard/stats returns stats object', async () => {
    const res = await fetch(`${BASE}?path=dashboard/stats`)
    const data = await res.json()
    expect(res.status).toBe(200)
    expect(data.stats).toHaveProperty('total_bins')
  }, 10000)
})
