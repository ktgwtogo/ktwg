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
      announcements: {
        Row: {
          body: string
          created_at: string
          ends_at: string | null
          id: string
          link_label: string | null
          link_url: string | null
          published: boolean
          starts_at: string
          title: string
          tone: string
          updated_at: string
        }
        Insert: {
          body?: string
          created_at?: string
          ends_at?: string | null
          id?: string
          link_label?: string | null
          link_url?: string | null
          published?: boolean
          starts_at?: string
          title: string
          tone?: string
          updated_at?: string
        }
        Update: {
          body?: string
          created_at?: string
          ends_at?: string | null
          id?: string
          link_label?: string | null
          link_url?: string | null
          published?: boolean
          starts_at?: string
          title?: string
          tone?: string
          updated_at?: string
        }
        Relationships: []
      }
      approval_requests: {
        Row: {
          created_at: string
          decided_at: string | null
          decided_by: string | null
          decision_note: string | null
          id: string
          kind: string
          payload: Json
          requested_by: string | null
          status: Database["public"]["Enums"]["approval_status"]
          summary: string
          title: string
        }
        Insert: {
          created_at?: string
          decided_at?: string | null
          decided_by?: string | null
          decision_note?: string | null
          id?: string
          kind: string
          payload?: Json
          requested_by?: string | null
          status?: Database["public"]["Enums"]["approval_status"]
          summary?: string
          title: string
        }
        Update: {
          created_at?: string
          decided_at?: string | null
          decided_by?: string | null
          decision_note?: string | null
          id?: string
          kind?: string
          payload?: Json
          requested_by?: string | null
          status?: Database["public"]["Enums"]["approval_status"]
          summary?: string
          title?: string
        }
        Relationships: []
      }
      audit_log: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          details: Json
          entity: string
          entity_id: string | null
          id: number
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          details?: Json
          entity?: string
          entity_id?: string | null
          id?: number
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          details?: Json
          entity?: string
          entity_id?: string | null
          id?: number
        }
        Relationships: []
      }
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
          item_description: string | null
          receipt_sent_at: string | null
          kind: string
          receipt_number: string | null
          received_at: string | null
          recorded_by: string | null
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
          item_description?: string | null
          receipt_sent_at?: string | null
          kind?: string
          receipt_number?: string | null
          received_at?: string | null
          recorded_by?: string | null
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
          item_description?: string | null
          receipt_sent_at?: string | null
          kind?: string
          receipt_number?: string | null
          received_at?: string | null
          recorded_by?: string | null
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
      documents: {
        Row: {
          body: string | null
          category: string
          emailed_count: number
          audience: string
          created_at: string
          created_by: string | null
          description: string | null
          file_name: string | null
          file_path: string | null
          id: string
          recipient_id: string | null
          title: string
        }
        Insert: {
          body?: string | null
          category?: string
          emailed_count?: number
          audience: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          file_name?: string | null
          file_path?: string | null
          id?: string
          recipient_id?: string | null
          title: string
        }
        Update: {
          body?: string | null
          category?: string
          emailed_count?: number
          audience?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          file_name?: string | null
          file_path?: string | null
          id?: string
          recipient_id?: string | null
          title?: string
        }
        Relationships: []
      }
      mailings: {
        Row: {
          audience: string
          body: string
          created_at: string
          created_by: string | null
          id: string
          recipients_count: number
          sent_at: string | null
          status: string
          subject: string
        }
        Insert: {
          audience: string
          body: string
          created_at?: string
          created_by?: string | null
          id?: string
          recipients_count?: number
          sent_at?: string | null
          status?: string
          subject: string
        }
        Update: {
          audience?: string
          body?: string
          created_at?: string
          created_by?: string | null
          id?: string
          recipients_count?: number
          sent_at?: string | null
          status?: string
          subject?: string
        }
        Relationships: []
      }
      member_cards: {
        Row: {
          birth_date: string | null
          card_number: string
          created_at: string
          created_by: string | null
          expires_at: string
          full_name: string
          id: string
          issued_at: string
          membership_type: Database["public"]["Enums"]["membership_type"]
          nationality: string | null
          notes: string | null
          photo_path: string | null
          sent_at: string | null
          status: string
          updated_at: string
          user_id: string
          verification_token: string
        }
        Insert: {
          birth_date?: string | null
          card_number: string
          created_at?: string
          created_by?: string | null
          expires_at: string
          full_name: string
          id?: string
          issued_at?: string
          membership_type: Database["public"]["Enums"]["membership_type"]
          nationality?: string | null
          notes?: string | null
          photo_path?: string | null
          sent_at?: string | null
          status?: string
          updated_at?: string
          user_id: string
          verification_token?: string
        }
        Update: {
          birth_date?: string | null
          card_number?: string
          created_at?: string
          created_by?: string | null
          expires_at?: string
          full_name?: string
          id?: string
          issued_at?: string
          membership_type?: Database["public"]["Enums"]["membership_type"]
          nationality?: string | null
          notes?: string | null
          photo_path?: string | null
          sent_at?: string | null
          status?: string
          updated_at?: string
          user_id?: string
          verification_token?: string
        }
        Relationships: []
      }
      member_files: {
        Row: {
          category: string
          created_at: string
          file_name: string
          file_path: string
          id: string
          notes: string | null
          size_bytes: number | null
          title: string
          uploaded_by: string | null
          user_id: string
        }
        Insert: {
          category?: string
          created_at?: string
          file_name: string
          file_path: string
          id?: string
          notes?: string | null
          size_bytes?: number | null
          title: string
          uploaded_by?: string | null
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          file_name?: string
          file_path?: string
          id?: string
          notes?: string | null
          size_bytes?: number | null
          title?: string
          uploaded_by?: string | null
          user_id?: string
        }
        Relationships: []
      }
      membership_applications: {
        Row: {
          availability: string | null
          contribution: string | null
          created_at: string
          decided_at: string | null
          decided_by: string | null
          decision_note: string | null
          id: string
          interests: string[]
          motivation: string
          referral: string | null
          skills: string | null
          statutes_accepted_at: string
          status: Database["public"]["Enums"]["membership_status"]
          type: Database["public"]["Enums"]["membership_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          availability?: string | null
          contribution?: string | null
          created_at?: string
          decided_at?: string | null
          decided_by?: string | null
          decision_note?: string | null
          id?: string
          interests?: string[]
          motivation: string
          referral?: string | null
          skills?: string | null
          statutes_accepted_at?: string
          status?: Database["public"]["Enums"]["membership_status"]
          type: Database["public"]["Enums"]["membership_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          availability?: string | null
          contribution?: string | null
          created_at?: string
          decided_at?: string | null
          decided_by?: string | null
          decision_note?: string | null
          id?: string
          interests?: string[]
          motivation?: string
          referral?: string | null
          skills?: string | null
          statutes_accepted_at?: string
          status?: Database["public"]["Enums"]["membership_status"]
          type?: Database["public"]["Enums"]["membership_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string
          created_at: string
          id: string
          link: string | null
          read_at: string | null
          title: string
          user_id: string
        }
        Insert: {
          body?: string
          created_at?: string
          id?: string
          link?: string | null
          read_at?: string | null
          title: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          link?: string | null
          read_at?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
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
      page_views: {
        Row: {
          created_at: string
          device: string | null
          id: number
          path: string
          referrer: string | null
          user_id: string | null
          visitor: string
        }
        Insert: {
          created_at?: string
          device?: string | null
          id?: number
          path: string
          referrer?: string | null
          user_id?: string | null
          visitor: string
        }
        Update: {
          created_at?: string
          device?: string | null
          id?: number
          path?: string
          referrer?: string | null
          user_id?: string | null
          visitor?: string
        }
        Relationships: []
      }
      pages: {
        Row: {
          blocks: Json
          created_at: string
          description: string
          hero_image: Json | null
          id: string
          published: boolean
          slug: string
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          blocks?: Json
          created_at?: string
          description?: string
          hero_image?: Json | null
          id?: string
          published?: boolean
          slug: string
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          blocks?: Json
          created_at?: string
          description?: string
          hero_image?: Json | null
          id?: string
          published?: boolean
          slug?: string
          sort_order?: number
          title?: string
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
      positions: {
        Row: {
          created_at: string
          description: string
          id: string
          is_system: boolean
          name: string
          permissions: string[]
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string
          id: string
          is_system?: boolean
          name: string
          permissions?: string[]
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          is_system?: boolean
          name?: string
          permissions?: string[]
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      posts: {
        Row: {
          author: string | null
          links: Json
          pinned: boolean
          placements: string[]
          video_url: string | null
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
          author?: string | null
          links?: Json
          pinned?: boolean
          placements?: string[]
          video_url?: string | null
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
          author?: string | null
          links?: Json
          pinned?: boolean
          placements?: string[]
          video_url?: string | null
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
          is_active: boolean
          must_change_password: boolean
          position_id: string | null
          address: string | null
          bio: string | null
          birth_date: string | null
          city: string | null
          civility: string | null
          country: string | null
          first_name: string | null
          last_name: string | null
          member_number: string | null
          member_since: string | null
          membership_status: Database["public"]["Enums"]["membership_status"]
          membership_type: Database["public"]["Enums"]["membership_type"] | null
          nationality: string | null
          organization: string | null
          phone: string | null
          photo_path: string | null
          profession: string | null
          whatsapp: string | null
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          is_active?: boolean
          must_change_password?: boolean
          position_id?: string | null
          address?: string | null
          bio?: string | null
          birth_date?: string | null
          city?: string | null
          civility?: string | null
          country?: string | null
          first_name?: string | null
          last_name?: string | null
          member_number?: string | null
          member_since?: string | null
          membership_status?: Database["public"]["Enums"]["membership_status"]
          membership_type?: Database["public"]["Enums"]["membership_type"] | null
          nationality?: string | null
          organization?: string | null
          phone?: string | null
          photo_path?: string | null
          profession?: string | null
          whatsapp?: string | null
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          is_active?: boolean
          must_change_password?: boolean
          position_id?: string | null
          address?: string | null
          bio?: string | null
          birth_date?: string | null
          city?: string | null
          civility?: string | null
          country?: string | null
          first_name?: string | null
          last_name?: string | null
          member_number?: string | null
          member_since?: string | null
          membership_status?: Database["public"]["Enums"]["membership_status"]
          membership_type?: Database["public"]["Enums"]["membership_type"] | null
          nationality?: string | null
          organization?: string | null
          phone?: string | null
          photo_path?: string | null
          profession?: string | null
          whatsapp?: string | null
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
      rate_limits: {
        Row: { hit_at: string; key: string }
        Insert: { hit_at?: string; key: string }
        Update: { hit_at?: string; key?: string }
        Relationships: []
      }
      reports: {
        Row: {
          audience: string[]
          author_id: string | null
          body: string
          category: string
          created_at: string
          file_name: string | null
          file_path: string | null
          id: string
          period: string
          status: string
          summary: string
          title: string
          updated_at: string
          validated_at: string | null
        }
        Insert: {
          audience?: string[]
          author_id?: string | null
          body?: string
          category?: string
          created_at?: string
          file_name?: string | null
          file_path?: string | null
          id?: string
          period?: string
          status?: string
          summary?: string
          title: string
          updated_at?: string
          validated_at?: string | null
        }
        Update: {
          audience?: string[]
          author_id?: string | null
          body?: string
          category?: string
          created_at?: string
          file_name?: string | null
          file_path?: string | null
          id?: string
          period?: string
          status?: string
          summary?: string
          title?: string
          updated_at?: string
          validated_at?: string | null
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
      site_settings: {
        Row: {
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          updated_by?: string | null
          value: Json
        }
        Update: {
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
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
      record_page_view: { Args: { p_path: string; p_visitor: string; p_referrer?: string | null; p_device?: string | null }; Returns: undefined }
      site_stats: { Args: { p_days?: number }; Returns: Json }
      verify_member_card: {
        Args: { p_token: string }
        Returns: { full_name: string; card_number: string; membership_type: Database["public"]["Enums"]["membership_type"]; issued_at: string; expires_at: string; status: string }[]
      }
      my_position: { Args: never; Returns: string }
      has_permission: { Args: { p_permission: string }; Returns: boolean }
      decide_membership: {
        Args: { p_application_id: string; p_approve: boolean; p_note?: string }
        Returns: string
      }
      is_validated_member: { Args: never; Returns: boolean }
      rate_limit_hit: {
        Args: { p_key: string; p_max: number; p_window: string }
        Returns: boolean
      }
      event_seats_taken: { Args: { p_event_id: string }; Returns: number }
      is_admin: { Args: never; Returns: boolean }
      is_staff: { Args: never; Returns: boolean }
      my_role: {
        Args: never
        Returns: Database["public"]["Enums"]["user_role"]
      }
    }
    Enums: {
      approval_status: "en_attente" | "approuvee" | "rejetee"
      membership_status: "aucune" | "en_attente" | "validee" | "refusee"
      membership_type: "adherent" | "membre" | "donateur"
      project_status: "en-preparation" | "en-cours" | "realise" | "operationnel"
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
      approval_status: ["en_attente", "approuvee", "rejetee"],
      membership_status: ["aucune", "en_attente", "validee", "refusee"],
      membership_type: ["adherent", "membre", "donateur"],
      project_status: ["en-preparation", "en-cours", "realise", "operationnel"],
      submission_status: ["nouveau", "en_cours", "traite", "archive"],
      user_role: ["member", "editor", "admin", "super_admin"],
    },
  },
} as const
