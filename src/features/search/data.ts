// Fictional demonstration records. Replace this adapter on Saturday; never treat
// sample ratings or badges as persisted reviews or verification decisions.
export const categories = [
  {
    id: "plumbing",
    name: "Plumbing & drainage",
    short: "Plumbing",
    icon: "wrench",
    description: "Leaky taps, water tanks and the pipes in between.",
    services: ["Leak repairs", "Tank installations", "Bathroom fittings"],
    portrait: 2,
  },
  {
    id: "electrical",
    name: "Electrical & wiring",
    short: "Electrical",
    icon: "zap",
    description: "From faulty sockets to a brighter, better-connected home.",
    services: ["Wiring", "Lighting", "Inverter installations"],
    portrait: 4,
  },
  {
    id: "carpentry",
    name: "Carpentry & furniture",
    short: "Carpentry",
    icon: "hammer",
    description: "Thoughtful repairs and woodwork made for your space.",
    services: ["Furniture repairs", "Cabinet making", "Door fittings"],
    portrait: 3,
  },
  {
    id: "tailoring",
    name: "Tailoring & fashion",
    short: "Tailoring",
    icon: "scissors",
    description: "Everyday alterations. Outfits for your big moments.",
    services: ["Alterations", "Bespoke outfits", "Uniforms"],
    portrait: 1,
  },
  {
    id: "painting",
    name: "Painting & finishing",
    short: "Painting",
    icon: "paintbrush",
    description: "Fresh colour and careful finishes, inside and out.",
    services: ["Interior painting", "Exterior painting", "Wall preparation"],
    portrait: 0,
  },
  {
    id: "cleaning",
    name: "Cleaning & care",
    short: "Cleaning",
    icon: "sparkles",
    description: "A fresh start for your home, office or new space.",
    services: [
      "Deep cleaning",
      "Office cleaning",
      "Post-construction cleaning",
    ],
    portrait: null,
  },
] as const;
export type CategoryId = (typeof categories)[number]["id"];
export const areas = [
  "GRA",
  "Ugbowo",
  "Ikpoba Hill",
  "Airport Road",
  "Uselu",
  "New Benin",
] as const;
export type Area = (typeof areas)[number];
export interface Artisan {
  id: string;
  name: string;
  category: CategoryId;
  skills: readonly CategoryId[];
  area: Area;
  headline: string;
  bio: string;
  rating: number;
  reviewCount: number;
  startingPriceKobo: number;
  profileReviewed: boolean;
  portrait: number | null;
  initials: string;
}
const featuredArtisans: readonly Artisan[] = [
  {
    id: "00000000-0000-4000-8000-000000000001",
    name: "Sample Artisan",
    category: "plumbing",
    skills: ["plumbing"],
    area: "GRA",
    headline: "Plumber & water systems specialist",
    bio: "Careful repairs for leaks, fittings and household water systems.",
    rating: 4.9,
    reviewCount: 28,
    startingPriceKobo: 1000000,
    profileReviewed: true,
    portrait: 2,
    initials: "SA",
  },
  {
    id: "00000000-0000-4000-8000-000000000002",
    name: "Sample Artisan 2",
    category: "tailoring",
    skills: ["tailoring"],
    area: "Ugbowo",
    headline: "Tailor & fashion designer",
    bio: "Beautiful everyday pieces, precise alterations and occasion wear.",
    rating: 4.8,
    reviewCount: 19,
    startingPriceKobo: 800000,
    profileReviewed: true,
    portrait: 1,
    initials: "S2",
  },
  {
    id: "00000000-0000-4000-8000-000000000003",
    name: "Sample Artisan 3",
    category: "painting",
    skills: ["painting"],
    area: "Ikpoba Hill",
    headline: "Painter & interior finisher",
    bio: "Neat preparation and lasting colour for homes and offices.",
    rating: 4.7,
    reviewCount: 15,
    startingPriceKobo: 1500000,
    profileReviewed: true,
    portrait: 0,
    initials: "S3",
  },
  {
    id: "00000000-0000-4000-8000-000000000004",
    name: "Sample Artisan 4",
    category: "carpentry",
    skills: ["carpentry"],
    area: "Airport Road",
    headline: "Carpenter & furniture maker",
    bio: "Custom shelves, sturdy furniture and repairs worth keeping.",
    rating: 4.8,
    reviewCount: 22,
    startingPriceKobo: 1200000,
    profileReviewed: true,
    portrait: 3,
    initials: "S4",
  },
  {
    id: "00000000-0000-4000-8000-000000000005",
    name: "Sample Artisan 5",
    category: "electrical",
    skills: ["electrical"],
    area: "Ikpoba Hill",
    headline: "Electrician & lighting specialist",
    bio: "Practical electrical repairs and considered lighting installations.",
    rating: 4.9,
    reviewCount: 24,
    startingPriceKobo: 1000000,
    profileReviewed: true,
    portrait: 4,
    initials: "S5",
  },
  {
    id: "00000000-0000-4000-8000-000000000006",
    name: "Sample Artisan 6",
    category: "cleaning",
    skills: ["cleaning"],
    area: "Uselu",
    headline: "Home & office cleaning specialist",
    bio: "Thorough cleaning for lived-in homes and busy workspaces.",
    rating: 4.6,
    reviewCount: 12,
    startingPriceKobo: 1800000,
    profileReviewed: true,
    portrait: null,
    initials: "S6",
  },
  {
    id: "00000000-0000-4000-8000-000000000007",
    name: "Sample Artisan 7",
    category: "plumbing",
    skills: ["plumbing"],
    area: "New Benin",
    headline: "Plumbing repairs & installations",
    bio: "Tap replacements, pipe repairs and bathroom maintenance.",
    rating: 4.4,
    reviewCount: 8,
    startingPriceKobo: 700000,
    profileReviewed: false,
    portrait: null,
    initials: "S7",
  },
  {
    id: "00000000-0000-4000-8000-000000000008",
    name: "Sample Artisan 8",
    category: "electrical",
    skills: ["electrical"],
    area: "GRA",
    headline: "Electrical maintenance specialist",
    bio: "Sockets, fixtures and everyday electrical maintenance.",
    rating: 4.5,
    reviewCount: 10,
    startingPriceKobo: 900000,
    profileReviewed: false,
    portrait: null,
    initials: "S8",
  },
  {
    id: "00000000-0000-4000-8000-000000000009",
    name: "Sample Artisan 9",
    category: "tailoring",
    skills: ["tailoring"],
    area: "New Benin",
    headline: "Bespoke tailoring & alterations",
    bio: "Made-to-fit outfits and careful clothing repairs.",
    rating: 4.7,
    reviewCount: 14,
    startingPriceKobo: 600000,
    profileReviewed: true,
    portrait: null,
    initials: "S9",
  },
];

