import { artisans, categories } from "@/features/search/data";

/**
 * Fictional demonstration data and typed browser-only service adapter
 * for Artisan Profiles, Portfolio Showcases, and Verification workflows (S04, S05, S06, S40, S41).
 * Replace with persistent backend endpoints upon service integration.
 */

export interface PortfolioItem {
  id: string;
  title: string;
  category: string;
  location: string;
  completedDate: string;
  description: string;
  imageUrl: string;
  tags: readonly string[];
}

export interface CustomerReview {
  id: string;
  reviewerName: string;
  area: string;
  rating: number;
  date: string;
  comment: string;
  jobRef: string;
  milestoneVerified: boolean;
}

export interface ArtisanProfile {
  id: string;
  slug: string;
  name: string;
  headline: string;
  category: string;
  trade: string;
  area: string;
  workshopAddress: string;
  rating: number;
  reviewCount: number;
  completedJobsCount: number;
  startingPriceKobo: number;
  experienceYears: number;
  profileReviewed: boolean;
  bvnVerified: boolean;
  ninVerified: boolean;
  workshopVetted: boolean;
  initials: string;
  bio: string;
  skills: readonly string[];
  portfolio: readonly PortfolioItem[];
  reviews: readonly CustomerReview[];
}

export type VerificationState = "UNDER_REVIEW" | "APPROVED" | "CHANGES_REQUESTED";

export interface VerificationApplication {
  id: string;
  artisanId: string;
  applicationRef: string;
  lodgedDate: string;
  status: VerificationState;
  ninNumber: string;
  tradeGuild: string;
  certificateRef: string;
  masterCraftsman: string;
  workshopLocation: string;
  submittedFiles: readonly { id: string; name: string; type: string }[];
  reviewNotes: string;
  timeline: readonly {
    title: string;
    detail: string;
    time: string;
    state: "complete" | "current" | "pending";
  }[];
}

const defaultPortfolio: readonly PortfolioItem[] = [
  {
    id: "photo-01",
    title: "Dual Pressure PPR Piping & Manifold Installation",
    category: "Plumbing",
    location: "Sample district, Benin City",
    completedDate: "18 Feb 2026",
    description:
      "Installed full PPR hot/cold manifold distribution system with independent isolation valves and high-pressure leak testing.",
    imageUrl: "/images/portfolio/ppr-manifold.jpg",
    tags: ["PPR Fusion", "Pressure Testing", "Manifold"],
  },
  {
    id: "photo-02",
    title: "Concealed Wall Vanity & Trap Replacement",
    category: "Plumbing",
    location: "Sample district, Benin City",
    completedDate: "04 Jan 2026",
    description:
      "Concealed bottle trap and flexible drain lines retrofit to eliminate sewer odor and under-sink dripping.",
    imageUrl: "/images/portfolio/vanity-trap.jpg",
    tags: ["Drainage", "Vanity", "Leak Repair"],
  },
  {
    id: "photo-03",
    title: "2,000L Overhead Tank & Automatic Float Switch",
    category: "Plumbing",
    location: "Sample district, Benin City",
    completedDate: "12 Dec 2025",
    description:
      "Reinforced steel stanchion plumbing with non-return check valves and automated submersible pump control wiring.",
    imageUrl: "/images/portfolio/overhead-tank.jpg",
    tags: ["Water Storage", "Float Switch", "Stanchion"],
  },
  {
    id: "photo-04",
    title: "Ground Floor Inspection Chamber & Manhole Clearing",
    category: "Plumbing",
    location: "Sample district, Benin City",
    completedDate: "28 Nov 2025",
    description:
      "Excavated blocked grease trap, renewed damaged PVC sweeps, and sealed with heavy-duty ductile iron inspection covers.",
    imageUrl: "/images/portfolio/manhole-drain.jpg",
    tags: ["Civil Plumbing", "Inspection Chamber", "Grease Trap"],
  },
];

