# MyCollect Dashboard — Next.js 14

AI-Powered Waste Intelligence Dashboard for Homagama Municipal Council.

## Stack
- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS** (custom design system)
- **Recharts** (charts)
- **AWS API Gateway** (your live backend)

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Set your API URL (already pre-configured to your AWS endpoint)
# Edit next.config.mjs if needed:
# NEXT_PUBLIC_API_URL=https://g7oob1ovd6.execute-api.ap-southeast-2.amazonaws.com/prod

# 3. Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page — hero, stats ticker, features, CTA |
| `/dashboard` | Overview — stats, live map, alerts, charts, bin table |
| `/bins` | All bins grid with search + priority filter |
| `/routes` | Collection routes with map preview |
| `/analytics` | Full charts — health trend, gas, fill level, priority donut |
| `/alerts` | All alerts sorted by severity |
| `/reports` | Export CSV/PDF reports |

## API Integration

All API calls are in `lib/api.ts`. The dashboard automatically falls back to mock data if the API is unreachable.

**Live endpoints used:**
- `GET /bin` — All bins latest status
- `GET /bin/{id}` — Single bin
- `GET /bin/{id}/history` — Historical data
- `GET /bin/priority/{level}` — Filter by priority
- `GET /dashboard/stats` — Dashboard statistics

## Design System

Custom dark eco-futuristic theme:
- **Fonts:** Bebas Neue (display) · Barlow Condensed (headings) · Barlow (body) · JetBrains Mono (data)
- **Colors:** Deep void black background, #22c55e green accent, red/orange/amber priority palette
- **Components:** StatCard, BinCard, BinTable, PriorityBadge, FillBar, Sidebar, Topbar

## Project Structure

```
app/
  page.tsx              ← Landing page
  dashboard/page.tsx    ← Main dashboard
  bins/page.tsx         ← Bins grid
  routes/page.tsx       ← Routes
  analytics/page.tsx    ← Charts
  alerts/page.tsx       ← Alerts
  reports/page.tsx      ← Reports

components/
  Sidebar.tsx
  Topbar.tsx
  StatCard.tsx
  BinCard.tsx
  BinTable.tsx
  PriorityBadge.tsx
  FillBar.tsx
  DashboardCharts.tsx
  charts/
    HealthTrendChart.tsx
    PriorityDonutChart.tsx
    GasAndFillCharts.tsx

lib/
  api.ts        ← AWS API calls
  types.ts      ← TypeScript types
  data.ts       ← Mock data + helpers
```
