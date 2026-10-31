export type DossierStatus = "pending" | "approved" | "rejected" | "flagged";

export interface VerificationDocument {
  id: string;
  type: "nin" | "trade_cert" | "workshop" | "utility_bill";
  label: string;
  url: string;
  identifier?: string;
  notes?: string;
  verified: boolean;
}

export interface VerificationDossier {
  id: string;
  artisanId: string;
  fullName: string;
  avatarUrl: string;
  trade: string;
  experienceYears: number;
  phone: string;
  email: string;
  location: string;
  workshopAddress: string;
  submittedAt: string;
  status: DossierStatus;
  competencies: string[];
  documents: VerificationDocument[];
  reviewerNotes?: string;
  rejectionReasons?: string[];
  decidedAt?: string;
  badgeIssued?: boolean;
}

export interface ArtisanRegistrationDraft {
  fullName: string;
  phone: string;
  email: string;
  password?: string;
  trade: string;
  experienceYears: number;
  coverageAreas: string[];
  workshopAddress: string;
  bio: string;
  ninNumber: string;
}

export interface DossierMetrics {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  averageTurnaroundHours: number;
}

const mockDossiers: VerificationDossier[] = [
  {
    id: "VET-BEN-4081",
    artisanId: "00000000-0000-4000-8000-000000000001",
    fullName: "Osaze Victor Ighodaro",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80",
    trade: "Electrical Installation & Solar Inverters",
    experienceYears: 8,
    phone: "+234 803 123 4567",
    email: "osaze.ighodaro@sabiwork.ng",
    location: "GRA, Benin City",
    workshopAddress: "14 Boundary Road, GRA, Benin City, Edo State",
    submittedAt: "2026-10-28T09:30:00Z",
    status: "pending",
    competencies: [
      "Industrial & Residential Conduit Wiring",
      "Hybrid Solar Inverter Installation (5kVA - 20kVA)",
      "High Voltage Surge Arrestor Installation",
      "Circuit Load Balancing & Breaker Sizing",
    ],
    documents: [
      {
        id: "doc-01",
        type: "nin",
        label: "National Identity Number (NIN Slip)",
        url: "/mock/docs/nin-ighodaro.pdf",
        identifier: "NIN: 6721-9840-2311",
        verified: false,
      },
      {
        id: "doc-02",
        type: "trade_cert",
        label: "NABTEB Advanced Craft Certificate",
        url: "/mock/docs/nabteb-cert.pdf",
        identifier: "Cert No: NAB/ELEC/2018/0942",
        verified: false,
      },
      {
        id: "doc-03",
        type: "workshop",
        label: "Workshop Physical Inspection Photo",
        url: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80",
        notes: "Geotagged: Boundary Rd GRA (6.3176° N, 5.6145° E)",
        verified: false,
      },
      {
        id: "doc-04",
        type: "utility_bill",
        label: "BEDC Electricity Proof of Address",
        url: "/mock/docs/bedc-bill.pdf",
        identifier: "Meter: 0142-8871-33",
        verified: false,
      },
    ],
  },
  {
    id: "VET-BEN-4082",
    artisanId: "00000000-0000-4000-8000-000000000002",
    fullName: "Blessing Osahon",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80",
    trade: "Plumbing & Borehole Systems",
    experienceYears: 6,
    phone: "+234 805 987 6543",
    email: "blessing.osahon@sabiwork.ng",
    location: "Airport Road, Benin City",
    workshopAddress: "45 Airport Road, opposite Ogba Zoo turnoff, Benin City",
    submittedAt: "2026-10-29T11:15:00Z",
    status: "pending",
    competencies: [
      "PPR & CPVC High Pressure Pipe Fusion",
      "Overhead Water Tank Scaffold Plumbing",
      "Submersible Borehole Pump Installation",
      "Sanitary Sewer Line Jetting",
    ],
    documents: [
      {
        id: "doc-05",
        type: "nin",
        label: "National Identification Slip",
        url: "/mock/docs/nin-osahon.pdf",
        identifier: "NIN: 4310-8821-6674",
        verified: false,
      },
      {
        id: "doc-06",
        type: "trade_cert",
        label: "City & Guilds Plumbing Certificate",
        url: "/mock/docs/cg-plumbing.pdf",
        identifier: "Cert No: CG-6129-NG",
        verified: false,
      },
      {
        id: "doc-07",
        type: "workshop",
        label: "Workshop Signpost & Frontage Photo",
        url: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80",
        notes: "Airport Road artisan cluster",
        verified: false,
      },
    ],
  },
  {
    id: "VET-BEN-4083",
    artisanId: "00000000-0000-4000-8000-000000000003",
    fullName: "Efe Godstime",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80",
    trade: "Carpentry & Custom Cabinetry",
    experienceYears: 10,
    phone: "+234 812 345 6789",
    email: "efe.godstime@sabiwork.ng",
    location: "Uselu, Benin City",
    workshopAddress: "12 Lagos-Benin Expressway, Uselu Shell, Benin City",
    submittedAt: "2026-10-25T14:00:00Z",
    status: "approved",
    badgeIssued: true,
    decidedAt: "2026-10-26T10:30:00Z",
    reviewerNotes: "Physical workshop inspection verified by Desk Officer. NABTEB credentials authenticated with board registry.",
    competencies: [
      "Hardwood Roofing Truss Fabrication",
      "Kitchen Modular Cabinet Assembly",
      "Marine Board Wardrobe Fitting",
    ],
    documents: [
      {
        id: "doc-08",
        type: "nin",
        label: "NIN Slip Verified",
        url: "/mock/docs/nin-godstime.pdf",
        identifier: "NIN: 9012-3341-7782",
        verified: true,
      },
    ],
  },
  {
    id: "VET-BEN-4084",
    artisanId: "00000000-0000-4000-8000-000000000004",
    fullName: "Nosa Omokaro",
    avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=256&q=80",
    trade: "Auto-Mechanic & Diagnostician",
    experienceYears: 4,
    phone: "+234 814 555 1212",
    email: "nosa.omokaro@sabiwork.ng",
    location: "Ikpoba Hill, Benin City",
    workshopAddress: "88 Agbor Road, Ikpoba Hill, Benin City",
    submittedAt: "2026-10-24T16:20:00Z",
    status: "rejected",
    rejectionReasons: [
      "Illegible NIN photo upload (name could not be matched with registry)",
      "Workshop address proof expired over 12 months ago",
    ],
    reviewerNotes: "Applicant notified to upload clear colour photocopy of NIMC slip and current Edo State utility voucher.",
    decidedAt: "2026-10-26T12:00:00Z",
    competencies: [
      "OBD-II Diagnostic Scanning",
      "Brake Hydraulic Maintenance",
    ],
    documents: [
      {
        id: "doc-09",
        type: "nin",
        label: "NIN Slip (Low Resolution)",
        url: "/mock/docs/nin-lowres.pdf",
        identifier: "NIN: Unreadable",
        verified: false,
      },
    ],
  },
  {
    id: "VET-BEN-4085",
    artisanId: "00000000-0000-4000-8000-000000000005",
    fullName: "Patience Aigbogun",
    avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80",
    trade: "Commercial Tiling & Masonry",
    experienceYears: 7,
    phone: "+234 809 432 1098",
    email: "patience.aigbogun@sabiwork.ng",
    location: "Ekenwan, Benin City",
    workshopAddress: "22 Ekenwan Road, near UNIBEN Ekenwan Campus, Benin City",
    submittedAt: "2026-10-30T08:00:00Z",
    status: "pending",
    competencies: [
      "Granite & Porcelain Laser Alignment Tiling",
      "Interlocking Pavers & Drainage Sloping",
      "Waterproof Screeding & Membrane Installation",
    ],
    documents: [
      {
        id: "doc-10",
        type: "nin",
        label: "NIMC Verification Slip",
        url: "/mock/docs/nin-aigbogun.pdf",
        identifier: "NIN: 1120-7749-3301",
        verified: false,
      },
      {
        id: "doc-11",
        type: "trade_cert",
        label: "Edo State Artisans Union Membership ID",
        url: "/mock/docs/union-card.pdf",
        identifier: "ID: EDA-MAS-2021-081",
        verified: false,
      },
    ],
  },
];

