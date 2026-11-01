import { Icon } from "@/components/icon";
import { Brand } from "@/components/public-shell";
export function AuthFrame({
  children,
  recovery = false,
}: {
  children: React.ReactNode;
  recovery?: boolean;
}) {
  return (
    <section className={`auth-page ${recovery ? "auth-recovery-page" : ""}`}>
      <div className="container auth-grid">
        <aside className="auth-story">
          <Brand />
          <p className="eyebrow">ONE ACCOUNT · TWO POSSIBILITIES</p>
          <h2>
            {recovery
              ? "Let’s get you back into your account."
              : "Hire local help and optionally offer your own skills."}
          </h2>
          <p>
            SabiWork uses one account for customers and artisans. Post requests,
            track work, and add a work profile whenever you are ready to be hired.
          </p>
          <ul>
            <li>
              <span>
                <Icon name="search" />
              </span>
              <div>
                <strong>Post and manage service requests</strong>
                <p>Track updates and keep your job details in one place.</p>
              </div>
            </li>
            <li>
              <span>
                <Icon name="wrench" />
              </span>
              <div>
                <strong>Add your optional work profile</strong>
                <p>Show your trade, service areas, and pricing guidance.</p>
              </div>
            </li>
            <li>
              <span>
                <Icon name="shield" />
              </span>
              <div>
                <strong>Secure account access</strong>
                <p>Email/password login is live. OTP verification is currently off.</p>
              </div>
            </li>
          </ul>
          <div className="auth-craft-art" aria-hidden="true">
            <span className="craft-circle" />
            <span className="craft-tile tile-one">
              <Icon name="wrench" size={34} />
            </span>
            <span className="craft-tile tile-two">
              <Icon name="scissors" size={34} />
            </span>
            <span className="craft-tile tile-three">
              <Icon name="hammer" size={34} />
            </span>
          </div>
          <p className="auth-story-foot">Built for clear requests, quotes, and job tracking in Benin City.</p>
        </aside>
        <div className="auth-form-column">
          <div className="auth-mobile-brand"><Brand /></div>
          <div className="auth-availability-notice">
            <Icon name="help" size={18} />
            <p>
              <strong>Account access is live</strong> · Neon Auth signup, login, and password reset are active. Payments, dispute handling, and verification decisions are still rolling out.
            </p>
          </div>
          {children}
        </div>
      </div>
    </section>
  );
}
