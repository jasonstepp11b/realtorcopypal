export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      generations: {
        Row: {
          id: string;
          user_id: string;
          content: string;
          type: string;
          title: string | null;
          created_at: string;
          project_id: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          content: string;
          type: string;
          title?: string | null;
          created_at?: string;
          project_id?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          content?: string;
          type?: string;
          title?: string | null;
          created_at?: string;
          project_id?: string | null;
        };
      };
      project_content: {
        Row: {
          id: string;
          project_id: string;
          user_id: string;
          content_type: string;
          content: string;
          metadata: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          user_id: string;
          content_type: string;
          content: string;
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          user_id?: string;
          content_type?: string;
          content?: string;
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      property_projects: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          address: string;
          property_type: string;
          bedrooms: string;
          bathrooms: string;
          square_feet: string;
          listing_price: string;
          features: string;
          selling_points: string;
          target_buyer: string;
          neighborhood_highlights: string;
          created_at: string;
          updated_at: string;
          image_url: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          address: string;
          property_type: string;
          bedrooms: string;
          bathrooms: string;
          square_feet: string;
          listing_price: string;
          features: string;
          selling_points: string;
          target_buyer: string;
          neighborhood_highlights: string;
          created_at?: string;
          updated_at?: string;
          image_url?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          address?: string;
          property_type?: string;
          bedrooms?: string;
          bathrooms?: string;
          square_feet?: string;
          listing_price?: string;
          features?: string;
          selling_points?: string;
          target_buyer?: string;
          neighborhood_highlights?: string;
          created_at?: string;
          updated_at?: string;
          image_url?: string | null;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
