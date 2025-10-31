-- Create chat_messages table for persisting chat history
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  conversation_id UUID NOT NULL DEFAULT gen_random_uuid(),
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Create policy for users to manage their own chat messages
CREATE POLICY "Users can manage their own chat messages"
ON public.chat_messages
FOR ALL
USING ((user_id = 'demo-user') OR (user_id = (auth.uid())::text));

-- Create index for faster queries
CREATE INDEX idx_chat_messages_user_conversation ON public.chat_messages(user_id, conversation_id, created_at);

-- Create grocery_items table for AI-generated grocery lists
CREATE TABLE IF NOT EXISTS public.grocery_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  item_name TEXT NOT NULL,
  quantity TEXT,
  category TEXT DEFAULT 'Other',
  checked BOOLEAN DEFAULT false,
  for_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.grocery_items ENABLE ROW LEVEL SECURITY;

-- Create policy for users to manage their own grocery items
CREATE POLICY "Users can manage their own grocery items"
ON public.grocery_items
FOR ALL
USING ((user_id = 'demo-user') OR (user_id = (auth.uid())::text));

-- Create index
CREATE INDEX idx_grocery_items_user_date ON public.grocery_items(user_id, for_date);