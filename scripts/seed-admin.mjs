import { Client } from "pg";

const source = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL;
if (!source) {
  throw new Error("Set DATABASE_URL_UNPOOLED or DATABASE_URL before seeding.");
}

const connectionString = source.replace("sslmode=require", "sslmode=verify-full");
const client = new Client({ connectionString });

const HOUR = 3_600_000;
const now = Date.now();
const at = (hoursOffset) => new Date(now + hoursOffset * HOUR);

const tiers = [
  ["tier-starter", "Starter", "New", "Newly approved artisans completing their first jobs.", 1200, 5, 0, 0, 1],
  ["tier-verified", "Verified", "Verified", "Dossiers cleared with a verified badge and first jobs delivered.", 1000, 3, 5, 40, 2],
  ["tier-pro", "Pro", "Pro", "Consistent ratings and a clean dispute record over 20 jobs.", 800, 2, 20, 45, 3],
  ["tier-elite", "Elite", "Elite", "Top-rated specialists with priority payout windows.", 600, 1, 60, 48, 4],
];

const categories = [
  ["cat-plumbing", "Plumbing", "wrench", 38, 2_500_000, "tier-verified", true, -336],
  ["cat-electrical", "Electrical", "zap", 41, 3_200_000, "tier-verified", true, -480],
  ["cat-carpentry", "Carpentry", "hammer", 29, 4_000_000, "tier-verified", true, -768],
  ["cat-painting", "Painting", "paintbrush", 33, 1_800_000, "tier-starter", true, -648],
  ["cat-tiling", "Tiling", "grid", 24, 2_200_000, "tier-verified", true, -2200],
  ["cat-hvac", "AC & HVAC", "sparkles", 17, 2_800_000, "tier-pro", true, -264],
  ["cat-welding", "Welding", "shield", 12, 3_600_000, "tier-pro", false, -2640],
  ["cat-auto", "Auto mechanics", "settings", 9, 1_500_000, "tier-starter", false, -3168],
];

const artisans = [
  ["seed-artisan-0001", "Friday Osas", "08030000001", "Tiling", 9, ["GRA", "Ugbowo"], "Ugbowo", "Tiler with nine years on bathroom and kitchen installations across Benin City.", "pending", true],
  ["seed-artisan-0002", "Blessing Iyamu", "08030000002", "Electrical", 6, ["Sapele Road", "Ring Road"], "Sapele Road", "Certified electrician handling residential rewiring and distribution board upgrades.", "pending", true],
  ["seed-artisan-0003", "Peter Akpan", "08030000003", "Carpentry", 12, ["Ikpoba Hill"], "Ikpoba Hill", "Carpenter building fitted wardrobes, kitchen units and door frames to measure.", "pending", false],
  ["seed-artisan-0004", "Grace Iyabo", "08030000004", "Painting", 4, ["GRA", "Adesuwa"], "Adesuwa", "Painter specialising in interior finishing, screeding and waterproof coatings.", "pending", true],
  ["seed-artisan-0005", "Kelvin Uche", "08030000005", "AC & HVAC", 7, ["Ring Road", "Ugbor"], "Ugbor", "HVAC technician servicing split units and installing ducted cooling systems.", "pending", true],
  ["seed-artisan-0006", "Chiamaka Eze", "08030000006", "Plumbing", 10, ["GRA"], "GRA", "Plumber handling pipework, pump installation and leak diagnostics for homes.", "approved", true],
  ["seed-artisan-0007", "Emeka Obi", "08030000007", "Plumbing", 5, ["Ugbowo"], "Ugbowo", "Plumber focused on bathroom fit-outs and pressurised water systems.", "approved", true],
  ["seed-artisan-0008", "Tunde Ade", "08030000008", "Welding", 3, ["Ikpoba Hill"], "Ikpoba Hill", "Welder fabricating gates, burglary bars and light structural frames.", "rejected", false],
];

