import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

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
        <div className="container py-4">
          <Link to="/" className="text-lg font-semibold tracking-tight">
            AI Trademark Similarity &amp; Application Portal
          </Link>
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
