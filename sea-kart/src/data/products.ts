export interface Product {
  id: string;
  name: string;
  localName?: string;
  priceRange: string;
  image: string;
  category: 'Fish' | 'Shellfish' | 'Special';
  isOutOfStock?: boolean;
}

export const products: Product[] = [
  {
    id: '1',
    name: 'Pink Perch',
    localName: 'Madimal',
    priceRange: '₹350 - ₹450',
    image: '/images/pink_perch.png',
    category: 'Fish'
  },
  {
    id: '2',
    name: 'Sardine',
    localName: 'Bootai',
    priceRange: '₹250 - ₹300',
    image: '/images/sardine.png',
    category: 'Fish'
  },
  {
    id: '3',
    name: 'Indian Mackerel',
    localName: 'Bangude',
    priceRange: '₹450 - ₹500',
    image: '/images/mackerel.png',
    category: 'Fish'
  },
  {
    id: '4',
    name: 'Reef Cod',
    localName: 'Muru',
    priceRange: '₹220 - ₹340',
    image: '/images/reef_cod.png',
    category: 'Fish'
  },
  {
    id: '5',
    name: 'King Fish',
    localName: 'Anjal',
    priceRange: '₹1450 - ₹1600',
    image: '/images/king_fish.png',
    category: 'Fish'
  },
  {
    id: '6',
    name: 'Silver Pomfret',
    localName: 'Maanji',
    priceRange: '₹1700 - ₹1800',
    image: '/images/pomfret.png',
    category: 'Fish'
  },
  {
    id: '7',
    name: 'Big Eye Snapper',
    localName: 'Disco',
    priceRange: '₹280 - ₹380',
    image: '/images/snapper.png',
    category: 'Fish'
  },
  {
    id: '8',
    name: 'Prawns',
    localName: 'Yetti',
    priceRange: 'Market Price',
    image: '/images/prawns.png',
    category: 'Shellfish'
  },
  {
    id: '9',
    name: 'Crab',
    localName: 'Denji',
    priceRange: '₹400 - ₹600',
    image: '/images/crab.png',
    category: 'Shellfish'
  }
];