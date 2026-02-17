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
      profiles: {
        Row: {
          id: string;
          email: string;
          display_name: string | null;
          role: "patient" | "caregiver";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          display_name?: string | null;
          role: "patient" | "caregiver";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          display_name?: string | null;
          role?: "patient" | "caregiver";
          created_at?: string;
          updated_at?: string;
        };
      };
      medications: {
        Row: {
          id: string;
          name: string;
          generic_name: string | null;
          purpose: string;
          schedule_times: string[];
          is_prn: boolean;
          take_with_food: boolean;
          key_notes: string[];
          interactions: string[];
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          generic_name?: string | null;
          purpose: string;
          schedule_times?: string[];
          is_prn?: boolean;
          take_with_food?: boolean;
          key_notes?: string[];
          interactions?: string[];
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          generic_name?: string | null;
          purpose?: string;
          schedule_times?: string[];
          is_prn?: boolean;
          take_with_food?: boolean;
          key_notes?: string[];
          interactions?: string[];
          created_at?: string;
        };
      };
      medication_logs: {
        Row: {
          id: string;
          medication_id: string;
          scheduled_time: string | null;
          status: "taken" | "skipped";
          logged_by: string;
          logged_at: string;
          log_date: string;
          notes: string | null;
        };
        Insert: {
          id?: string;
          medication_id: string;
          scheduled_time?: string | null;
          status: "taken" | "skipped";
          logged_by: string;
          logged_at?: string;
          log_date?: string;
          notes?: string | null;
        };
        Update: {
          id?: string;
          medication_id?: string;
          scheduled_time?: string | null;
          status?: "taken" | "skipped";
          logged_by?: string;
          logged_at?: string;
          log_date?: string;
          notes?: string | null;
        };
      };
      sync_log: {
        Row: {
          id: string;
          table_name: string;
          record_id: string;
          action: "INSERT" | "UPDATE" | "DELETE";
          changed_by: string | null;
          changed_at: string;
          payload: Json | null;
        };
        Insert: {
          id?: string;
          table_name: string;
          record_id: string;
          action: "INSERT" | "UPDATE" | "DELETE";
          changed_by?: string | null;
          changed_at?: string;
          payload?: Json | null;
        };
        Update: {
          id?: string;
          table_name?: string;
          record_id?: string;
          action?: "INSERT" | "UPDATE" | "DELETE";
          changed_by?: string | null;
          changed_at?: string;
          payload?: Json | null;
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

// Convenience types
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Medication = Database["public"]["Tables"]["medications"]["Row"];
export type MedicationLog = Database["public"]["Tables"]["medication_logs"]["Row"];
export type MedicationLogInsert = Database["public"]["Tables"]["medication_logs"]["Insert"];