const defaultReviews: readonly CustomerReview[] = [
  {
    id: "rev-01",
    reviewerName: "Sample Customer",
    area: "GRA Axis",
    rating: 5,
    date: "24 Oct 2026",
    comment:
      "The sample artisan arrived on schedule and diagnosed the persistent leak under the kitchen sink. Clean work and courteous service.",
    jobRef: "BN-REQ-8421",
    milestoneVerified: true,
  },
  {
    id: "rev-02",
    reviewerName: "Sample Customer 2",
    area: "Sample district",
    rating: 5,
    date: "09 Oct 2026",
    comment:
      "Replaced our entire overhead tank bypass manifold. Honest pricing and genuine heavy gauge pipes used.",
    jobRef: "BN-REQ-7910",
    milestoneVerified: true,
  },
  {
    id: "rev-03",
    reviewerName: "Sample Customer 3",
    area: "Ugbowo",
    rating: 4,
    date: "15 Sep 2026",
    comment:
      "Good technical know-how on water booster pump wiring and pressure switches. Will recommend to colleagues.",
    jobRef: "BN-REQ-7104",
    milestoneVerified: true,
  },
];

export const defaultArtisan: ArtisanProfile = {
  id: "00000000-0000-4000-8000-000000000001",
  slug: "sample-artisan",
  name: "Sample Artisan",
  headline: "Master Plumber & Pipe Fitter",
  category: "plumbing",
  trade: "Plumbing & Water Systems",
  area: "GRA",
  workshopAddress: "Sample workshop area, Benin City",
  rating: 4.9,
  reviewCount: 38,
  completedJobsCount: 142,
  startingPriceKobo: 1_000_000,
  experienceYears: 12,
  profileReviewed: false,
  bvnVerified: false,
  ninVerified: false,
  workshopVetted: false,
  initials: "SA",
  bio: "Trade-certified master plumber with over 12 years of hands-on installation, troubleshooting, and pressurized piping maintenance across Benin City. Specializing in high-density PPR fusion, concealed drainage traps, borehole water distribution, and sanitary ware fixtures. Registered member of the Edo State Professional Artisans Guild.",
  skills: [
    "PPR Heat-Fusion Piping",
    "Under-Sink Leak Detection",
    "Overhead Tank Stanchion Plumbing",
    "Water Pump & Float Switch Automation",
    "Bathroom Sanitary Ware Installation",
    "Drainage & Inspection Chambers",
  ],
  portfolio: defaultPortfolio,
  reviews: defaultReviews,
};

export const defaultVerification: VerificationApplication = {
  id: "app-ver-001",
  artisanId: defaultArtisan.id,
  applicationRef: "VER-BN-2026-104",
  lodgedDate: "28 October 2026 · 10:15 WAT",
  status: "UNDER_REVIEW",
  ninNumber: "Not provided in sample",
  tradeGuild: "Edo State Guild of Plumbers & Building Craftsmen",
  certificateRef: "SAMPLE-CERT-NOT-ISSUED",
  masterCraftsman: "Sample reviewer",
  workshopLocation: "Sample workshop area, Benin City",
  submittedFiles: [
    { id: "f1", name: "sample-identity-document.pdf", type: "application/pdf" },
    { id: "f2", name: "sample-workshop-photo.jpg", type: "image/jpeg" },
    { id: "f3", name: "sample-trade-certificate.pdf", type: "application/pdf" },
  ],
  reviewNotes:
    "Physical workshop inspection scheduled with Benin Hub field verification team.",
  timeline: [
    {
      title: "Application Submitted",
      detail: "Sample form fields were previewed locally; no documents were uploaded.",
      time: "28 Oct, 10:15 WAT",
      state: "complete",
    },
    {
      title: "Sample review state",
      detail: "No identity number or guild record was checked.",
      time: "29 Oct, 14:30 WAT",
      state: "complete",
    },
    {
      title: "Sample location review",
      detail: "No workshop visit or location check was performed.",
      time: "In Progress",
      state: "current",
    },
    {
      title: "Credential integration pending",
      detail: "No badge or credential is issued by this prototype.",
      time: "Pending",
      state: "pending",
    },
  ],
};

const waitBriefly = () => new Promise<void>((resolve) => setTimeout(resolve, 200));