const disputes = [
  ["DSP-2026-0141", "Kitchen sink re-piping left unfinished", "JOB-2026-0784", "Plumbing", "GRA", "Ada Nwosu", "Emeka Obi", 18_500_000, "under_review", "high", "Officer A. Nwosu", -52, 14,
    "Customer paid the deposit for a full re-pipe; the artisan left after the first run with the sink still disconnected.",
    "The sink has been unusable for four days and the artisan stopped answering calls after Tuesday.",
    "I completed the accessible run and asked for the remaining balance before opening the wall to finish."],
  ["DSP-2026-0138", "Electrical burn-out after rewiring", "JOB-2026-0771", "Electrical", "Sapele Road", "Tunde Ade", "Blessing Iyamu", 26_000_000, "escalated", "urgent", "Officer B. Ogie", -68, 6,
    "A socket circuit failed two days after a full rewire. Customer reports smoke and a tripped board.",
    "The board trips whenever the bedroom circuit is loaded. I have photos of the burnt socket.",
    "The circuit was tested before handover. I suspect the customer added a heavy appliance afterwards."],
  ["DSP-2026-0135", "Grouting failed within a week", "JOB-2026-0755", "Tiling", "Ugbowo", "Grace Iyabo", "Friday Osas", 9_400_000, "awaiting_evidence", "normal", null, -30, 30,
    "Finished tiling job has grout lifting along the shower wall less than a week after completion.",
    "The grout is coming away in lines and water is getting behind the tiles.",
    "Happy to return once the customer sends photos of the affected wall and the product used."],
  ["DSP-2026-0129", "Paint finish patchy on repaint", "JOB-2026-0733", "Painting", "Adesuwa", "Kelvin Uche", "Grace Iyabo", 6_200_000, "under_review", "high", "Officer C. Ilenre", -90, 40,
    "Repaint of a three-bedroom flat shows visible roller marks and patchy coverage on two walls.",
    "Two walls look striped in daylight and the colour does not match the agreed sample.",
    "The walls needed two coats and the customer only funded one. I offered a second coat at cost."],
  ["DSP-2026-0118", "Wardrobe doors misaligned", "JOB-2026-0702", "Carpentry", "Ikpoba Hill", "Ada Nwosu", "Peter Akpan", 11_800_000, "resolved", "normal", "Officer A. Nwosu", -220, -2,
    "Fitted wardrobe doors sat out of alignment after installation.",
    "Two doors rub against the frame and do not close flush.",
    "The hinges needed a second adjustment, which I completed on the return visit."],
];

const evidence = {
  "DSP-2026-0141": [
    ["Invoice for deposit payment", "Photo", "customer", true, -50],
    ["Photo of exposed pipework", "Photo", "customer", true, -49],
    ["Site visit note", "Note", "system", false, -40],
  ],
  "DSP-2026-0138": [
    ["Photo of burnt socket", "Photo", "customer", true, -66],
    ["Test certificate from handover", "Document", "artisan", false, -60],
  ],
  "DSP-2026-0135": [["Shower wall close-up", "Photo", "customer", true, -28]],
  "DSP-2026-0129": [
    ["Colour sample photo", "Photo", "customer", false, -88],
    ["Paint tin receipt", "Document", "artisan", true, -80],
  ],
  "DSP-2026-0118": [["Door alignment video", "Video", "customer", true, -210]],
};

const events = {
  "DSP-2026-0141": [
    ["Case opened", "Customer opened the case with a deposit invoice attached.", -52],
    ["Officer assigned", "Officer A. Nwosu picked up the case.", -51],
    ["Review started", "Officer requested the artisan's site notes.", -30],
  ],
  "DSP-2026-0138": [
    ["Case opened", "Customer reported smoke from a bedroom socket.", -68],
    ["Escalated to senior officer", "Priority raised after the safety report.", -20],
  ],
  "DSP-2026-0135": [
    ["Case opened", "Customer reported grout lifting along the shower wall.", -30],
    ["Evidence requested", "Officer asked for photos of the affected wall.", -22],
  ],
  "DSP-2026-0129": [
    ["Case opened", "Customer disputed the paint finish on two walls.", -90],
    ["Review started", "Officer compared the finish against the agreed sample.", -60],
  ],
  "DSP-2026-0118": [
    ["Case opened", "Customer reported misaligned wardrobe doors.", -220],
    ["Case resolved", "Artisan returned to adjust the hinges; customer signed off.", -2],
  ],
};

