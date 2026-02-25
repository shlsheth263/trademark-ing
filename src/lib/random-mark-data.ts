// Random data generators for display on customer-facing results tables

const APPLICANT_NAMES = [
  "Zhou Dengqiang", "Sittichan Vuttipornkul", "JustCo Management Pte. Ltd.",
  "Sarah Lim", "Michael Wong", "Bright Star Education Pte. Ltd.",
  "Green Leaf Foods Pte. Ltd.", "Swift Logistics Pte. Ltd.", "TechVision Pte. Ltd.",
  "Tan Wei Ming", "Lim Mei Hua", "Kumar Rajesh", "Chen Xiaoli",
  "Ng Boon Kiat", "Wong Siew Ling", "Ali bin Ahmad", "Ong Mei Fang",
  "Lee Kah Wai", "Yap Seng Huat", "Chong Li Ping",
];

const STATUSES = ["Registered", "Pending", "Published"];

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return s / 2147483647;
  };
}

export function generateMarkDisplayData(trademarkId: string, index: number) {
  const rand = seededRandom(index * 31 + trademarkId.length * 7);
  const classNo = [9, 25, 29, 30, 35, 36, 39, 41, 42, 43][Math.floor(rand() * 10)];
  const classNo2 = rand() > 0.6 ? `, ${[9, 25, 30, 35, 41, 42][Math.floor(rand() * 6)]}` : "";
  const applicant = APPLICANT_NAMES[Math.floor(rand() * APPLICANT_NAMES.length)];
  const year = 2016 + Math.floor(rand() * 9);
  const month = 1 + Math.floor(rand() * 12);
  const day = 1 + Math.floor(rand() * 28);
  const filingDate = `${String(day).padStart(2, "0")}/${String(month).padStart(2, "0")}/${year}`;
  const status = STATUSES[Math.floor(rand() * STATUSES.length)];

  return { classNo: `${classNo}${classNo2}`, applicant, filingDate, status };
}
