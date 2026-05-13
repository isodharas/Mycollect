'use client'
import type { Priority } from '@/lib/types'
import { useLang } from '@/lib/LangContext'

const S: Record<Priority,string> = {
  CRITICAL:'p-critical', HIGH:'p-high', MEDIUM:'p-medium', LOW:'p-low'
}
const SI: Record<Priority,string> = {
  CRITICAL:'අවදානම්', HIGH:'ඉහළ', MEDIUM:'මධ්‍යම', LOW:'සාමාන්‍ය'
}

export default function PriorityBadge({priority,size='md'}:{priority:Priority;size?:'sm'|'md'}) {
  const { lang } = useLang()
  const label = lang === 'si' ? SI[priority] : priority
  return (
    <span className={`badge ${S[priority]}`} style={{fontSize:size==='sm'?9.5:10.5,padding:size==='sm'?'2px 8px':'3px 10px'}}>
      <span className="badge-dot"/>
      {label}
    </span>
  )
}
