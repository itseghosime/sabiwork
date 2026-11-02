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
    location: "Boundary Rd, GRA, Benin City",
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
    location: "Ihama Rd, GRA, Benin City",
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
    location: "Ugbowo Axis, Benin City",
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
    location: "Airport Rd, Benin City",
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
    reviewerName: "Ada Okafor",
    area: "GRA Axis",
    rating: 5,
    date: "24 Oct 2026",
    comment:
      "Osaze arrived right on schedule and diagnosed the persistent leak under our kitchen sink instantly. Clean work and very courteous.",
    jobRef: "BN-REQ-8421",
    milestoneVerified: true,
  },
  {
    id: "rev-02",
    reviewerName: "Pastor Eghosa Imasuen",
    area: "Boundary Rd",
    rating: 5,
    date: "09 Oct 2026",
    comment:
      "Replaced our entire overhead tank bypass manifold. Honest pricing and genuine heavy gauge pipes used.",
    jobRef: "BN-REQ-7910",
    milestoneVerified: true,
  },
  {
    id: "rev-03",
    reviewerName: "Engr. Felix Omokaro",
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
  slug: "osaze-ighodaro",
  name: "Osaze Ighodaro",
  headline: "Master Plumber & Pipe Fitter",
  category: "plumbing",
  trade: "Plumbing & Water Systems",
  area: "GRA",
  workshopAddress: "14 Boundary Road, GRA, Benin City (Opposite Royal Marble Hotel)",
  rating: 4.9,
  reviewCount: 38,
  completedJobsCount: 142,
  startingPriceKobo: 1_000_000,
  experienceYears: 12,
  profileReviewed: true,
  bvnVerified: true,
  ninVerified: true,
  workshopVetted: true,
  initials: "OI",
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
  ninNumber: "••••••••9012",
  tradeGuild: "Edo State Guild of Plumbers & Building Craftsmen",
  certificateRef: "EDG-PL-2018-0442",
  masterCraftsman: "Chief Pa Osagie Omorogbe (Uselu)",
  workshopLocation: "14 Boundary Road, GRA, Benin City",
  submittedFiles: [
    { id: "f1", name: "national_id_slip.pdf", type: "application/pdf" },
    { id: "f2", name: "workshop_signboard_front.jpg", type: "image/jpeg" },
    { id: "f3", name: "guild_membership_certificate.pdf", type: "application/pdf" },
  ],
  reviewNotes:
    "Physical workshop inspection scheduled with Benin Hub field verification team.",
  timeline: [
    {
      title: "Application Submitted",
      detail: "Credentials, NIN validation token, and workshop photos uploaded.",
      time: "28 Oct, 10:15 WAT",
      state: "complete",
    },
    {
      title: "Identity & Guild Audit",
      detail: "NIN match verified against guild membership registry.",
      time: "29 Oct, 14:30 WAT",
      state: "complete",
    },
    {
      title: "Workshop Field Inspection",
      detail: "Physical verification officer assigned for workshop site visit.",
      time: "In Progress",
      state: "current",
    },
    {
      title: "Pro Badge Issuance",
      detail: "Final review and public badge credential publishing.",
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
      query === "osaze" ||
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
        message: "Network timeout while syncing profile with Benin City directory. Please try again.",
      };
    }
    const updated: ArtisanProfile = {
      ...defaultArtisan,
      ...input,
    };
    return {
      ok: true,
      message: "Profile updated successfully! Preview changes reflected locally.",
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
      message: "Verification application lodged successfully! Application #VER-BN-2026-104 under review.",
      ref: "VER-BN-2026-104",
    };
  },
};
