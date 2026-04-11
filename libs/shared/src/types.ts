export type ProductStatus =
  | 'considering'
  | 'shortlisted'
  | 'winner'
  | 'purchased';

export interface Collection {
  id: string;
  user_id: string;
  name: string;
  slug: string;
  cover_image_url: string | null;
  color: string;
  created_at: string;
}

export interface Product {
  id: string;
  user_id: string;
  collection_id: string;
  title: string;
  price: number;
  original_price: number;
  currency: string;
  shop_name: string;
  shop_domain: string;
  source_url: string;
  image_url: string | null;
  status: ProductStatus;
  notes: string;
  rating: number;
  quantity: number;
  archived: boolean;
  price_checked_at: string | null;
  created_at: string;
  added_by: string;
}

export interface Shop {
  id: string;
  collection_id: string;
  name: string;
  domain: string;
  url: string | null;
  created_at: string;
}

export interface CollectionMember {
  id: string;
  collection_id: string;
  user_id: string;
  role: 'viewer' | 'editor';
  invited_by: string;
  created_at: string;
}
