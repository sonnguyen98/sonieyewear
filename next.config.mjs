/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
          { key: 'Cross-Origin-Embedder-Policy', value: 'credentialless' },
        ],
      },
    ]
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: 'img.vietqr.io' },
      { protocol: 'https', hostname: 'api.qrserver.com' },
    ],
  },
  webpack(config) {
    // Allow importing .glb and .gltf 3D model files
    config.module.rules.push({
      test: /\.(glb|gltf)$/,
      use: { loader: 'file-loader' },
    })
    return config
  },
}

export default nextConfig
