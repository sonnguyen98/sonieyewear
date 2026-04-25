'use client'

import Button from '@/components/ui/Button'
import { VI } from '@/constants/vietnamese'
import { openZaloDefault } from '@/lib/zalo'
import type { CameraState } from '@/types/ar'

interface ARFallbackProps {
  reason: CameraState
  onRetry?: () => void
}

export default function ARFallback({ reason, onRetry }: ARFallbackProps) {
  const isDenied = reason === 'denied'

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-5">
        <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h2 className="text-xl font-black text-brand-black mb-2">
        {isDenied ? VI.ar.deniedTitle : VI.ar.errorTitle}
      </h2>
      <p className="text-brand-muted text-sm mb-6 max-w-xs leading-relaxed">
        {isDenied ? VI.ar.deniedDesc : VI.ar.errorDesc}
      </p>
      <div className="flex flex-col gap-3 w-full max-w-xs">
        {onRetry && !isDenied && (
          <Button variant="primary" fullWidth onClick={onRetry}>
            {VI.common.retry}
          </Button>
        )}
        <Button variant="zalo" fullWidth onClick={openZaloDefault}>
          {VI.ar.contactZalo}
        </Button>
      </div>
    </div>
  )
}
