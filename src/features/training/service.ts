export type TrainingCategory = "all" | "customer" | "safety" | "escrow" | "proofs";
export type ModuleLevel = "Foundational" | "Intermediate" | "Mastery";
export type ModuleStatus = "not_started" | "in_progress" | "completed";

export interface TrainingCertificatePreview {
  id: string;
  moduleId: string;
  moduleTitle: string;
  holderName: string;
  trade: string;
  serialNumber: string;
  issuedAt: string;
  verificationHash: string;
  accreditationBody: string;
}

export interface TrainingSection {
  sectionTitle: string;
  paragraphs: string[];
  proTip?: string;
}

export interface TrainingModule {
  id: string;
  title: string;
  summary: string;
  category: TrainingCategory;
  durationMinutes: number;
  level: ModuleLevel;
  status: ModuleStatus;
  progress: number;
  coverImage: string;
  author: string;
  topicsCovered: string[];
  keyTakeaways: string[];
  sections: TrainingSection[];
  certificatePreview?: TrainingCertificatePreview;
}

export interface TrainingStats {
  completedCount: number;
  inProgressCount: number;
  availableCount: number;
  totalHoursLearned: number;
  sampleCertificatePreviews: number;
}

const mockModules: TrainingModule[] = [
  {
    id: "SAMPLE-MODULE-01",
    title: "Mastering Client Communication & In-Home Etiquette in Benin City",
    summary:
      "Essential practices for entering residential homes across GRA, Airport Road, and Ugbowo. Covers punctuality call-ahead protocols, language, quote disclosures, and clean exit handshakes.",
    category: "customer",
    durationMinutes: 25,
    level: "Foundational",
    status: "completed",
    progress: 100,
    coverImage: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80",
    author: "Sample content team",
    topicsCovered: [
      "The First 3 Minutes: Arrival & Professional Greeting",
      "Translating Technical Terms to Homeowner Plain Language",
      "Handling Unexpected Complications Without Hostility",
      "Post-Service Cleanliness & Formal Customer Signoff",
    ],
    keyTakeaways: [
      "Always call or send an SMS 45 minutes prior to arriving at the jobsite in Benin City traffic.",
      "Use only fictional names and references in this preview; no SabiWork account or booking is active.",
      "Explain the exact issue and show photos before uncoupling or disassembling concealed pipes or cables.",
      "No payment provider or escrow service is connected; all payment examples are previews only.",
    ],
    sections: [
      {
        sectionTitle: "The First 3 Minutes: Setting the Tone on Arrival",
        paragraphs: [
          "In sample scenarios, respect and clear communication help set expectations. When you arrive, wait for an invitation before entering a home or work area.",
          "Use a fictional name and request reference when rehearsing an introduction. Do not treat this sample as a real booking or identity check.",
        ],
        proTip: "Use a general sample meeting area. This prototype does not store or verify residential addresses.",
      },
      {
        sectionTitle: "Translating Technical Jargon to Plain Terms",
        paragraphs: [
          "Clients rarely understand terms like 'low capacitance bypass breakdown' or 'conduit earthing degradation'. When explaining what failed, relate the issue to everyday consequences: 'The surge protector absorbed a lightning spike from the BEDC line, preventing your deep freezer compressor from burning out.'",
          "Always show the damaged part directly alongside the replacement brand-new component before installing it.",
        ],
        proTip: "Keep all replaced parts in a clean carton or bag and present them to the customer during signoff.",
      },
      {
        sectionTitle: "Handling Unforeseen Complications Without Drama",
        paragraphs: [
          "Occasionally, opening a ceiling plasterboard reveals decayed timber or severed conduits not captured in the initial quote. Stop work immediately. Call the customer to the site, take high-resolution before-photos for your SabiWork record, and explain the supplementary repair required.",
          "Submit an official milestone add-on quote through the app rather than verbally estimating an arbitrary cash sum.",
        ],
      },
    ],
    certificatePreview: {
      id: "SAMPLE-CERTIFICATE-PREVIEW-01",
      moduleId: "SAMPLE-MODULE-01",
      moduleTitle: "Mastering Client Communication & In-Home Etiquette in Benin City",
      holderName: "Sample Artisan",
      trade: "Sample trade",
      serialNumber: "NOT ISSUED - SAMPLE",
      issuedAt: "",
      verificationHash: "NOT VERIFIABLE - SAMPLE",
      accreditationBody: "None; no accreditation or credential is issued",
    },
  },
  {
    id: "SAMPLE-MODULE-02",
    title: "Documenting Sample Job Photos: Clear Layouts",
    summary:
      "Preview sample before, during, and after photo practices. This prototype does not adjudicate disputes or release payouts.",
    category: "proofs",
    durationMinutes: 20,
    level: "Foundational",
    status: "in_progress",
    progress: 65,
    coverImage: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80",
    author: "Sample content team",
    topicsCovered: [
      "Lighting & Angle: Eliminating Blurry Lens Artifacts",
      "Before-Photo Requirements: Wide Room View vs Component Detail",
      "Capturing Pressure Tests & Inverter Voltage Meter Reads",
      "Signoff Evidence: Customer Signature Protocol",
    ],
    keyTakeaways: [
      "Capture at least one wide-angle context photo showing the surrounding room layout.",
      "Take close-up photos of manufacturer labels, serial numbers, and meter test readings.",
      "Ensure timestamps and geolocation coordinates are visible in your camera app.",
    ],
    sections: [
      {
        sectionTitle: "Sample Photo Review and Evidence",
        paragraphs: [
          "A future review process requires backend policies, secure evidence storage, and authorized reviewers. This prototype does not inspect photos, adjudicate disputes, or release funds.",
        ],
      },
    ],
  },
  {
    id: "SAMPLE-MODULE-03",
    title: "Building Transparent Itemized Quotes (Labour vs Materials)",
    summary:
      "How to separate material market costs from professional craftsmanship fees to win higher customer trust and eliminate fee haggling across Edo State markets.",
    category: "escrow",
    durationMinutes: 30,
    level: "Intermediate",
    status: "completed",
    progress: 100,
    coverImage: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=600&q=80",
    author: "Sample content team",
    topicsCovered: [
      "Why Lump-Sum Quotes Get Rejected by Discerning Customers",
      "Benin City Price Indexes: Oba Market & Uselu Electrical Markets",
      "Calculating Consumable Overheads (Gas, Drill Bits, Screws)",
      "Factoring Travel Logistics Across Ring Road Traffic",
    ],
    keyTakeaways: [
      "Always break quotes into Labour, Primary Materials, and Logistics.",
      "Provide receipts for store-bought branded parts like Coleman cable or Tiger piping.",
    ],
    sections: [
      {
        sectionTitle: "The Anatomy of a Trusted Quote",
        paragraphs: [
          "Itemizing every component builds instant confidence. Clients in Benin City are wary of inflated material costs. Stating exact brands and specifications removes doubt and leads to rapid quote approval.",
        ],
      },
    ],
    certificatePreview: {
      id: "SAMPLE-CERTIFICATE-PREVIEW-02",
      moduleId: "SAMPLE-MODULE-03",
      moduleTitle: "Building Transparent Itemized Quotes (Labour vs Materials)",
      holderName: "Sample Artisan",
      trade: "Sample trade",
      serialNumber: "NOT ISSUED - SAMPLE",
      issuedAt: "",
      verificationHash: "NOT VERIFIABLE - SAMPLE",
      accreditationBody: "None; no accreditation or credential is issued",
    },
  },
  {
    id: "SAMPLE-MODULE-04",
    title: "Essential Electrical & Water Isolation Safety Protocols",
    summary:
      "Life-saving lockout/tagout procedures before commencing rewiring or high-pressure plumbing repairs in Edo State residential and commercial compounds.",
    category: "safety",
    durationMinutes: 45,
    level: "Mastery",
    status: "in_progress",
    progress: 30,
    coverImage: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80",
    author: "Sample safety content team",
    topicsCovered: [
      "Verifying Zero Voltage: Multimeter Verification Steps",
      "Compound Main Water Gate Isolation & Pressure Depressurization",
      "Generator Automatic Transfer Switch (ATS) Backfeed Hazards",
      "Personal Protective Equipment (PPE) Standards for Field Technicians",
    ],
    keyTakeaways: [
      "Never rely on a circuit breaker label; always test with a calibrated digital multimeter.",
      "Watch out for changeover switches: inverter feed may energize lines even when BEDC is out.",
    ],
    sections: [
      {
        sectionTitle: "Isolating Feeds in Hybrid Power Systems",
        paragraphs: [
          "Modern homes in GRA frequently run on three concurrent power sources: BEDC national grid, diesel generator, and battery inverter banks. Isolating the main circuit breaker does not shut down solar battery feed.",
        ],
      },
    ],
  },
  {
    id: "SAMPLE-MODULE-05",
    title: "Managing 2-Stage Milestone Escrow: Deposit to Completion Release",
    summary:
      "The prototype does not hold funds or provide escrow. Payment milestone examples are not a guarantee or instruction to transact.",
    category: "escrow",
    durationMinutes: 20,
    level: "Foundational",
    status: "not_started",
    progress: 0,
    coverImage: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=600&q=80",
    author: "Sample content team",
    topicsCovered: [
      "Milestone 1 (70%) Material & Mobilization Advance",
      "Milestone 2 (30%) Completion & Workmanship Guarantee",
      "Sample sign-off status concepts (no automatic release)",
    ],
    keyTakeaways: [
      "Sample milestone labels are not evidence that a customer has paid or funds are held.",
      "No automatic payment release or dispute process exists in this prototype.",
    ],
    sections: [
      {
        sectionTitle: "How Milestone Escrow Protects Artisans",
        paragraphs: [
          "Milestone concepts can help explain a sample quote. This interface does not collect, hold, release, or guarantee any funds.",
        ],
      },
    ],
  },
  {
    id: "SAMPLE-MODULE-06",
    title: "Safe Chemical Handling & Drain Snaking Hazards",
    summary:
      "Prevent chemical burns, toxic fumes, and pipe bursts when using caustic acid cleaners and motorized rooters in domestic PVC sewage pipes.",
    category: "safety",
    durationMinutes: 35,
    level: "Intermediate",
    status: "not_started",
    progress: 0,
    coverImage: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80",
    author: "Sample safety content team",
    topicsCovered: [
      "Why Sulfuric Acid Melts Thin-Wall PVC Drain Pipes",
      "Mechanical Snake Operation: Safety Gloves and Eye Goggles",
      "Ventilating Confined Soakaway Pits and Septic Chambers",
    ],
    keyTakeaways: [
      "Never mix acid drain unblockers with alkaline bleach products: lethal chlorine gas is produced.",
      "Wear puncture-resistant leather gauntlets when handling motorized drain cables.",
    ],
    sections: [
      {
        sectionTitle: "Chemical Reactions in Drain Cleaning",
        paragraphs: [
          "Pouring raw commercial acid into PVC drains produces extreme exothermic heat that warps joints and causes boiling caustic splashback into technicians' eyes.",
        ],
      },
    ],
  },
  {
    id: "SAMPLE-MODULE-07",
    title: "Writing Accurate Defect Summaries & Material Take-Offs",
    summary:
      "Transform verbal diagnostic findings into crisp, structured service reports that win commercial corporate clients and facility manager contracts.",
    category: "proofs",
    durationMinutes: 40,
    level: "Mastery",
    status: "completed",
    progress: 100,
    coverImage: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=600&q=80",
    author: "Sample building-maintenance content team",
    topicsCovered: [
      "Executive Problem Definition: Cause vs Symptom",
      "Material Take-Off Quantity Calculations with 5% Wastage Buffer",
      "Scheduling Phased Maintenance for Corporate Facilities",
    ],
    keyTakeaways: [
      "Include serial numbers, manufacturer specs, and warranty terms in every report.",
      "Distinguish urgent safety defects from elective aesthetic upgrades.",
    ],
    sections: [
      {
        sectionTitle: "Structured Diagnostic Writing",
        paragraphs: [
          "Facility managers at hotels and bank branches in Benin City require formal diagnostic reports before releasing purchase orders.",
        ],
      },
    ],
    certificatePreview: {
      id: "SAMPLE-CERTIFICATE-PREVIEW-03",
      moduleId: "SAMPLE-MODULE-07",
      moduleTitle: "Writing Accurate Defect Summaries & Material Take-Offs",
      holderName: "Sample Artisan",
      trade: "Sample trade",
      serialNumber: "NOT ISSUED - SAMPLE",
      issuedAt: "",
      verificationHash: "NOT VERIFIABLE - SAMPLE",
      accreditationBody: "None; no accreditation or credential is issued",
    },
  },
  {
    id: "SAMPLE-MODULE-08",
    title: "De-escalating Scope Creep & Requesting Milestone Add-ons",
    summary:
      "Professional techniques for handling client requests for 'small small extra work' politely without losing income or delaying existing appointments.",
    category: "customer",
    durationMinutes: 25,
    level: "Intermediate",
    status: "completed",
    progress: 100,
    coverImage: "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=600&q=80",
    author: "Sample content team",
    topicsCovered: [
      "The 'Friendly Boundary' Script for Unexpected Extras",
      "Creating Add-On Milestones Directly in the SabiWork Mobile App",
      "Protecting Your Schedule for Subsequent Booked Clients",
    ],
    keyTakeaways: [
      "Never agree to extra electrical work without recording a milestone amendment.",
      "Frame policy as customer protection: 'Ma, to ensure your warranty covers this new ceiling fan, let me add it to our official job ticket.'",
    ],
    sections: [
      {
        sectionTitle: "The Friendly Boundary Script",
        paragraphs: [
          "When a customer says 'While you are here, help me check this switch too', respond warmly: 'I would be very happy to fix that for you so your home is completely safe! Let me quickly log a ₦5,000 minor fix add-on in the app so your SabiWork receipt covers it.'",
        ],
      },
    ],
    certificatePreview: {
      id: "SAMPLE-CERTIFICATE-PREVIEW-04",
      moduleId: "SAMPLE-MODULE-08",
      moduleTitle: "De-escalating Scope Creep & Requesting Milestone Add-ons",
      holderName: "Sample Artisan",
      trade: "Sample trade",
      serialNumber: "NOT ISSUED - SAMPLE",
      issuedAt: "",
      verificationHash: "NOT VERIFIABLE - SAMPLE",
      accreditationBody: "None; no accreditation or credential is issued",
    },
  },
];

