import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

interface OnboardingData {
  weight_goal: 'lose' | 'maintain' | 'gain';
  current_weight: number;
  target_weight: number;
  weekly_goal: 'mild' | 'moderate' | 'aggressive';
  primary_nutrition_goal: 'weight_loss' | 'muscle_building' | 'maintenance' | 'general_health';
}

export const useOnboarding = (user: User | null) => {
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('onboarding_completed')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        setNeedsOnboarding(!data?.onboarding_completed);
      } catch (error) {
        console.error('Error checking onboarding status:', error);
        setNeedsOnboarding(false);
      } finally {
        setLoading(false);
      }
    };

    checkOnboardingStatus();
  }, [user]);

  const completeOnboarding = async (data: OnboardingData) => {
    if (!user) return { error: new Error('No user found') };

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          onboarding_completed: true,
          ...data
        })
        .eq('id', user.id);

      if (error) throw error;

      setNeedsOnboarding(false);
      return { error: null };
    } catch (error) {
      console.error('Error completing onboarding:', error);
      return { error };
    }
  };

  return { needsOnboarding, loading, completeOnboarding };
};