// Fictional training catalogue for the artisan demo workspace (S44, S45, S46).
// Guide progress is an in-memory preview only — never a real completion record.
export type TopicId = "customer" | "documentation" | "pricing" | "safety";

export type Tip = { title: string; text: string };
export type Callout = { title: string; text: string };
export type Comparison = {
  avoidLabel: string;
  avoid: string;
  avoidNote: string;
  plainLabel: string;
  plain: string;
  plainNote: string;
};
export type FlowStage = { stage: string; title: string; text: string };
export type Takeaway = { title: string; text: string };

export type GuideStep = {
  id: string;
  title: string;
  minutes: number;
  intro: string;
  tips?: readonly Tip[];
  callout?: Callout;
  comparisons?: readonly Comparison[];
  flow?: readonly FlowStage[];
  takeaways?: readonly Takeaway[];
};

export type Guide = {
  id: string;
  title: string;
  topic: TopicId;
  trade: string;
  summary: string;
  minutes: number;
  steps: readonly GuideStep[];
  /** Demo seed: number of opening steps already ticked when a session starts. */
  seededSteps: number;
};

export const topics: readonly { id: TopicId; label: string }[] = [
  { id: "customer", label: "Customer relations" },
  { id: "documentation", label: "Work documentation" },
  { id: "pricing", label: "Pricing & quotes" },
  { id: "safety", label: "Safety & health" },
];

// Fictional learner, mirroring the shared discovery fixture "Osaze Ighodaro".
export const learner = {
  name: "Osaze Ighodaro",
  trade: "Plumbing & field utility",
  area: "GRA, Benin City",
} as const;

// Fictional internal reference. Not a real or verifiable identifier.
const guideIds = [
  "00000000-0000-4000-9000-000000000001",
  "00000000-0000-4000-9000-000000000002",
  "00000000-0000-4000-9000-000000000003",
  "00000000-0000-4000-9000-000000000004",
  "00000000-0000-4000-9000-000000000005",
  "00000000-0000-4000-9000-000000000006",
  "00000000-0000-4000-9000-000000000007",
  "00000000-0000-4000-9000-000000000008",
] as const;

