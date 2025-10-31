import { useLocation, Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Home, Search, Calendar, TrendingUp, ShoppingCart, MessageSquare, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navigation = () => {
  const location = useLocation();
  const { user, signOut } = useAuth(false);

  const links = [
    { to: "/", label: "Dashboard", icon: Home },
    { to: "/discover", label: "Discover", icon: Search },
    { to: "/meal-plan", label: "Meal Plan", icon: Calendar },
    { to: "/analytics", label: "Analytics", icon: TrendingUp },
    { to: "/grocery-list", label: "Grocery", icon: ShoppingCart },
    { to: "/ai-chat", label: "AI Chat", icon: MessageSquare },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t md:top-0 md:bottom-auto md:border-b md:border-t-0">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center">
          <div className="flex justify-around md:justify-start md:gap-8 py-3 flex-1">
            {links.map(({ to, label, icon: Icon }) => {
            const isActive = location.pathname === to || 
              (to !== "/" && location.pathname.startsWith(to));
            
            return (
              <Link
                key={to}
                to={to}
                className={cn(
                  "flex flex-col md:flex-row items-center gap-1 md:gap-2 px-3 py-2 rounded-lg transition-all",
                  isActive
                    ? "text-primary font-medium bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs md:text-sm">{label}</span>
              </Link>
              );
            })}
          </div>
          
          {user && (
            <div className="hidden md:flex items-center gap-4 py-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <User className="h-4 w-4" />
                    <span className="text-sm">{user.email?.split('@')[0]}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={signOut} className="text-destructive cursor-pointer">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
