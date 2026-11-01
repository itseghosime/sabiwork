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
    location: "Sample area, Benin City",
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
    location: "Sample area, Benin City",
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
    location: "Sample area, Benin City",
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
    location: "Sample area, Benin City",
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
    reviewerName: "Sample Customer 1",
    area: "Sample area",
    rating: 5,
    date: "24 Oct 2026",
    comment:
      "Sample review text for layout preview only.",
    jobRef: "SAMPLE-REQUEST-001",
    milestoneVerified: false,
  },
  {
    id: "rev-02",
    reviewerName: "Sample Customer 2",
    area: "Sample area",
    rating: 5,
    date: "09 Oct 2026",
    comment:
      "Sample review text for layout preview only.",
    jobRef: "SAMPLE-REQUEST-002",
    milestoneVerified: false,
  },
  {
    id: "rev-03",
    reviewerName: "Sample Customer 3",
    area: "Sample area",
    rating: 4,
    date: "15 Sep 2026",
    comment:
      "Sample review text for layout preview only.",
    jobRef: "SAMPLE-REQUEST-003",
    milestoneVerified: false,
  },
];

export const defaultArtisan: ArtisanProfile = {
  id: "SAMPLE-ARTISAN-001",
  slug: "sample-artisan-1",
  name: "Sample Artisan 1",
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
  bio: "Fictional artisan profile for demonstrating plumbing skills, sample reviews, and portfolio layouts. No credentials or work history are verified.",
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
  id: "SAMPLE-APPLICATION-001",
  artisanId: defaultArtisan.id,
  applicationRef: "SAMPLE-VERIFICATION-PREVIEW",
  lodgedDate: "28 October 2026 · 10:15 WAT",
  status: "UNDER_REVIEW",
  tradeGuild: "Not provided in this sample",
  certificateRef: "Not issued",
  masterCraftsman: "Not assigned",
  workshopLocation: "Sample workshop area, Benin City",
  submittedFiles: [
    { id: "f1", name: "sample-identity-document-not-uploaded.pdf", type: "application/pdf" },
    { id: "f2", name: "sample-workshop-image-not-uploaded.jpg", type: "image/jpeg" },
    { id: "f3", name: "sample-certificate-not-issued.pdf", type: "application/pdf" },
  ],
  reviewNotes:
    "Sample status only. No documents were uploaded and no review was performed.",
  timeline: [
    {
      title: "Sample Form Preview",
      detail: "No credentials or documents were submitted or saved.",
      time: "28 Oct, 10:15 WAT",
      state: "complete",
    },
    {
      title: "Identity and Guild Review",
        detail: "Sample state only; no identity or membership check occurred.",
        time: "Example timeline step",
        state: "pending",
    },
    {
      title: "Sample Workshop Review State",
      detail: "No visit or inspection was scheduled.",
      time: "Not started",
      state: "pending",
    },
    {
      title: "Credential Preview",
      detail: "No badge or credential is issued or published.",
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
      query === defaultArtisan.id.toLowerCase() ||
      query === defaultArtisan.slug ||
      query === "sample-artisan" ||
      query === "1" ||
      query === "default"
    ) {
      return defaultArtisan;
    }
    return null;
  },

  async updateProfile(
    input: Partial<ArtisanProfile>,
    simulateError = false,
  ): Promise<{ ok: boolean; message: string; profile?: ArtisanProfile }> {
    await waitBriefly();
    if (simulateError) {
      return {
        ok: false,
        message: "Could not update the local profile preview. No profile data was saved.",
      };
    }
    const updated: ArtisanProfile = {
      ...defaultArtisan,
      ...input,
    };
    return {
      ok: true,
      message: "Sample profile preview updated locally; nothing was saved.",
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
      declarationChecked: boolean;
      simulateError?: boolean;
    },
  ): Promise<{ ok: boolean; message: string; ref?: string }> {
    await waitBriefly();
    if (input.simulateError) {
      return {
        ok: false,
        message: "Sample verification preview failed. No document was uploaded or stored.",
      };
    }
    if (!input.declarationChecked) {
      return {
        ok: false,
        message: "Acknowledge the prototype limitation to preview the form.",
      };
    }
    return {
      ok: true,
      message: "Sample form preview complete. No details were stored, uploaded, or checked.",
      ref: "SAMPLE-VERIFICATION-PREVIEW",
    };
  },
};
