import {
  LayoutGrid,
  Home,
  Smartphone,
  CreditCard,
  Plane,
  Film,
  Zap,
  Droplets,
  Flame,
  Building2,
  Wifi,
  Phone,
  Tv,
  Car,
  FileText,
  ShieldCheck,
  GraduationCap,
  Stethoscope,
  Heart,
  Landmark,
  User,
  CreditCard as CardIcon,
  Receipt,
  StethoscopeIcon,
} from "lucide-react";

// --- MOCK DATA ---

export const categoryData = {
  all: { id: "all", name: "All Categories", icon: LayoutGrid },
  utilities: { id: "utilities", name: "Housing & Utilities", icon: Home },
  communication: {
    id: "communication",
    name: "Communication",
    icon: Smartphone,
  },
  finance: { id: "finance", name: "Finance", icon: CreditCard },
  travel: { id: "travel", name: "Travel", icon: Plane },
  entertainment: { id: "entertainment", name: "Entertainment", icon: Film },
  healthcare: { id: "healthcare", name: "health Care", icon: StethoscopeIcon },
};

// const MOCK_CATEGORIES = [
//   { id: "all", name: "All Categories", icon: LayoutGrid },
//   { id: "utilities", name: "Housing & Utilities", icon: Home },
//   { id: "communication", name: "Communication", icon: Smartphone },
//   { id: "finance", name: "Finance", icon: CreditCard },
//   { id: "travel", name: "Travel", icon: Plane },
//   { id: "entertainment", name: "Entertainment", icon: Film },
// ];

