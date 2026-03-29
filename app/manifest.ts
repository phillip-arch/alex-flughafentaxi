import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Alex Flughafentaxi',
    short_name: 'Alex Flughafentaxi',
    description:
      'Alex Flughafentaxi als App auf Ihrem Geraet installieren und Fahrten schneller buchen.',
    start_url: '/account?tab=start',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#000000',
    icons: [
      {
        src: 'https://dmyr5rcjsjpgfdx8.public.blob.vercel-storage.com/images/appphoneicon.jpg',
        sizes: '512x512',
        type: 'image/jpeg',
        purpose: 'maskable',
      },
    ],
  };
}