export const profilesDemoService = {
  async getProfile(idOrSlug: string): Promise<ArtisanProfile | null> {
    await waitBriefly();
    const query = idOrSlug.toLowerCase().trim();
    if (
      query === defaultArtisan.id ||
      query === defaultArtisan.slug ||
      query === "sample" ||
      query === "1" ||
      query === "default"
    ) {
      return defaultArtisan;
    }
    const listing = artisans.find(
      (person) => person.id === query || person.name.toLowerCase().replaceAll(" ", "-") === query,
    );
    if (!listing) return null;
    const category = categories.find((item) => item.id === listing.category);
    return {
      ...defaultArtisan,
      id: listing.id,
      slug: listing.name.toLowerCase().replaceAll(" ", "-"),
      name: listing.name,
      headline: listing.headline,
      category: listing.category,
      trade: category?.name ?? listing.category,
      area: listing.area,
      workshopAddress: `Sample workshop area, ${listing.area}, Benin City`,
      rating: listing.rating,
      reviewCount: listing.reviewCount,
      completedJobsCount: 12 + listing.reviewCount,
      startingPriceKobo: listing.startingPriceKobo,
      experienceYears: 2 + (listing.reviewCount % 12),
      profileReviewed: listing.profileReviewed,
      initials: listing.initials,
      bio: listing.bio,
      skills: [listing.headline, ...(category?.services ?? [])],
      portfolio: defaultPortfolio.map((item, index) => ({
        ...item,
        id: `${listing.id}-sample-${index + 1}`,
        category: category?.short ?? listing.category,
        title: `${category?.short ?? "Trade"} sample ${index + 1}`,
        description: `Illustrative ${category?.name.toLowerCase() ?? "trade"} portfolio item for this prototype. No real job or customer is represented.`,
      })),
      reviews: defaultReviews.map((review, index) => ({
        ...review,
        id: `${listing.id}-review-${index + 1}`,
        comment: "Illustrative sample review for prototype demonstration only.",
        milestoneVerified: false,
      })),
    };
  },

  async updateProfile(
    input: Partial<ArtisanProfile>,
    simulateError = false,
  ): Promise<{ ok: boolean; message: string; profile?: ArtisanProfile }> {
    await waitBriefly();
    if (simulateError) {
      return {
        ok: false,
        message: "Network timeout while syncing profile with Benin City directory. Please try again.",
      };
    }
    const updated: ArtisanProfile = {
      ...defaultArtisan,
      ...input,
    };
    return {
      ok: true,
      message: "Profile preview updated locally only. Nothing was saved.",
      profile: updated,
    };
  },

  async getPortfolioItem(artisanId: string, photoId: string): Promise<PortfolioItem | null> {
    await waitBriefly();
    const item = defaultPortfolio.find((p) => p.id === photoId) || defaultPortfolio[0];
    return item ?? null;
  },

  async getVerificationStatus(artisanId: string): Promise<VerificationApplication> {
    await waitBriefly();
    if (artisanId !== defaultArtisan.id) {
      return {
        ...defaultVerification,
        artisanId,
      };
    }
    return defaultVerification;
  },

  async submitVerification(
    input: {
      ninNumber: string;
      certificateRef: string;
      workshopAddress: string;
      declarationChecked: boolean;
      simulateError?: boolean;
    },
  ): Promise<{ ok: boolean; message: string; ref?: string }> {
    await waitBriefly();
    if (input.simulateError) {
      return {
        ok: false,
        message: "Failed to upload verification documents. Connection to verification vault timed out.",
      };
    }
    if (!input.declarationChecked) {
      return {
        ok: false,
        message: "Please accept the legal declaration to submit your verification application.",
      };
    }
    if (!input.ninNumber || input.ninNumber.trim().length < 11) {
      return {
        ok: false,
        message: "Please enter a valid 11-digit National Identity Number (NIN).",
      };
    }
    return {
      ok: true,
      message: "Verification form preview complete. No documents were uploaded or application saved.",
      ref: "VER-BN-2026-104",
    };
  },
};
