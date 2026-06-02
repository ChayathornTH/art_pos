import type { Artwork } from './types';

export const INITIAL_ARTWORKS: Artwork[] = [
  {
    id: 'art-1',
    title: 'Sunset Resonance',
    description: 'Inspired by the radiant energy of mountain sunsets, using rich gold leaf layers and expressive palette knife textures. A statement piece that glows in warm ambient light.',
    price: 450,
    dimensions: '24 x 36 inches',
    medium: 'Original Oil on Canvas & Gold Leaf',
    category: 'Paintings',
    image: '/images/sunset_resonance.png',
    status: 'available',
    views: 142,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'art-2',
    title: 'Monochrome Whisper',
    description: 'A minimalist dialogue between human curves and botanical structures. Hand-printed on heavy textured cotton archival paper, signed and numbered by the artist.',
    price: 65,
    dimensions: '12 x 18 inches',
    medium: 'Limited Edition Fine Art Print',
    category: 'Prints',
    image: '/images/monochrome_whisper.png',
    status: 'available',
    views: 89,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'art-3',
    title: 'Golden Hour Forest',
    description: 'Capturing the fleeting warm glow filtering through misty pine trees. Painted wet-on-wet on a cradled wood panel, featuring deep, atmospheric forest layers.',
    price: 320,
    dimensions: '18 x 24 inches',
    medium: 'Original Oil on Wood Panel',
    category: 'Paintings',
    image: '/images/golden_hour_forest.png',
    status: 'reserved',
    views: 204,
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'art-4',
    title: 'Neon Cyber Lotus',
    description: 'A futuristic digital illustration capturing a glowing cybernetic lotus floating on virtual fluid. Printed using premium giclée ink on black linen paper.',
    price: 180,
    dimensions: '20 x 20 inches',
    medium: 'Limited Edition Digital Print',
    category: 'Digital',
    image: '/images/neon_cyber_lotus.png',
    status: 'available',
    views: 310,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  }
];
