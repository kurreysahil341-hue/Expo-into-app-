export interface SampleImage {
  id: string;
  name: string;
  category: string;
  url: string;
  defaultWidth: number;
  defaultHeight: number;
  approxSize: string;
  description: string;
}

export const SAMPLE_IMAGES: SampleImage[] = [
  {
    id: 'sample-landscape',
    name: 'Mountain Lake Vista',
    category: 'Nature',
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1920&q=80',
    defaultWidth: 1920,
    defaultHeight: 1280,
    approxSize: '1.8 MB',
    description: 'High-res mountain panorama with vibrant reflections',
  },
  {
    id: 'sample-portrait',
    name: 'Studio Portrait',
    category: 'Portrait',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=80',
    defaultWidth: 1200,
    defaultHeight: 1600,
    approxSize: '1.2 MB',
    description: 'Crisp studio photography with subtle skin textures',
  },
  {
    id: 'sample-architecture',
    name: 'Modern Architecture',
    category: 'Urban',
    url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1800&q=80',
    defaultWidth: 1800,
    defaultHeight: 1200,
    approxSize: '1.4 MB',
    description: 'Sharp geometric glass building facade with straight lines',
  },
  {
    id: 'sample-food',
    name: 'Artisan Coffee & Pastry',
    category: 'Product',
    url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1400&q=80',
    defaultWidth: 1400,
    defaultHeight: 1050,
    approxSize: '950 KB',
    description: 'Warm cafe scene with rich depth of field and fine detail',
  },
];
