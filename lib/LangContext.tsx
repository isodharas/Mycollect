'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export type Lang = 'en' | 'si'

const T: Record<Lang, Record<string,string>> = {
  en: {
    overview:'Overview', live_bins:'Live Bins', routes:'Routes',
    analytics:'Analytics', alerts:'Alerts', reports:'Reports',
    sign_out:'Sign out', system_live:'System Live',
    waste_intelligence:'Waste Intelligence', municipal_operator:'Municipal Operator',
    total_bins:'Total Bins', critical:'Critical', high_priority:'High Priority',
    avg_health_risk:'Avg Health Risk', live_alerts:'Live Alerts',
    todays_schedule:"Today's Schedule", homagama_zone:'Homagama Zone',
    all_active:'all active', immediate_action:'Immediate action needed',
    collect_2hrs:'Collect within 2 hours', tap_filter:'tap to filter',
    all_bins_status:'All Bins — Live Status', view_all:'View All',
    export_csv:'Export CSV', aws_connected:'AWS Connected',
    fill_level:'Fill Level', gas_level:'Gas PPM', health_risk:'Health Risk',
    temperature:'Temperature', humidity:'Humidity', updated:'Updated',
    bin_id:'Bin ID', location:'Location', priority:'Priority',
    add_new_bin:'Add New Bin', edit_bin:'Edit Bin', delete_bin:'Delete',
    save_changes:'Save Changes', cancel:'Cancel',
    search_bins:'Search bins or locations...',
    bins_monitored:'bins monitored', navigation:'Navigation',
  },
  si: {
    overview:'දළ විශ්ලේෂණය', live_bins:'සජීව කූඩු', routes:'මාර්ග',
    analytics:'විශ්ලේෂණය', alerts:'අනතුරු ඇඟවීම්', reports:'වාර්තා',
    sign_out:'ඉවත් වන්න', system_live:'පද්ධතිය සක්‍රිය',
    waste_intelligence:'අපද්‍රව්‍ය බුද්ධිය', municipal_operator:'නාගරික ක්‍රියාකරු',
    total_bins:'මුළු කූඩු', critical:'අවදානම්', high_priority:'ඉහළ ප්‍රමුඛතා',
    avg_health_risk:'සාමාන්‍ය සෞඛ්‍ය අවදානම', live_alerts:'සජීව අනතුරු',
    todays_schedule:'අද කාලසටහන', homagama_zone:'හෝමාගම කලාපය',
    all_active:'සියල්ල සක්‍රිය', immediate_action:'ක්ෂණික ක්‍රියාමාර්ගය අවශ්‍යයි',
    collect_2hrs:'පැය 2 ඇතුළත එකතු කරන්න', tap_filter:'පෙරහන් කිරීමට',
    all_bins_status:'සියලු කූඩු — සජීව තත්ත්වය', view_all:'සියල්ල බලන්න',
    export_csv:'CSV අපනයනය', aws_connected:'AWS සම්බන්ධිත',
    fill_level:'පිරවීමේ මට්ටම', gas_level:'වායු PPM', health_risk:'සෞඛ්‍ය අවදානම',
    temperature:'උෂ්ණත්වය', humidity:'ආර්ද්‍රතාව', updated:'යාවත්කාලීන',
    bin_id:'කූඩු හැඳුනුම', location:'ස්ථානය', priority:'ප්‍රමුඛතාව',
    add_new_bin:'නව කූඩුවක් එකතු කරන්න', edit_bin:'කූඩුව සංස්කරණය', delete_bin:'මකන්න',
    save_changes:'වෙනස්කම් සුරකින්න', cancel:'අවලංගු කරන්න',
    search_bins:'කූඩු හෝ ස්ථාන සොයන්න...',
    bins_monitored:'කූඩු නිරීක්ෂණය', navigation:'සංචලනය',
  }
}

const Ctx = createContext<{lang:Lang;setLang:(l:Lang)=>void;t:(k:string)=>string}>({
  lang:'en', setLang:()=>{}, t:(k)=>k
})

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en')

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('mycollect_lang') as Lang
    if (saved === 'en' || saved === 'si') setLangState(saved)
  }, [])

  const setLang = (l: Lang) => {
    setLangState(l)
    localStorage.setItem('mycollect_lang', l)
  }

  const t = (key: string) => T[lang][key] || T['en'][key] || key

  return <Ctx.Provider value={{lang, setLang, t}}>{children}</Ctx.Provider>
}

export function useLang() { return useContext(Ctx) }
