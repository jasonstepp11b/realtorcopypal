export interface PropertyProject {
  id: string;
  user_id: string;
  name: string;
  address: string;
  property_type: string;
  listing_price: number;
  bedrooms: number;
  bathrooms: number;
  square_feet: number;
  description: string;
  features: string[];
  selling_points: string[];
  target_buyers: string[];
  year_built?: number;
  lot_size?: number;
  image_url?: string;
  created_at: string;
  updated_at: string;
}
