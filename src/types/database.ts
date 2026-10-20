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
      contact_messages: {
        Row: {
          admin_notes: string | null
          consent_at: string
          country: string
          created_at: string
          email: string
          id: string
          locale: string
          message: string
          name: string
          phone: string | null
          status: Database["public"]["Enums"]["submission_status"]
          subject: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          consent_at?: string
          country: string
          created_at?: string
          email: string
          id?: string
          locale?: string
          message: string
          name: string
          phone?: string | null
          status?: Database["public"]["Enums"]["submission_status"]
          subject: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          consent_at?: string
          country?: string
          created_at?: string
          email?: string
          id?: string
          locale?: string
          message?: string
          name?: string
          phone?: string | null
          status?: Database["public"]["Enums"]["submission_status"]
          subject?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contact_messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      donation_declarations: {
        Row: {
          admin_notes: string | null
          amount_fcfa: number
          consent_at: string
          created_at: string
          email: string
          frequency: string
          id: string
          locale: string
          method: string
          name: string
          phone: string | null
          project: string | null
          reference: string | null
          status: Database["public"]["Enums"]["submission_status"]
          updated_at: string
          user_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          amount_fcfa: number
          consent_at?: string
          created_at?: string
          email: string
          frequency: string
          id?: string
          locale?: string
          method: string
          name: string
          phone?: string | null
          project?: string | null
          reference?: string | null
          status?: Database["public"]["Enums"]["submission_status"]
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          amount_fcfa?: number
          consent_at?: string
          created_at?: string
          email?: string
          frequency?: string
          id?: string
          locale?: string
          method?: string
          name?: string
          phone?: string | null
          project?: string | null
          reference?: string | null
          status?: Database["public"]["Enums"]["submission_status"]
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "donation_declarations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      engagement_applications: {
        Row: {
          admin_notes: string | null
          availability: string[]
          consent_at: string
          country: string
          created_at: string
          email: string
          id: string
          locale: string
          message: string | null
          name: string
          phone: string | null
          profile: string
          skills: string | null
          status: Database["public"]["Enums"]["submission_status"]
          type: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          availability?: string[]
          consent_at?: string
          country: string
          created_at?: string
          email: string
          id?: string
          locale?: string
          message?: string | null
          name: string
          phone?: string | null
          profile: string
          skills?: string | null
          status?: Database["public"]["Enums"]["submission_status"]
          type: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          availability?: string[]
          consent_at?: string
          country?: string
          created_at?: string
          email?: string
          id?: string
          locale?: string
          message?: string | null
          name?: string
          phone?: string | null
          profile?: string
          skills?: string | null
          status?: Database["public"]["Enums"]["submission_status"]
          type?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "engagement_applications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      event_registrations: {
        Row: {
          admin_notes: string | null
          consent_at: string
          created_at: string
          email: string
          event_id: string
          id: string
          locale: string
          name: string
          needs: string | null
          organization: string | null
          phone: string
          seats: number
          status: Database["public"]["Enums"]["submission_status"]
          updated_at: string
          user_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          consent_at?: string
          created_at?: string
          email: string
          event_id: string
          id?: string
          locale?: string
          name: string
          needs?: string | null
          organization?: string | null
          phone: string
          seats?: number
          status?: Database["public"]["Enums"]["submission_status"]
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          consent_at?: string
          created_at?: string
          email?: string
          event_id?: string
          id?: string
          locale?: string
          name?: string
          needs?: string | null
          organization?: string | null
          phone?: string
          seats?: number
          status?: Database["public"]["Enums"]["submission_status"]
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_registrations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_registrations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          body: string[]
          capacity: number | null
          city: string
          created_at: string
          ends_at: string | null
          format: string
          id: string
          image: Json | null
          is_sample: boolean
          published: boolean
          slug: string
          starts_at: string
          summary: string
          title: string
          updated_at: string
          venue: string
        }
        Insert: {
          body?: string[]
          capacity?: number | null
          city?: string
          created_at?: string
          ends_at?: string | null
          format?: string
          id?: string
          image?: Json | null
          is_sample?: boolean
          published?: boolean
          slug: string
          starts_at: string
          summary?: string
          title: string
          updated_at?: string
          venue?: string
        }
        Update: {
          body?: string[]
          capacity?: number | null
          city?: string
          created_at?: string
          ends_at?: string | null
          format?: string
          id?: string
          image?: Json | null
          is_sample?: boolean
          published?: boolean
          slug?: string
          starts_at?: string
          summary?: string
          title?: string
          updated_at?: string
          venue?: string
        }
        Relationships: []
      }
      gallery_items: {
        Row: {
          caption: string
          category: string
          created_at: string
          id: string
          image: Json
          published: boolean
          sort_order: number
          updated_at: string
        }
        Insert: {
          caption?: string
          category: string
          created_at?: string
          id?: string
          image: Json
          published?: boolean
          sort_order?: number
          updated_at?: string
        }
        Update: {
          caption?: string
          category?: string
          created_at?: string
          id?: string
          image?: Json
          published?: boolean
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          confirmed_at: string | null
          consent_at: string
          created_at: string
          email: string
          id: string
          locale: string
          token: string
          unsubscribed_at: string | null
          updated_at: string
        }
        Insert: {
          confirmed_at?: string | null
          consent_at?: string
          created_at?: string
          email: string
          id?: string
          locale?: string
          token?: string
          unsubscribed_at?: string | null
          updated_at?: string
        }
        Update: {
          confirmed_at?: string | null
          consent_at?: string
          created_at?: string
          email?: string
          id?: string
          locale?: string
          token?: string
          unsubscribed_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      partners: {
        Row: {
          country: string
          created_at: string
          description: string
          id: string
          initials: string
          logo: string | null
          name: string
          published: boolean
          sort_order: number
          tone: string
          updated_at: string
          url: string | null
        }
        Insert: {
          country: string
          created_at?: string
          description?: string
          id?: string
          initials: string
          logo?: string | null
          name: string
          published?: boolean
          sort_order?: number
          tone?: string
          updated_at?: string
          url?: string | null
        }
        Update: {
          country?: string
          created_at?: string
          description?: string
          id?: string
          initials?: string
          logo?: string | null
          name?: string
          published?: boolean
          sort_order?: number
          tone?: string
          updated_at?: string
          url?: string | null
        }
        Relationships: []
      }
      partnership_requests: {
        Row: {
          admin_notes: string | null
          budget: string
          consent_at: string
          contact_name: string
          contact_role: string | null
          contributions: string[]
          country: string
          created_at: string
          email: string
          id: string
          interests: string[]
          locale: string
          message: string
          organization: string
          partner_type: string
          phone: string | null
          status: Database["public"]["Enums"]["submission_status"]
          updated_at: string
          user_id: string | null
          website: string | null
        }
        Insert: {
          admin_notes?: string | null
          budget: string
          consent_at?: string
          contact_name: string
          contact_role?: string | null
          contributions?: string[]
          country: string
          created_at?: string
          email: string
          id?: string
          interests?: string[]
          locale?: string
          message: string
          organization: string
          partner_type: string
          phone?: string | null
          status?: Database["public"]["Enums"]["submission_status"]
          updated_at?: string
          user_id?: string | null
          website?: string | null
        }
        Update: {
          admin_notes?: string | null
          budget?: string
          consent_at?: string
          contact_name?: string
          contact_role?: string | null
          contributions?: string[]
          country?: string
          created_at?: string
          email?: string
          id?: string
          interests?: string[]
          locale?: string
          message?: string
          organization?: string
          partner_type?: string
          phone?: string | null
          status?: Database["public"]["Enums"]["submission_status"]
          updated_at?: string
          user_id?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "partnership_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          body: string[]
          category: string
          created_at: string
          excerpt: string
          gallery: Json
          id: string
          image: Json | null
          published: boolean
          published_on: string
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          body?: string[]
          category: string
          created_at?: string
          excerpt?: string
          gallery?: Json
          id?: string
          image?: Json | null
          published?: boolean
          published_on?: string
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          body?: string[]
          category?: string
          created_at?: string
          excerpt?: string
          gallery?: Json
          id?: string
          image?: Json | null
          published?: boolean
          published_on?: string
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          body: string[]
          budget_eur: number | null
          created_at: string
          facts: Json
          gallery: Json
          id: string
          image: Json | null
          location: string
          milestones: Json
          progress: Json | null
          published: boolean
          raised_eur: number | null
          slug: string
          sort_order: number
          status: Database["public"]["Enums"]["project_status"]
          summary: string
          tagline: string
          title: string
          updated_at: string
        }
        Insert: {
          body?: string[]
          budget_eur?: number | null
          created_at?: string
          facts?: Json
          gallery?: Json
          id?: string
          image?: Json | null
          location?: string
          milestones?: Json
          progress?: Json | null
          published?: boolean
          raised_eur?: number | null
          slug: string
          sort_order?: number
          status?: Database["public"]["Enums"]["project_status"]
          summary?: string
          tagline?: string
          title: string
          updated_at?: string
        }
        Update: {
          body?: string[]
          budget_eur?: number | null
          created_at?: string
          facts?: Json
          gallery?: Json
          id?: string
          image?: Json | null
          location?: string
          milestones?: Json
          progress?: Json | null
          published?: boolean
          raised_eur?: number | null
          slug?: string
          sort_order?: number
          status?: Database["public"]["Enums"]["project_status"]
          summary?: string
          tagline?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      role_invitations: {
        Row: {
          created_at: string
          email: string
          invited_by: string | null
          role: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          created_at?: string
          email: string
          invited_by?: string | null
          role: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          created_at?: string
          email?: string
          invited_by?: string | null
          role?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: [
          {
            foreignKeyName: "role_invitations_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      testimonials: {
        Row: {
          created_at: string
          id: string
          initials: string
          is_sample: boolean
          name: string
          photo: string | null
          published: boolean
          quote: string
          role: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          initials?: string
          is_sample?: boolean
          name: string
          photo?: string | null
          published?: boolean
          quote: string
          role?: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          initials?: string
          is_sample?: boolean
          name?: string
          photo?: string | null
          published?: boolean
          quote?: string
          role?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      training_applications: {
        Row: {
          admin_notes: string | null
          age: number
          boarding: boolean
          city: string
          consent_at: string
          created_at: string
          email: string | null
          id: string
          level: string
          locale: string
          motivation: string | null
          name: string
          phone: string
          status: Database["public"]["Enums"]["submission_status"]
          track: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          age: number
          boarding?: boolean
          city: string
          consent_at?: string
          created_at?: string
          email?: string | null
          id?: string
          level: string
          locale?: string
          motivation?: string | null
          name: string
          phone: string
          status?: Database["public"]["Enums"]["submission_status"]
          track: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          age?: number
          boarding?: boolean
          city?: string
          consent_at?: string
          created_at?: string
          email?: string | null
          id?: string
          level?: string
          locale?: string
          motivation?: string | null
          name?: string
          phone?: string
          status?: Database["public"]["Enums"]["submission_status"]
          track?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "training_applications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      event_seats_taken: { Args: { p_event_id: string }; Returns: number }
      is_admin: { Args: never; Returns: boolean }
      is_staff: { Args: never; Returns: boolean }
      my_role: {
        Args: never
        Returns: Database["public"]["Enums"]["user_role"]
      }
    }
    Enums: {
      project_status: "en-preparation" | "en-cours" | "realise"
      submission_status: "nouveau" | "en_cours" | "traite" | "archive"
      user_role: "member" | "editor" | "admin" | "super_admin"
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
      project_status: ["en-preparation", "en-cours", "realise"],
      submission_status: ["nouveau", "en_cours", "traite", "archive"],
      user_role: ["member", "editor", "admin", "super_admin"],
    },
  },
} as const
