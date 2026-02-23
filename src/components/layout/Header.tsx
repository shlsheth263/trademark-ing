import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { LogIn, User, Shield } from "lucide-react";

const NAV_ITEMS = [
  { label: "Home", path: "/" },
  { label: "Check Similarity", path: "/check-similarity" },
  { label: "Explore Similar Marks", path: "/explore" },
  { label: "Track Application", path: "/track" },
];

export function Header() {
  const { pathname } = useLocation();

  return (
    <header>
      <div className="bg-primary text-primary-foreground">
        <div className="container flex items-center justify-between py-4">
          <Link to="/" className="text-lg font-semibold tracking-tight">
            AI Trademark Similarity &amp; Application Portal
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
                <LogIn className="mr-1.5 h-4 w-4" /> Login
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="z-50 bg-popover">
              <DropdownMenuItem asChild>
                <Link to="/track" className="flex items-center gap-2 cursor-pointer">
                  <User className="h-4 w-4" /> Customer
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/agent/login" className="flex items-center gap-2 cursor-pointer">
                  <Shield className="h-4 w-4" /> Agent
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <nav className="border-b bg-secondary">
        <div className="container flex gap-0">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "border-b-2 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-primary/5",
                pathname === item.path
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground",
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
