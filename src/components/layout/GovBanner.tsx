import headerBanner from "@/assets/header-banner.png";

export function GovBanner() {
  return (
    <div className="border-b bg-background">
      <div className="container py-2">
        <img
          src={headerBanner}
          alt="Office of the Controller General of Patents, Designs & Trade Marks — Department for Promotion of Industry and Internal Trade, Ministry of Commerce & Industry, Government of India — Intellectual Property India"
          className="h-10 w-auto object-contain md:h-12"
        />
      </div>
    </div>
  );
}
