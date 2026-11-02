import Link from "next/link";
import { Icon } from "@/components/icon";
import { Portrait } from "@/components/discovery";
import { formatNaira } from "@/features/search/data";
import { BookingDeposit } from "./booking-deposit";

type PublicArtisan = {
  id: string;
  name: string;
  headline: string;
  trade: string;
  area: string;
  workshopAddress: string;
  rating: number;
  reviewCount: number;
  startingPriceKobo: number;
  experienceYears: number;
  profileReviewed: boolean;
  initials: string;
  portrait: number | null;
  bio: string;
  skills: string[];
};

type PaymentOutcome = "missing" | "pending" | "failed" | "error" | "not_found";

const paymentMessages: Record<PaymentOutcome, string> = {
  missing: "We did not receive a payment reference, so nothing was charged.",
  pending: "Paystack is still confirming the transaction. Refresh in a moment.",
  failed: "Paystack declined or cancelled the transaction. Nothing was charged.",
  error: "We could not verify that payment. Please try again.",
  not_found: "That payment reference is unknown to us.",
};

export function PublicArtisanDetail({
  artisan,
  isPresentationData,
  workspace = false,
  customerEmail = "",
  depositKobo,
  paymentsEnabled,
  paidReference,
  paymentOutcome,
}: {
  artisan: PublicArtisan;
  isPresentationData: boolean;
  workspace?: boolean;
  customerEmail?: string;
  depositKobo: number;
  paymentsEnabled: boolean;
  paidReference: string | null;
  paymentOutcome: PaymentOutcome | null;
}) {
  return (
    <section className="pa-page">
      <div className="container pa-shell">
        <nav aria-label="Breadcrumb" className="breadcrumb">
          <Link href="/">Home</Link>
          <Icon name="next" size={14} />
          <Link href={workspace ? "/explore" : "/artisans"}>
            {workspace ? "Explore artisans" : "Find an artisan"}
          </Link>
          <Icon name="next" size={14} />
          <span aria-current="page">{artisan.name}</span>
        </nav>

        {isPresentationData && (
          <div className="pa-banner pa-banner-warn" role="note">
            <Icon name="alert" size={18} />
            <div>
              <strong>Presentation sample profile</strong>
              <span>
                This seeded profile is fictional and is not a real artisan.
              </span>
            </div>
          </div>
        )}

        {paidReference ? (
          <div className="pa-banner pa-banner-success" role="status">
            <Icon name="check" size={18} />
            <div>
              <strong>Payment reference returned.</strong>
              <span>Reference {paidReference}. Check the payment status from your account before treating it as paid.</span>
            </div>
          </div>
        ) : paymentOutcome ? (
          <div className="pa-banner pa-banner-warn" role="status">
            <Icon name="alert" size={18} />
            <div>
              <strong>Payment not completed.</strong>
              <span>{paymentMessages[paymentOutcome]}</span>
            </div>
          </div>
        ) : null}

        <div className="pa-layout">
          <div className="pa-main">
            <header className="pa-hero">
              <div className="pa-portrait">
                <Portrait
                  index={artisan.portrait}
                  name={artisan.name}
                  initials={artisan.initials}
                />
              </div>
              <div className="pa-hero-copy">
                <p className="eyebrow">BENIN CITY ARTISAN PROFILE</p>
                <h1>{artisan.name}</h1>
                <p className="pa-headline">{artisan.headline}</p>
                <ul className="pa-facts">
                  <li>
                    <Icon name="pin" size={16} />
                    <span>
                      {artisan.area}, Benin City
                    </span>
                  </li>
                  <li>
                    <Icon name="star" size={16} />
                    <span>
                      {artisan.reviewCount
                        ? `${artisan.rating.toFixed(1)} from ${artisan.reviewCount} reviews`
                        : "New profile — no reviews yet"}
                    </span>
                  </li>
                  <li>
                    <Icon name="calendar" size={16} />
                    <span>{artisan.experienceYears} years experience</span>
                  </li>
                </ul>
                <div className="pa-badges">
                  {artisan.profileReviewed && !isPresentationData && (
                    <span className="pa-badge">
                      <Icon name="badge" size={15} /> Profile reviewed
                    </span>
                  )}
                </div>
              </div>
            </header>

            <div className="pa-panels">
              <section className="pa-panel pa-panel-wide">
                <h2>About this artisan</h2>
                <p>{artisan.bio}</p>
              </section>
              <section className="pa-panel">
                <h2>Skills</h2>
                <div className="pa-tags">
                  {artisan.skills.map((skill) => (
                    <span key={skill}>{skill}</span>
                  ))}
                </div>
              </section>
              <section className="pa-panel">
                <h2>Trade &amp; workshop</h2>
                <dl className="pa-details">
                  <div>
                    <dt>Primary trade</dt>
                    <dd>{artisan.trade}</dd>
                  </div>
                  <div>
                    <dt>Workshop area</dt>
                    <dd>{artisan.workshopAddress}</dd>
                  </div>
                </dl>
              </section>
              <section className="pa-panel pa-panel-wide">
                <h2>Profile status</h2>
                <p>
                  {isPresentationData
                    ? "This fictional seed profile has not been reviewed by an admin."
                    : artisan.profileReviewed
                      ? "Profile details reviewed by an admin before listing."
                      : "This profile has not been reviewed by an admin."}
                </p>
                <p className="pa-note">
                  Verification checks, escrow handling and training certificates
                  are not yet available in this demo.
                </p>
              </section>
            </div>
          </div>

          <aside className="pa-side">
            <section className="pa-book">
              <p className="eyebrow">
                {isPresentationData
                  ? "TEST BOOKING PREVIEW"
                  : "BOOK THIS ARTISAN"}
              </p>
              <div className="pa-price">
                <span>
                  {isPresentationData
                    ? "Sample rate guidance"
                    : "Starting labour"}
                </span>
                <strong>{formatNaira(artisan.startingPriceKobo)}</strong>
                <small>
                  {isPresentationData
                    ? "Fictional seed amount for presentation only."
                    : "Final cost is agreed in your quote."}
                </small>
              </div>
              <div className="pa-deposit">
                <div>
                  <span>
                    {isPresentationData
                      ? "Test deposit"
                      : "Estimate only"}
                  </span>
                  <strong>{formatNaira(depositKobo)}</strong>
                </div>
                <small>
                  {isPresentationData
                    ? "Test-mode checkout only. No real money moves and no work slot is reserved."
                    : "No slot is reserved until the scope and price are agreed in a quote."}
                </small>
              </div>
              <BookingDeposit
                artisanId={artisan.id}
                artisanName={artisan.name}
                amountKobo={depositKobo}
                paymentsEnabled={paymentsEnabled}
                initialEmail={customerEmail}
                customerWorkspace={workspace}
              />
              <Link
                className="button button-subtle pa-quote"
                href={workspace ? "/requests/new" : "/signup/customer"}
              >
                Request a quote instead <Icon name="arrow" size={16} />
              </Link>
              <p className="pa-test-note">
                <Icon name="lock" size={14} /> Paystack test mode. Card details
                never touch SabiWork.
              </p>
            </section>
            {paymentsEnabled && (
              <section className="pa-side-note">
                <Icon name="shield" size={20} />
                <p>
                  Testing? Use card 4084 0840 8408 4081, any future expiry, CVV
                  408, PIN 0000 and OTP 123456.
                </p>
              </section>
            )}
          </aside>
        </div>
      </div>
    </section>
  );
}
