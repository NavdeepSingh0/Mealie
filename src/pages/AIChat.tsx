import { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, Bot, Send, User, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

interface Message {
  role: 'user' | 'assistant';
  content: string;
  mealPlanData?: any;
  groceryListData?: any;
}

const AIChat = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userGoals, setUserGoals] = useState<any>(null);
  const [dishes, setDishes] = useState<any[]>([]);
  const [conversationId, setConversationId] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const dishName = searchParams.get("dish");
  const action = searchParams.get("action");
  const [hasAutoSent, setHasAutoSent] = useState(false);

  useEffect(() => {
    if (user) {
      initializeConversation();
      loadUserGoals();
      loadDishes();
    }
  }, [user]);

  // Auto-send prompt based on action after initialization
  useEffect(() => {
    if (conversationId && !hasAutoSent && action && !isLoading && messages.length >= 1) {
      let autoPrompt = "";
      if (action === 'mealplan') {
        autoPrompt = "Please create a personalized weekly meal plan based on my nutrition goals.";
      } else if (action === 'groceries') {
        autoPrompt = "Please generate a grocery list for today's meals based on my nutrition goals.";
      } else if (action === 'similar' && dishName) {
        autoPrompt = `Please suggest dishes similar to ${dishName}.`;
      } else if (action === 'healthier' && dishName) {
        autoPrompt = `Please suggest healthier alternatives to ${dishName}.`;
      }
      
      if (autoPrompt) {
        setHasAutoSent(true);
        setInput(autoPrompt);
        // Auto-send after a brief delay
        setTimeout(() => {
          handleSendMessage(autoPrompt);
        }, 500);
      }
    }
  }, [conversationId, hasAutoSent, action, isLoading, dishName, messages]);

  const initializeConversation = async () => {
    if (!user) return;
    
    const key = `chat_conversation_${user.id}`;
    const storedConvId = localStorage.getItem(key);
    
    if (storedConvId) {
      // Always reuse the stored conversation ID
      setConversationId(storedConvId);
      
      const { data: existingMessages } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("conversation_id", storedConvId)
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });

      if (existingMessages && existingMessages.length > 0) {
        const loadedMessages = existingMessages
          .filter((m: any) => m.role !== 'system')
          .map((m: any) => ({
            role: m.role,
            content: m.content,
            mealPlanData: m.metadata?.mealPlanData,
            groceryListData: m.metadata?.groceryListData,
          }));
        setMessages(loadedMessages);
      } else {
        // Initialize the existing conversation id with a greeting
        await initializeChat(storedConvId);
      }
      return;
    }
    
    // Create new conversation if none exists
    const newConvId = crypto.randomUUID();
    setConversationId(newConvId);
    localStorage.setItem(key, newConvId);
    await initializeChat(newConvId);
  };
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadUserGoals = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (data) {
      setUserGoals(data);
    }
  };

  const loadDishes = async () => {
    const { data } = await supabase
      .from("nutrition_info")
      .select("*")
      .order("Dish Name")
      .limit(100);

    if (data) {
      setDishes(data);
    }
  };

  const initializeChat = async (convId: string) => {
    let greeting = "Hello! I'm your nutrition assistant. ";

    if (action === 'similar' && dishName) {
      greeting += `I'll help you find dishes similar to ${dishName}. What aspects are you most interested in - taste, ingredients, nutrition, or cooking method?`;
    } else if (action === 'healthier' && dishName) {
      greeting += `I'll suggest healthier alternatives to ${dishName}. What's your main concern - calories, fat content, or overall nutrition?`;
    } else if (action === 'mealplan') {
      greeting += `I'll help you create a personalized weekly meal plan based on your nutrition goals. Let me know if you have any dietary preferences or restrictions!`;
    } else {
      greeting += `How can I help you with your nutrition journey today?`;
    }

    const assistantMsg = { role: 'assistant' as const, content: greeting };
    setMessages([assistantMsg]);
    
    // Save initial message
    if (user) {
      await supabase.from("chat_messages").insert({
        user_id: user.id,
        conversation_id: convId,
        role: 'assistant',
        content: greeting,
      });
    }
  };

  const streamChat = async (userMessage: string) => {
    const CHAT_URL = `https://ltjagciiobttbmrqdaui.supabase.co/functions/v1/ai-nutrition-chat`;
    
    try {
      const resp = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx0amFnY2lpb2J0dGJtcnFkYXVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExNDc4MDYsImV4cCI6MjA3NjcyMzgwNn0.knooai2xtspNPmwE2DX4zoxFlxnitlIT43CHfuf7XXo'}`,
        },
        body: JSON.stringify({
          messages: [...messages, { role: 'user', content: userMessage }],
          action,
          dishName,
          userGoals,
          dishes: dishes.map(d => ({ "Dish Name": d["Dish Name"] })),
        }),
      });

      if (!resp.ok) {
        if (resp.status === 429) {
          toast.error("Rate limit exceeded. Please wait a moment.");
          return;
        }
        if (resp.status === 402) {
          toast.error("AI credits depleted. Please add credits.");
          return;
        }
        throw new Error('Failed to get response');
      }

      if (!resp.body) throw new Error('No response body');

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let streamDone = false;
      let assistantContent = "";

      // Add assistant message placeholder
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") {
            streamDone = true;
            break;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantContent += content;
              setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = { role: 'assistant', content: assistantContent };
                return updated;
              });
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Parse structured data from response
      const mealPlanData = parseMealPlan(assistantContent);
      const groceryListData = parseGroceryList(assistantContent);

      // Update message with structured data
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: 'assistant',
          content: assistantContent,
          mealPlanData,
          groceryListData,
        };
        return updated;
      });

      // Save assistant message to database
      if (user) {
        await supabase.from("chat_messages").insert({
          user_id: user.id,
          conversation_id: conversationId,
          role: 'assistant',
          content: assistantContent,
          metadata: { mealPlanData, groceryListData },
        });
      }
    } catch (error) {
      console.error('Chat error:', error);
      toast.error("Failed to get AI response");
      setMessages(prev => prev.slice(0, -1));
    }
  };

  const parseMealPlan = (content: string) => {
    const startMarker = "---MEAL_PLAN_START---";
    const endMarker = "---MEAL_PLAN_END---";
    const startIdx = content.indexOf(startMarker);
    const endIdx = content.indexOf(endMarker);

    if (startIdx === -1 || endIdx === -1) return null;

    const planText = content.substring(startIdx + startMarker.length, endIdx).trim();
    const plan: any = {};

    const days = planText.split(/\n(?=\w+day:)/i);
    days.forEach((dayBlock) => {
      const lines = dayBlock.split("\n").filter((l) => l.trim());
      if (lines.length === 0) return;

      const dayLine = lines[0];
      const dayMatch = dayLine.match(/^(\w+):/);
      if (!dayMatch) return;

      const day = dayMatch[1];
      plan[day] = {};

      lines.slice(1).forEach((line) => {
        const mealMatch = line.match(/- (\w+):\s*(.+?)\s*\((\d+)\s*kcal\)/i);
        if (mealMatch) {
          const [, mealType, dishName, calories] = mealMatch;
          const type = mealType.toLowerCase();
          if (!plan[day][type]) plan[day][type] = [];
          plan[day][type].push({ dishName, calories: parseInt(calories) });
        }
      });
    });

    return Object.keys(plan).length > 0 ? plan : null;
  };

  const parseGroceryList = (content: string) => {
    const startMarker = "---GROCERY_LIST_START---";
    const endMarker = "---GROCERY_LIST_END---";
    const startIdx = content.indexOf(startMarker);
    const endIdx = content.indexOf(endMarker);

    if (startIdx === -1 || endIdx === -1) {
      // Fallback: try to parse from markdown-style grocery sections
      const groceryMatch = content.match(/\*\*(?:Grocery List|Fruits & Vegetables|Spices & Seasonings|Meat|Frozen)\*\*/i);
      if (groceryMatch) {
        return parseGroceryFallback(content);
      }
      return null;
    }

    const listText = content.substring(startIdx + startMarker.length, endIdx).trim();
    const items: any[] = [];

    let currentCategory = "Other";
    listText.split("\n").forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed) return;

      if (trimmed.endsWith(":")) {
        currentCategory = trimmed.slice(0, -1);
      } else if (trimmed.startsWith("-") || trimmed.startsWith("*")) {
        const itemMatch = trimmed.match(/[-*]\s*(.+?)\s*\((.+?)\)/);
        if (itemMatch) {
          items.push({
            name: itemMatch[1].trim(),
            quantity: itemMatch[2].trim(),
            category: currentCategory,
          });
        }
      }
    });

    return items.length > 0 ? items : null;
  };

  const parseGroceryFallback = (content: string) => {
    const items: any[] = [];
    let currentCategory = "Other";
    
    const lines = content.split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      // Check for category headers like **Fruits & Vegetables:**
      const categoryMatch = trimmed.match(/\*\*(.+?)[:*]/);
      if (categoryMatch) {
        currentCategory = categoryMatch[1].trim().replace(/\*+/g, '');
        continue;
      }

      // Match lines like "* Apple (2 pieces)" or "- Onions (500g)"
      const itemMatch = trimmed.match(/^[*-]\s+(.+?)\s+\((.+?)\)/);
      if (itemMatch) {
        items.push({
          name: itemMatch[1].trim(),
          quantity: itemMatch[2].trim(),
          category: currentCategory,
        });
      }
    }

    return items.length > 0 ? items : null;
  };

  const importMealPlan = async (mealPlanData: any) => {
    if (!user) {
      toast.error("Please log in to import meal plans");
      return;
    }

    try {
      const { data: existing } = await supabase
        .from("grocery_lists")
        .select("*")
        .eq("user_id", user.id)
        .eq("completed", false)
        .limit(1)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from("grocery_lists")
          .update({ items: mealPlanData })
          .eq("id", existing.id);
        
        if (error) {
          console.error("Error updating meal plan:", error);
          toast.error(error.message || "Failed to import meal plan");
          return;
        }
      } else {
        const { error } = await supabase.from("grocery_lists").insert({
          user_id: user.id,
          list_name: "Weekly Meal Plan",
          items: mealPlanData,
          completed: false,
        });
        
        if (error) {
          console.error("Error creating meal plan:", error);
          toast.error("Failed to import meal plan");
          return;
        }
      }

      toast.success("Meal plan imported successfully!");
      navigate("/meal-plan");
    } catch (error) {
      console.error("Unexpected error importing meal plan:", error);
      toast.error("Failed to import meal plan");
    }
  };

  const importGroceryList = async (groceryListData: any[]) => {
    if (!user) {
      toast.error("Please log in to import grocery lists");
      return;
    }

    try {
      // First delete existing items for today
      const today = new Date().toISOString().split("T")[0];
      await supabase
        .from("grocery_items")
        .delete()
        .eq("user_id", user.id)
        .eq("for_date", today);

      // Insert new items
      const { error } = await supabase.from("grocery_items").insert(
        groceryListData.map((item) => ({
          user_id: user.id,
          item_name: item.name,
          quantity: item.quantity,
          category: item.category,
          for_date: today,
          checked: false,
        }))
      );

      if (error) {
        console.error("Error importing grocery list:", error);
        toast.error(error.message || "Failed to import grocery list");
        return;
      }

      toast.success("Grocery list imported successfully!");
      navigate("/grocery-list");
    } catch (error) {
      console.error("Unexpected error importing grocery list:", error);
      toast.error("Failed to import grocery list");
    }
  };

  const handleSendMessage = async (messageText: string) => {
    if (!messageText.trim() || isLoading) return;

    const userMessage = messageText.trim();
    setInput("");
    const userMsg = { role: 'user' as const, content: userMessage };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    // Save user message to database
    if (user) {
      await supabase.from("chat_messages").insert({
        user_id: user.id,
        conversation_id: conversationId,
        role: 'user',
        content: userMessage,
      });
    }

    await streamChat(userMessage);
    setIsLoading(false);
  };

  const handleSend = async () => {
    handleSendMessage(input);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <Button 
          variant="ghost" 
          className="mb-4"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <Card className="h-[calc(100vh-200px)] flex flex-col overflow-hidden">
          <CardHeader className="flex-shrink-0">
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              AI Nutrition Assistant
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col min-h-0">
            <ScrollArea className="flex-1 pr-4 min-h-0">
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.role === 'assistant' && (
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          <Bot className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div className="flex flex-col gap-2 max-w-[80%]">
                      <div
                        className={`rounded-lg px-4 py-2 break-words ${
                          message.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap break-words overflow-wrap-anywhere">
                          {message.content.replace(/---MEAL_PLAN_START---[\s\S]*?---MEAL_PLAN_END---/g, '')
                            .replace(/---GROCERY_LIST_START---[\s\S]*?---GROCERY_LIST_END---/g, '').trim()}
                        </p>
                      </div>
                      {message.mealPlanData && (
                        <Button
                          size="sm"
                          onClick={() => importMealPlan(message.mealPlanData)}
                          className="w-fit"
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Import Meal Plan
                        </Button>
                      )}
                      {message.groceryListData && (
                        <Button
                          size="sm"
                          onClick={() => importGroceryList(message.groceryListData)}
                          className="w-fit"
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Import Grocery List
                        </Button>
                      )}
                    </div>
                    {message.role === 'user' && (
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="rounded-lg px-4 py-2 bg-muted">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 rounded-full bg-primary animate-bounce" />
                        <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.1s' }} />
                        <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.2s' }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            <div className="flex gap-2 mt-4 flex-shrink-0">
              <Input
                placeholder="Ask about nutrition, meal planning, or get recommendations..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
                className="flex-1 min-w-0"
              />
              <Button onClick={handleSend} disabled={isLoading || !input.trim()} className="flex-shrink-0">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AIChat;
