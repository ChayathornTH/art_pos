export interface Artwork {
  id: string;
  title: string;
  description: string;
  price: number;
  dimensions: string;
  medium: string;
  category: string;
  image: string;
  status: 'available' | 'reserved' | 'sold';
  views: number;
  createdAt: string;
}

export interface CartItem {
  artwork: Artwork;
  quantity: number;
}

export interface SaleTransaction {
  id: string;
  timestamp: string;
  items: {
    artworkId: string;
    title: string;
    price: number;
    quantity: number;
  }[];
  totalAmount: number;
  paymentMethod: 'cash' | 'card' | 'transfer';
  buyerName?: string;
  buyerContact?: string;
  notes?: string;
}

export interface AppSettings {
  guestPassword?: string;
  artistPassword?: string;
  shopName: string;
  paymentTransferDetails: string;
  whatsappNumber?: string;
}
