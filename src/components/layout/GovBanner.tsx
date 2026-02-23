import leftLogo from "@/assets/left.png";
import centerLogo from "@/assets/center.png";
import rightLogo from "@/assets/right.png";

export function GovBanner() {
  return (
    <div className="border-b bg-background">
      <div className="container flex items-center justify-between py-2">
        <img
          src={leftLogo}
          alt="Office of the Controller General of Patents, Designs & Trade Marks — Department for Promotion of Industry and Internal Trade, Ministry of Commerce & Industry, Government of India"
          className="h-12 w-auto object-contain md:h-16"
        />
        <img
          src={centerLogo}
          alt="Department for Promotion of Industry and Internal Trade, Government of India"
          className="h-10 w-auto object-contain md:h-14"
        />
        <img
          src={rightLogo}
          alt="Intellectual Property India — Patents, Designs, Trade Marks, Geographical Indications"
          className="h-12 w-auto object-contain md:h-16"
        />
      </div>
    </div>
  );
}
