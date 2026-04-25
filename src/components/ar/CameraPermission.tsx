'use client'

import Button from '@/components/ui/Button'
import { VI } from '@/constants/vietnamese'

interface CameraPermissionProps {
  onAllow: () => void
}

export default function CameraPermission({ onAllow }: CameraPermissionProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
      <div className="w-20 h-20 bg-brand-zalo/10 rounded-full flex items-center justify-center mb-5">
        <svg className="w-10 h-10 text-brand-zalo" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      </div>
      <h2 className="text-xl font-black text-brand-black mb-2">{VI.ar.permissionTitle}</h2>
      <p className="text-brand-muted text-sm mb-6 max-w-xs leading-relaxed">{VI.ar.permissionDesc}</p>
      <Button variant="zalo" size="lg" onClick={onAllow}>
        {VI.ar.allowCamera}
      </Button>
      <p className="mt-4 text-xs text-brand-muted">🔒 Hình ảnh không được lưu trữ</p>
    </div>
  )
}
