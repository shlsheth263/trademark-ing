export interface SimilarMark {
  id: string;
  trademarkId: string;
  similarity: number;
  imageUrl: string;
  name: string;
  dinoScore: number;
  vggScore: number;
  textScore: number;
  colorScore: number;
  fontScore: number;
  shapeScore: number;
  queryOcr: string[];
}

export interface Application {
  id: string;
  businessName: string;
  applicantName: string;
  contactNumber: string;
  email: string;
  category: string;
  logoText: string;
  logoUrl: string;
  submissionDate: string;
  status: "submitted" | "approved" | "rejected";
  agentNotes?: string;
}

export const mockSimilarMarks: SimilarMark[] = Array.from({ length: 12 }, (_, i) => ({
  id: `mark-${i + 1}`,
  trademarkId: `TM-${String(2024001 + i)}`,
  similarity: Math.round((95 - i * 5.5) * 10) / 10,
  imageUrl: `https://placehold.co/200x200/1a365d/ffffff?text=TM${i + 1}`,
  name: `Trademark ${i + 1}`,
  dinoScore: 0,
  vggScore: 0,
  textScore: 0,
  colorScore: 0,
  fontScore: 0,
  shapeScore: 0,
  queryOcr: [],
}));

export const mockApplications: Application[] = [
  {
    id: "APP-2024-001",
    businessName: "TechVision Pte Ltd",
    applicantName: "John Tan",
    contactNumber: "+65 9123 4567",
    email: "john@techvision.sg",
    category: "9",
    logoText: "TechVision",
    logoUrl: "https://placehold.co/300x300/1a365d/ffffff?text=TV",
    submissionDate: "2024-12-15",
    status: "submitted",
  },
  {
    id: "APP-2024-002",
    businessName: "Green Leaf Foods",
    applicantName: "Sarah Lim",
    contactNumber: "+65 8234 5678",
    email: "sarah@greenleaf.sg",
    category: "29",
    logoText: "GreenLeaf",
    logoUrl: "https://placehold.co/300x300/2d6a4f/ffffff?text=GL",
    submissionDate: "2024-12-18",
    status: "submitted",
  },
  {
    id: "APP-2024-003",
    businessName: "Swift Logistics",
    applicantName: "Michael Wong",
    contactNumber: "+65 9345 6789",
    email: "michael@swiftlog.sg",
    category: "39",
    logoText: "SwiftLog",
    logoUrl: "https://placehold.co/300x300/6b21a8/ffffff?text=SL",
    submissionDate: "2024-12-10",
    status: "approved",
    agentNotes: "No significant similarity found. Approved for registration.",
  },
  {
    id: "APP-2024-004",
    businessName: "Bright Star Education",
    applicantName: "Lisa Chen",
    contactNumber: "+65 8456 7890",
    email: "lisa@brightstar.sg",
    category: "41",
    logoText: "BrightStar",
    logoUrl: "https://placehold.co/300x300/b45309/ffffff?text=BS",
    submissionDate: "2024-12-05",
    status: "rejected",
    agentNotes: "High similarity (87%) with existing registered mark TM-2023-456. Application rejected.",
  },
];
