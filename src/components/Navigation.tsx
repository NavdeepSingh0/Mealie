import { useLocation, Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Home, Search, Calendar, TrendingUp, ShoppingCart, MessageSquare, LogOut, User, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import logo from "@/assets/mealie-logo.png";

const Navigation = () => {
  const location = useLocation();
  const { user, signOut } = useAuth(false);
  const isMobile = useIsMobile();
  const { theme, setTheme } = useTheme();

  const links = [
    { to: "/dashboard", label: "Dashboard", icon: Home },
    { to: "/discover", label: "Discover", icon: Search },
    { to: "/meal-plan", label: "Meal Plan", icon: Calendar },
    { to: "/analytics", label: "Analytics", icon: TrendingUp },
    { to: "/grocery-list", label: "Grocery", icon: ShoppingCart },
  ];

  const isAIChatActive = location.pathname === "/ai-chat";

  return (
    <>
      {/* Floating AI Chat Button - All devices */}
      <Link
        to="/ai-chat"
        className={cn(
          "fixed bottom-24 md:bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-all hover:scale-110",
          isAIChatActive
            ? "bg-primary text-primary-foreground"
            : "bg-gradient-to-br from-primary to-secondary text-white hover:shadow-xl"
        )}
      >
        <MessageSquare className="h-6 w-6" />
      </Link>

      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t md:top-0 md:bottom-auto md:border-b md:border-t-0">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center">
            <Link to="/dashboard" className="hidden md:flex items-center gap-2 py-3 mr-8">
              <img src={logo} alt="Mealie" className="h-10 w-10" />
              <span className="font-bold text-xl text-foreground">Mealie</span>
            </Link>
            <div className="flex justify-around md:justify-start md:gap-8 py-3 flex-1">
              {links.map(({ to, label, icon: Icon }) => {
            const isActive = location.pathname === to || 
              (to !== "/" && to !== "/dashboard" && location.pathname.startsWith(to));
            
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
          
          <div className="hidden md:flex items-center gap-2 py-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="h-9 w-9"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
            
            {user && (
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
            )}
          </div>
        </div>
      </div>
    </nav>
    </>
  );
};

export default Navigation;