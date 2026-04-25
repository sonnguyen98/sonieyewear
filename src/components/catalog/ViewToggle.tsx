'use client'

interface ViewToggleProps {
  mode: 'static' | 'ar'
  onChange: (mode: 'static' | 'ar') => void
}

export default function ViewToggle({ mode, onChange }: ViewToggleProps) {
  const isAR = mode === 'ar'

  return (
    <div className="flex items-center gap-2.5 select-none" suppressHydrationWarning>
      <span
        onClick={() => onChange('static')}
        className={`text-xs font-bold cursor-pointer transition-colors ${!isAR ? 'text-brand-black' : 'text-brand-muted'}`}
      >
        Xem Gọng
      </span>

      <button
        onClick={() => onChange(isAR ? 'static' : 'ar')}
        className="relative flex-shrink-0 w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none"
        style={{ backgroundColor: '#00bfa5' }}
        aria-label="Toggle AR mode"
      >
        <span
          className="absolute top-0.5 bottom-0.5 w-5 bg-white rounded-full shadow transition-all duration-300"
          style={{ left: isAR ? 'calc(100% - 22px)' : '2px' }}
        />
      </button>

      <span
        onClick={() => onChange('ar')}
        className={`text-xs font-bold cursor-pointer transition-colors whitespace-nowrap ${isAR ? 'text-brand-black' : 'text-brand-muted'}`}
      >
        Thử 3D
      </span>
    </div>
  )
}