export const guides: readonly Guide[] = [
  {
    id: guideIds[0],
    title: "Mastering client communication & in-home etiquette",
    topic: "customer",
    trade: learner.trade,
    summary:
      "Proper greeting protocols, clean boot coverings, protecting surrounding tiles, and verbal confirmations before shut-off.",
    minutes: 12,
    seededSteps: 2,
    steps: [
      {
        id: "arrival",
        title: "Arrival & compound entry",
        minutes: 3,
        intro:
          "The first three minutes set the tone. Clients are not just hiring your tools; they are welcoming you into their home.",
        tips: [
          {
            title: "Present your demo profile card",
            text: "Introduce yourself clearly before entering: “Good morning, I am Osaze from SabiWork, here to inspect the booster pump leak.”",
          },
          {
            title: "Ask before stepping in",
            text: "Never walk into private rooms unguided. Stand back from the threshold and ask where the service valve or inspection area is located.",
          },
        ],
        callout: {
          title: "Compound etiquette field tip",
          text: "Do not park across the client’s driveway gate. Park roadside until you are invited, and ask where heavy toolboxes should be unloaded.",
        },
      },
      {
        id: "protection",
        title: "Surface protection & boot covers",
        minutes: 3,
        intro:
          "Protecting floors and tiles shows respect for the home and prevents disputes about damage that never happened.",
        tips: [
          {
            title: "Use covers you actually carry",
            text: "Consume-work only when your kit includes real coverings. If you do not have them, tell the client what you will and will not be able to protect.",
          },
        ],
      },
      {
        id: "plain-english",
        title: "Explaining faults in plain terms",
        minutes: 4,
        intro:
          "When artisans use heavy workshop jargon, clients often assume they are being overcharged. Speaking plainly builds instant trust.",
        comparisons: [
          {
            avoidLabel: "Avoid industry jargon",
            avoid:
              "“Your PPR female adaptor suffered severe thermal expansion water hammer and burst the threading.”",
            avoidNote: "Client reaction: confused, anxious, feels out of control.",
            plainLabel: "Say this plainly",
            plain:
              "“The cold-water pipe joint has a hairline crack because pump pressure was too strong. I will fit a heavy-duty brass fitting so it stays sealed.”",
            plainNote: "Client reaction: understands the cause and the value.",
          },
          {
            avoidLabel: "Avoid vague explanations",
            avoid:
              "“The whole plumbing inside your wall is condemned. Everything must change now.”",
            avoidNote: "Client reaction: alarmed, suspects extortion, stops work.",
            plainLabel: "Say this plainly",
            plain:
              "“Only this 50cm stretch behind the shower mixer is leaking. The rest of the riser is fine, so we only need to rebuild this one section today.”",
            plainNote: "Client reaction: reassured that you are precise.",
          },
        ],
        flow: [
          {
            stage: "Stage 1",
            title: "Show the wet joint",
            text: "Shine your work light on the drip so the client can see the water seeping.",
          },
          {
            stage: "Stage 2",
            title: "State the root cause",
            text: "Explain in ten words or less what worn seal or pressure surge caused the leak.",
          },
          {
            stage: "Stage 3",
            title: "Confirm the quote scope",
            text: "Remind the client that this exact replacement is already covered by the agreed quote.",
          },
        ],
      },
      {
        id: "scope-guard",
        title: "Handling extra work without drama",
        minutes: 4,
        intro:
          "Older compounds often hide corrosion behind tiles. Sudden cash demands or on-site arguments destroy trust.",
        tips: [
          {
            title: "Stop, photograph, explain",
            text: "Stop disassembly, take a clear photo with the client watching, then calmly show what you found before any extra work is agreed.",
          },
          {
            title: "Route extra work through the app",
            text: "Add extra materials and labour as a new itemised quote inside the app, never as unrecorded cash requests.",
          },
        ],
      },
      {
        id: "sign-off",
        title: "Milestone sign-off",
        minutes: 2,
        intro:
          "Clear sign-offs protect both sides and make future work easier to agree.",
        takeaways: [
          {
            title: "Greet by name",
            text: "Confirm the customer’s name and the designated work zone before unpacking heavy tool bags.",
          },
          {
            title: "Give an honest duration",
            text: "Say how long the repair should take before you shut off the water mains.",
          },
          {
            title: "Describe the break plainly",
            text: "Never patronise the customer or make them feel uninformed.",
          },
          {
            title: "Keep payments in TEST mode",
            text: "Remind clients that this demo uses simulated payments — no real money moves and nothing is guaranteed.",
          },
        ],
      },
    ],
  },
  {
    id: guideIds[1],
    title: "Documenting jobsite proofs & leak photos",
    topic: "documentation",
    trade: learner.trade,
    summary:
      "Taking standardised before-and-after photos for residential piping repairs.",
    minutes: 8,
    seededSteps: 2,
    steps: [
      {
        id: "before",
        title: "Before photos",
        minutes: 4,
        intro:
          "Photograph the fault area before touching anything, with the whole visible context in frame.",
      },
      {
        id: "after",
        title: "After photos",
        minutes: 4,
        intro:
          "Capture the repaired joint from the same angle, then note what changed. Demo previews only — real photo storage is not connected.",
      },
    ],
  },
  {
    id: guideIds[2],
    title: "Building transparent itemized quotes",
    topic: "pricing",
    trade: learner.trade,
    summary:
      "Separating fittings, consumables and labour clearly so clients approve scope without pushback.",
    minutes: 10,
    seededSteps: 2,
    steps: [
      {
        id: "line-items",
        title: "Separate the line items",
        minutes: 5,
        intro:
          "List fittings, adhesive solvents and labour as separate rows so the client sees exactly what each amount buys.",
      },
      {
        id: "agree",
        title: "Read the quote aloud with the client",
        minutes: 5,
        intro:
          "Walk the client through each row before they accept. Agreement captured in the app prevents later disputes.",
      },
    ],
  },
  {
    id: guideIds[3],
    title: "Essential main valve isolation protocols",
    topic: "safety",
    trade: learner.trade,
    summary:
      "Locating gate valves, depressurising safely, and avoiding electrical conduit hazards.",
    minutes: 14,
    seededSteps: 2,
    steps: [
      {
        id: "locate",
        title: "Locate the isolation point",
        minutes: 6,
        intro:
          "Confirm the municipal and borehole gate valves before opening any joint. Ask the client where their borehole shutoff sits.",
      },
      {
        id: "depressurise",
        title: "Depressurise before disassembly",
        minutes: 8,
        intro:
          "Open a downstream tap to release pressure, and confirm no conduit runs behind the wet wall.",
      },
    ],
  },
  {
    id: guideIds[4],
    title: "Running milestone payments in TEST mode",
    topic: "pricing",
    trade: learner.trade,
    summary:
      "How the demo splits material advances and final acceptance payments — a simulation, with no real funds.",
    minutes: 9,
    seededSteps: 0,
    steps: [
      {
        id: "advance",
        title: "Material advance (simulated)",
        minutes: 4,
        intro:
          "In TEST mode the platform simulates a material advance so you can see how records would look. No real transfer occurs.",
      },
      {
        id: "final",
        title: "Final acceptance (simulated)",
        minutes: 5,
        intro:
          "The final release is recorded only after the client marks the work accepted in the demo. It is not a guarantee of any payment.",
      },
    ],
  },
  {
    id: guideIds[5],
    title: "Safe chemical drain handling & mechanical snaking",
    topic: "safety",
    trade: learner.trade,
    summary:
      "Protective eyewear, neutralisers, and drum auger safety in tight household bathrooms.",
    minutes: 11,
    seededSteps: 0,
    steps: [
      {
        id: "protect",
        title: "Protect yourself first",
        minutes: 5,
        intro:
          "Wear eye protection and gloves before any chemical touches the drain; label solutions and never mix them.",
      },
      {
        id: "snake",
        title: "Snake the drain mechanically",
        minutes: 6,
        intro:
          "Feed the auger slowly and keep the cable away from energised fittings, including pumps and heaters.",
      },
    ],
  },
  {
    id: guideIds[6],
    title: "Writing accurate defect summaries",
    topic: "documentation",
    trade: learner.trade,
    summary:
      "Concise write-ups that document pre-existing corrosion before high-pressure work begins.",
    minutes: 15,
    seededSteps: 1,
    steps: [
      {
        id: "observe",
        title: "Observe before touching",
        minutes: 7,
        intro:
          "Record what the pipe already looked like — flaking, staining, prior patches — before any repair starts.",
      },
      {
        id: "word",
        title: "Keep wording short and factual",
        minutes: 8,
        intro:
          "Write plain sentences a site foreman could read back months later and reconstruct the same facts.",
      },
      {
        id: "attach",
        title: "Attach your evidence",
        minutes: 4,
        intro:
          "Demo note: previews of attachments are not persisted between sessions in this build.",
      },
    ],
  },
  {
    id: guideIds[7],
    title: "De-escalating scope creep & add-ons",
    topic: "customer",
    trade: learner.trade,
    summary:
      "Politely declining off-book labour and converting extra requests into recorded quotes.",
    minutes: 7,
    seededSteps: 2,
    steps: [
      {
        id: "decline",
        title: "Decline politely, stay warm",
        minutes: 3,
        intro:
          "“I can add that, but it must go through the app as its own quote so we both have a record.”",
      },
      {
        id: "record",
        title: "Record the request",
        minutes: 4,
        intro:
          "Every extra item becomes a documented quote line, keeping protection identical for both sides.",
      },
    ],
  },
];

// Fictional completion date stored in UTC and rendered in Africa/Lagos time.
export const demoCompletedAtUtc = "2026-10-25T10:30:00.000Z";
/** Fictional internal docket reference for the demo certificate. */
export const demoDocket = "SW-TRN-2026-0001";
