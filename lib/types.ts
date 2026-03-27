export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

export interface Bin {
  bin_id: string
  fill_level: number
  gas_ppm: number
  temperature: number
  humidity: number
  health_risk: number
  priority: number
  priority_label: Priority
  last_updated: string
  timestamp: string
  classified_by: string
}

export interface BinHistoryItem {
  bin_id: string
  timestamp: string
  fill_level: number
  gas_ppm: number
  temperature: number
  humidity: number
  health_risk: number
  priority: number
  priority_label: Priority
}

export interface DashboardStats {
  total_bins: number
  by_priority: Record<Priority, number>
  average_health_risk: number
  average_fill_level: number
  needs_immediate_attention: number
  needs_attention_soon: number
  critical_bins: Array<{ bin_id: string; fill_level: number; gas_ppm: number; health_risk: number }>
  high_priority_bins: Array<{ bin_id: string; fill_level: number; gas_ppm: number; health_risk: number }>
}

export interface ApiResponse<T> {
  message: string
  data?: T
  error?: string
}
