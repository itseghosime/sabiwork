import { Brand } from "@/components/public-shell";
import { type SignupPath } from "./signup-paths";

type Story = {
  eyebrow: string;
  title: string;
  body: string;
  foot: string;
};

const stories: Record<SignupPath, Story> = {
  customer: {
    eyebrow: "Joining as a customer",
    title: "Post the job. Compare the quotes.",
    body: "Describe the work once and let artisans come to you with itemised pricing.",
    foot: "One account also lets you add a work profile later.",
  },
  artisan: {
    eyebrow: "Joining as an artisan",
    title: "Put your craft where it gets found.",
    body: "Add your trade, the areas you cover and pricing guidance, then answer the requests that fit.",
    foot: "One account also lets you post your own requests later.",
  },
};

const accountStory: Story = {
  eyebrow: "One account, two possibilities",
  title: "Hire local help. Or offer your own skills.",
  body: "SabiWork uses one account for customers and artisans.",
  foot: "Clear requests, quotes and job tracking in Benin City.",
};

const recoveryStory: Story = {
  eyebrow: "Account recovery",
  title: "Let’s get you back in.",
  body: "Reset your password with the email address on your account.",
  foot: "We never reveal whether an address has an account.",
};

export function AuthFrame({
  children,
  recovery = false,
  path = null,
}: {
  children: React.ReactNode;
  recovery?: boolean;
  path?: SignupPath | null;
}) {
  const story = recovery ? recoveryStory : path ? stories[path] : accountStory;

  return (
    <section className={`auth-page ${path ? `auth-path-${path}` : ""}`}>
      <div className="container auth-grid">
        <aside className="auth-story">
          <Brand />
          <div className="auth-story-body">
            <p className="eyebrow">{story.eyebrow}</p>
            <h2>{story.title}</h2>
            <p>{story.body}</p>
          </div>
          <p className="auth-story-foot">{story.foot}</p>
        </aside>
        <div className="auth-form-column">
          <div className="auth-form-inner">
            <div className="auth-mobile-brand">
              <Brand />
            </div>
            <p className="auth-availability-notice">
              <span>
                <strong>Account access is live</strong> · Payments and disputes
                are still rolling out.
              </span>
            </p>
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}
