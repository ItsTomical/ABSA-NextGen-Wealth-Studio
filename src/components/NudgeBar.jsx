import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./NudgeBar.css";

// ── Nudge builder ──────────────────────────────────────────────────
// Pure function: takes financial snapshot, returns active nudge objects.
// Callers render whatever subset they like; dismissal is handled in NudgeBar.
export function buildNudges({ lifestyle, takeHome, surplus, savingsRate, goals }) {
  const nudges = [];

  const lifestylePct =
    takeHome > 0 ? Math.round((lifestyle / takeHome) * 100) : 0;
  const efPct =
    goals.emergencyFund.target > 0
      ? Math.round((goals.emergencyFund.saved / goals.emergencyFund.target) * 100)
      : 0;

  // ── Warnings ───────────────────────────────────────────────────
  if (surplus < 0) {
    nudges.push({
      id: "surplus-negative",
      type: "warning",
      message:
        "Your monthly expenses exceed your take-home pay. Review your fixed costs to get back in the black.",
    });
  }

  if (lifestylePct > 30 && surplus >= 0) {
    nudges.push({
      id: "lifestyle-high",
      type: "warning",
      message: `Lifestyle spending is ${lifestylePct}% of your take-home — above the 30% guideline. Consider trimming subscriptions or recurring expenses.`,
    });
  }

  // ── Info ───────────────────────────────────────────────────────
  if (savingsRate > 0 && savingsRate < 10) {
    nudges.push({
      id: "savings-low",
      type: "info",
      message: `Your savings rate is ${savingsRate}%. Aim for 20% or more — even small increases compound significantly over time.`,
    });
  }

  if (goals.raInvesting.saved === 0 && surplus > 0) {
    nudges.push({
      id: "no-ra",
      type: "info",
      message:
        "You haven't started RA contributions yet. Even R500/month reduces your PAYE today and grows tax-free.",
      action: { label: "Learn about RAs →", path: "/learn?term=ra" },
    });
  }

  // ── Positive reinforcement ─────────────────────────────────────
  if (goals.emergencyFund.saved >= goals.emergencyFund.target) {
    nudges.push({
      id: "ef-complete",
      type: "success",
      message:
        "Emergency fund complete — well done! You can now redirect those savings toward your deposit or RA.",
    });
  } else if (efPct >= 50) {
    nudges.push({
      id: "ef-halfway",
      type: "success",
      message: `You're ${efPct}% of the way to your emergency fund target. Keep the debit order running.`,
    });
  }

  return nudges;
}

// ── Type config ────────────────────────────────────────────────────
const TYPE = {
  warning: { color: "var(--absa-red)", icon: "!" },
  success: { color: "var(--green)",    icon: "✓" },
  info:    { color: "var(--blue)",     icon: "i" },
};

// ── Component ──────────────────────────────────────────────────────
export function NudgeBar({ nudges }) {
  const [dismissed, setDismissed] = useState(new Set());
  const nav = useNavigate();

  const visible = nudges.filter((n) => !dismissed.has(n.id));
  if (visible.length === 0) return null;

  const dismiss = (id) =>
    setDismissed((prev) => new Set([...prev, id]));

  return (
    <div className="nudge-bar">
      {visible.map((nudge) => {
        const { color, icon } = TYPE[nudge.type] ?? TYPE.info;
        return (
          <div
            key={nudge.id}
            className="nudge-item"
            style={{ borderLeftColor: color }}
          >
            <span className="nudge-item-icon" style={{ color }}>
              {icon}
            </span>
            <span className="nudge-item-msg">{nudge.message}</span>
            {nudge.action && (
              <button
                className="btn btn-ghost nudge-learn-btn"
                onClick={() => nav(nudge.action.path)}
              >
                {nudge.action.label}
              </button>
            )}
            <button
              className="nudge-item-dismiss"
              onClick={() => dismiss(nudge.id)}
              aria-label="Dismiss"
            >
              ×
            </button>
          </div>
        );
      })}
    </div>
  );
}