export function getTrainingStats(): TrainingStats {
  const completed = mockModules.filter((m) => m.status === "completed").length;
  const inProgress = mockModules.filter((m) => m.status === "in_progress").length;
  const available = mockModules.filter((m) => m.status === "not_started").length;
  return {
    completedCount: completed,
    inProgressCount: inProgress,
    availableCount: available,
    totalHoursLearned: 8.5,
    sampleCertificatePreviews: completed,
  };
}

export function getTrainingModules(category?: string, statusFilter?: string): TrainingModule[] {
  return mockModules.filter((m) => {
    if (category && category !== "all" && m.category !== category) {
      return false;
    }
    if (statusFilter && statusFilter !== "all" && m.status !== statusFilter) {
      return false;
    }
    return true;
  });
}

export function getTrainingModule(id: string): TrainingModule | undefined {
  return mockModules.find((m) => m.id === id);
}

export function previewModuleCompletion(id: string): { previewed: boolean; module?: TrainingModule; error?: string } {
  const target = mockModules.find((m) => m.id === id);
  if (!target) {
    return { previewed: false, error: "Sample module not found" };
  }
  target.status = "completed";
  target.progress = 100;
  if (!target.certificatePreview) {
    target.certificatePreview = {
      id: `SAMPLE-CERTIFICATE-PREVIEW-${target.id}`,
      moduleId: target.id,
      moduleTitle: target.title,
      holderName: "Sample Artisan",
      trade: "Sample trade",
      serialNumber: "NOT ISSUED - SAMPLE",
      issuedAt: "",
      verificationHash: "NOT VERIFIABLE - SAMPLE",
      accreditationBody: "None; no accreditation or credential is issued",
    };
  }
  return { previewed: true, module: { ...target } };
}

export function getSampleCertificatePreview(id: string): TrainingCertificatePreview | undefined {
  const mod = mockModules.find((m) => m.id === id);
  return mod?.certificatePreview;
}