// Additional fictional profiles give the prototype enough variety to demo
// category filters, search, sorting, and pagination without implying real
// providers or verified customer outcomes.
const demoProfiles: readonly {
  category: CategoryId;
  area: Area;
  headline: string;
  bio: string;
  skill: string;
}[] = [
  { category: "plumbing", area: "GRA", headline: "Pipe fitting & leak repair", bio: "Sample specialist for tap repairs, pipe fitting and water storage maintenance.", skill: "Leak detection" },
  { category: "electrical", area: "Ugbowo", headline: "Home wiring & lighting", bio: "Sample specialist for safe home wiring, lighting and socket repairs.", skill: "Lighting installation" },
  { category: "carpentry", area: "Ikpoba Hill", headline: "Custom furniture & cabinetry", bio: "Sample craftsperson for fitted cabinets, shelves and furniture restoration.", skill: "Cabinet making" },
  { category: "tailoring", area: "Airport Road", headline: "Bespoke tailoring & alterations", bio: "Sample fashion professional for made-to-measure outfits and careful alterations.", skill: "Bespoke outfits" },
  { category: "painting", area: "Uselu", headline: "Interior painting & finishing", bio: "Sample decorator for wall preparation, smooth paintwork and colour refreshes.", skill: "Interior finishing" },
  { category: "cleaning", area: "New Benin", headline: "Home & office cleaning", bio: "Sample cleaning professional for deep cleans, move-ins and tidy workspaces.", skill: "Deep cleaning" },
  { category: "plumbing", area: "Ugbowo", headline: "Water systems & bathroom fittings", bio: "Sample specialist for bathroom fittings, water pumps and household pipework.", skill: "Bathroom fittings" },
  { category: "electrical", area: "GRA", headline: "Electrical repairs & inverter setup", bio: "Sample electrician for fixture repairs and small backup-power installations.", skill: "Inverter setup" },
  { category: "carpentry", area: "Airport Road", headline: "Doors, shelves & wood repairs", bio: "Sample carpenter for door adjustments, built-in shelves and wood repairs.", skill: "Door fitting" },
  { category: "tailoring", area: "Ikpoba Hill", headline: "Occasion wear & native styles", bio: "Sample tailor for event outfits, native styles and fitting adjustments.", skill: "Occasion wear" },
  { category: "painting", area: "New Benin", headline: "Wall prep & decorative paint", bio: "Sample painter for neat surface preparation and decorative home finishes.", skill: "Wall preparation" },
  { category: "cleaning", area: "GRA", headline: "Move-in & post-renovation cleaning", bio: "Sample cleaner for move-in refreshes and post-renovation tidy-ups.", skill: "Move-in cleaning" },
  { category: "plumbing", area: "Ikpoba Hill", headline: "Drainage & fixture maintenance", bio: "Sample plumbing professional for drainage clearing and fixture maintenance.", skill: "Drainage" },
  { category: "electrical", area: "Uselu", headline: "Lighting, fans & socket repairs", bio: "Sample electrician for lighting, ceiling fans and everyday socket repairs.", skill: "Fan installation" },
  { category: "carpentry", area: "New Benin", headline: "Furniture assembly & repairs", bio: "Sample craftsperson for furniture assembly and practical repairs.", skill: "Furniture repair" },
  { category: "tailoring", area: "GRA", headline: "Uniforms & everyday alterations", bio: "Sample tailor for uniform orders, hems and wardrobe alterations.", skill: "Uniforms" },
  { category: "painting", area: "Airport Road", headline: "Exterior paint & weatherproofing", bio: "Sample painter for exterior refreshes and protective finishing.", skill: "Exterior painting" },
  { category: "cleaning", area: "Ugbowo", headline: "Residential deep-clean specialist", bio: "Sample cleaner for kitchens, bathrooms and detailed home deep cleans.", skill: "Residential cleaning" },
  { category: "plumbing", area: "Airport Road", headline: "Pump, tank & pipe installations", bio: "Sample specialist for water pumps, tank connections and pipe installations.", skill: "Pump installation" },
  { category: "electrical", area: "New Benin", headline: "Residential wiring & safety checks", bio: "Sample electrician for residential wiring and basic fixture checks.", skill: "Residential wiring" },
  { category: "carpentry", area: "Uselu", headline: "Kitchen fittings & custom shelves", bio: "Sample carpenter for kitchen fittings and made-to-measure shelving.", skill: "Kitchen cabinetry" },
  { category: "tailoring", area: "New Benin", headline: "Fashion design & garment repairs", bio: "Sample fashion professional for custom pieces and garment repairs.", skill: "Garment repair" },
  { category: "painting", area: "Ugbowo", headline: "Room refresh & colour consultation", bio: "Sample decorator for room refreshes and thoughtful colour planning.", skill: "Colour consultation" },
  { category: "cleaning", area: "Ikpoba Hill", headline: "Office & small-business cleaning", bio: "Sample cleaner for tidy offices and small business spaces.", skill: "Office cleaning" },
  { category: "plumbing", area: "Uselu", headline: "Bathroom upgrades & leak repairs", bio: "Sample plumber for bathroom upgrades, fittings and leak repairs.", skill: "Bathroom upgrades" },
  { category: "electrical", area: "Airport Road", headline: "Home appliance & fixture support", bio: "Sample electrician for household fixtures and straightforward appliance connections.", skill: "Fixture installation" },
  { category: "carpentry", area: "GRA", headline: "Wardrobes & interior woodwork", bio: "Sample craftsperson for wardrobes, trim and practical interior woodwork.", skill: "Wardrobe fitting" },
  { category: "tailoring", area: "Uselu", headline: "Made-to-fit shirts & occasion wear", bio: "Sample tailor for made-to-fit shirts and special-occasion outfits.", skill: "Made-to-measure" },
  { category: "painting", area: "Ikpoba Hill", headline: "Careful home repainting", bio: "Sample painter for clean edges, prepared walls and home repainting.", skill: "Home repainting" },
  { category: "cleaning", area: "Airport Road", headline: "Short-let turnover cleaning", bio: "Sample cleaner for guest-ready short-let turnover and linen refreshes.", skill: "Turnover cleaning" },
  { category: "plumbing", area: "New Benin", headline: "Tap, toilet & pipe repairs", bio: "Sample plumber for common household fixture and pipe repairs.", skill: "Fixture repair" },
  { category: "electrical", area: "Ikpoba Hill", headline: "Smart lighting & electrical upgrades", bio: "Sample electrician for lighting upgrades and small home improvements.", skill: "Lighting upgrades" },
  { category: "carpentry", area: "Ugbowo", headline: "Furniture finishing & restoration", bio: "Sample craftsperson for furniture touch-ups, refinishing and restoration.", skill: "Furniture finishing" },
  { category: "tailoring", area: "Airport Road", headline: "Children's wear & family tailoring", bio: "Sample tailor for children's outfits and practical family alterations.", skill: "Children's wear" },
  { category: "painting", area: "GRA", headline: "Decorative walls & finishing", bio: "Sample painter for feature walls and polished finishing details.", skill: "Decorative finishes" },
];

