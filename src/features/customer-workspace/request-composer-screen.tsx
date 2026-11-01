"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";
import { Icon } from "@/components/icon";
import { areas, categories, type CategoryId } from "@/features/search/data";
import {
  formatMoney,
  readJson,
  type CustomerRequest,
  type RequestStatus,
} from "./service";

const MAX_BUDGET_KOBO = 100_000_000;
const budgetPresets = [25_000, 50_000, 120_000];

const steps = [
  {
    title: "Artisans quote",
    body: "Verified artisans in your area send itemised quotes with materials and labour split out.",
  },
  {
    title: "You compare and accept",
    body: "Review quotes side by side, then accept the one that fits your budget and timeline.",
  },
  {
    title: "Pay in two milestones",
    body: "A 50% mobilisation deposit starts the work; the 50% balance follows your sign-off.",
  },
];

export function RequestComposerScreen() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState<CategoryId>("plumbing");
  const [area, setArea] = useState<string>(areas[0]);
  const [description, setDescription] = useState("");
  const [budgetNaira, setBudgetNaira] = useState("35,000");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<RequestStatus | null>(null);

  const category =
    categories.find((item) => item.id === categoryId) ?? categories[0];
  const budgetKobo = useMemo(() => {
    const digits = budgetNaira.replace(/[^\d]/g, "");
    return digits ? Number(digits) * 100 : 0;
  }, [budgetNaira]);

  function validate() {
    if (title.trim().length < 3) {
      return "Give the request a title of at least 3 characters.";
    }
    if (description.trim().length < 20) {
      return "Describe the work in at least 20 characters so artisans can quote accurately.";
    }
    if (budgetKobo <= 0) {
      return "Enter an estimated budget above ₦0.";
    }
    if (budgetKobo > MAX_BUDGET_KOBO) {
      return "Enter a budget of ₦1,000,000 or less.";
    }
    return null;
  }

  async function submit(status: RequestStatus) {
    const problem = validate();
    if (problem) {
      setError(problem);
      return;
    }

    setSaving(status);
    setError(null);

    try {
      const saved = await readJson<CustomerRequest>("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          category: category.short,
          service_area: `${area}, Benin City`,
          description: description.trim(),
          budget_guidance_kobo: budgetKobo,
          status,
        }),
      });
      router.push(`/requests/${saved.id}`);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Could not save the request.",
      );
      setSaving(null);
    }
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    void submit("submitted");
  }

  return (
    <section className="cb-page">
      <header className="cb-page-head">
        <div className="cb-page-head-copy">
          <p className="cb-eyebrow">
            <span>New request</span>
            <span>Benin City</span>
          </p>
          <h1>Describe the work you need</h1>
          <p>
            The clearer the brief, the sharper the quotes. You can save a draft
            and come back to it before anything is published.
          </p>
        </div>
        <div className="cb-actions">
          <Link className="button button-outline" href="/requests">
            <Icon name="back" size={15} />
            My requests
          </Link>
        </div>
      </header>

      <div className="cb-composer">
        <form className="cb-panel cb-composer-form" onSubmit={onSubmit} noValidate>
          <div className="cb-panel-head">
            <h2>Request details</h2>
            <p className="cb-panel-note">
              Saved to your account in Neon. Nothing is sent to artisans until
              you publish.
            </p>
          </div>

          <div className="cb-form">
            <label className="cb-field">
              What needs doing?
              <input
                required
                minLength={3}
                maxLength={120}
                placeholder="e.g. Kitchen pipe burst repair"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
              />
              <span className="cb-char-count">{title.length}/120</span>
            </label>

            <fieldset className="cb-fieldset">
              <legend>Trade</legend>
              <div className="cb-chip-grid">
                {categories.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className="cb-chip cb-chip-icon"
                    aria-pressed={item.id === categoryId}
                    onClick={() => setCategoryId(item.id)}
                  >
                    <Icon name={item.icon} size={15} />
                    {item.short}
                  </button>
                ))}
              </div>
            </fieldset>

            <div className="cb-field-row">
              <label className="cb-field">
                Service area
                <select
                  value={area}
                  onChange={(event) => setArea(event.target.value)}
                >
                  {areas.map((item) => (
                    <option key={item} value={item}>
                      {item}, Benin City
                    </option>
                  ))}
                </select>
              </label>

              <label className="cb-field">
                Estimated budget (NGN)
                <input
                  required
                  inputMode="numeric"
                  value={budgetNaira}
                  onChange={(event) => setBudgetNaira(event.target.value)}
                  onBlur={() =>
                    setBudgetNaira(
                      budgetKobo
                        ? String(budgetKobo / 100).replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                        : "",
                    )
                  }
                />
                <span className="cb-char-count">
                  {budgetKobo > 0
                    ? formatMoney(budgetKobo)
                    : "Guidance for artisans, not a fixed price"}
                </span>
              </label>
            </div>

            <div className="cb-chip-row">
              {budgetPresets.map((amount) => (
                <button
                  key={amount}
                  type="button"
                  className="cb-chip"
                  aria-pressed={budgetKobo === amount * 100}
                  onClick={() =>
                    setBudgetNaira(
                      String(amount).replace(/\B(?=(\d{3})+(?!\d))/g, ","),
                    )
                  }
                >
                  ₦{String(amount).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                </button>
              ))}
            </div>

            <label className="cb-field">
              Job description &amp; site access
              <textarea
                required
                minLength={20}
                maxLength={2000}
                rows={6}
                placeholder="Describe the task, materials needed, access instructions and any constraints..."
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              />
              <span className="cb-char-count">{description.length}/2000</span>
            </label>

            {error ? (
              <p className="cb-field-error" role="alert">
                {error}
              </p>
            ) : null}

            <div className="cb-composer-actions">
              <button
                type="button"
                className="button button-outline"
                disabled={saving !== null}
                onClick={() => void submit("draft")}
              >
                {saving === "draft" ? "Saving draft..." : "Save as draft"}
              </button>
              <button
                type="submit"
                className="button button-primary"
                disabled={saving !== null}
              >
                {saving === "submitted" ? "Publishing..." : "Publish request"}
                <Icon name="arrow" size={15} />
              </button>
            </div>
          </div>
        </form>

        <aside className="cb-composer-aside">
          <div className="cb-summary-card">
            <p className="cb-summary-label">Request preview</p>
            <h2>{title.trim() || "Untitled request"}</h2>
            <p className="cb-summary-meta">
              {category.name} · {area}, Benin City
            </p>
            <div className="cb-summary-budget">
              <span>Budget guidance</span>
              <strong>{budgetKobo > 0 ? formatMoney(budgetKobo) : "Not set"}</strong>
            </div>
            <p className="cb-summary-body">
              {description.trim() ||
                "Your description will appear here. Artisans use it to scope materials and labour."}
            </p>
          </div>

          <div className="cb-panel cb-steps-panel">
            <div className="cb-panel-head">
              <h2>What happens next</h2>
            </div>
            <ol className="cb-steps">
              {steps.map((step, index) => (
                <li key={step.title}>
                  <span className="cb-step-index" aria-hidden="true">
                    {index + 1}
                  </span>
                  <div>
                    <strong>{step.title}</strong>
                    <p>{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>
            <p className="cb-footnote">
              Milestone amounts are test-mode records. No card is charged and no
              escrow guarantee is provided.
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
}
