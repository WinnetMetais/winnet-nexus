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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      activity_log: {
        Row: {
          created_at: string
          event_type: string
          id: number
          metadata: Json | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: never
          metadata?: Json | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: never
          metadata?: Json | null
          user_id?: string | null
        }
        Relationships: []
      }
      admins: {
        Row: {
          created_at: string
          id: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: never
          user_id: string
        }
        Update: {
          created_at?: string
          id?: never
          user_id?: string
        }
        Relationships: []
      }
      app_889475991a_activities: {
        Row: {
          activity_date: string
          activity_type: string
          assigned_to: string | null
          created_at: string
          created_by: string
          description: string | null
          entity_id: string
          entity_type: string
          id: string
          title: string
        }
        Insert: {
          activity_date?: string
          activity_type: string
          assigned_to?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          entity_id: string
          entity_type: string
          id?: string
          title: string
        }
        Update: {
          activity_date?: string
          activity_type?: string
          assigned_to?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          entity_id?: string
          entity_type?: string
          id?: string
          title?: string
        }
        Relationships: []
      }
      app_889475991a_attachments: {
        Row: {
          created_at: string
          entity_id: string
          entity_type: string
          file_name: string
          file_size: number | null
          file_type: string | null
          file_url: string
          id: string
          storage_path: string | null
          uploaded_by: string
        }
        Insert: {
          created_at?: string
          entity_id: string
          entity_type: string
          file_name: string
          file_size?: number | null
          file_type?: string | null
          file_url: string
          id?: string
          storage_path?: string | null
          uploaded_by: string
        }
        Update: {
          created_at?: string
          entity_id?: string
          entity_type?: string
          file_name?: string
          file_size?: number | null
          file_type?: string | null
          file_url?: string
          id?: string
          storage_path?: string | null
          uploaded_by?: string
        }
        Relationships: []
      }
      app_889475991a_audit_logs: {
        Row: {
          action: string
          changed_fields: string[] | null
          created_at: string
          id: string
          ip_address: unknown | null
          new_values: Json | null
          old_values: Json | null
          record_id: string
          table_name: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          changed_fields?: string[] | null
          created_at?: string
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          record_id: string
          table_name: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          changed_fields?: string[] | null
          created_at?: string
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string
          table_name?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      app_889475991a_audit_trail: {
        Row: {
          action: string
          changed_fields: string[] | null
          created_at: string
          id: string
          ip_address: unknown | null
          new_values: Json | null
          old_values: Json | null
          record_id: string
          table_name: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          changed_fields?: string[] | null
          created_at?: string
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          record_id: string
          table_name: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          changed_fields?: string[] | null
          created_at?: string
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string
          table_name?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      app_889475991a_cash_flow: {
        Row: {
          amount: number
          category: string
          created_at: string
          created_by: string
          description: string
          id: string
          notes: string | null
          payment_method: string | null
          reference_id: string | null
          reference_type: string | null
          status: string | null
          subcategory: string | null
          tags: string[] | null
          transaction_date: string
          transaction_type: string
          updated_at: string
        }
        Insert: {
          amount: number
          category: string
          created_at?: string
          created_by: string
          description: string
          id?: string
          notes?: string | null
          payment_method?: string | null
          reference_id?: string | null
          reference_type?: string | null
          status?: string | null
          subcategory?: string | null
          tags?: string[] | null
          transaction_date: string
          transaction_type: string
          updated_at?: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          created_by?: string
          description?: string
          id?: string
          notes?: string | null
          payment_method?: string | null
          reference_id?: string | null
          reference_type?: string | null
          status?: string | null
          subcategory?: string | null
          tags?: string[] | null
          transaction_date?: string
          transaction_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      app_889475991a_commission_structure: {
        Row: {
          base_percentage: number | null
          commission_type: string
          created_at: string
          created_by: string
          effective_from: string
          effective_to: string | null
          id: string
          is_active: boolean | null
          maximum_amount: number | null
          minimum_amount: number | null
          tiers: Json | null
          user_id: string
        }
        Insert: {
          base_percentage?: number | null
          commission_type: string
          created_at?: string
          created_by: string
          effective_from: string
          effective_to?: string | null
          id?: string
          is_active?: boolean | null
          maximum_amount?: number | null
          minimum_amount?: number | null
          tiers?: Json | null
          user_id: string
        }
        Update: {
          base_percentage?: number | null
          commission_type?: string
          created_at?: string
          created_by?: string
          effective_from?: string
          effective_to?: string | null
          id?: string
          is_active?: boolean | null
          maximum_amount?: number | null
          minimum_amount?: number | null
          tiers?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      app_889475991a_companies: {
        Row: {
          address: string | null
          city: string | null
          cnpj: string | null
          company_size: string | null
          created_at: string
          created_by: string
          deleted_at: string | null
          email: string | null
          id: string
          industry: string | null
          metadata: Json | null
          name: string
          notes: string | null
          phone: string | null
          state: string | null
          status: string | null
          updated_at: string
          website: string | null
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          cnpj?: string | null
          company_size?: string | null
          created_at?: string
          created_by: string
          deleted_at?: string | null
          email?: string | null
          id?: string
          industry?: string | null
          metadata?: Json | null
          name: string
          notes?: string | null
          phone?: string | null
          state?: string | null
          status?: string | null
          updated_at?: string
          website?: string | null
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          cnpj?: string | null
          company_size?: string | null
          created_at?: string
          created_by?: string
          deleted_at?: string | null
          email?: string | null
          id?: string
          industry?: string | null
          metadata?: Json | null
          name?: string
          notes?: string | null
          phone?: string | null
          state?: string | null
          status?: string | null
          updated_at?: string
          website?: string | null
          zip_code?: string | null
        }
        Relationships: []
      }
      app_889475991a_contacts: {
        Row: {
          company_id: string | null
          created_at: string
          created_by: string
          deleted_at: string | null
          department: string | null
          email: string | null
          id: string
          is_primary: boolean | null
          metadata: Json | null
          name: string
          notes: string | null
          phone: string | null
          position: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          created_by: string
          deleted_at?: string | null
          department?: string | null
          email?: string | null
          id?: string
          is_primary?: boolean | null
          metadata?: Json | null
          name: string
          notes?: string | null
          phone?: string | null
          position?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          company_id?: string | null
          created_at?: string
          created_by?: string
          deleted_at?: string | null
          department?: string | null
          email?: string | null
          id?: string
          is_primary?: boolean | null
          metadata?: Json | null
          name?: string
          notes?: string | null
          phone?: string | null
          position?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "app_889475991a_contacts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "app_889475991a_companies"
            referencedColumns: ["id"]
          },
        ]
      }
      app_889475991a_customer_segments: {
        Row: {
          created_at: string
          created_by: string
          criteria: Json
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          criteria: Json
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          criteria?: Json
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      app_889475991a_documents: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          document_type: string | null
          entity_id: string | null
          entity_type: string | null
          file_path: string
          file_size: number | null
          filename: string
          id: string
          is_public: boolean | null
          mime_type: string | null
          original_filename: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          document_type?: string | null
          entity_id?: string | null
          entity_type?: string | null
          file_path: string
          file_size?: number | null
          filename: string
          id?: string
          is_public?: boolean | null
          mime_type?: string | null
          original_filename: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          document_type?: string | null
          entity_id?: string | null
          entity_type?: string | null
          file_path?: string
          file_size?: number | null
          filename?: string
          id?: string
          is_public?: boolean | null
          mime_type?: string | null
          original_filename?: string
        }
        Relationships: []
      }
      app_889475991a_email_templates: {
        Row: {
          body_html: string
          body_text: string | null
          created_at: string
          created_by: string
          id: string
          is_active: boolean | null
          name: string
          subject: string
          template_type: string | null
          updated_at: string
          variables: Json | null
        }
        Insert: {
          body_html: string
          body_text?: string | null
          created_at?: string
          created_by: string
          id?: string
          is_active?: boolean | null
          name: string
          subject: string
          template_type?: string | null
          updated_at?: string
          variables?: Json | null
        }
        Update: {
          body_html?: string
          body_text?: string | null
          created_at?: string
          created_by?: string
          id?: string
          is_active?: boolean | null
          name?: string
          subject?: string
          template_type?: string | null
          updated_at?: string
          variables?: Json | null
        }
        Relationships: []
      }
      app_889475991a_integration_logs: {
        Row: {
          created_at: string
          error_message: string | null
          execution_time_ms: number | null
          id: string
          integration_name: string
          operation: string
          request_data: Json | null
          response_data: Json | null
          status: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          execution_time_ms?: number | null
          id?: string
          integration_name: string
          operation: string
          request_data?: Json | null
          response_data?: Json | null
          status: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          execution_time_ms?: number | null
          id?: string
          integration_name?: string
          operation?: string
          request_data?: Json | null
          response_data?: Json | null
          status?: string
        }
        Relationships: []
      }
      app_889475991a_invoices: {
        Row: {
          company_id: string
          created_at: string
          created_by: string
          deleted_at: string | null
          due_date: string
          id: string
          invoice_number: string
          issue_date: string
          notes: string | null
          paid_amount: number | null
          payment_method: string | null
          remaining_amount: number
          sale_id: string | null
          status: string | null
          total_amount: number
          updated_at: string
        }
        Insert: {
          company_id: string
          created_at?: string
          created_by: string
          deleted_at?: string | null
          due_date: string
          id?: string
          invoice_number: string
          issue_date: string
          notes?: string | null
          paid_amount?: number | null
          payment_method?: string | null
          remaining_amount: number
          sale_id?: string | null
          status?: string | null
          total_amount: number
          updated_at?: string
        }
        Update: {
          company_id?: string
          created_at?: string
          created_by?: string
          deleted_at?: string | null
          due_date?: string
          id?: string
          invoice_number?: string
          issue_date?: string
          notes?: string | null
          paid_amount?: number | null
          payment_method?: string | null
          remaining_amount?: number
          sale_id?: string | null
          status?: string | null
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "app_889475991a_invoices_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "app_889475991a_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "app_889475991a_invoices_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "app_889475991a_sales"
            referencedColumns: ["id"]
          },
        ]
      }
      app_889475991a_leads: {
        Row: {
          address: string | null
          assigned_to: string | null
          city: string | null
          cnpj_cpf: string | null
          company_id: string | null
          contact_id: string | null
          created_at: string
          created_by: string
          deleted_at: string | null
          description: string | null
          estimated_value: number | null
          expected_close_date: string | null
          id: string
          metadata: Json | null
          notes: string | null
          origin: Database["public"]["Enums"]["lead_origin"] | null
          priority: string | null
          probability: number | null
          requester_name: string | null
          source: string | null
          state: string | null
          status: Database["public"]["Enums"]["lead_status"] | null
          tags: string[] | null
          title: string
          updated_at: string
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          assigned_to?: string | null
          city?: string | null
          cnpj_cpf?: string | null
          company_id?: string | null
          contact_id?: string | null
          created_at?: string
          created_by: string
          deleted_at?: string | null
          description?: string | null
          estimated_value?: number | null
          expected_close_date?: string | null
          id?: string
          metadata?: Json | null
          notes?: string | null
          origin?: Database["public"]["Enums"]["lead_origin"] | null
          priority?: string | null
          probability?: number | null
          requester_name?: string | null
          source?: string | null
          state?: string | null
          status?: Database["public"]["Enums"]["lead_status"] | null
          tags?: string[] | null
          title: string
          updated_at?: string
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          assigned_to?: string | null
          city?: string | null
          cnpj_cpf?: string | null
          company_id?: string | null
          contact_id?: string | null
          created_at?: string
          created_by?: string
          deleted_at?: string | null
          description?: string | null
          estimated_value?: number | null
          expected_close_date?: string | null
          id?: string
          metadata?: Json | null
          notes?: string | null
          origin?: Database["public"]["Enums"]["lead_origin"] | null
          priority?: string | null
          probability?: number | null
          requester_name?: string | null
          source?: string | null
          state?: string | null
          status?: Database["public"]["Enums"]["lead_status"] | null
          tags?: string[] | null
          title?: string
          updated_at?: string
          zip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "app_889475991a_leads_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "app_889475991a_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "app_889475991a_leads_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "app_889475991a_contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      app_889475991a_notifications: {
        Row: {
          created_at: string
          entity_id: string | null
          entity_type: string | null
          id: string
          message: string
          read_at: string | null
          title: string
          type: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          message: string
          read_at?: string | null
          title: string
          type?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          message?: string
          read_at?: string | null
          title?: string
          type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      app_889475991a_opportunities: {
        Row: {
          actual_close_date: string | null
          assigned_to: string
          company_id: string
          competitors: string[] | null
          contact_id: string | null
          created_at: string
          created_by: string
          decision_makers: string[] | null
          deleted_at: string | null
          description: string | null
          expected_close_date: string | null
          id: string
          lead_id: string | null
          metadata: Json | null
          next_action: string | null
          next_action_date: string | null
          notes: string | null
          probability: number | null
          products_services: string[] | null
          stage: string | null
          title: string
          updated_at: string
          value: number
        }
        Insert: {
          actual_close_date?: string | null
          assigned_to: string
          company_id: string
          competitors?: string[] | null
          contact_id?: string | null
          created_at?: string
          created_by: string
          decision_makers?: string[] | null
          deleted_at?: string | null
          description?: string | null
          expected_close_date?: string | null
          id?: string
          lead_id?: string | null
          metadata?: Json | null
          next_action?: string | null
          next_action_date?: string | null
          notes?: string | null
          probability?: number | null
          products_services?: string[] | null
          stage?: string | null
          title: string
          updated_at?: string
          value: number
        }
        Update: {
          actual_close_date?: string | null
          assigned_to?: string
          company_id?: string
          competitors?: string[] | null
          contact_id?: string | null
          created_at?: string
          created_by?: string
          decision_makers?: string[] | null
          deleted_at?: string | null
          description?: string | null
          expected_close_date?: string | null
          id?: string
          lead_id?: string | null
          metadata?: Json | null
          next_action?: string | null
          next_action_date?: string | null
          notes?: string | null
          probability?: number | null
          products_services?: string[] | null
          stage?: string | null
          title?: string
          updated_at?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "app_889475991a_opportunities_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "app_889475991a_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "app_889475991a_opportunities_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "app_889475991a_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "app_889475991a_opportunities_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "app_889475991a_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      app_889475991a_payments: {
        Row: {
          amount: number
          created_at: string
          created_by: string
          id: string
          invoice_id: string
          notes: string | null
          payment_date: string
          payment_method: string
          reference_number: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          created_by: string
          id?: string
          invoice_id: string
          notes?: string | null
          payment_date: string
          payment_method: string
          reference_number?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          created_by?: string
          id?: string
          invoice_id?: string
          notes?: string | null
          payment_date?: string
          payment_method?: string
          reference_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "app_889475991a_payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "app_889475991a_invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      app_889475991a_pipeline_stages: {
        Row: {
          color: string | null
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean | null
          is_system: boolean | null
          name: string
          stage_key: string
          stage_order: number
        }
        Insert: {
          color?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          is_system?: boolean | null
          name: string
          stage_key: string
          stage_order: number
        }
        Update: {
          color?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          is_system?: boolean | null
          name?: string
          stage_key?: string
          stage_order?: number
        }
        Relationships: []
      }
      app_889475991a_products: {
        Row: {
          category: string | null
          created_at: string
          created_by: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          sku: string | null
          specifications: Json | null
          unit_of_measure: string | null
          unit_price: number | null
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          sku?: string | null
          specifications?: Json | null
          unit_of_measure?: string | null
          unit_price?: number | null
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          sku?: string | null
          specifications?: Json | null
          unit_of_measure?: string | null
          unit_price?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      app_889475991a_proposal_items: {
        Row: {
          created_at: string
          description: string | null
          id: string
          product_service: string
          proposal_id: string | null
          quantity: number
          total_price: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          product_service: string
          proposal_id?: string | null
          quantity: number
          total_price: number
          unit_price: number
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          product_service?: string
          proposal_id?: string | null
          quantity?: number
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "app_889475991a_proposal_items_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "app_889475991a_proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      app_889475991a_proposals: {
        Row: {
          created_at: string
          created_by: string
          deleted_at: string | null
          description: string | null
          discount_percentage: number | null
          discount_value: number | null
          final_value: number
          id: string
          notes: string | null
          opportunity_id: string
          proposal_number: string
          response_date: string | null
          sent_date: string | null
          status: string | null
          terms_conditions: string | null
          title: string
          total_value: number
          updated_at: string
          validity_days: number | null
          viewed_date: string | null
        }
        Insert: {
          created_at?: string
          created_by: string
          deleted_at?: string | null
          description?: string | null
          discount_percentage?: number | null
          discount_value?: number | null
          final_value: number
          id?: string
          notes?: string | null
          opportunity_id: string
          proposal_number: string
          response_date?: string | null
          sent_date?: string | null
          status?: string | null
          terms_conditions?: string | null
          title: string
          total_value: number
          updated_at?: string
          validity_days?: number | null
          viewed_date?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string
          deleted_at?: string | null
          description?: string | null
          discount_percentage?: number | null
          discount_value?: number | null
          final_value?: number
          id?: string
          notes?: string | null
          opportunity_id?: string
          proposal_number?: string
          response_date?: string | null
          sent_date?: string | null
          status?: string | null
          terms_conditions?: string | null
          title?: string
          total_value?: number
          updated_at?: string
          validity_days?: number | null
          viewed_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "app_889475991a_proposals_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "app_889475991a_opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      app_889475991a_quote_items: {
        Row: {
          created_at: string
          description: string
          id: string
          product_code: string | null
          product_id: string | null
          quantity: number
          quote_id: string
          total_price: number
          unit: string
          unit_price: number
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          product_code?: string | null
          product_id?: string | null
          quantity?: number
          quote_id: string
          total_price: number
          unit?: string
          unit_price: number
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          product_code?: string | null
          product_id?: string | null
          quantity?: number
          quote_id?: string
          total_price?: number
          unit?: string
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "app_889475991a_quote_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "app_889475991a_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "app_889475991a_quote_items_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "app_889475991a_quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      app_889475991a_quotes: {
        Row: {
          company_id: string | null
          contact_id: string | null
          created_at: string
          created_by: string
          delivery_time: string | null
          discount_amount: number | null
          discount_percentage: number | null
          id: string
          lead_id: string | null
          observations: string | null
          payment_terms: string | null
          quote_date: string
          quote_number: string
          status: Database["public"]["Enums"]["quote_status"] | null
          subtotal: number
          total_amount: number
          updated_at: string
          user_id: string | null
          valid_until: string
          warranty: string | null
        }
        Insert: {
          company_id?: string | null
          contact_id?: string | null
          created_at?: string
          created_by: string
          delivery_time?: string | null
          discount_amount?: number | null
          discount_percentage?: number | null
          id?: string
          lead_id?: string | null
          observations?: string | null
          payment_terms?: string | null
          quote_date?: string
          quote_number: string
          status?: Database["public"]["Enums"]["quote_status"] | null
          subtotal?: number
          total_amount?: number
          updated_at?: string
          user_id?: string | null
          valid_until: string
          warranty?: string | null
        }
        Update: {
          company_id?: string | null
          contact_id?: string | null
          created_at?: string
          created_by?: string
          delivery_time?: string | null
          discount_amount?: number | null
          discount_percentage?: number | null
          id?: string
          lead_id?: string | null
          observations?: string | null
          payment_terms?: string | null
          quote_date?: string
          quote_number?: string
          status?: Database["public"]["Enums"]["quote_status"] | null
          subtotal?: number
          total_amount?: number
          updated_at?: string
          user_id?: string | null
          valid_until?: string
          warranty?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "app_889475991a_quotes_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "app_889475991a_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "app_889475991a_quotes_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "app_889475991a_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "app_889475991a_quotes_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "app_889475991a_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      app_889475991a_sales: {
        Row: {
          assigned_to: string
          commission_percentage: number | null
          commission_value: number | null
          company_id: string
          contact_id: string | null
          created_at: string
          created_by: string
          deleted_at: string | null
          delivery_date: string | null
          id: string
          notes: string | null
          opportunity_id: string | null
          payment_terms: string | null
          proposal_id: string | null
          sale_date: string
          sale_number: string
          status: string | null
          title: string
          total_value: number
          updated_at: string
        }
        Insert: {
          assigned_to: string
          commission_percentage?: number | null
          commission_value?: number | null
          company_id: string
          contact_id?: string | null
          created_at?: string
          created_by: string
          deleted_at?: string | null
          delivery_date?: string | null
          id?: string
          notes?: string | null
          opportunity_id?: string | null
          payment_terms?: string | null
          proposal_id?: string | null
          sale_date: string
          sale_number: string
          status?: string | null
          title: string
          total_value: number
          updated_at?: string
        }
        Update: {
          assigned_to?: string
          commission_percentage?: number | null
          commission_value?: number | null
          company_id?: string
          contact_id?: string | null
          created_at?: string
          created_by?: string
          deleted_at?: string | null
          delivery_date?: string | null
          id?: string
          notes?: string | null
          opportunity_id?: string | null
          payment_terms?: string | null
          proposal_id?: string | null
          sale_date?: string
          sale_number?: string
          status?: string | null
          title?: string
          total_value?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "app_889475991a_sales_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "app_889475991a_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "app_889475991a_sales_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "app_889475991a_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "app_889475991a_sales_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "app_889475991a_opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "app_889475991a_sales_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "app_889475991a_proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      app_889475991a_sales_targets: {
        Row: {
          achieved_deals: number | null
          achieved_revenue: number | null
          created_at: string
          created_by: string
          deals_target: number | null
          id: string
          is_active: boolean | null
          revenue_target: number
          target_month: number | null
          target_period: string
          target_quarter: number | null
          target_year: number
          updated_at: string
          user_id: string
        }
        Insert: {
          achieved_deals?: number | null
          achieved_revenue?: number | null
          created_at?: string
          created_by: string
          deals_target?: number | null
          id?: string
          is_active?: boolean | null
          revenue_target: number
          target_month?: number | null
          target_period: string
          target_quarter?: number | null
          target_year: number
          updated_at?: string
          user_id: string
        }
        Update: {
          achieved_deals?: number | null
          achieved_revenue?: number | null
          created_at?: string
          created_by?: string
          deals_target?: number | null
          id?: string
          is_active?: boolean | null
          revenue_target?: number
          target_month?: number | null
          target_period?: string
          target_quarter?: number | null
          target_year?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      app_889475991a_tasks: {
        Row: {
          assigned_to: string
          completed_at: string | null
          created_at: string
          created_by: string
          description: string | null
          due_date: string | null
          entity_id: string | null
          entity_type: string | null
          id: string
          priority: string | null
          status: string | null
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to: string
          completed_at?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          due_date?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          priority?: string | null
          status?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string
          completed_at?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          due_date?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          priority?: string | null
          status?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      app_889475991a_user_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          department: string | null
          full_name: string | null
          id: string
          phone: string | null
          preferences: Json | null
          role: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          department?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          preferences?: Json | null
          role?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          department?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          preferences?: Json | null
          role?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      clientes: {
        Row: {
          cep: string | null
          cidade: string | null
          cpf_ou_cnpj: number | null
          created_at: string | null
          created_by: string | null
          email: string
          empresa: string | null
          endereco: string | null
          estado: string | null
          id: string
          nome: string
          observacoes: string | null
          origem_lead: string | null
          status: string | null
          telefone: string | null
          updated_at: string | null
        }
        Insert: {
          cep?: string | null
          cidade?: string | null
          cpf_ou_cnpj?: number | null
          created_at?: string | null
          created_by?: string | null
          email: string
          empresa?: string | null
          endereco?: string | null
          estado?: string | null
          id?: string
          nome: string
          observacoes?: string | null
          origem_lead?: string | null
          status?: string | null
          telefone?: string | null
          updated_at?: string | null
        }
        Update: {
          cep?: string | null
          cidade?: string | null
          cpf_ou_cnpj?: number | null
          created_at?: string | null
          created_by?: string | null
          email?: string
          empresa?: string | null
          endereco?: string | null
          estado?: string | null
          id?: string
          nome?: string
          observacoes?: string | null
          origem_lead?: string | null
          status?: string | null
          telefone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      itens_orcamento: {
        Row: {
          codigo: string | null
          created_at: string | null
          descricao: string
          id: string
          orcamento_id: string | null
          quantidade: number | null
          total: number | null
          unidade: string | null
          valor_unitario: number
        }
        Insert: {
          codigo?: string | null
          created_at?: string | null
          descricao: string
          id?: string
          orcamento_id?: string | null
          quantidade?: number | null
          total?: number | null
          unidade?: string | null
          valor_unitario: number
        }
        Update: {
          codigo?: string | null
          created_at?: string | null
          descricao?: string
          id?: string
          orcamento_id?: string | null
          quantidade?: number | null
          total?: number | null
          unidade?: string | null
          valor_unitario?: number
        }
        Relationships: [
          {
            foreignKeyName: "itens_orcamento_orcamento_id_fkey"
            columns: ["orcamento_id"]
            isOneToOne: false
            referencedRelation: "orcamentos"
            referencedColumns: ["id"]
          },
        ]
      }
      lancamentos_financeiros: {
        Row: {
          categoria: string | null
          created_at: string | null
          created_by: string | null
          data_lancamento: string | null
          descricao: string
          id: string
          status: string | null
          tipo: string
          valor: number
          venda_id: string | null
        }
        Insert: {
          categoria?: string | null
          created_at?: string | null
          created_by?: string | null
          data_lancamento?: string | null
          descricao: string
          id?: string
          status?: string | null
          tipo: string
          valor: number
          venda_id?: string | null
        }
        Update: {
          categoria?: string | null
          created_at?: string | null
          created_by?: string | null
          data_lancamento?: string | null
          descricao?: string
          id?: string
          status?: string | null
          tipo?: string
          valor?: number
          venda_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lancamentos_financeiros_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lancamentos_financeiros_venda_id_fkey"
            columns: ["venda_id"]
            isOneToOne: false
            referencedRelation: "vendas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lancamentos_financeiros_venda_id_fkey"
            columns: ["venda_id"]
            isOneToOne: false
            referencedRelation: "vw_pendentes_financeiros"
            referencedColumns: ["venda_id"]
          },
        ]
      }
      logs: {
        Row: {
          created_at: string | null
          id: string
          mensagem: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          mensagem: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          mensagem?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      notificacoes: {
        Row: {
          created_at: string | null
          id: string
          lida: boolean | null
          mensagem: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          lida?: boolean | null
          mensagem: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          lida?: boolean | null
          mensagem?: string
          user_id?: string
        }
        Relationships: []
      }
      orcamentos: {
        Row: {
          cliente_id: string | null
          created_at: string | null
          created_by: string | null
          data_vencimento: string
          desconto_percentual: number | null
          forma_pagamento: string | null
          garantia: string | null
          id: string
          numero_orcamento: string | null
          observacoes: string | null
          prazo_entrega: string | null
          solicitado_por: string | null
          status: string | null
          subtotal: number | null
          updated_at: string | null
          valor_total: number
        }
        Insert: {
          cliente_id?: string | null
          created_at?: string | null
          created_by?: string | null
          data_vencimento: string
          desconto_percentual?: number | null
          forma_pagamento?: string | null
          garantia?: string | null
          id?: string
          numero_orcamento?: string | null
          observacoes?: string | null
          prazo_entrega?: string | null
          solicitado_por?: string | null
          status?: string | null
          subtotal?: number | null
          updated_at?: string | null
          valor_total?: number
        }
        Update: {
          cliente_id?: string | null
          created_at?: string | null
          created_by?: string | null
          data_vencimento?: string
          desconto_percentual?: number | null
          forma_pagamento?: string | null
          garantia?: string | null
          id?: string
          numero_orcamento?: string | null
          observacoes?: string | null
          prazo_entrega?: string | null
          solicitado_por?: string | null
          status?: string | null
          subtotal?: number | null
          updated_at?: string | null
          valor_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "orcamentos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orcamentos_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      pagamentos: {
        Row: {
          created_at: string | null
          created_by: string | null
          data_pagamento: string | null
          id: string
          metodo: string | null
          parcela_num: number | null
          status: string | null
          total_parcelas: number | null
          updated_at: string | null
          valor_pago: number
          venda_id: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          data_pagamento?: string | null
          id?: string
          metodo?: string | null
          parcela_num?: number | null
          status?: string | null
          total_parcelas?: number | null
          updated_at?: string | null
          valor_pago: number
          venda_id?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          data_pagamento?: string | null
          id?: string
          metodo?: string | null
          parcela_num?: number | null
          status?: string | null
          total_parcelas?: number | null
          updated_at?: string | null
          valor_pago?: number
          venda_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pagamentos_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pagamentos_venda_id_fkey"
            columns: ["venda_id"]
            isOneToOne: false
            referencedRelation: "vendas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pagamentos_venda_id_fkey"
            columns: ["venda_id"]
            isOneToOne: false
            referencedRelation: "vw_pendentes_financeiros"
            referencedColumns: ["venda_id"]
          },
        ]
      }
      rate_limit_log: {
        Row: {
          action: string
          id: string
          ip_address: unknown | null
          timestamp: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          id?: string
          ip_address?: unknown | null
          timestamp?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          id?: string
          ip_address?: unknown | null
          timestamp?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      usuarios: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          email: string
          id: string
          nome: string
          role: string | null
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          email: string
          id: string
          nome: string
          role?: string | null
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          email?: string
          id?: string
          nome?: string
          role?: string | null
        }
        Relationships: []
      }
      vendas: {
        Row: {
          created_at: string | null
          created_by: string | null
          data_venda: string | null
          forma_pagamento: string | null
          id: string
          orcamento_id: string | null
          status: string | null
          valor_total: number
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          data_venda?: string | null
          forma_pagamento?: string | null
          id?: string
          orcamento_id?: string | null
          status?: string | null
          valor_total: number
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          data_venda?: string | null
          forma_pagamento?: string | null
          id?: string
          orcamento_id?: string | null
          status?: string | null
          valor_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "vendas_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendas_orcamento_id_fkey"
            columns: ["orcamento_id"]
            isOneToOne: false
            referencedRelation: "orcamentos"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      vw_fluxo_caixa: {
        Row: {
          mes: string | null
          saldo: number | null
          total_entradas: number | null
          total_saidas: number | null
        }
        Relationships: []
      }
      vw_kpis_financeiros: {
        Row: {
          entradas_mes_atual: number | null
          pagamentos_pendentes: number | null
          saidas_mes_atual: number | null
          total_entradas: number | null
          total_saidas: number | null
          vendas_pendentes: number | null
        }
        Relationships: []
      }
      vw_pendentes_financeiros: {
        Row: {
          cliente_nome: string | null
          data_pagamento: string | null
          data_vencimento: string | null
          data_venda: string | null
          forma_pagamento: string | null
          lancamento_status: string | null
          numero_orcamento: string | null
          pagamento_status: string | null
          valor_total: number | null
          venda_id: string | null
          venda_status: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      create_notification: {
        Args: {
          entity_id?: string
          entity_type?: string
          notification_message: string
          notification_title: string
          notification_type?: string
          target_user_id: string
        }
        Returns: string
      }
      current_uid: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_address_by_cep: {
        Args: { cep_input: string }
        Returns: Json
      }
      get_user_role: {
        Args: { user_id: string }
        Returns: string
      }
      log_access_attempt: {
        Args: { operation: string; table_name: string; user_id?: string }
        Returns: undefined
      }
      log_activity: {
        Args: { p_event_type: string; p_metadata?: Json; p_user_id: string }
        Returns: undefined
      }
      validate_security_config: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      lead_origin:
        | "google_lp01"
        | "google_lp02"
        | "meta"
        | "organico"
        | "lead_frio"
        | "indicacao"
      lead_status:
        | "prospecto"
        | "qualificado"
        | "apresentacao_catalogo"
        | "proposta_enviada"
        | "em_negociacao"
        | "cliente_winnet"
        | "remarketing"
        | "inativo"
      quote_status:
        | "rascunho"
        | "enviado"
        | "aprovado"
        | "rejeitado"
        | "expirado"
      status_lancamento: "pendente" | "confirmado" | "cancelado"
      status_orcamento:
        | "rascunho"
        | "enviado"
        | "aprovado"
        | "rejeitado"
        | "em negociação"
      status_pagamento: "confirmado" | "pendente" | "cancelado"
      status_venda: "pendente" | "confirmada" | "cancelada" | "em negociação"
      task_priority: "baixa" | "media" | "alta" | "urgente"
      task_status:
        | "pendente"
        | "em_andamento"
        | "concluida"
        | "atrasada"
        | "cancelada"
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
      lead_origin: [
        "google_lp01",
        "google_lp02",
        "meta",
        "organico",
        "lead_frio",
        "indicacao",
      ],
      lead_status: [
        "prospecto",
        "qualificado",
        "apresentacao_catalogo",
        "proposta_enviada",
        "em_negociacao",
        "cliente_winnet",
        "remarketing",
        "inativo",
      ],
      quote_status: [
        "rascunho",
        "enviado",
        "aprovado",
        "rejeitado",
        "expirado",
      ],
      status_lancamento: ["pendente", "confirmado", "cancelado"],
      status_orcamento: [
        "rascunho",
        "enviado",
        "aprovado",
        "rejeitado",
        "em negociação",
      ],
      status_pagamento: ["confirmado", "pendente", "cancelado"],
      status_venda: ["pendente", "confirmada", "cancelada", "em negociação"],
      task_priority: ["baixa", "media", "alta", "urgente"],
      task_status: [
        "pendente",
        "em_andamento",
        "concluida",
        "atrasada",
        "cancelada",
      ],
    },
  },
} as const
