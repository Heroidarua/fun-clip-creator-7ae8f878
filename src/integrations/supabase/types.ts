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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      ai_usage_log: {
        Row: {
          id: string
          tool: string
          used_at: string
          user_id: string
        }
        Insert: {
          id?: string
          tool: string
          used_at?: string
          user_id: string
        }
        Update: {
          id?: string
          tool?: string
          used_at?: string
          user_id?: string
        }
        Relationships: []
      }
      announcements: {
        Row: {
          active: boolean
          created_at: string
          id: string
          message: string
          priority: number
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          message: string
          priority?: number
          title: string
          type?: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          message?: string
          priority?: number
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      donations: {
        Row: {
          amount: number
          created_at: string
          currency: string
          expires_at: string | null
          external_payment_id: string | null
          id: string
          paid_at: string | null
          payment_method: string | null
          provider: string
          qr_code: string | null
          qr_code_base64: string | null
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          expires_at?: string | null
          external_payment_id?: string | null
          id?: string
          paid_at?: string | null
          payment_method?: string | null
          provider?: string
          qr_code?: string | null
          qr_code_base64?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          expires_at?: string | null
          external_payment_id?: string | null
          id?: string
          paid_at?: string | null
          payment_method?: string | null
          provider?: string
          qr_code?: string | null
          qr_code_base64?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      downloader_status: {
        Row: {
          category: string
          created_at: string
          id: string
          label: string | null
          last_checked: string
          platform: string
          status: string
        }
        Insert: {
          category?: string
          created_at?: string
          id?: string
          label?: string | null
          last_checked?: string
          platform: string
          status?: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          label?: string | null
          last_checked?: string
          platform?: string
          status?: string
        }
        Relationships: []
      }
      favorite_games: {
        Row: {
          created_at: string
          game_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          game_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          game_id?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      games: {
        Row: {
          category: string | null
          created_at: string | null
          external_id: number | null
          id: number
          img: string | null
          platform: string | null
          src: string
          title: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          external_id?: number | null
          id?: number
          img?: string | null
          platform?: string | null
          src: string
          title: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          external_id?: number | null
          id?: number
          img?: string | null
          platform?: string | null
          src?: string
          title?: string
        }
        Relationships: []
      }
      iptv_spin_results: {
        Row: {
          created_at: string
          id: string
          outcome: string
          session_id: string
          user_id: string | null
          won: boolean
        }
        Insert: {
          created_at?: string
          id?: string
          outcome: string
          session_id: string
          user_id?: string | null
          won?: boolean
        }
        Update: {
          created_at?: string
          id?: string
          outcome?: string
          session_id?: string
          user_id?: string | null
          won?: boolean
        }
        Relationships: []
      }
      marquee_settings: {
        Row: {
          color: string
          created_at: string
          direction: string
          id: string
          pause_on_hover: boolean
          singleton: boolean
          speed: number
          updated_at: string
        }
        Insert: {
          color?: string
          created_at?: string
          direction?: string
          id?: string
          pause_on_hover?: boolean
          singleton?: boolean
          speed?: number
          updated_at?: string
        }
        Update: {
          color?: string
          created_at?: string
          direction?: string
          id?: string
          pause_on_hover?: boolean
          singleton?: boolean
          speed?: number
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          data: Json
          id: string
          message: string
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: Json
          id?: string
          message: string
          read?: boolean
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json
          id?: string
          message?: string
          read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          banner_url: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          id: string
          plan: Database["public"]["Enums"]["subscription_plan"]
          plan_updated_at: string
          profile_theme: string
          referral_code: string | null
          referral_count: number
          updated_at: string
          user_id: string
          username_change_count: number
        }
        Insert: {
          avatar_url?: string | null
          banner_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          plan?: Database["public"]["Enums"]["subscription_plan"]
          plan_updated_at?: string
          profile_theme?: string
          referral_code?: string | null
          referral_count?: number
          updated_at?: string
          user_id: string
          username_change_count?: number
        }
        Update: {
          avatar_url?: string | null
          banner_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          plan?: Database["public"]["Enums"]["subscription_plan"]
          plan_updated_at?: string
          profile_theme?: string
          referral_code?: string | null
          referral_count?: number
          updated_at?: string
          user_id?: string
          username_change_count?: number
        }
        Relationships: []
      }
      referral_tracking: {
        Row: {
          created_at: string
          id: string
          referral_code: string
          referred_id: string
          referrer_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          referral_code: string
          referred_id: string
          referrer_id: string
        }
        Update: {
          created_at?: string
          id?: string
          referral_code?: string
          referred_id?: string
          referrer_id?: string
        }
        Relationships: []
      }
      user_stats: {
        Row: {
          achievements_unlocked: number
          days_active: number
          games_played: number
          id: string
          level: number
          tools_used: number
          total_downloads: number
          total_xp: number
          updated_at: string
          user_id: string
        }
        Insert: {
          achievements_unlocked?: number
          days_active?: number
          games_played?: number
          id?: string
          level?: number
          tools_used?: number
          total_downloads?: number
          total_xp?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          achievements_unlocked?: number
          days_active?: number
          games_played?: number
          id?: string
          level?: number
          tools_used?: number
          total_downloads?: number
          total_xp?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      video_enhancement_jobs: {
        Row: {
          audio_enhancement: Json | null
          created_at: string | null
          enhancement_mode: string | null
          error_message: string | null
          expires_at: string | null
          id: string
          input_fps: number | null
          input_height: number | null
          input_size: number | null
          input_width: number | null
          original_filename: string
          output_fps: number | null
          output_height: number | null
          output_size: number | null
          output_url: string | null
          output_width: number | null
          progress: number | null
          status: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          audio_enhancement?: Json | null
          created_at?: string | null
          enhancement_mode?: string | null
          error_message?: string | null
          expires_at?: string | null
          id?: string
          input_fps?: number | null
          input_height?: number | null
          input_size?: number | null
          input_width?: number | null
          original_filename: string
          output_fps?: number | null
          output_height?: number | null
          output_size?: number | null
          output_url?: string | null
          output_width?: number | null
          progress?: number | null
          status?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          audio_enhancement?: Json | null
          created_at?: string | null
          enhancement_mode?: string | null
          error_message?: string | null
          expires_at?: string | null
          id?: string
          input_fps?: number | null
          input_height?: number | null
          input_size?: number | null
          input_width?: number | null
          original_filename?: string
          output_fps?: number | null
          output_height?: number | null
          output_size?: number | null
          output_url?: string | null
          output_width?: number | null
          progress?: number | null
          status?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      youtube_download_jobs: {
        Row: {
          created_at: string
          error_message: string | null
          expires_at: string
          file_size: number | null
          file_url: string | null
          format: string
          id: string
          progress: number
          quality: string
          source_url: string
          status: Database["public"]["Enums"]["youtube_job_status"]
          title: string | null
          updated_at: string
          user_id: string | null
          video_id: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          expires_at?: string
          file_size?: number | null
          file_url?: string | null
          format: string
          id?: string
          progress?: number
          quality: string
          source_url: string
          status?: Database["public"]["Enums"]["youtube_job_status"]
          title?: string | null
          updated_at?: string
          user_id?: string | null
          video_id: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          expires_at?: string
          file_size?: number | null
          file_url?: string | null
          format?: string
          id?: string
          progress?: number
          quality?: string
          source_url?: string
          status?: Database["public"]["Enums"]["youtube_job_status"]
          title?: string | null
          updated_at?: string
          user_id?: string | null
          video_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_and_log_ai_usage: { Args: { _tool: string }; Returns: Json }
      get_ai_usage_today: { Args: never; Returns: Json }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
    }
    Enums: {
      subscription_plan: "free" | "pro"
      youtube_job_status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED"
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
      subscription_plan: ["free", "pro"],
      youtube_job_status: ["PENDING", "PROCESSING", "COMPLETED", "FAILED"],
    },
  },
} as const
