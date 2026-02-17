export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface ScheduleEntry {
  day: number;  // 0=Sunday, 1=Monday, ..., 6=Saturday
  time: string; // "HH:MM"
}

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
          dosage: string | null;
          purpose: string | null;
          is_prn: boolean;
          schedule: ScheduleEntry[];
          min_hours_between: number | null;
          take_with_food: boolean;
          notes: string | null;
          created_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          dosage?: string | null;
          purpose?: string | null;
          is_prn?: boolean;
          schedule?: ScheduleEntry[];
          min_hours_between?: number | null;
          take_with_food?: boolean;
          notes?: string | null;
          created_by: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          dosage?: string | null;
          purpose?: string | null;
          is_prn?: boolean;
          schedule?: ScheduleEntry[];
          min_hours_between?: number | null;
          take_with_food?: boolean;
          notes?: string | null;
          created_by?: string;
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
      tasks: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          assigned_to: string;
          assigned_by: string;
          status: "pending" | "completed";
          due_date: string | null;
          completed_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          assigned_to: string;
          assigned_by: string;
          status?: "pending" | "completed";
          due_date?: string | null;
          completed_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          assigned_to?: string;
          assigned_by?: string;
          status?: "pending" | "completed";
          due_date?: string | null;
          completed_at?: string | null;
          created_at?: string;
        };
      };
      feeling_checkins: {
        Row: {
          id: string;
          user_id: string;
          period: "morning" | "afternoon" | "evening";
          pain_level: number;
          mood_level: number;
          energy_level: number;
          notes: string | null;
          checkin_date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          period: "morning" | "afternoon" | "evening";
          pain_level: number;
          mood_level: number;
          energy_level: number;
          notes?: string | null;
          checkin_date?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          period?: "morning" | "afternoon" | "evening";
          pain_level?: number;
          mood_level?: number;
          energy_level?: number;
          notes?: string | null;
          checkin_date?: string;
          created_at?: string;
        };
      };
      care_activities: {
        Row: {
          id: string;
          category: "wound_care" | "exercise" | "hygiene" | "nutrition" | "other";
          description: string;
          logged_by: string;
          activity_date: string;
          activity_time: string;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          category: "wound_care" | "exercise" | "hygiene" | "nutrition" | "other";
          description: string;
          logged_by: string;
          activity_date?: string;
          activity_time?: string;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          category?: "wound_care" | "exercise" | "hygiene" | "nutrition" | "other";
          description?: string;
          logged_by?: string;
          activity_date?: string;
          activity_time?: string;
          notes?: string | null;
          created_at?: string;
        };
      };
      doctor_contacts: {
        Row: {
          id: string;
          name: string;
          specialty: string | null;
          phone: string;
          is_emergency: boolean;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          specialty?: string | null;
          phone: string;
          is_emergency?: boolean;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          specialty?: string | null;
          phone?: string;
          is_emergency?: boolean;
          notes?: string | null;
          created_at?: string;
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
export type MedicationInsert = Database["public"]["Tables"]["medications"]["Insert"];
export type MedicationLog = Database["public"]["Tables"]["medication_logs"]["Row"];
export type MedicationLogInsert = Database["public"]["Tables"]["medication_logs"]["Insert"];
