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
          <p className="eyebrow">SKILLED HANDS. TRUSTED WORK.</p>
          <h2>
            {recovery
              ? "A little help getting back in."
              : "Good things start with the right connection."}
          </h2>
          <p>
            Find local skills for the jobs that matter. Your next helping hand
            could be just around the corner.
          </p>
          <ul>
            <li>
              <span>
                <Icon name="search" />
              </span>
              <div>
                <strong>Find your kind of help</strong>
                <p>Explore local trades around Benin City.</p>
              </div>
            </li>
            <li>
              <span>
                <Icon name="wrench" />
              </span>
              <div>
                <strong>Know the work before it starts</strong>
                <p>Agree on an itemized scope and quote.</p>
              </div>
            </li>
            <li>
              <span>
                <Icon name="shield" />
              </span>
              <div>
                <strong>Keep your account yours</strong>
                <p>Keep requests, quotes and updates together.</p>
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
          <p className="auth-story-foot">A clear path from first request to finished work.</p>
        </aside>
        <div className="auth-form-column">
          <div className="auth-mobile-brand"><Brand /></div>
          <div className="auth-demo-notice">
            <Icon name="help" size={18} />
            <p>
              <strong>Frontend demo</strong> · Nothing is sent or saved. Use
              sample details, never a real password.
            </p>
          </div>
          {children}
        </div>
      </div>
    </section>
  );
}
