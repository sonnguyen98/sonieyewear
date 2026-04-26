import { ImageResponse } from 'next/og'

export const size = { width: 64, height: 64 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          background: '#1E4D78',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 'inset 0 0 0 3px #C9A84C',
        }}
      >
        <span
          style={{
            color: '#C9A84C',
            fontSize: 38,
            fontWeight: 900,
            fontFamily: 'Georgia, serif',
            lineHeight: 1,
            marginTop: 2,
          }}
        >
          S
        </span>
      </div>
    ),
    { ...size }
  )
}
