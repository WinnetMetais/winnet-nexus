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
      can_access_orcamento: {
        Args: { o_id: number; uid: string; usr_role: string }
        Returns: boolean
      }
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
      fn_can_access_orcamento: {
        Args: { o_id: string }
        Returns: boolean
      }
      fn_get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      fn_get_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      fn_validate_user_permissions: {
        Args: { required_roles: string[] }
        Returns: boolean
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
