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
      chat_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          metadata: Json | null
          role: string
          user_id: string
        }
        Insert: {
          content: string
          conversation_id?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          role: string
          user_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      grocery_items: {
        Row: {
          category: string | null
          checked: boolean | null
          created_at: string
          for_date: string | null
          id: string
          item_name: string
          quantity: string | null
          user_id: string
        }
        Insert: {
          category?: string | null
          checked?: boolean | null
          created_at?: string
          for_date?: string | null
          id?: string
          item_name: string
          quantity?: string | null
          user_id: string
        }
        Update: {
          category?: string | null
          checked?: boolean | null
          created_at?: string
          for_date?: string | null
          id?: string
          item_name?: string
          quantity?: string | null
          user_id?: string
        }
        Relationships: []
      }
      grocery_lists: {
        Row: {
          completed: boolean | null
          created_at: string | null
          id: string
          items: Json | null
          list_name: string
          user_id: string | null
        }
        Insert: {
          completed?: boolean | null
          created_at?: string | null
          id?: string
          items?: Json | null
          list_name: string
          user_id?: string | null
        }
        Update: {
          completed?: boolean | null
          created_at?: string | null
          id?: string
          items?: Json | null
          list_name?: string
          user_id?: string | null
        }
        Relationships: []
      }
      ingredients: {
        Row: {
          created_at: string | null
          id: string
          ingredient_name: string
          unit_g: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          ingredient_name: string
          unit_g?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          ingredient_name?: string
          unit_g?: number | null
        }
        Relationships: []
      }
      meal_types: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      nutrition_dataset: {
        Row: {
          carbs_g: number | null
          energy_kcal: number | null
          fat_g: number | null
          id: string
          name: string | null
          protein_g: number | null
        }
        Insert: {
          carbs_g?: number | null
          energy_kcal?: number | null
          fat_g?: number | null
          id?: string
          name?: string | null
          protein_g?: number | null
        }
        Update: {
          carbs_g?: number | null
          energy_kcal?: number | null
          fat_g?: number | null
          id?: string
          name?: string | null
          protein_g?: number | null
        }
        Relationships: []
      }
      nutrition_info: {
        Row: {
          "Calcium (mg)": number | null
          "Calories (kcal)": number | null
          "Carbohydrates (g)": number | null
          created_at: string | null
          "Dish Name": string
          "Fats (g)": number | null
          "Fibre (g)": number | null
          "Folate (µg)": number | null
          "Free Sugar (g)": number | null
          id: string
          "Iron (mg)": number | null
          "Protein (g)": number | null
          "Sodium (mg)": number | null
          updated_at: string | null
          "Vitamin C (mg)": number | null
        }
        Insert: {
          "Calcium (mg)"?: number | null
          "Calories (kcal)"?: number | null
          "Carbohydrates (g)"?: number | null
          created_at?: string | null
          "Dish Name": string
          "Fats (g)"?: number | null
          "Fibre (g)"?: number | null
          "Folate (µg)"?: number | null
          "Free Sugar (g)"?: number | null
          id?: string
          "Iron (mg)"?: number | null
          "Protein (g)"?: number | null
          "Sodium (mg)"?: number | null
          updated_at?: string | null
          "Vitamin C (mg)"?: number | null
        }
        Update: {
          "Calcium (mg)"?: number | null
          "Calories (kcal)"?: number | null
          "Carbohydrates (g)"?: number | null
          created_at?: string | null
          "Dish Name"?: string
          "Fats (g)"?: number | null
          "Fibre (g)"?: number | null
          "Folate (µg)"?: number | null
          "Free Sugar (g)"?: number | null
          id?: string
          "Iron (mg)"?: number | null
          "Protein (g)"?: number | null
          "Sodium (mg)"?: number | null
          updated_at?: string | null
          "Vitamin C (mg)"?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          current_weight: number | null
          email: string | null
          full_name: string | null
          id: string
          onboarding_completed: boolean | null
          primary_nutrition_goal: string | null
          target_weight: number | null
          updated_at: string | null
          weekly_goal: string | null
          weight_goal: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          current_weight?: number | null
          email?: string | null
          full_name?: string | null
          id: string
          onboarding_completed?: boolean | null
          primary_nutrition_goal?: string | null
          target_weight?: number | null
          updated_at?: string | null
          weekly_goal?: string | null
          weight_goal?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          current_weight?: number | null
          email?: string | null
          full_name?: string | null
          id?: string
          onboarding_completed?: boolean | null
          primary_nutrition_goal?: string | null
          target_weight?: number | null
          updated_at?: string | null
          weekly_goal?: string | null
          weight_goal?: string | null
        }
        Relationships: []
      }
      recipe_ingredients: {
        Row: {
          created_at: string | null
          id: string
          ingredient_id: string | null
          quantity: number
          recipe_id: string | null
          unit: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          ingredient_id?: string | null
          quantity: number
          recipe_id?: string | null
          unit?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          ingredient_id?: string | null
          quantity?: number
          recipe_id?: string | null
          unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recipe_ingredients_ingredient_id_fkey"
            columns: ["ingredient_id"]
            isOneToOne: false
            referencedRelation: "ingredients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_ingredients_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recipes: {
        Row: {
          cook_time_minutes: number | null
          created_at: string | null
          id: string
          instructions: string | null
          prep_time_minutes: number | null
          recipe_name: string
          servings: number | null
          updated_at: string | null
        }
        Insert: {
          cook_time_minutes?: number | null
          created_at?: string | null
          id?: string
          instructions?: string | null
          prep_time_minutes?: number | null
          recipe_name: string
          servings?: number | null
          updated_at?: string | null
        }
        Update: {
          cook_time_minutes?: number | null
          created_at?: string | null
          id?: string
          instructions?: string | null
          prep_time_minutes?: number | null
          recipe_name?: string
          servings?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_favorites: {
        Row: {
          created_at: string | null
          dish_id: string | null
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          dish_id?: string | null
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          dish_id?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_favorites_dish_id_fkey"
            columns: ["dish_id"]
            isOneToOne: false
            referencedRelation: "nutrition_info"
            referencedColumns: ["id"]
          },
        ]
      }
      user_goals: {
        Row: {
          completed: boolean | null
          created_at: string | null
          current_value: number | null
          end_date: string | null
          goal_type: string
          id: string
          start_date: string | null
          target_value: number | null
          user_id: string | null
        }
        Insert: {
          completed?: boolean | null
          created_at?: string | null
          current_value?: number | null
          end_date?: string | null
          goal_type: string
          id?: string
          start_date?: string | null
          target_value?: number | null
          user_id?: string | null
        }
        Update: {
          completed?: boolean | null
          created_at?: string | null
          current_value?: number | null
          end_date?: string | null
          goal_type?: string
          id?: string
          start_date?: string | null
          target_value?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_meals: {
        Row: {
          consumed_at: string | null
          created_at: string | null
          dish_id: string | null
          id: string
          meal_type: string | null
          serving_size: number | null
          user_id: string
        }
        Insert: {
          consumed_at?: string | null
          created_at?: string | null
          dish_id?: string | null
          id?: string
          meal_type?: string | null
          serving_size?: number | null
          user_id: string
        }
        Update: {
          consumed_at?: string | null
          created_at?: string | null
          dish_id?: string | null
          id?: string
          meal_type?: string | null
          serving_size?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_meals_dish_id_fkey"
            columns: ["dish_id"]
            isOneToOne: false
            referencedRelation: "nutrition_info"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          created_at: string | null
          daily_calorie_goal: number | null
          daily_fiber_goal: number | null
          daily_protein_goal: number | null
          daily_sugar_limit: number | null
          dietary_preferences: string[] | null
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          daily_calorie_goal?: number | null
          daily_fiber_goal?: number | null
          daily_protein_goal?: number | null
          daily_sugar_limit?: number | null
          dietary_preferences?: string[] | null
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          daily_calorie_goal?: number | null
          daily_fiber_goal?: number | null
          daily_protein_goal?: number | null
          daily_sugar_limit?: number | null
          dietary_preferences?: string[] | null
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      meal_category: "breakfast" | "lunch" | "dinner" | "snack"
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
      meal_category: ["breakfast", "lunch", "dinner", "snack"],
    },
  },
} as const