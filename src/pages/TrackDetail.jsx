import { useParams, useNavigate } from "react-router-dom";
import { TRACKS } from "../data/tracks";
import { useUser } from "../context/UserContext";
import { fmt, InfoTooltip, ProgressBar, DonutChart } from "../components/UI";
import "./TrackDetail.css";

export default function TrackDetail() {
  const { trackId } = useParams();
  const nav = useNavigate();
  const { profile, surplus, toggleAction, updateMilestoneStatus, activateTrack } = useUser();
  const track = TRACKS.find((t) => t.id === trackId);

  const defaultStatus = track
    ? Object.fromEntries(track.milestones.map((_, i) => [i, i === 0 ? "active" : "todo"]))
    : {};
  const milestoneStatus = profile.milestoneProgress?.[trackId] ?? defaultStatus;

  if (!track) return <div className="page-body">Track not found</div>;

  const activeIdx = track.milestones.findIndex(
    (_, i) => milestoneStatus[i] === "active",
  );
  const activeMilestone = track.milestones[activeIdx >= 0 ? activeIdx : 0];
  const alloc = activeMilestone.allocation;

  const depositLabel = trackId === "debt-destroyer" ? "Debt payoff" : "Deposit savings";
  const depositColor = trackId === "debt-destroyer" ? "#dc2626" : "#2563EB";

  const donutData = Object.keys(alloc).length
    ? [
        { label: depositLabel,     value: alloc.deposit   || 0, color: depositColor },
        { label: "Emergency fund", value: alloc.emergency || 0, color: "#0f1117" },
        { label: "RA / invest",    value: alloc.ra        || 0, color: "#9ca3af" },
        { label: "Lifestyle",      value: alloc.lifestyle || 0, color: "#f59e0b" },
      ].filter((d) => d.value > 0)
    : [];

  const monthlyBreakdown = Object.keys(alloc).length
    ? [
        { label: depositLabel,     value: surplus * (alloc.deposit   / 100), color: depositColor },
        { label: "Emergency fund", value: surplus * (alloc.emergency / 100), color: "#6b7280" },
        { label: "RA / invest",    value: surplus * (alloc.ra        / 100), color: "#9ca3af" },
        { label: "Lifestyle",      value: surplus * (alloc.lifestyle  / 100), color: "#f59e0b" },
      ].filter((d) => d.value > 0)
    : [];

  const goals = profile.goals;

  // Each track has a different primary goal that drives the progress bar and time estimate
  const PRIMARY_GOAL_CFG = {
    "first-property":     { goalKey: "depositSavings", allocKey: "deposit", label: "Deposit savings", color: "blue" },
    "balanced-lifestyle": { goalKey: "raInvesting",    allocKey: "ra",      label: "RA / investing",  color: "green" },
    "aggressive-global":  { goalKey: "raInvesting",    allocKey: "ra",      label: "RA / investing",  color: "green" },
    "debt-destroyer":     { goalKey: "debtPayoff",     allocKey: "deposit", label: "Debt payoff",     color: "red" },
  };
  const pgCfg = PRIMARY_GOAL_CFG[trackId] ?? PRIMARY_GOAL_CFG["first-property"];
  const primaryGoal = goals[pgCfg.goalKey] ?? { saved: 0, target: 1 };
  const primaryRemaining = Math.max(0, primaryGoal.target - primaryGoal.saved);
  const monthlyPrimary = surplus * ((alloc[pgCfg.allocKey] || 0) / 100);
  const monthsLeft = monthlyPrimary > 0 ? Math.ceil(primaryRemaining / monthlyPrimary) : 60;
  const yearsLeft = Math.floor(monthsLeft / 12);
  const mLeft = monthsLeft % 12;
  const primaryPct = Math.min(100, Math.round((primaryGoal.saved / primaryGoal.target) * 100));
  const monthlyToFinishOneEarly =
    monthsLeft > 1
      ? Math.ceil(primaryRemaining / (monthsLeft - 1) - monthlyPrimary)
      : 0;
  const isActive = profile.activeTrack === track.id;

  function cycleStatus(idx) {
    const order = ["todo", "active", "done"];
    const cur = milestoneStatus[idx] || "todo";
    const next = order[(order.indexOf(cur) + 1) % 3];
    updateMilestoneStatus(track.id, idx, next);
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="track-breadcrumb">
            <button
              className="track-breadcrumb-link"
              onClick={() => nav("/tracks")}
            >
              Strategy Tracks
            </button>
            {" / "}
            <strong>{track.name}</strong>
          </div>
          <div className="page-title">{track.name}</div>
        </div>
        <div className="track-header-right">
          <div>
            <div className="track-time-remaining">
              {yearsLeft}y {mLeft}m
            </div>
            <div className="track-time-label">Remaining on track</div>
          </div>
          {!isActive ? (
            <button
              className="btn btn-primary"
              onClick={() => activateTrack(track.id)}
            >
              Set active
            </button>
          ) : (
            <span className="badge badge-green badge-active-track">
              Active track
            </span>
          )}
        </div>
      </div>

      <div className="page-body">
        {/* Milestone stepper */}
        <div className="card milestone-card">
          <div className="label label--mb16">MILESTONE TIMELINE</div>
          <div className="milestone-stepper">
            {track.milestones.map((m, i) => {
              const status = milestoneStatus[i] || "todo";
              return (
                <div
                  key={i}
                  className={`milestone-step milestone-step-clickable ${status === "done" ? "completed" : status === "active" ? "active" : ""}`}
                  onClick={() => cycleStatus(i)}
                  title="Click to cycle status"
                >
                  <div
                    className={`step-node ${status === "done" ? "completed" : status === "active" ? "active" : ""}`}
                  >
                    {status === "done" ? "✓" : i + 1}
                  </div>
                  {status === "active" && (
                    <div className="step-year">Year {m.year} - NOW</div>
                  )}
                  <div
                    className={`step-label ${status === "active" ? "active-label" : ""}`}
                  >
                    {m.title}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="milestone-hint">
            Click a milestone to toggle its status.
          </div>
        </div>

        <div className="track-detail-grid">
          {/* Main column */}
          <div>
            <div className="card current-milestone-card">
              <div className="label current-milestone-year">
                CURRENT MILESTONE - YEAR {activeMilestone.year}
              </div>
              <div className="current-milestone-title">
                {activeMilestone.title}
              </div>

              <div className="milestone-progress-wrap">
                <div className="milestone-progress-header">
                  <span className="milestone-progress-label">
                    {pgCfg.label} — progress to {fmt(primaryGoal.target)}
                  </span>
                  <span className="milestone-progress-value">
                    {fmt(primaryGoal.saved)} · {primaryPct}%
                  </span>
                </div>
                <ProgressBar pct={primaryPct} color={pgCfg.color} />
              </div>

              <p className="current-milestone-desc">{activeMilestone.desc}</p>

              {activeMilestone.actions.length > 0 && (
                <div>
                  <div className="label action-items-label">
                    ACTION ITEMS
                    <InfoTooltip text="Complete these steps to advance your milestone. Tick them off as you go." />
                  </div>
                  {activeMilestone.actions.map((action) => (
                    <div
                      key={action.id}
                      className="action-item action-item-clickable"
                      onClick={() => toggleAction(action.id)}
                    >
                      <div
                        className={`action-check ${profile.actionsDone[action.id] ? "checked" : ""}`}
                      >
                        {profile.actionsDone[action.id] && (
                          <span className="action-check-icon">✓</span>
                        )}
                      </div>
                      <span
                        className={
                          profile.actionsDone[action.id]
                            ? "action-text--done"
                            : "action-text--active"
                        }
                      >
                        {action.text}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Nudge */}
            {primaryRemaining > 0 && monthlyToFinishOneEarly > 0 && (
              <div className="nudge-card">
                You're <strong>{fmt(primaryRemaining)}</strong> from your{" "}
                {pgCfg.label.toLowerCase()} goal — redirect{" "}
                <strong>{fmt(monthlyToFinishOneEarly)} more/month</strong> to
                hit it a month early.
              </div>
            )}

            {/* Philosophy */}
            <div className="card philosophy-card">
              <div className="label label--mb8">TRACK PHILOSOPHY</div>
              <p className="philosophy-body">{track.philosophy}</p>
              <div className="divider" />
              <div className="philosophy-columns">
                <div className="philosophy-col">
                  <div className="label philosophy-col-label--green">
                    PRIORITISES
                  </div>
                  {track.prioritises.map((p) => (
                    <div key={p} className="philosophy-item">
                      ✓ {p}
                    </div>
                  ))}
                </div>
                <div className="philosophy-col">
                  <div className="label philosophy-col-label--red">
                    SACRIFICES
                  </div>
                  {track.sacrifices.map((s) => (
                    <div key={s} className="philosophy-item">
                      ✗ {s}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Rules */}
            {track.rules?.length > 0 && (
              <div className="card rules-card">
                <div className="label label--mb8">TRACK RULES</div>
                {track.rules.map((rule) => (
                  <div key={rule.id} className="rule-item">
                    → {rule.message}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div>
            <div className="card alloc-card">
              <div className="label label--mb12">SURPLUS ALLOCATION</div>
              {donutData.map((d) => (
                <div key={d.label} className="alloc-row">
                  <div className="alloc-row-left">
                    <div
                      className="alloc-dot"
                      style={{ background: d.color }}
                    />
                    <span className="alloc-name">{d.label}</span>
                  </div>
                  <strong className="alloc-pct">{d.value}%</strong>
                </div>
              ))}
            </div>

            <div className="card">
              <div className="label label--mb12">MONTHLY BREAKDOWN</div>
              {monthlyBreakdown.map((d) => (
                <div
                  key={d.label}
                  className="breakdown-item"
                  style={{ borderLeftColor: d.color }}
                >
                  <div className="breakdown-row">
                    <span className="breakdown-label">{d.label}</span>
                    <span className="breakdown-value">{fmt(d.value)}</span>
                  </div>
                </div>
              ))}
              <div className="divider" />
              <div className="breakdown-total-row">
                <span className="breakdown-total-label">Total surplus</span>
                <span className="breakdown-total-value">{fmt(surplus)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
