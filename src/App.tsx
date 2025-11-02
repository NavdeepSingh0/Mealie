import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navigation from "./components/Navigation";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import Discover from "./pages/Discover";
import MealPlan from "./pages/MealPlan";
import Analytics from "./pages/Analytics";
import GroceryList from "./pages/GroceryList";
import AIChat from "./pages/AIChat";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="*" element={
            <div className="pb-20 md:pb-0 md:pt-16">
              <Navigation />
              <Routes>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/discover" element={<Discover />} />
                <Route path="/meal-plan" element={<MealPlan />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/grocery-list" element={<GroceryList />} />
                <Route path="/ai-chat" element={<AIChat />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          } />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;