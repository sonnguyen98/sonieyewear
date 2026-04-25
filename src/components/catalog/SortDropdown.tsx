'use client'

import type { SortOption } from '@/types/filters'
import { VI } from '@/constants/vietnamese'

interface SortDropdownProps {
  value: SortOption
  onChange: (v: SortOption) => void
}

export default function SortDropdown({ value, onChange }: SortDropdownProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-brand-muted hidden sm:block">{VI.catalog.sortBy}:</span>
      <select
        value={value}
        onChange={e => onChange(e.target.value as SortOption)}
        className="text-xs font-medium text-brand-black border border-brand-border rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-brand-black"
      >
        {(Object.entries(VI.catalog.sortOptions) as [SortOption, string][]).map(([v, label]) => (
          <option key={v} value={v}>{label}</option>
        ))}
      </select>
    </div>
  )
}