export const servicesData = {
  "Municipal Taxes": {
    id: "municipal-tax",
    name: "Municipal Taxes",
    icon: Building2,
    category: "utilities",
    color: "bg-orange-100 text-orange-600",
  },
  "Prepaid Meter": {
    id: "prepaid-meter",
    name: "Prepaid Meter",
    icon: Zap,
    category: "utilities",
    color: "bg-orange-100 text-orange-600",
  },
  Water: {
    id: "water",
    name: "Water",
    icon: Droplets,
    category: "utilities",
    color: "bg-blue-100 text-blue-600",
  },
  "LPG Gas": {
    id: "lpg",
    name: "LPG Gas",
    icon: Flame,
    category: "utilities",
    color: "bg-red-100 text-red-600",
  },
  Gas: {
    id: "gas",
    name: "Gas",
    icon: Flame,
    category: "utilities",
    color: "bg-red-100 text-red-600",
  },
  Electricity: {
    id: "electricity",
    name: "Electricity",
    icon: Zap,
    category: "utilities",
    color: "bg-yellow-100 text-yellow-600",
  },
  "Housing Society": {
    id: "housing",
    name: "Housing Society",
    icon: Home,
    category: "utilities",
    color: "bg-emerald-100 text-emerald-600",
  },
  "Piped Gas": {
    id: "piped-gas",
    name: "Piped Gas",
    icon: Flame,
    category: "utilities",
    color: "bg-orange-100 text-orange-600",
  },
  "Municipal Services": {
    id: "municipal-services",
    name: "Municipal Services",
    icon: Landmark,
    category: "utilities",
    color: "bg-orange-100 text-orange-600",
  },
  "Clubs and Associations": {
    id: "clubs-and-associations",
    name: "Clubs and Associations",
    icon: Landmark,
    category: "utilities",
    color: "bg-blue-100 text-blue-600",
  },
  "Mobile Prepaid": {
    id: "mobile-prepaid",
    name: "Mobile Prepaid",
    icon: Smartphone,
    category: "communication",
    color: "bg-rose-100 text-rose-600",
  },
  "Mobile Postpaid": {
    id: "mobile-postpaid",
    name: "Mobile Postpaid",
    icon: Smartphone,
    category: "communication",
    color: "bg-pink-100 text-pink-600",
  },
  "Broadband Postpaid": {
    id: "broadband",
    name: "Broadband Postpaid",
    icon: Wifi,
    category: "communication",
    color: "bg-cyan-100 text-cyan-600",
  },
  "Landline Postpaid": {
    id: "landline",
    name: "Landline Postpaid",
    icon: Phone,
    category: "communication",
    color: "bg-indigo-100 text-indigo-600",
  },
  DTH: {
    id: "dth",
    name: "DTH",
    icon: Tv,
    category: "communication",
    color: "bg-violet-100 text-violet-600",
  },
  "Cable TV": {
    id: "cable",
    name: "Cable TV",
    icon: Tv,
    category: "communication",
    color: "bg-fuchsia-100 text-fuchsia-600",
  },

  "Credit Card": {
    id: "credit-card",
    name: "Credit Card",
    icon: CardIcon,
    category: "finance",
    color: "bg-emerald-100 text-emerald-600",
  },
  "Loan Repayment": {
    id: "loan",
    name: "Loan Repayment",
    icon: Receipt,
    category: "finance",
    color: "bg-teal-100 text-teal-600",
  },
  "National Pension System": {
    id: "national-pension-system",
    name: "National Pension System",
    icon: ShieldCheck,
    category: "finance",
    color: "bg-blue-100 text-blue-600",
  },
  Insurance: {
    id: "insurance",
    name: "Insurance",
    icon: ShieldCheck,
    category: "finance",
    color: "bg-blue-100 text-blue-600",
  },
  "Recurring Deposit": {
    id: "recurring-deposit",
    name: "Recurring Deposit",
    icon: Receipt,
    category: "finance",
    color: "bg-sky-100 text-sky-600",
  },
  "National Pension": {
    id: "nps",
    name: "National Pension",
    icon: Landmark,
    category: "finance",
    color: "bg-green-100 text-green-600",
  },

  Fastag: {
    id: "fastag",
    name: "Fastag",
    icon: Car,
    category: "travel",
    color: "bg-orange-100 text-orange-600",
  },
  "NCMC Recharge": {
    id: "ncmc",
    name: "NCMC Recharge",
    icon: CardIcon,
    category: "travel",
    color: "bg-amber-100 text-amber-600",
  },
  eChallan: {
    id: "echallan",
    name: "eChallan",
    icon: FileText,
    category: "travel",
    color: "bg-red-100 text-red-600",
  },

  Subscription: {
    id: "subscription",
    name: "Subscription",
    icon: Film,
    category: "entertainment",
    color: "bg-purple-100 text-purple-600",
  },
  Hospital: {
    id: "hospital",
    name: "Hospital",
    icon: Stethoscope,
    category: "other",
    color: "bg-rose-100 text-rose-600",
  },
  "Hospital and Pathology": {
    id: "hospital-and-pathology",
    name: "Hospital and Pathology",
    icon: Stethoscope,
    category: "other",
    color: "bg-rose-100 text-rose-600",
  },

  Hospital: {
    id: "hospital",
    name: "Hospital",
    icon: Stethoscope,
    category: "other",
    color: "bg-rose-100 text-rose-600",
  },
  Donation: {
    id: "donation",
    name: "Donation",
    icon: Heart,
    category: "other",
    color: "bg-pink-100 text-pink-600",
  },
  Rental: {
    id: "rental",
    name: "Rental",
    icon: Home,
    category: "other",
    color: "bg-indigo-100 text-indigo-600",
  },
  "Education Fees": {
    id: "education",
    name: "Education Fees",
    icon: GraduationCap,
    category: "other",
    color: "bg-yellow-100 text-yellow-600",
  },
  "Clubs & Associations": {
    id: "clubs",
    name: "Clubs & Associations",
    icon: User,
    category: "other",
    color: "bg-blue-100 text-blue-600",
  },

  "Agent Collection": {
    id: "agent",
    name: "Agent Collection",
    icon: User,
    category: "other",
    color: "bg-blue-100 text-blue-600",
  },
};

