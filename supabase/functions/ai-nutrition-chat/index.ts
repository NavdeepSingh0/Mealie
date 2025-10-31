import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, action, dishName, userGoals = {}, dishes } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Safely extract goals with defaults
    const calories = userGoals?.daily_calorie_goal || userGoals?.calories || 2000;
    const protein = userGoals?.daily_protein_goal || userGoals?.protein || 50;
    const fiber = userGoals?.daily_fiber_goal || userGoals?.fiber || 25;

    let systemPrompt = `You are an expert nutrition advisor specializing in Indian cuisine. You help users make informed decisions about their meals based on nutritional content.
    
User's Daily Goals: Calories: ${calories}kcal, Protein: ${protein}g, Fiber: ${fiber}g.
IMPORTANT: Always consider these goals when making recommendations. Suggest meals that help meet but not exceed these targets.`;
    
    if (action === 'similar') {
      systemPrompt += ` The user is looking for dishes similar to "${dishName}". Recommend 3-5 similar Indian dishes from the database, explaining why they're similar in terms of ingredients, preparation, or nutritional profile. Be specific and helpful.`;
    } else if (action === 'healthier') {
      systemPrompt += ` The user wants healthier alternatives to "${dishName}". Suggest 3-5 healthier Indian dishes from the database with lower calories, less fat, or more nutrients. Explain what makes each alternative healthier.`;
    } else if (action === 'mealplan') {
      systemPrompt += ` Help the user create a balanced weekly meal plan based on their goals: ${JSON.stringify(userGoals)}. 
      
      IMPORTANT: When you provide a meal plan, format it EXACTLY like this at the end of your response:
      
      ---MEAL_PLAN_START---
      Monday:
      - Breakfast: [Dish Name] ([Calories] kcal)
      - Lunch: [Dish Name] ([Calories] kcal)
      - Dinner: [Dish Name] ([Calories] kcal)
      - Snack: [Dish Name] ([Calories] kcal)
      
      Tuesday:
      [continue for all 7 days]
      ---MEAL_PLAN_END---
      
      Use exact dish names from the database and include calorie information.`;
    } else if (action === 'groceries') {
      systemPrompt += ` Generate a grocery list for today's meals. List ingredients grouped by category (Vegetables, Grains, Protein, Spices, Dairy, Other).
      
      IMPORTANT: Format your response EXACTLY like this:
      
      ---GROCERY_LIST_START---
      Vegetables:
      - [Item name] ([quantity])
      
      Grains:
      - [Item name] ([quantity])
      
      [continue for all categories]
      ---GROCERY_LIST_END---`;
    } else {
      systemPrompt += ` Help users with nutrition questions, meal planning, and understanding Indian food nutrition. Be encouraging and practical. When suggesting dishes, reference real Indian dishes that would be in a nutrition database.`;
    }

    // Add context about available dishes if provided
    if (dishes && dishes.length > 0) {
      systemPrompt += `\n\nAvailable dishes in the database include: ${dishes.map((d: any) => d["Dish Name"]).slice(0, 20).join(", ")}...`;
    }

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits depleted. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const text = await response.text();
      console.error('AI gateway error:', response.status, text);
      return new Response(JSON.stringify({ error: 'AI gateway error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Return the streaming response
    return new Response(response.body, {
      headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
