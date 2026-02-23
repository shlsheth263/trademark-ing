import { Shield } from "lucide-react";

export function GovBanner() {
  return (
    <div className="bg-gov-banner text-gov-banner-foreground">
      <div className="container flex items-center gap-2 py-1.5 text-xs">
        <Shield className="h-3.5 w-3.5" />
        <span>A Government Agency Website</span>
      </div>
    </div>
  );
}