// const MOCK_SERVICES = [
//   // --- Housing & Utilities ---
//   {
//     id: "municipal-tax",
//     name: "Municipal Taxes",
//     icon: Building2,
//     category: "utilities",
//     color: "bg-orange-100 text-orange-600",
//   },
//   {
//     id: "water",
//     name: "Water",
//     icon: Droplets,
//     category: "utilities",
//     color: "bg-blue-100 text-blue-600",
//   },
//   {
//     id: "lpg",
//     name: "LPG Gas",
//     icon: Flame,
//     category: "utilities",
//     color: "bg-red-100 text-red-600",
//   },
//   {
//     id: "electricity",
//     name: "Electricity",
//     icon: Zap,
//     category: "utilities",
//     color: "bg-yellow-100 text-yellow-600",
//   },
//   {
//     id: "housing",
//     name: "Housing Society",
//     icon: Home,
//     category: "utilities",
//     color: "bg-emerald-100 text-emerald-600",
//   },
//   {
//     id: "piped-gas",
//     name: "Piped Gas",
//     icon: Flame,
//     category: "utilities",
//     color: "bg-orange-100 text-orange-600",
//   },
//   {
//     id: "municipal-services",
//     name: "Municipal Services",
//     icon: Landmark,
//     category: "utilities",
//     color: "bg-slate-100 text-slate-600",
//   },

//   // --- Communication ---
//   {
//     id: "mobile-prepaid",
//     name: "Mobile Prepaid",
//     icon: Smartphone,
//     category: "communication",
//     color: "bg-rose-100 text-rose-600",
//   },
//   {
//     id: "mobile-postpaid",
//     name: "Mobile Postpaid",
//     icon: Smartphone,
//     category: "communication",
//     color: "bg-pink-100 text-pink-600",
//   },
//   {
//     id: "broadband",
//     name: "Broadband Postpaid",
//     icon: Wifi,
//     category: "communication",
//     color: "bg-cyan-100 text-cyan-600",
//   },
//   {
//     id: "landline",
//     name: "Landline Postpaid",
//     icon: Phone,
//     category: "communication",
//     color: "bg-indigo-100 text-indigo-600",
//   },
//   {
//     id: "dth",
//     name: "DTH",
//     icon: Tv,
//     category: "communication",
//     color: "bg-violet-100 text-violet-600",
//   },
//   {
//     id: "cable",
//     name: "Cable TV",
//     icon: Tv,
//     category: "communication",
//     color: "bg-fuchsia-100 text-fuchsia-600",
//   },

//   // --- Finance ---
//   {
//     id: "credit-card",
//     name: "Credit Card",
//     icon: CardIcon,
//     category: "finance",
//     color: "bg-emerald-100 text-emerald-600",
//   },
//   {
//     id: "loan",
//     name: "Loan Repayment",
//     icon: Receipt,
//     category: "finance",
//     color: "bg-teal-100 text-teal-600",
//   },
//   {
//     id: "insurance",
//     name: "Insurance",
//     icon: ShieldCheck,
//     category: "finance",
//     color: "bg-blue-100 text-blue-600",
//   },
//   {
//     id: "recurring-deposit",
//     name: "Recurring Deposit",
//     icon: Landmark,
//     category: "finance",
//     color: "bg-sky-100 text-sky-600",
//   },
//   {
//     id: "nps",
//     name: "National Pension",
//     icon: Landmark,
//     category: "finance",
//     color: "bg-green-100 text-green-600",
//   },

//   // --- Travel ---
//   {
//     id: "fastag",
//     name: "Fastag",
//     icon: Car,
//     category: "travel",
//     color: "bg-orange-100 text-orange-600",
//   },
//   {
//     id: "ncmc",
//     name: "NCMC Recharge",
//     icon: CardIcon,
//     category: "travel",
//     color: "bg-amber-100 text-amber-600",
//   },
//   {
//     id: "echallan",
//     name: "eChallan",
//     icon: FileText,
//     category: "travel",
//     color: "bg-red-100 text-red-600",
//   },

//   // --- Entertainment ---
//   {
//     id: "subscription",
//     name: "Subscription",
//     icon: Film,
//     category: "entertainment",
//     color: "bg-purple-100 text-purple-600",
//   },

