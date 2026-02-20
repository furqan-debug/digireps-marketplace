export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      freelancer_services: {
        Row: {
          category_id: string
          created_at: string
          freelancer_id: string
          id: string
        }
        Insert: {
          category_id: string
          created_at?: string
          freelancer_id: string
          id?: string
        }
        Update: {
          category_id?: string
          created_at?: string
          freelancer_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "freelancer_services_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "service_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          order_id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          order_id: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          order_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          budget: number
          category_id: string
          client_id: string
          commission_rate: number
          created_at: string
          deadline: string | null
          description: string
          escrow_status: Database["public"]["Enums"]["escrow_status"]
          freelancer_id: string
          id: string
          status: Database["public"]["Enums"]["order_status"]
          title: string
          updated_at: string
        }
        Insert: {
          budget: number
          category_id: string
          client_id: string
          commission_rate?: number
          created_at?: string
          deadline?: string | null
          description?: string
          escrow_status?: Database["public"]["Enums"]["escrow_status"]
          freelancer_id: string
          id?: string
          status?: Database["public"]["Enums"]["order_status"]
          title: string
          updated_at?: string
        }
        Update: {
          budget?: number
          category_id?: string
          client_id?: string
          commission_rate?: number
          created_at?: string
          deadline?: string | null
          description?: string
          escrow_status?: Database["public"]["Enums"]["escrow_status"]
          freelancer_id?: string
          id?: string
          status?: Database["public"]["Enums"]["order_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "service_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolio_items: {
        Row: {
          created_at: string
          description: string | null
          freelancer_id: string
          id: string
          image_url: string
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          freelancer_id: string
          id?: string
          image_url: string
          title?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          freelancer_id?: string
          id?: string
          image_url?: string
          title?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          application_status:
            | Database["public"]["Enums"]["application_status"]
            | null
          avatar_url: string | null
          bio: string | null
          certifications: Json | null
          company: string | null
          country: string | null
          created_at: string
          display_name: string
          experience_years: number | null
          freelancer_level:
            | Database["public"]["Enums"]["freelancer_level"]
            | null
          headline: string | null
          hourly_rate: number | null
          id: string
          is_suspended: boolean
          last_active_at: string | null
          skills: string[] | null
          timezone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          application_status?:
            | Database["public"]["Enums"]["application_status"]
            | null
          avatar_url?: string | null
          bio?: string | null
          certifications?: Json | null
          company?: string | null
          country?: string | null
          created_at?: string
          display_name?: string
          experience_years?: number | null
          freelancer_level?:
            | Database["public"]["Enums"]["freelancer_level"]
            | null
          headline?: string | null
          hourly_rate?: number | null
          id?: string
          is_suspended?: boolean
          last_active_at?: string | null
          skills?: string[] | null
          timezone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          application_status?:
            | Database["public"]["Enums"]["application_status"]
            | null
          avatar_url?: string | null
          bio?: string | null
          certifications?: Json | null
          company?: string | null
          country?: string | null
          created_at?: string
          display_name?: string
          experience_years?: number | null
          freelancer_level?:
            | Database["public"]["Enums"]["freelancer_level"]
            | null
          headline?: string | null
          hourly_rate?: number | null
          id?: string
          is_suspended?: boolean
          last_active_at?: string | null
          skills?: string[] | null
          timezone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ratings: {
        Row: {
          created_at: string
          id: string
          order_id: string
          rating: number
          review_text: string | null
          reviewee_id: string
          reviewer_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          rating: number
          review_text?: string | null
          reviewee_id: string
          reviewer_id: string
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          rating?: number
          review_text?: string | null
          reviewee_id?: string
          reviewer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ratings_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      service_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      violations: {
        Row: {
          created_at: string
          id: string
          message_content: string | null
          order_id: string | null
          user_id: string
          violation_type: string
        }
        Insert: {
          created_at?: string
          id?: string
          message_content?: string | null
          order_id?: string | null
          user_id: string
          violation_type?: string
        }
        Update: {
          created_at?: string
          id?: string
          message_content?: string | null
          order_id?: string | null
          user_id?: string
          violation_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "violations_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
      is_freelancer_approved: { Args: { _user_id: string }; Returns: boolean }
      is_order_participant: { Args: { _order_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "client" | "freelancer" | "admin"
      application_status: "pending" | "approved" | "rejected"
      escrow_status: "none" | "held" | "released" | "refunded"
      freelancer_level: "verified" | "pro" | "elite"
      order_status:
        | "pending"
        | "accepted"
        | "in_progress"
        | "delivered"
        | "completed"
        | "disputed"
        | "refunded"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["client", "freelancer", "admin"],
      application_status: ["pending", "approved", "rejected"],
      escrow_status: ["none", "held", "released", "refunded"],
      freelancer_level: ["verified", "pro", "elite"],
      order_status: [
        "pending",
        "accepted",
        "in_progress",
        "delivered",
        "completed",
        "disputed",
        "refunded",
      ],
    },
  },
} as const
