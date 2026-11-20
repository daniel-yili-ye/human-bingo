// Mirrors supabase/migrations. Regenerate once a database is running:
//   supabase gen types typescript --local > lib/supabase/database.types.ts

export type Database = {
  public: {
    Tables: {
      boards: {
        Row: {
          id: string;
          slug: string;
          owner_id: string;
          title: string;
          row_count: number;
          col_count: number;
          free_space: boolean;
          prompts: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          owner_id?: string;
          title: string;
          row_count: number;
          col_count: number;
          free_space?: boolean;
          prompts: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          row_count?: number;
          col_count?: number;
          free_space?: boolean;
          prompts?: string[];
        };
        Relationships: [];
      };
      ai_generations: {
        Row: { id: number; user_id: string; created_at: string };
        Insert: { user_id: string; created_at?: string };
        Update: { user_id?: string; created_at?: string };
        Relationships: [];
      };
    };
    Views: Record<never, never>;
    Functions: {
      get_board_by_slug: {
        Args: { p_slug: string };
        Returns: {
          slug: string;
          title: string;
          row_count: number;
          col_count: number;
          free_space: boolean;
          prompts: string[];
          updated_at: string;
        }[];
      };
      consume_ai_generation: {
        Args: Record<never, never>;
        Returns: boolean;
      };
      get_ai_usage: {
        Args: Record<never, never>;
        Returns: {
          used: number;
          hourly_limit: number;
          next_free_at: string | null;
        }[];
      };
    };
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
};