//   // --- Others ---
//   {
//     id: "hospital",
//     name: "Hospital",
//     icon: Stethoscope,
//     category: "other",
//     color: "bg-rose-100 text-rose-600",
//   },
//   {
//     id: "donation",
//     name: "Donation",
//     icon: Heart,
//     category: "other",
//     color: "bg-pink-100 text-pink-600",
//   },
//   {
//     id: "rental",
//     name: "Rental",
//     icon: Home,
//     category: "other",
//     color: "bg-indigo-100 text-indigo-600",
//   },
//   {
//     id: "education",
//     name: "Education Fees",
//     icon: GraduationCap,
//     category: "other",
//     color: "bg-yellow-100 text-yellow-600",
//   },
//   {
//     id: "clubs",
//     name: "Clubs & Associations",
//     icon: User,
//     category: "other",
//     color: "bg-blue-100 text-blue-600",
//   },
//   {
//     id: "hospital-pathology",
//     name: "Hospital & Pathology",
//     icon: Stethoscope,
//     category: "other",
//     color: "bg-emerald-100 text-emerald-600",
//   },
//   {
//     id: "agent",
//     name: "Agent Collection",
//     icon: User,
//     category: "other",
//     color: "bg-slate-100 text-slate-600",
//   },
// ];

// const MOCK_BILLERS = [
//   "Adani Electricity Mumbai Ltd",
//   "Ajmer Vidyut Vitran Nigam Ltd (AVVNL)",
//   "Assam Power Distribution Company Ltd (APDCL)",
//   "Bangalore Electricity Supply Company Ltd (BESCOM)",
//   "Best Undertaking",
//   "BSES Rajdhani Power Limited",
//   "BSES Yamuna Power Limited",
//   "CESC Limited",
//   "Dakshin Gujarat Vij Company Ltd (DGVCL)",
//   "Damodar Valley Corporation (DVC)",
//   "Department of Power, Nagaland",
//   "DNH Power Distribution Corporation Ltd",
//   "Goa Electricity Department",
//   "Gulbarga Electricity Supply Company Ltd",
//   "Hubli Electricity Supply Company Ltd (HESCOM)",
//   "Jaipur Vidyut Vitran Nigam (JVVNL)",
//   "Jammu And Kashmir Power Development Department",
//   "Jharkhand Bijli Vitran Nigam Limited (JBVNL)",
//   "Jodhpur Vidyut Vitran Nigam Limited (JDVVNL)",
//   "Kanpur Electricity Supply Company Ltd",
//   "Kerala State Electricity Board Ltd. (KSEBL)",
//   "Kota Electricity Distribution Limited (KEDL)",
//   "Madhya Gujarat Vij Company Ltd (MGVCL)",
//   "Maharashtra State Electricity Distribution Co. Ltd",
//   "Meghalaya Power Distribution Corporation Ltd",
//   "North Bihar Power Distribution Company Ltd",
//   "North Delhi Power Limited (Tata Power - DDL)",
//   "Paschim Gujarat Vij Company Ltd (PGVCL)",
//   "Punjab State Power Corporation Ltd (PSPCL)",
//   "South Bihar Power Distribution Company Ltd",
//   "Tamil Nadu Generation and Distribution Corporation",
//   "Tata Power Company Limited (Mumbai)",
//   "Telangana State Southern Power Distribution Company",
//   "Torrent Power",
//   "Tripura State Electricity Corporation Ltd",
//   "Uttar Gujarat Vij Company Ltd (UGVCL)",
//   "Uttar Pradesh Power Corporation Ltd (UPPCL)",
//   "West Bengal State Electricity Distribution Co. Ltd",
// ];

// --- API SIMULATION ---

// export const fetchCategories = () => {
//   return new Promise((resolve) => {
//     setTimeout(() => {
//       resolve(MOCK_CATEGORIES);
//     }, 500); // Simulate network delay
//   });
// };

// export const fetchServices = (category = "all") => {
//   return new Promise((resolve) => {
//     setTimeout(() => {
//       if (category === "all") {
//         resolve(MOCK_SERVICES);
//       } else {
//         const filtered = MOCK_SERVICES.filter(
//           (service) => service.category === category,
//         );
//         resolve(filtered);
//       }
//     }, 600); // slightly longer delay
//   });
// };

