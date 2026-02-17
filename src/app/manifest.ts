import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Medical Dashboard',
    short_name: 'MedDash',
    description: 'Post-surgery care coordination for Harris and Kent',
    start_url: '/today',
    display: 'standalone',
    background_color: '#faf9f7',
    theme_color: '#5ca88f',
    icons: [
      {
        src: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
