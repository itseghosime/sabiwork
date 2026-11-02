export type ArtisanProfileDTO = {
  user_id: string;
  contact_phone: string;
  primary_trade: string;
  experience_years: number;
  coverage_areas: string[];
  workshop_area: string;
  bio: string;
  skills: string[];
  rate_guidance_kobo: number | null;
  availability_notes: string | null;
  is_listed: boolean;
  verification_status: "unsubmitted" | "pending" | "approved" | "rejected";
};

export type DeskJob = {
  id: string;
  request_id: string;
  status: "accepted" | "in_progress" | "completed" | "cancelled";
  title: string;
  category: string;
  service_area: string;
  description: string;
  budget_guidance_kobo: number;
  total_quote_kobo: number;
  customer_name: string;
  created_at: string;
  updated_at: string;
  escrow_kobo: number;
  update_count: number;
  latest_update: { note: string; created_at: string } | null;
};

export type DeskQuote = {
  id: string;
  request_id: string;
  title: string;
  category: string;
  service_area: string;
  customer_name: string;
  total_kobo: number;
  status: "pending" | "accepted" | "declined";
  created_at: string;
};

export type DeskPayment = {
  id: string;
  reference: string;
  job_id: string;
  milestone: "deposit" | "balance";
  amount_kobo: number;
  status: "pending" | "confirmed" | "failed" | "cancelled";
  paid_at: string | null;
  created_at: string;
};

export type DeskRequest = {
  id: string;
  title: string;
  category: string;
  service_area: string;
  description: string;
  budget_guidance_kobo: number;
  created_at: string;
  quotes_count: number;
  customer_name: string;
};

export type ArtisanDesk = {
  profile: ArtisanProfileDTO | null;
  display_name: string;
  reference: string;
  stats: {
    active_jobs: number;
    in_progress_jobs: number;
    pending_quotes: number;
    completed_jobs: number;
    mtd_earnings_kobo: number;
    pending_escrow_kobo: number;
    week_earnings_kobo: number;
    reviews_count: number;
    average_rating: number;
  };
  jobs: DeskJob[];
  quotes: DeskQuote[];
  payments: DeskPayment[];
  open_requests: DeskRequest[];
};