const extraArtisans: Artisan[] = demoProfiles.map((profile, index) => {
  const number = index + 10;
  const portrait = index % 5;
  return {
    id: `00000000-0000-4000-8000-${String(number).padStart(12, "0")}`,
    name: `Sample Artisan ${number}`,
    category: profile.category,
    skills: [profile.category],
    area: profile.area,
    headline: profile.headline,
    bio: profile.bio,
    rating: [4.6, 4.8, 4.7, 4.9, 4.5][index % 5],
    reviewCount: 6 + ((index * 7) % 29),
    startingPriceKobo: (6000 + ((index * 1350) % 12000)) * 100,
    profileReviewed: index % 3 !== 0,
    portrait,
    initials: `S${number}`,
  };
});

export const artisans: readonly Artisan[] = [
  ...featuredArtisans,
  ...extraArtisans,
];
export const formatNaira = (kobo: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: kobo % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(kobo / 100);

export const tradeAliases: Record<CategoryId, readonly string[]> = {
  plumbing: ["plumber", "plumbers"],
  electrical: ["electrician", "electricians"],
  carpentry: ["carpenter", "carpenters"],
  tailoring: ["tailor", "tailors"],
  painting: ["painter", "painters"],
  cleaning: ["cleaner", "cleaners"],
};
