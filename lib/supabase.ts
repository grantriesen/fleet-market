import { createBrowserClient } from '@supabase/ssr';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Singleton SSR-compatible instance (sets cookies for middleware)
let supabaseInstance: ReturnType<typeof createBrowserClient> | null = null;

// Primary export — use this everywhere in client components
export const createClient = () => {
  if (!supabaseInstance) {
    supabaseInstance = createBrowserClient(supabaseUrl, supabaseAnonKey);
  }
  return supabaseInstance;
};

// Backward-compatible named export (also uses SSR client now)
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

// Database types
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          phone: string | null;
          company_name: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['users']['Insert']>;
      };
      templates: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          category: string | null;
          preview_url: string | null;
          thumbnail_url: string | null;
          config_json: any;
          template_files_path: string | null;
          is_active: boolean;
          display_order: number;
          created_at: string;
          updated_at: string;
        };
      };
      sites: {
        Row: {
          id: string;
          user_id: string;
          template_id: string;
          site_name: string;
          slug: string;
          custom_domain: string | null;
          deployment_status: string;
          deployed_url: string | null;
          subscription_tier: string;
          created_at: string;
          updated_at: string;
          last_deployed_at: string | null;
        };
        Insert: Omit<Database['public']['Tables']['sites']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['sites']['Insert']>;
      };
      site_content: {
        Row: {
          id: string;
          site_id: string;
          field_key: string;
          value: string | null;
          field_type: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['site_content']['Row'], 'id' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['site_content']['Insert']>;
      };
      site_customizations: {
        Row: {
          id: string;
          site_id: string;
          customization_type: string;
          config_json: any;
          updated_at: string;
        };
      };
      manufacturers: {
        Row: {
          id: string;
          site_id: string;
          name: string;
          logo_url: string | null;
          description: string | null;
          website_url: string | null;
          display_order: number;
          is_featured: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['manufacturers']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['manufacturers']['Insert']>;
      };
    };
  };
};