const holds = [
  ["ESC-2026-0912", "JOB-2026-0784", "Bathroom re-tile and waterproofing", "Tiling", "GRA", "Chiamaka Eze", "Friday Osas", "Access Bank •••• 4019", 24_000_000, "balance", "release_due", true, -96, 4, null],
  ["ESC-2026-0908", "JOB-2026-0771", "Bedroom and socket rewiring", "Electrical", "Sapele Road", "Tunde Ade", "Blessing Iyamu", "GTBank •••• 2280", 48_000_000, "balance", "held", false, -120, 26, null],
  ["ESC-2026-0904", "JOB-2026-0755", "Kitchen cabinet installation", "Carpentry", "Ikpoba Hill", "Halima Bello", "Samuel Ojo", "Zenith Bank •••• 7734", 15_500_000, "deposit", "held", false, -72, 14, null],
  ["ESC-2026-0899", "JOB-2026-0733", "Two-bedroom interior repaint", "Painting", "Adesuwa", "Grace Iyabo", "Peter Akpan", "Access Bank •••• 5510", 10_600_000, "balance", "released", true, -240, -30, -28],
  ["ESC-2026-0894", "JOB-2026-0702", "Split AC servicing and gas top-up", "AC & HVAC", "Ring Road", "Osaretin Ede", "Kelvin Uche", "First Bank •••• 9032", 7_800_000, "deposit", "held", true, -60, 20, null],
  ["ESC-2026-0887", "JOB-2026-0688", "Security gate fabrication and fitting", "Welding", "Sapele Road", "Ada Nwosu", "Ibrahim Sule", "Access Bank •••• 1187", 32_000_000, "balance", "disputed", true, -168, -6, null],
  ["ESC-2026-0881", "JOB-2026-0664", "Borehole pump replacement", "Plumbing", "Ugbowo", "Tunde Ade", "Emeka Obi", "GTBank •••• 6621", 21_000_000, "deposit", "released", true, -420, -200, -198],
];

const auditLogs = [
  ["Officer A. Nwosu", "Case officer", "verification.approved", "Artisan dossier seed-artisan-0006", "info", -26],
  ["Officer B. Ogie", "Senior officer", "payout.release_requested", "Escrow release ESC-2026-0912", "warning", -50],
  ["System", "Automation", "dispute.sla_breached", "Case DSP-2026-0138", "critical", -73],
  ["Officer C. Ilenre", "Case officer", "dispute.escalated", "Case DSP-2026-0129", "warning", -97],
  ["Officer A. Nwosu", "Case officer", "verification.rejected", "Artisan dossier seed-artisan-0008", "info", -140],
  ["Officer B. Ogie", "Senior officer", "trade_tier.updated", 'Tier "Pro" commission band', "warning", -164],
  ["System", "Automation", "escrow.hold_created", "Escrow hold ESC-2026-0908", "info", -186],
  ["Officer C. Ilenre", "Case officer", "dispute.evidence_requested", "Case DSP-2026-0135", "info", -210],
  ["System", "Automation", "auth.failed_attempt", "Admin desk login", "critical", -258],
  ["Officer A. Nwosu", "Case officer", "desk.ticket_assigned", "Desk ticket DSK-2026-0311", "info", -300],
];