export function getDossierMetrics(): DossierMetrics {
  const total = mockDossiers.length;
  const pending = mockDossiers.filter((d) => d.status === "pending").length;
  const approved = mockDossiers.filter((d) => d.status === "approved").length;
  const rejected = mockDossiers.filter((d) => d.status === "rejected").length;
  return {
    total,
    pending,
    approved,
    rejected,
    averageTurnaroundHours: 18,
  };
}

export function getVerificationDossiers(filter?: string): VerificationDossier[] {
  if (!filter || filter === "all") {
    return [...mockDossiers];
  }
  return mockDossiers.filter((d) => d.status === filter);
}

export function getVerificationDossier(id: string): VerificationDossier | undefined {
  return mockDossiers.find((d) => d.id === id);
}

export function approveDossier(id: string, notes: string): { success: boolean; dossier?: VerificationDossier; error?: string } {
  const target = mockDossiers.find((d) => d.id === id);
  if (!target) {
    return { success: false, error: "Dossier not found" };
  }
  target.status = "approved";
  target.badgeIssued = true;
  target.reviewerNotes = notes;
  target.decidedAt = new Date().toISOString();
  target.documents.forEach((doc) => {
    doc.verified = true;
  });
  return { success: true, dossier: { ...target } };
}

export function rejectDossier(
  id: string,
  reasons: string[],
  notes: string
): { success: boolean; dossier?: VerificationDossier; error?: string } {
  const target = mockDossiers.find((d) => d.id === id);
  if (!target) {
    return { success: false, error: "Dossier not found" };
  }
  target.status = "rejected";
  target.badgeIssued = false;
  target.rejectionReasons = reasons;
  target.reviewerNotes = notes;
  target.decidedAt = new Date().toISOString();
  return { success: true, dossier: { ...target } };
}

export function registerArtisan(draft: ArtisanRegistrationDraft): {
  success: boolean;
  dossierId: string;
  artisanId: string;
} {
  const newId = `VET-BEN-${Math.floor(1000 + Math.random() * 9000)}`;
  const newArtisanId = `00000000-0000-4000-8000-${Math.floor(100000000000 + Math.random() * 900000000000)}`;
  const newDossier: VerificationDossier = {
    id: newId,
    artisanId: newArtisanId,
    fullName: draft.fullName,
    avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=256&q=80",
    trade: draft.trade,
    experienceYears: draft.experienceYears,
    phone: draft.phone,
    email: draft.email,
    location: draft.coverageAreas[0] ? `${draft.coverageAreas[0]}, Benin City` : "Benin City, Edo State",
    workshopAddress: draft.workshopAddress,
    submittedAt: new Date().toISOString(),
    status: "pending",
    competencies: [
      `${draft.trade} General Practice`,
      `${draft.trade} Safety Compliance`,
    ],
    documents: [
      {
        id: `doc-${Date.now()}-1`,
        type: "nin",
        label: "National Identity Number (NIN)",
        url: "#",
        identifier: `NIN: ${draft.ninNumber}`,
        verified: false,
      },
    ],
  };
  mockDossiers.unshift(newDossier);
  return {
    success: true,
    dossierId: newId,
    artisanId: newArtisanId,
  };
}
