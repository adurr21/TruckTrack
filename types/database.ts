export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      users: {
        Row: { id: string; name: string; created_at: string };
        Insert: { id: string; name?: string; created_at?: string };
        Update: { id?: string; name?: string; created_at?: string };
        Relationships: [];
      };
      settlements: {
        Row: {
          sheet_id: string;
          user_id: string;
          date: string;
          truck_num: string;
          dollie_num: string;
          to: string;
          from: string;
          pro_no: string;
          trailer_num: string;
          paysheet_num: string;
          pay: number;
          created_at: string;
        };
        Insert: {
          sheet_id?: string;
          user_id: string;
          date: string;
          truck_num: string;
          dollie_num: string;
          to: string;
          from: string;
          pro_no: string;
          trailer_num: string;
          paysheet_num: string;
          pay: number;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["settlements"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type UserProfile = Database["public"]["Tables"]["users"]["Row"];
export type Settlement = Database["public"]["Tables"]["settlements"]["Row"];
export type SettlementInsert =
  Database["public"]["Tables"]["settlements"]["Insert"];