const tickets = [
  ["DSK-2026-0318", "Artisan cannot upload NIN slip", "Artisan · Friday Osas", "chat", "new", "high", "Upload rejects a 1.8 MB photo. Needs the file-size limit or an alternative upload path.", -4],
  ["DSK-2026-0315", "Customer asks how escrow release works", "Customer · Ada Nwosu", "email", "open", "normal", "Asked when the balance milestone moves from held to released after sign-off.", -7],
  ["DSK-2026-0311", "Duplicate deposit charge on test account", "Customer · Tunde Ade", "email", "waiting", "urgent", "Test-mode duplicate charge. Payment provider ledger is not connected, so no refund can be issued from this desk.", -21],
  ["DSK-2026-0307", "Request to switch trade category", "Artisan · Blessing Iyamu", "chat", "open", "normal", "Wants to move from Electrical to AC & HVAC after completing a certification.", -26],
  ["DSK-2026-0302", "Training module certificate not showing", "Artisan · Peter Akpan", "phone", "resolved", "normal", "Certificate appeared after the module page was refreshed. Marked resolved.", -49],
];

const replies = [
  ["DSK-2026-0315", "Officer A. Nwosu", "The balance milestone releases once the customer signs off, then the payout window for the artisan's tier applies.", -6],
  ["DSK-2026-0311", "Officer B. Ogie", "Logged against the test ledger. No live charge exists, so nothing needs reversing.", -20],
];

let transactionOpen = false;

