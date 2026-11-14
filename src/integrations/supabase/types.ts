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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      assistance_requests: {
        Row: {
          assistance_type: Database["public"]["Enums"]["assistance_type"]
          circumstances: string
          consent_given: boolean
          created_at: string
          email: string
          estimated_need_cad: number | null
          full_name: string
          general_location: string
          id: string
          status: string
        }
        Insert: {
          assistance_type: Database["public"]["Enums"]["assistance_type"]
          circumstances: string
          consent_given: boolean
          created_at?: string
          email: string
          estimated_need_cad?: number | null
          full_name: string
          general_location: string
          id?: string
          status?: string
        }
        Update: {
          assistance_type?: Database["public"]["Enums"]["assistance_type"]
          circumstances?: string
          consent_given?: boolean
          created_at?: string
          email?: string
          estimated_need_cad?: number | null
          full_name?: string
          general_location?: string
          id?: string
          status?: string
        }
        Relationships: []
      }
      campaign_allocations: {
        Row: {
          amount_cad: number
          campaign_id: string
          created_at: string
          id: string
          label: string
          sort_order: number
        }
        Insert: {
          amount_cad: number
          campaign_id: string
          created_at?: string
          id?: string
          label: string
          sort_order?: number
        }
        Update: {
          amount_cad?: number
          campaign_id?: string
          created_at?: string
          id?: string
          label?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "campaign_allocations_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_documents: {
        Row: {
          campaign_id: string
          created_at: string
          file_name: string
          file_path: string
          id: string
          kind: Database["public"]["Enums"]["campaign_document_kind"]
          uploaded_by: string | null
        }
        Insert: {
          campaign_id: string
          created_at?: string
          file_name: string
          file_path: string
          id?: string
          kind: Database["public"]["Enums"]["campaign_document_kind"]
          uploaded_by?: string | null
        }
        Update: {
          campaign_id?: string
          created_at?: string
          file_name?: string
          file_path?: string
          id?: string
          kind?: Database["public"]["Enums"]["campaign_document_kind"]
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_documents_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_verifications: {
        Row: {
          campaign_id: string
          consent_date: string | null
          consent_given: boolean
          consent_scope: string | null
          contact_email: string | null
          contact_phone: string | null
          identity_verified: boolean
          legal_name: string | null
          updated_at: string
          verification_method: string | null
          verification_notes: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          campaign_id: string
          consent_date?: string | null
          consent_given?: boolean
          consent_scope?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          identity_verified?: boolean
          legal_name?: string | null
          updated_at?: string
          verification_method?: string | null
          verification_notes?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          campaign_id?: string
          consent_date?: string | null
          consent_given?: boolean
          consent_scope?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          identity_verified?: boolean
          legal_name?: string | null
          updated_at?: string
          verification_method?: string | null
          verification_notes?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_verifications_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: true
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          beneficiary_display_name: string
          campaign_message: string | null
          category: Database["public"]["Enums"]["assistance_type"]
          created_at: string
          goal_cad: number
          id: string
          kind: Database["public"]["Enums"]["campaign_kind"]
          photo_alt: string | null
          photo_path: string | null
          published_at: string | null
          slug: string
          status: Database["public"]["Enums"]["campaign_status"]
          story: string
          title: string
          updated_at: string
        }
        Insert: {
          beneficiary_display_name: string
          campaign_message?: string | null
          category: Database["public"]["Enums"]["assistance_type"]
          created_at?: string
          goal_cad: number
          id?: string
          kind?: Database["public"]["Enums"]["campaign_kind"]
          photo_alt?: string | null
          photo_path?: string | null
          published_at?: string | null
          slug: string
          status?: Database["public"]["Enums"]["campaign_status"]
          story: string
          title: string
          updated_at?: string
        }
        Update: {
          beneficiary_display_name?: string
          campaign_message?: string | null
          category?: Database["public"]["Enums"]["assistance_type"]
          created_at?: string
          goal_cad?: number
          id?: string
          kind?: Database["public"]["Enums"]["campaign_kind"]
          photo_alt?: string | null
          photo_path?: string | null
          published_at?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["campaign_status"]
          story?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          subject: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          subject: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          subject?: string
        }
        Relationships: []
      }
      donations: {
        Row: {
          amount_cad: number
          campaign_id: string | null
          completed_at: string | null
          created_at: string
          currency: string
          donor_display_name: string | null
          environment: string
          id: string
          is_anonymous: boolean
          provider: string
          provider_payment_id: string | null
          status: Database["public"]["Enums"]["donation_status"]
        }
        Insert: {
          amount_cad: number
          campaign_id?: string | null
          completed_at?: string | null
          created_at?: string
          currency?: string
          donor_display_name?: string | null
          environment?: string
          id?: string
          is_anonymous?: boolean
          provider?: string
          provider_payment_id?: string | null
          status?: Database["public"]["Enums"]["donation_status"]
        }
        Update: {
          amount_cad?: number
          campaign_id?: string | null
          completed_at?: string | null
          created_at?: string
          currency?: string
          donor_display_name?: string | null
          environment?: string
          id?: string
          is_anonymous?: boolean
          provider?: string
          provider_payment_id?: string | null
          status?: Database["public"]["Enums"]["donation_status"]
        }
        Relationships: [
          {
            foreignKeyName: "donations_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_campaign_progress: {
        Args: never
        Returns: {
          campaign_id: string
          donation_count: number
          raised_cad: number
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin"
      assistance_type:
        | "mobility_equipment"
        | "wheelchairs_assistive_devices"
        | "accessible_transportation"
        | "housing_accessibility"
        | "essential_living_expenses"
        | "daily_support"
        | "other"
      campaign_document_kind:
        | "consent_form"
        | "identity"
        | "quote_or_invoice"
        | "assessment"
        | "other"
      campaign_kind: "individual" | "community_appeal"
      campaign_status: "draft" | "published" | "closed"
      donation_status: "pending" | "completed" | "refunded" | "failed"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin"],
      assistance_type: [
        "mobility_equipment",
        "wheelchairs_assistive_devices",
        "accessible_transportation",
        "housing_accessibility",
        "essential_living_expenses",
        "daily_support",
        "other",
      ],
      campaign_document_kind: [
        "consent_form",
        "identity",
        "quote_or_invoice",
        "assessment",
        "other",
      ],
      campaign_kind: ["individual", "community_appeal"],
      campaign_status: ["draft", "published", "closed"],
      donation_status: ["pending", "completed", "refunded", "failed"],
    },
  },
} as const
