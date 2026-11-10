import { useLocation, Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Home, Search, Calendar, TrendingUp, ShoppingCart, MessageSquare, LogOut, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Logo } from "@/components/Logo";

const links = [
  { to: "/dashboard", label: "Today", icon: Home },
  { to: "/discover", label: "Discover", icon: Search },
  { to: "/meal-plan", label: "Plan", icon: Calendar },
  { to: "/grocery-list", label: "Grocery", icon: ShoppingCart },
  { to: "/analytics", label: "Trends", icon: TrendingUp },
];

const AccountMenu = () => {
  const { user, signOut } = useAuth(false);
  const { theme, setTheme } = useTheme();
  if (!user) return null;
  const email = user.email ?? "";
  const initial = (email[0] ?? "?").toUpperCase();

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="h-9 w-9"
        aria-label="Toggle dark mode"
      >
        <Sun className="h-4 w-4 dark:hidden" />
        <Moon className="hidden h-4 w-4 dark:block" />
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary font-display text-base font-semibold text-secondary-foreground outline-none ring-offset-background transition-shadow focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-label="Account menu"
          >
            {initial}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="truncate font-normal text-muted-foreground">{email}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={signOut} className="cursor-pointer text-destructive focus:text-destructive">
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

const Navigation = () => {
  const location = useLocation();
  const isActive = (to: string) => location.pathname === to || location.pathname.startsWith(to + "/");
  const isAIChatActive = location.pathname === "/ai-chat";

  return (
    <>
      {/* Assistant shortcut, reachable from every page */}
      {!isAIChatActive && (
        <Link
          to="/ai-chat"
          aria-label="Open nutrition assistant"
          className="fixed bottom-24 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-foreground text-background shadow-[var(--shadow-lg)] transition-transform hover:scale-105 md:bottom-6 md:right-6"
        >
          <MessageSquare className="h-6 w-6" />
        </Link>
      )}

      {/* Mobile top bar */}
      <header className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b bg-background/90 px-4 backdrop-blur md:hidden">
        <Link to="/dashboard" aria-label="Mealie home">
          <Logo markClassName="h-7 w-7" className="[&>span:last-child]:text-xl" />
        </Link>
        <AccountMenu />
      </header>

      {/* Desktop top bar and mobile bottom tabs share one element */}
      <nav
        aria-label="Main"
        className="fixed inset-x-0 bottom-0 z-40 border-t bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:bottom-auto md:top-0 md:border-b md:border-t-0 md:bg-background/90 md:pb-0"
      >
        <div className="mx-auto flex max-w-6xl items-center px-2 md:h-16 md:px-8">
          <Link to="/dashboard" className="mr-10 hidden md:block" aria-label="Mealie home">
            <Logo />
          </Link>

          <ul className="flex flex-1 justify-around md:justify-start md:gap-1">
            {links.map(({ to, label, icon: Icon }) => {
              const active = isActive(to);
              return (
                <li key={to}>
                  <Link
                    to={to}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "relative flex flex-col items-center gap-1 px-3 py-2.5 text-[11px] font-medium transition-colors md:flex-row md:gap-2 md:rounded-full md:px-4 md:py-2 md:text-sm",
                      active
                        ? "text-primary md:bg-primary/10"
                        : "text-muted-foreground hover:text-foreground md:hover:bg-accent"
                    )}
                  >
                    <Icon className="h-5 w-5 md:h-4 md:w-4" strokeWidth={active ? 2.4 : 2} />
                    <span>{label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="hidden md:block">
            <AccountMenu />
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navigation;