try {
  await client.connect();
  await client.query("BEGIN");
  transactionOpen = true;

  for (const [id, name, badge, description, bps, days, jobs, ratingTenths, order] of tiers) {
    await client.query(
      `INSERT INTO public.commission_tiers
         (id, name, badge, description, commission_bps, payout_window_days, min_completed_jobs, min_rating_tenths, sort_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       ON CONFLICT (id) DO NOTHING`,
      [id, name, badge, description, bps, days, jobs, ratingTenths, order],
    );
  }

  for (const [id, name, icon, artisanCount, rate, tierId, active, reviewedHours] of categories) {
    await client.query(
      `INSERT INTO public.trade_categories
         (id, name, icon, active_artisans, median_rate_kobo, default_tier_id, active, last_reviewed_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       ON CONFLICT (id) DO NOTHING`,
      [id, name, icon, artisanCount, rate, tierId, active, at(reviewedHours)],
    );
  }

  for (const [userId, displayName, phone, trade, years, areas, workshop, bio, status, listed] of artisans) {
    await client.query(
      `INSERT INTO public.user_profiles (user_id, role, display_name)
       VALUES ($1, 'artisan', $2)
       ON CONFLICT (user_id) DO NOTHING`,
      [userId, displayName],
    );
    await client.query(
      `INSERT INTO public.artisan_profiles
         (user_id, contact_phone, primary_trade, experience_years, coverage_areas, workshop_area, bio, is_listed, verification_status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       ON CONFLICT (user_id) DO NOTHING`,
      [userId, phone, trade, years, areas, workshop, bio, listed, status],
    );
  }

  for (const row of disputes) {
    const [
      id, title, jobRef, trade, area, customer, artisan, amount, status, priority, officer,
      openedOffset, slaOffset, summary, customerStatement, artisanStatement,
    ] = row;
    await client.query(
      `INSERT INTO public.disputes
         (id, title, job_ref, trade, area, customer_name, artisan_name, amount_kobo, status, priority, officer,
          summary, customer_statement, artisan_statement, opened_at, sla_due_at, resolved_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
       ON CONFLICT (id) DO NOTHING`,
      [
        id, title, jobRef, trade, area, customer, artisan, amount, status, priority, officer,
        summary, customerStatement, artisanStatement, at(openedOffset), at(slaOffset),
        status === "resolved" ? at(slaOffset) : null,
      ],
    );
  }

  for (const [disputeId, items] of Object.entries(evidence)) {
    for (const [name, kind, submittedBy, verified, submittedOffset] of items) {
      await client.query(
        `INSERT INTO public.dispute_evidence (dispute_id, name, kind, submitted_by, verified, submitted_at)
         SELECT $1,$2,$3,$4,$5,$6
         WHERE NOT EXISTS (SELECT 1 FROM public.dispute_evidence WHERE dispute_id = $1 AND name = $2)`,
        [disputeId, name, kind, submittedBy, verified, at(submittedOffset)],
      );
    }
  }

  for (const [disputeId, items] of Object.entries(events)) {
    for (const [label, detail, offset] of items) {
      await client.query(
        `INSERT INTO public.dispute_events (dispute_id, label, detail, occurred_at)
         SELECT $1,$2,$3,$4
         WHERE NOT EXISTS (SELECT 1 FROM public.dispute_events WHERE dispute_id = $1 AND label = $2)`,
        [disputeId, label, detail, at(offset)],
      );
    }
  }

  for (const row of holds) {
    const [
      id, jobRef, title, trade, area, customer, artisan, bank, amount, milestone,
      status, signedOff, heldOffset, dueOffset, releasedOffset,
    ] = row;
    await client.query(
      `INSERT INTO public.escrow_holds
         (id, job_ref, title, trade, area, customer_name, artisan_name, payout_bank, amount_kobo, milestone,
          status, signed_off, held_since, release_due_at, released_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
       ON CONFLICT (id) DO NOTHING`,
      [
        id, jobRef, title, trade, area, customer, artisan, bank, amount, milestone,
        status, signedOff, at(heldOffset), at(dueOffset), releasedOffset === null ? null : at(releasedOffset),
      ],
    );
  }

  for (const [actor, role, action, target, severity, offset] of auditLogs) {
    await client.query(
      `INSERT INTO public.audit_logs (actor, actor_role, action, target, severity, occurred_at)
       SELECT $1,$2,$3,$4,$5,$6
       WHERE NOT EXISTS (SELECT 1 FROM public.audit_logs WHERE action = $3 AND target = $4)`,
      [actor, role, action, target, severity, at(offset)],
    );
  }

  for (const [id, subject, fromLabel, channel, status, priority, summary, offset] of tickets) {
    await client.query(
      `INSERT INTO public.desk_tickets
         (id, subject, from_label, channel, status, priority, summary, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$8)
       ON CONFLICT (id) DO NOTHING`,
      [id, subject, fromLabel, channel, status, priority, summary, at(offset)],
    );
  }

  for (const [ticketId, author, body, offset] of replies) {
    await client.query(
      `INSERT INTO public.desk_ticket_replies (ticket_id, author, body, created_at)
       SELECT $1,$2,$3,$4
       WHERE NOT EXISTS (
         SELECT 1 FROM public.desk_ticket_replies WHERE ticket_id = $1 AND author = $2 AND body = $3
       )`,
      [ticketId, author, body, at(offset)],
    );
  }

  const counts = await client.query(`
    SELECT 'artisan_profiles' AS table_name, count(*)::int AS rows FROM public.artisan_profiles
    UNION ALL SELECT 'commission_tiers', count(*)::int FROM public.commission_tiers
    UNION ALL SELECT 'trade_categories', count(*)::int FROM public.trade_categories
    UNION ALL SELECT 'disputes', count(*)::int FROM public.disputes
    UNION ALL SELECT 'dispute_evidence', count(*)::int FROM public.dispute_evidence
    UNION ALL SELECT 'dispute_events', count(*)::int FROM public.dispute_events
    UNION ALL SELECT 'escrow_holds', count(*)::int FROM public.escrow_holds
    UNION ALL SELECT 'audit_logs', count(*)::int FROM public.audit_logs
    UNION ALL SELECT 'desk_tickets', count(*)::int FROM public.desk_tickets
    UNION ALL SELECT 'desk_ticket_replies', count(*)::int FROM public.desk_ticket_replies
  `);

  await client.query("COMMIT");
  transactionOpen = false;

  for (const row of counts.rows) {
    console.log(`${row.table_name.padEnd(22)} ${row.rows}`);
  }
  console.log("Admin demo data seeded.");
} catch (error) {
  if (transactionOpen) await client.query("ROLLBACK");
  throw error;
} finally {
  await client.end();
}
