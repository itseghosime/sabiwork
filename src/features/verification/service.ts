export type DossierStatus = "pending" | "approved" | "rejected" | "flagged";

export interface VerificationDocument {
  id: string;
  type: "nin" | "trade_cert" | "workshop" | "utility_bill";
  label: string;
  url: string;
  identifier?: string;
  notes?: string;
  verified?: boolean;
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
    id: "SAMPLE-VERIFY-001",
    artisanId: "SAMPLE-ARTISAN-001",
    fullName: "Sample Artisan 1",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80",
    trade: "Electrical Installation & Solar Inverters",
    experienceYears: 8,
    phone: "Not provided",
    email: "artisan-1@example.test",
    location: "GRA, Benin City",
    workshopAddress: "Sample workshop area, Benin City",
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
        label: "Sample identity-document placeholder",
        url: "/mock/docs/sample-identity-document.pdf",
        identifier: "Sample only; no identity number",
        verified: false,
      },
      {
        id: "doc-02",
        type: "trade_cert",
        label: "Sample trade-certificate placeholder",
        url: "/mock/docs/sample-certificate-not-issued.pdf",
        identifier: "Sample only; no certificate issued",
      },
      {
        id: "doc-03",
        type: "workshop",
        label: "Sample workshop image",
        url: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80",
        notes: "Sample image only; no location metadata",
      },
      {
        id: "doc-04",
        type: "utility_bill",
        label: "Sample utility-document placeholder",
        url: "/mock/docs/sample-utility-bill-not-uploaded.pdf",
        identifier: "Sample only; no utility account or meter number",
      },
    ],
  },
  {
    id: "SAMPLE-VERIFY-002",
    artisanId: "SAMPLE-ARTISAN-002",
    fullName: "Sample Artisan 2",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80",
    trade: "Plumbing & Borehole Systems",
    experienceYears: 6,
    phone: "Not provided",
    email: "artisan-2@example.test",
    location: "Airport Road, Benin City",
    workshopAddress: "Sample workshop area, Benin City",
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
        label: "Sample identity-document placeholder",
        url: "/mock/docs/sample-identity-document-2.pdf",
        identifier: "Sample only; no identity number",
      },
      {
        id: "doc-06",
        type: "trade_cert",
        label: "Sample trade-certificate placeholder",
        url: "/mock/docs/sample-plumbing-certificate-not-issued.pdf",
        identifier: "Sample only; no certificate issued",
      },
      {
        id: "doc-07",
        type: "workshop",
        label: "Sample workshop image",
        url: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80",
        notes: "Sample image only; no location metadata",
      },
    ],
  },
  {
    id: "SAMPLE-VERIFY-003",
    artisanId: "SAMPLE-ARTISAN-003",
    fullName: "Sample Artisan 3",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=80",
    trade: "Carpentry & Custom Cabinetry",
    experienceYears: 10,
    phone: "Not provided",
    email: "artisan-3@example.test",
    location: "Uselu, Benin City",
    workshopAddress: "Sample workshop area, Benin City",
    submittedAt: "2026-10-25T14:00:00Z",
    status: "approved",
    decidedAt: "2026-10-26T10:30:00Z",
    reviewerNotes: "Sample reviewer note. No workshop inspection or credential check was performed.",
    competencies: [
      "Hardwood Roofing Truss Fabrication",
      "Kitchen Modular Cabinet Assembly",
      "Marine Board Wardrobe Fitting",
    ],
    documents: [
      {
        id: "doc-08",
        type: "nin",
        label: "Sample identity-document placeholder",
        url: "/mock/docs/sample-identity-document-3.pdf",
        identifier: "Sample only; no identity number",
      },
    ],
  },
  {
    id: "SAMPLE-VERIFY-004",
    artisanId: "SAMPLE-ARTISAN-004",
    fullName: "Sample Artisan 4",
    avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=256&q=80",
    trade: "Auto-Mechanic & Diagnostician",
    experienceYears: 4,
    phone: "Not provided",
    email: "artisan-4@example.test",
    location: "Ikpoba Hill, Benin City",
    workshopAddress: "Sample workshop area, Benin City",
    submittedAt: "2026-10-24T16:20:00Z",
    status: "rejected",
    rejectionReasons: [
      "Sample identity-document placeholder needs revision",
      "Sample location detail needs revision",
    ],
    reviewerNotes: "Sample reviewer note. No applicant was contacted or document checked.",
    decidedAt: "2026-10-26T12:00:00Z",
    competencies: [
      "OBD-II Diagnostic Scanning",
      "Brake Hydraulic Maintenance",
    ],
    documents: [
      {
        id: "doc-09",
        type: "nin",
        label: "Sample identity-document placeholder",
        url: "/mock/docs/sample-identity-document-low-resolution.pdf",
        identifier: "Sample only; no identity number",
      },
    ],
  },
  {
    id: "SAMPLE-VERIFY-005",
    artisanId: "SAMPLE-ARTISAN-005",
    fullName: "Sample Artisan 5",
    avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80",
    trade: "Commercial Tiling & Masonry",
    experienceYears: 7,
    phone: "Not provided",
    email: "artisan-5@example.test",
    location: "Ekenwan, Benin City",
    workshopAddress: "Sample workshop area, Benin City",
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
        label: "Sample identity-document placeholder",
        url: "/mock/docs/sample-identity-document-5.pdf",
        identifier: "Sample only; no identity number",
      },
      {
        id: "doc-11",
        type: "trade_cert",
        label: "Sample membership-record placeholder",
        url: "/mock/docs/sample-membership-record-not-issued.pdf",
        identifier: "Sample only; no membership ID",
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

export function previewDossierApproval(id: string, notes: string): { success: boolean; dossier?: VerificationDossier; error?: string } {
  const target = mockDossiers.find((d) => d.id === id);
  if (!target) {
    return { success: false, error: "Sample dossier not found" };
  }
  target.status = "approved";
  target.reviewerNotes = notes;
  target.decidedAt = new Date().toISOString();
  return { success: true, dossier: { ...target } };
}

export function previewDossierRevision(
  id: string,
  reasons: string[],
  notes: string
): { success: boolean; dossier?: VerificationDossier; error?: string } {
  const target = mockDossiers.find((d) => d.id === id);
  if (!target) {
    return { success: false, error: "Sample dossier not found" };
  }
  target.status = "rejected";
  target.rejectionReasons = reasons;
  target.reviewerNotes = notes;
  target.decidedAt = new Date().toISOString();
  return { success: true, dossier: { ...target } };
}
