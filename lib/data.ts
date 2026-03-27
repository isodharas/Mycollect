import type { Bin, DashboardStats, Priority } from './types'
export const MOCK_BINS: Bin[] = [
  {bin_id:'BIN_001',fill_level:100,gas_ppm:650,temperature:31.2,humidity:78,health_risk:61.5,priority:3,priority_label:'CRITICAL',last_updated:new Date().toISOString(),timestamp:'1704362400',classified_by:'RandomForest_ML'},
  {bin_id:'BIN_005',fill_level:98, gas_ppm:520,temperature:30.8,humidity:76,health_risk:57.6,priority:3,priority_label:'CRITICAL',last_updated:new Date().toISOString(),timestamp:'1704362400',classified_by:'RandomForest_ML'},
  {bin_id:'BIN_009',fill_level:95, gas_ppm:480,temperature:31.0,humidity:77,health_risk:52.5,priority:3,priority_label:'CRITICAL',last_updated:new Date().toISOString(),timestamp:'1704362400',classified_by:'RandomForest_ML'},
  {bin_id:'BIN_002',fill_level:82, gas_ppm:109,temperature:30.1,humidity:75,health_risk:32.3,priority:2,priority_label:'HIGH',    last_updated:new Date().toISOString(),timestamp:'1704362400',classified_by:'RandomForest_ML'},
  {bin_id:'BIN_006',fill_level:78, gas_ppm:134,temperature:30.3,humidity:74,health_risk:32.8,priority:2,priority_label:'HIGH',    last_updated:new Date().toISOString(),timestamp:'1704362400',classified_by:'RandomForest_ML'},
  {bin_id:'BIN_008',fill_level:75, gas_ppm:128,temperature:30.0,humidity:74,health_risk:31.9,priority:2,priority_label:'HIGH',    last_updated:new Date().toISOString(),timestamp:'1704362400',classified_by:'RandomForest_ML'},
  {bin_id:'BIN_011',fill_level:71, gas_ppm:115,temperature:29.8,humidity:73,health_risk:28.6,priority:2,priority_label:'HIGH',    last_updated:new Date().toISOString(),timestamp:'1704362400',classified_by:'RandomForest_ML'},
  {bin_id:'BIN_003',fill_level:65, gas_ppm:250,temperature:30.0,humidity:75,health_risk:34.5,priority:1,priority_label:'MEDIUM',  last_updated:new Date().toISOString(),timestamp:'1704362400',classified_by:'RandomForest_ML'},
  {bin_id:'BIN_007',fill_level:60, gas_ppm:200,temperature:30.0,humidity:75,health_risk:32.0,priority:1,priority_label:'MEDIUM',  last_updated:new Date().toISOString(),timestamp:'1704362400',classified_by:'RandomForest_ML'},
  {bin_id:'BIN_010',fill_level:55, gas_ppm:180,temperature:30.0,humidity:74,health_risk:30.5,priority:1,priority_label:'MEDIUM',  last_updated:new Date().toISOString(),timestamp:'1704362400',classified_by:'RandomForest_ML'},
  {bin_id:'BIN_004',fill_level:30, gas_ppm:50, temperature:29.0,humidity:73,health_risk:8.5, priority:0,priority_label:'LOW',     last_updated:new Date().toISOString(),timestamp:'1704362400',classified_by:'RandomForest_ML'},
  {bin_id:'BIN_012',fill_level:25, gas_ppm:40, temperature:29.0,humidity:73,health_risk:7.8, priority:0,priority_label:'LOW',     last_updated:new Date().toISOString(),timestamp:'1704362400',classified_by:'RandomForest_ML'},
]
export const MOCK_STATS: DashboardStats = {
  total_bins:12,
  by_priority:{LOW:2,MEDIUM:3,HIGH:4,CRITICAL:3},
  average_health_risk:34.2,
  average_fill_level:69.5,
  needs_immediate_attention:3,
  needs_attention_soon:4,
  critical_bins:   MOCK_BINS.filter(b=>b.priority_label==='CRITICAL').map(b=>({bin_id:b.bin_id,fill_level:b.fill_level,gas_ppm:b.gas_ppm,health_risk:b.health_risk})),
  high_priority_bins:MOCK_BINS.filter(b=>b.priority_label==='HIGH').map(b=>({bin_id:b.bin_id,fill_level:b.fill_level,gas_ppm:b.gas_ppm,health_risk:b.health_risk})),
}
export const BIN_LOCATIONS: Record<string,string> = {
  BIN_001:'Homagama North Market, Colombo Rd',
  BIN_002:'Homagama Railway Station, Station Rd',
  BIN_003:'Homagama Central Bus Stand',
  BIN_004:'Homagama Divisional Hospital',
  BIN_005:'Galawila Market Junction',
  BIN_006:'Homagama Town Hall, Main St',
  BIN_007:'Sethsiripaya Road, Homagama',
  BIN_008:'Homagama South Market',
  BIN_009:'Denzil Kobbekaduwa Rd Junction',
  BIN_010:'Homagama Police Station Area',
  BIN_011:'Wijerama Junction, Homagama',
  BIN_012:'Homagama Pradeshiya Sabha',
}

export const BIN_LOCATIONS_SI: Record<string,string> = {
  BIN_001:'හෝමාගම උතුරු වෙළඳපොළ, කොළඹ පාර',
  BIN_002:'හෝමාගම දුම්රිය ස්ථානය, ස්ථාන පාර',
  BIN_003:'හෝමාගම මධ්‍යම බස් නැවතුම',
  BIN_004:'හෝමාගම දිවිසිය රෝහල',
  BIN_005:'ගාලවිල වෙළඳ සන්ධිය',
  BIN_006:'හෝමාගම නගර ශාලාව, ප්‍රධාන වීදිය',
  BIN_007:'සේත්සිරිපාය පාර, හෝමාගම',
  BIN_008:'හෝමාගම දකුණු වෙළඳපොළ',
  BIN_009:'ඩෙන්සිල් කොබ්බෑකඩු පාර සන්ධිය',
  BIN_010:'හෝමාගම පොලිස් ස්ථාන ප්‍රදේශය',
  BIN_011:'විජේරාම සන්ධිය, හෝමාගම',
  BIN_012:'හෝමාගම ප්‍රාදේශීය සභාව',
}
export const REAL_BINS = ['BIN_001']
export const HEALTH_TREND = [
  {day:'Mon',risk:42},{day:'Tue',risk:38},{day:'Wed',risk:51},{day:'Thu',risk:67},
  {day:'Fri',risk:72},{day:'Sat',risk:65},{day:'Sun',risk:58},
]
export const GAS_24H = Array.from({length:24},(_,i)=>({h:`${i}:00`,ppm:Math.round(80+Math.random()*60)}))
export const FILL_24H = Array.from({length:24},(_,i)=>({h:`${i}:00`,pct:Math.round(40+i*1.8+Math.random()*10)}))
// Client-only timeAgo — always returns empty string on server to avoid hydration mismatch
export function timeAgo(iso: string): string {
  if (typeof window === 'undefined') return 'live'
  try {
    const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
    if (s < 60) return `${s}s ago`
    if (s < 3600) return `${Math.floor(s/60)}m ago`
    return `${Math.floor(s/3600)}h ago`
  } catch { return 'live' }
}
