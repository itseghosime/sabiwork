export type TrainingCategory = "all" | "customer" | "safety" | "escrow" | "proofs";
export type ModuleLevel = "Foundational" | "Intermediate" | "Mastery";
export type ModuleStatus = "not_started" | "in_progress" | "completed";

export interface TrainingCertificate {
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
  certificate?: TrainingCertificate;
}

export interface TrainingStats {
  completedCount: number;
  inProgressCount: number;
  availableCount: number;
  totalHoursLearned: number;
  certificatesEarned: number;
}

const mockModules: TrainingModule[] = [
  {
    id: "BEN-MOD-01",
    title: "Mastering Client Communication & In-Home Etiquette in Benin City",
    summary:
      "Essential practices for entering residential homes across GRA, Airport Road, and Ugbowo. Covers punctuality call-ahead protocols, language, quote disclosures, and clean exit handshakes.",
    category: "customer",
    durationMinutes: 25,
    level: "Foundational",
    status: "completed",
    progress: 100,
    coverImage: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80",
    author: "SabiWork Academy & Edo Artisan Board",
    topicsCovered: [
      "The First 3 Minutes: Arrival & Professional Greeting",
      "Translating Technical Terms to Homeowner Plain Language",
      "Handling Unexpected Complications Without Hostility",
      "Post-Service Cleanliness & Formal Customer Signoff",
    ],
    keyTakeaways: [
      "Always call or send an SMS 45 minutes prior to arriving at the jobsite in Benin City traffic.",
      "Wear your SabiWork lanyard and protective shoe covers when entering furnished living rooms.",
      "Explain the exact issue and show photos before uncoupling or disassembling concealed pipes or cables.",
      "Never pressure a homeowner into off-platform cash deposits outside the SabiWork escrow protocol.",
    ],
    sections: [
      {
        sectionTitle: "The First 3 Minutes: Setting the Tone on Arrival",
        paragraphs: [
          "In Edo State households, respect and first impressions determine whether a client becomes a repeat patron or lodges an immediate dispute. When you ring the bell or knock at the gate, take two steps backward so the occupant can view your full profile and credentials through the peephole.",
          "Introduce yourself clearly by name and mention the SabiWork request code (e.g., 'Good morning ma, I am Osaze from SabiWork regarding your solar inverter callout'). Avoid rushing straight to the fuse box or plumbing fixture without an invited escort.",
        ],
        proTip: "Benin City Pro Tip: In gated estates along Boundary Road and Airport Road, estate security gates often demand resident clearance. Confirm with the homeowner 30 minutes ahead to prevent standing at the security gatehouse.",
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
    certificate: {
      id: "CERT-SABI-2026-781",
      moduleId: "BEN-MOD-01",
      moduleTitle: "Mastering Client Communication & In-Home Etiquette in Benin City",
      holderName: "Osaze Victor Ighodaro",
      trade: "Electrical Installation & Solar Inverters",
      serialNumber: "EDO-SABI-COM-2026-0941",
      issuedAt: "2026-10-24T14:30:00Z",
      verificationHash: "sha256-e91b4028fa77610b2c140",
      accreditationBody: "Edo State Ministry of Wealth Creation & SabiWork Academy",
    },
  },
  {
    id: "BEN-MOD-02",
    title: "Documenting Jobsite Proofs: Clear Photos That Pass Admin Review",
    summary:
      "Learn how to capture geotagged before, during, and after photos that protect you against false disputes and guarantee rapid milestone payout releases from the escrow vault.",
    category: "proofs",
    durationMinutes: 20,
    level: "Foundational",
    status: "in_progress",
    progress: 65,
    coverImage: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80",
    author: "SabiWork Quality & Dispute Desk",
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
        sectionTitle: "Why Evidence Photos Protect Your Paystack Payout",
        paragraphs: [
          "In the event of a customer dispute claiming work was incomplete, the SabiWork Admin Dispute Desk (S34/S35) inspects the evidence vault. High quality photographic proof with clear before and after states guarantees your milestone deposit release.",
        ],
      },
    ],
  },
  {
    id: "BEN-MOD-03",
    title: "Building Transparent Itemized Quotes (Labour vs Materials)",
    summary:
      "How to separate material market costs from professional craftsmanship fees to win higher customer trust and eliminate fee haggling across Edo State markets.",
    category: "escrow",
    durationMinutes: 30,
    level: "Intermediate",
    status: "completed",
    progress: 100,
    coverImage: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=600&q=80",
    author: "SabiWork Commercial Estimating Panel",
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
    certificate: {
      id: "CERT-SABI-2026-782",
      moduleId: "BEN-MOD-03",
      moduleTitle: "Building Transparent Itemized Quotes (Labour vs Materials)",
      holderName: "Osaze Victor Ighodaro",
      trade: "Electrical Installation & Solar Inverters",
      serialNumber: "EDO-SABI-QTE-2026-0428",
      issuedAt: "2026-10-25T11:00:00Z",
      verificationHash: "sha256-88a4c0101f33789b1420",
      accreditationBody: "Edo State Ministry of Wealth Creation & SabiWork Academy",
    },
  },
  {
    id: "BEN-MOD-04",
    title: "Essential Electrical & Water Isolation Safety Protocols",
    summary:
      "Life-saving lockout/tagout procedures before commencing rewiring or high-pressure plumbing repairs in Edo State residential and commercial compounds.",
    category: "safety",
    durationMinutes: 45,
    level: "Mastery",
    status: "in_progress",
    progress: 30,
    coverImage: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80",
    author: "Edo State Fire Service & Safety Guild",
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
    id: "BEN-MOD-05",
    title: "Managing 2-Stage Milestone Escrow: Deposit to Completion Release",
    summary:
      "Understand how SabiWork 2-stage escrow safeguards your payment: Milestone 1 deposit locks client funds before you buy materials; Milestone 2 unlocks upon customer or admin signoff.",
    category: "escrow",
    durationMinutes: 20,
    level: "Foundational",
    status: "not_started",
    progress: 0,
    coverImage: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=600&q=80",
    author: "SabiWork Escrow Compliance Desk",
    topicsCovered: [
      "Milestone 1 (70%) Material & Mobilization Advance",
      "Milestone 2 (30%) Completion & Workmanship Guarantee",
      "Resolving Late Signoff With Automated 72-Hour Release",
    ],
    keyTakeaways: [
      "Never buy materials out of your personal pocket until Milestone 1 deposit status shows 'Deposited in Escrow'.",
      "If a customer fails to sign off within 72 hours of submitted completion proof, SabiWork desk initiates automatic release.",
    ],
    sections: [
      {
        sectionTitle: "How Milestone Escrow Protects Artisans",
        paragraphs: [
          "In traditional informal engagements, artisans routinely encounter clients who refuse to settle final balances after work is finished. SabiWork eliminates this risk by requiring full milestone commitment upfront into test escrow.",
        ],
      },
    ],
  },
  {
    id: "BEN-MOD-06",
    title: "Safe Chemical Handling & Drain Snaking Hazards",
    summary:
      "Prevent chemical burns, toxic fumes, and pipe bursts when using caustic acid cleaners and motorized rooters in domestic PVC sewage pipes.",
    category: "safety",
    durationMinutes: 35,
    level: "Intermediate",
    status: "not_started",
    progress: 0,
    coverImage: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80",
    author: "Edo Environmental & Public Health Committee",
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
    id: "BEN-MOD-07",
    title: "Writing Accurate Defect Summaries & Material Take-Offs",
    summary:
      "Transform verbal diagnostic findings into crisp, structured service reports that win commercial corporate clients and facility manager contracts.",
    category: "proofs",
    durationMinutes: 40,
    level: "Mastery",
    status: "completed",
    progress: 100,
    coverImage: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=600&q=80",
    author: "Nigerian Institute of Building Technologists (Edo Chapter)",
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
    certificate: {
      id: "CERT-SABI-2026-783",
      moduleId: "BEN-MOD-07",
      moduleTitle: "Writing Accurate Defect Summaries & Material Take-Offs",
      holderName: "Osaze Victor Ighodaro",
      trade: "Electrical Installation & Solar Inverters",
      serialNumber: "EDO-SABI-RPT-2026-0819",
      issuedAt: "2026-10-27T16:00:00Z",
      verificationHash: "sha256-42bb9001ee74312da58",
      accreditationBody: "Edo State Ministry of Wealth Creation & SabiWork Academy",
    },
  },
  {
    id: "BEN-MOD-08",
    title: "De-escalating Scope Creep & Requesting Milestone Add-ons",
    summary:
      "Professional techniques for handling client requests for 'small small extra work' politely without losing income or delaying existing appointments.",
    category: "customer",
    durationMinutes: 25,
    level: "Intermediate",
    status: "completed",
    progress: 100,
    coverImage: "https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=600&q=80",
    author: "SabiWork Customer Experience Guild",
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
    certificate: {
      id: "CERT-SABI-2026-784",
      moduleId: "BEN-MOD-08",
      moduleTitle: "De-escalating Scope Creep & Requesting Milestone Add-ons",
      holderName: "Osaze Victor Ighodaro",
      trade: "Electrical Installation & Solar Inverters",
      serialNumber: "EDO-SABI-SCP-2026-0312",
      issuedAt: "2026-10-28T09:15:00Z",
      verificationHash: "sha256-11da8839cb4012fe77",
      accreditationBody: "Edo State Ministry of Wealth Creation & SabiWork Academy",
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
    certificatesEarned: completed,
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

export function completeModule(id: string): { success: boolean; module?: TrainingModule; error?: string } {
  const target = mockModules.find((m) => m.id === id);
  if (!target) {
    return { success: false, error: "Module not found" };
  }
  target.status = "completed";
  target.progress = 100;
  if (!target.certificate) {
    target.certificate = {
      id: `CERT-SABI-2026-${Math.floor(100 + Math.random() * 900)}`,
      moduleId: target.id,
      moduleTitle: target.title,
      holderName: "Osaze Victor Ighodaro",
      trade: "Electrical Installation & Solar Inverters",
      serialNumber: `EDO-SABI-${target.category.toUpperCase()}-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      issuedAt: new Date().toISOString(),
      verificationHash: `sha256-${Math.random().toString(36).substring(2, 15)}`,
      accreditationBody: "Edo State Ministry of Wealth Creation & SabiWork Academy",
    };
  }
  return { success: true, module: { ...target } };
}

export function getModuleCertificate(id: string): TrainingCertificate | undefined {
  const mod = mockModules.find((m) => m.id === id);
  return mod?.certificate;
}
