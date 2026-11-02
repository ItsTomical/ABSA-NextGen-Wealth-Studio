import { useState } from "react";
import { useUser } from "../context/UserContext";
import { TRACKS } from "../data/tracks";
import {
  fmt,
  fmtK,
  InfoTooltip,
  ProgressBar,
  HealthRing,
  DonutChart,
} from "../components/UI";
import "./Dashboard.css";
import { NudgeBar, buildNudges } from "../components/NudgeBar";

// ── Helpers ────────────────────────────────────────────────────────
function pct(part, total) {
  return total > 0 ? Math.min(100, Math.round((part / total) * 100)) : 0;
}

function getMarginalRate(annualIncome) {
  if (annualIncome <= 245100) return 18;
  if (annualIncome <= 383100) return 26;
  if (annualIncome <= 530200) return 31;
  if (annualIncome <= 695800) return 36;
  if (annualIncome <= 887000) return 39;
  if (annualIncome <= 1878600) return 41;
  return 45;
}

function calcUif(gross) {
  return Math.min(gross * 0.01, 177.12);
}

function calcPaye(gross, takeHome, uif) {
  return Math.max(0, gross - takeHome - uif);
}

// ── Static data ────────────────────────────────────────────────────
const EDIT_FIELDS = [
  { key: "grossSalary", label: "Gross Salary", cat: "Income" },
  { key: "rent", label: "Rent / Bond", cat: "Housing" },
  { key: "carRepayment", label: "Car Repayment", cat: "Mobility" },
  { key: "medicalAid", label: "Medical Aid", cat: "Lifestyle" },
  { key: "familySupport", label: "Family Support", cat: "Lifestyle" },
  { key: "subscriptions", label: "Subscriptions", cat: "Lifestyle" },
  { key: "studentLoan", label: "Student Loan", cat: "Debt" },
];

// Defines which goals exist on each track and their display order.
// depositSavings only belongs to First Property Path.
const TRACK_GOALS = {
  "first-property": [
    "emergencyFund",
    "depositSavings",
    "debtPayoff",
    "raInvesting",
  ],
  "balanced-lifestyle": ["emergencyFund", "raInvesting", "debtPayoff"],
  "aggressive-global": ["emergencyFund", "raInvesting", "debtPayoff"],
  "debt-destroyer": ["debtPayoff", "emergencyFund", "raInvesting"],
};

const badge = (p) => (p >= 100 ? "Done" : p > 0 ? "Started" : "Begin");
const badgeCls = (p) => (p >= 100 ? "green" : p > 0 ? "amber" : "grey");

const GOAL_CONFIGS = [
  {
    goalKey: "emergencyFund",
    label: "Emergency fund",
    color: "red",
    tooltip: (goals) =>
      `Aim for 3 months of expenses. Your target of ${fmt(goals.emergencyFund.target)} covers about 3 months at your cost level.`,
    getStatus: badge,
    getStatusClass: badgeCls,
  },
  {
    goalKey: "depositSavings",
    label: "Deposit savings",
    color: "blue",
    tooltip: (goals) =>
      `10% deposit on a ${fmt(goals.depositSavings.target * 10)} property. Start early — transfer duty and bond registration fees add another ~R60K.`,
    getStatus: badge,
    getStatusClass: badgeCls,
  },
  {
    goalKey: "raInvesting",
    label: "RA / investing",
    color: "green",
    tooltip: (_, grossSalary) => {
      const rate = getMarginalRate(grossSalary * 12) / 100;
      return `RA contributions are tax-deductible up to 27.5% of income. At your income level, you could save ~${fmt(Math.round(grossSalary * 0.1 * rate * 12))}/year in PAYE.`;
    },
    getStatus: badge,
    getStatusClass: badgeCls,
  },
  {
    goalKey: "debtPayoff",
    label: "Debt payoff",
    color: "red",
    tooltip: () =>
      "Clearing your student loan frees up cash flow and reduces your debt-to-income ratio, which improves bond affordability.",
    getStatus: badge,
    getStatusClass: badgeCls,
  },
];

// ── Sub-components ─────────────────────────────────────────────────
function CategoryRow({ label, value, pct: barPct, color }) {
  return (
    <div className="snapshot-cat-row">
      <span className="snapshot-cat-name">{label}</span>
      <div className="snapshot-cat-track">
        <div
          className="snapshot-cat-fill"
          style={{ width: `${barPct}%`, background: color }}
        />
      </div>
      <span className="snapshot-cat-amt">{fmt(value)}</span>
      <span className="snapshot-cat-pct">{barPct}%</span>
    </div>
  );
}

function GoalRow({
  label,
  pct: goalPct,
  saved,
  target,
  color,
  status,
  statusClass,
  tooltip,
  notPriority,
  editOpen,
  goalKey,
  onUpdate,
}) {
  return (
    <div className={`goal-row${notPriority ? " goal-row--dim" : ""}`}>
      <div className="goal-row-top">
        <span className="goal-name">
          {label}
          <InfoTooltip text={tooltip} />
          {notPriority && (
            <span className="goal-not-priority">
              not a priority on this track
            </span>
          )}
        </span>
        <div className="goal-right">
          <span className="goal-pct">{goalPct}%</span>
          <span className={`badge badge-${statusClass}`}>{status}</span>
        </div>
      </div>
      <ProgressBar pct={goalPct} color={color} />
      {editOpen ? (
        <div className="goal-edit-row">
          <div>
            <label
              className="edit-field-label"
              htmlFor={`goal-saved-${goalKey}`}
            >
              Saved
            </label>
            <input
              id={`goal-saved-${goalKey}`}
              type="number"
              value={saved}
              onChange={(e) =>
                onUpdate(goalKey, "saved", Number(e.target.value))
              }
              className="search-input edit-field-input"
            />
          </div>
          <div>
            <label
              className="edit-field-label"
              htmlFor={`goal-target-${goalKey}`}
            >
              Target
            </label>
            <input
              id={`goal-target-${goalKey}`}
              type="number"
              value={target}
              onChange={(e) =>
                onUpdate(goalKey, "target", Number(e.target.value))
              }
              className="search-input edit-field-input"
            />
          </div>
        </div>
      ) : (
        <div className="goal-amounts">
          {fmt(saved)} of {fmt(target)}
        </div>
      )}
    </div>
  );
}

function KpiBlock({ value, badge, badgeClass, label, tooltip, sep }) {
  return (
    <div className={`snapshot-kpi${sep ? " snapshot-kpi--sep" : ""}`}>
      <div className="snapshot-kpi-val">
        {value}
        <span className={`badge ${badgeClass} snapshot-kpi-badge`}>
          {badge}
        </span>
      </div>
      <div className="snapshot-kpi-lbl">
        {label}
        <InfoTooltip text={tooltip} />
      </div>
    </div>
  );
}

// ── Component ──────────────────────────────────────────────────────
export default function Dashboard() {
  const { profile, takeHome, fixedCosts, surplus, healthScore, updateProfile } =
    useUser();
  const [editOpen, setEditOpen] = useState(false);
  const [goalsEditOpen, setGoalsEditOpen] = useState(false);

  const {
    grossSalary,
    lastMonthSurplus,
    rent,
    carRepayment,
    medicalAid,
    familySupport,
    subscriptions,
    studentLoan,
    goals,
  } = profile;

  const surplusDelta = surplus - lastMonthSurplus;

  const uif = calcUif(grossSalary);
  const paye = calcPaye(grossSalary, takeHome, uif);

  const housing = rent;
  const mobility = carRepayment;
  const lifestyle = medicalAid + familySupport + subscriptions;
  const debt = studentLoan;

  const dti = grossSalary > 0 ? +((debt / grossSalary) * 100).toFixed(1) : 0;
  const savingsRate = pct(surplus, takeHome);
  const fixedCostLoad = pct(fixedCosts, takeHome);
  const efMonths =
    fixedCosts > 0
      ? parseFloat((goals.emergencyFund.saved / fixedCosts).toFixed(1))
      : 0;
  const trackedNetWorth =
    goals.emergencyFund.saved +
    goals.depositSavings.saved +
    goals.raInvesting.saved;

  const nudges = buildNudges({
    lifestyle,
    takeHome,
    surplus,
    savingsRate,
    goals,
  });

  const categories = [
    {
      label: "Housing",
      value: housing,
      pct: pct(housing, takeHome),
      color: "#2563EB",
    },
    {
      label: "Mobility",
      value: mobility,
      pct: pct(mobility, takeHome),
      color: "#6b7280",
    },
    {
      label: "Lifestyle",
      value: lifestyle,
      pct: pct(lifestyle, takeHome),
      color: "#f59e0b",
    },
    { label: "Debt", value: debt, pct: pct(debt, takeHome), color: "#dc2626" },
    {
      label: "Savings",
      value: Math.max(0, surplus),
      pct: Math.max(0, savingsRate),
      color: "#16a34a",
    },
  ];

  const activeTrack = TRACKS.find((t) => t.id === profile.activeTrack);
  const milestoneStatuses =
    profile.milestoneProgress?.[profile.activeTrack] ?? {};
  const activeMilestoneIdx = activeTrack
    ? activeTrack.milestones.findIndex(
        (_, i) => milestoneStatuses[i] === "active",
      )
    : -1;
  const activeMilestone =
    activeTrack?.milestones[activeMilestoneIdx >= 0 ? activeMilestoneIdx : 0];
  const alloc = activeMilestone?.allocation ?? {
    emergency: 30,
    deposit: 40,
    ra: 10,
    lifestyle: 20,
  };

  const trackGoalKeys = TRACK_GOALS[profile.activeTrack] ?? [
    "emergencyFund",
    "depositSavings",
    "debtPayoff",
    "raInvesting",
  ];

  const goalRows = GOAL_CONFIGS.filter((cfg) =>
    trackGoalKeys.includes(cfg.goalKey),
  )
    .sort(
      (a, b) =>
        trackGoalKeys.indexOf(a.goalKey) - trackGoalKeys.indexOf(b.goalKey),
    )
    .map((cfg) => {
      const g = goals[cfg.goalKey];
      const p = pct(g.saved, g.target);
      return {
        label: cfg.label,
        pct: p,
        saved: g.saved,
        target: g.target,
        color: cfg.color,
        status: cfg.getStatus(p),
        statusClass: cfg.getStatusClass(p),
        tooltip: cfg.tooltip(goals, grossSalary),
        goalKey: cfg.goalKey,
        notPriority: cfg.goalKey === "debtPayoff" && studentLoan === 0,
      };
    });

  function handleGoalUpdate(goalKey, field, value) {
    updateProfile("goals", {
      ...goals,
      [goalKey]: { ...goals[goalKey], [field]: value },
    });
  }

  const donutData = [
    {
      label: `Emergency ${alloc.emergency}%`,
      frac: alloc.emergency / 100,
      color: "#0f1117",
      value: surplus * (alloc.emergency / 100),
    },
    {
      label: `Deposit ${alloc.deposit}%`,
      frac: alloc.deposit / 100,
      color: "#2563EB",
      value: surplus * (alloc.deposit / 100),
    },
    {
      label: `RA ${alloc.ra}%`,
      frac: alloc.ra / 100,
      color: "#9ca3af",
      value: surplus * (alloc.ra / 100),
    },
    {
      label: `Lifestyle ${alloc.lifestyle}%`,
      frac: alloc.lifestyle / 100,
      color: "#f59e0b",
      value: surplus * (alloc.lifestyle / 100),
    },
  ];

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Dashboard</div>
      </div>

      <div className="page-body">
        <NudgeBar nudges={nudges} />

        {/* Hero row: surplus + income breakdown */}
        <div className="grid-2 income-hero-grid">
          <div className="card">
            <div className="label">
              INVESTABLE SURPLUS THIS MONTH
              <InfoTooltip text="Your surplus is what remains after tax, all fixed costs, and monthly obligations. This is what you can realistically invest or save." />
            </div>
            <div className={`metric-lg${surplus < 0 ? " surplus-neg" : ""}`}>
              {fmt(surplus)}
            </div>
            <div className="progress-track surplus-bar">
              <div
                className="progress-fill progress-red"
                style={{
                  width: `${Math.min(100, Math.max(0, pct(surplus, takeHome)))}%`,
                }}
              />
            </div>
            <div
              className={`surplus-delta${surplusDelta < 0 ? " surplus-delta--neg" : ""}`}
            >
              {surplusDelta >= 0 ? "↑" : "↓"} {fmt(Math.abs(surplusDelta))}{" "}
              <span>{surplusDelta >= 0 ? "more" : "less"} than last month</span>
            </div>
          </div>

          <div className="card">
            <div className="label label--mb16">INCOME BREAKDOWN</div>
            <div className="gtn-row">
              <div className="gtn-step">
                <span className="gtn-val">{fmt(grossSalary)}</span>
                <span className="gtn-desc">Gross salary</span>
              </div>
              <span className="gtn-arrow">→</span>
              <div className="gtn-step">
                <span className="gtn-val gtn-deduct">
                  −{fmt(Math.round(paye))}
                </span>
                <span className="gtn-desc">PAYE tax</span>
              </div>
              <span className="gtn-arrow">→</span>
              <div className="gtn-step">
                <span className="gtn-val gtn-deduct">
                  −{fmt(Math.round(uif))}
                </span>
                <span className="gtn-desc">UIF</span>
              </div>
              <span className="gtn-arrow">→</span>
              <div className="gtn-step">
                <span className="gtn-val gtn-result">{fmt(takeHome)}</span>
                <span className="gtn-desc">Take-home</span>
              </div>
            </div>
            <div className="gtn-bar">
              <div
                className="gtn-seg gtn-seg-paye"
                style={{ width: `${pct(paye, grossSalary)}%` }}
              />
              <div
                className="gtn-seg gtn-seg-uif"
                style={{ width: `${pct(uif, grossSalary)}%` }}
              />
              <div className="gtn-seg gtn-seg-net" />
            </div>
            <div className="stat-footnote">
              {Math.round((takeHome / grossSalary) * 100)}% of gross
            </div>
          </div>
        </div>

        {/* Money Snapshot */}
        <div className="card snapshot-card">
          <div className="snapshot-header">
            <div className="label">MONEY SNAPSHOT</div>
            <button
              className="btn btn-outline snapshot-edit-toggle"
              onClick={() => setEditOpen((v) => !v)}
            >
              {editOpen ? "Done" : "Edit"}
            </button>
          </div>

          <div className="label label--mb12">SPENDING CATEGORIES</div>
          <div className="snapshot-cats">
            {categories.map((cat) => (
              <CategoryRow key={cat.label} {...cat} />
            ))}
          </div>

          <div className="divider" />

          <div className="snapshot-kpis">
            <KpiBlock
              value={`${dti}%`}
              badge={dti < 10 ? "Healthy" : dti < 20 ? "Moderate" : "High"}
              badgeClass={
                dti < 10
                  ? "badge-green"
                  : dti < 20
                    ? "badge-amber"
                    : "badge-red"
              }
              label="Debt-to-income"
              tooltip="Monthly debt payments as a % of gross income. Below 10% is healthy; SA banks typically allow up to 40% for bond affordability."
            />
            <KpiBlock
              sep
              value={`${savingsRate}%`}
              badge={
                savingsRate >= 20
                  ? "Strong"
                  : savingsRate >= 10
                    ? "Fair"
                    : "Low"
              }
              badgeClass={
                savingsRate >= 20
                  ? "badge-green"
                  : savingsRate >= 10
                    ? "badge-amber"
                    : "badge-red"
              }
              label="Savings rate"
              tooltip="The percentage of take-home pay available to save or invest. Above 20% puts you on track for meaningful wealth building."
            />
          </div>

          <div className="divider" />

          <div className="snapshot-kpis">
            <KpiBlock
              value={`${fixedCostLoad}%`}
              badge={
                fixedCostLoad < 50
                  ? "Good"
                  : fixedCostLoad < 70
                    ? "Fair"
                    : "High"
              }
              badgeClass={
                fixedCostLoad < 50
                  ? "badge-green"
                  : fixedCostLoad < 70
                    ? "badge-amber"
                    : "badge-red"
              }
              label="Fixed-cost load"
              tooltip="The percentage of take-home pay committed to fixed monthly costs. Below 50% leaves healthy room for savings and investing."
            />
            <KpiBlock
              sep
              value={`${efMonths}mo`}
              badge={efMonths >= 3 ? "Safe" : efMonths >= 1 ? "Partial" : "Low"}
              badgeClass={
                efMonths >= 3
                  ? "badge-green"
                  : efMonths >= 1
                    ? "badge-amber"
                    : "badge-red"
              }
              label="Emergency fund"
              tooltip="Months of fixed expenses covered by your emergency fund. Aim for at least 3 months before investing aggressively."
            />
            <KpiBlock
              sep
              value={fmtK(trackedNetWorth)}
              badge={trackedNetWorth > 0 ? "Growing" : "Start"}
              badgeClass={trackedNetWorth > 0 ? "badge-green" : "badge-grey"}
              label="Net worth"
              tooltip="Your accumulated savings and investments across all tracked goals. Grows as you hit milestones. Does not include property or vehicle values."
            />
          </div>

          {editOpen && (
            <>
              <div className="divider" />
              <div className="label label--mb12">EDIT YOUR NUMBERS</div>
              <div className="snapshot-edit-grid">
                {EDIT_FIELDS.map((f) => (
                  <div key={f.key}>
                    <label
                      className="edit-field-label"
                      htmlFor={`edit-${f.key}`}
                    >
                      <span className="snapshot-edit-cat">{f.cat} · </span>
                      {f.label}
                    </label>
                    <input
                      id={`edit-${f.key}`}
                      type="number"
                      value={profile[f.key]}
                      onChange={(e) =>
                        updateProfile(f.key, Number(e.target.value))
                      }
                      className="search-input edit-field-input"
                    />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Goals + donut */}
        <div className="grid-2 goals-donut-grid">
          <div className="card">
            <div className="goals-header-row">
              <div className="label">GOALS PROGRESS</div>
              <button
                className="btn btn-outline snapshot-edit-toggle"
                onClick={() => setGoalsEditOpen((v) => !v)}
              >
                {goalsEditOpen ? "Done" : "Edit"}
              </button>
            </div>
            {goalRows.map((g) => (
              <GoalRow
                key={g.goalKey}
                {...g}
                editOpen={goalsEditOpen}
                onUpdate={handleGoalUpdate}
              />
            ))}
          </div>

          <div className="goals-right-col">
            <div className="card health-card">
              <div className="label health-label">
                HEALTH SCORE
                <InfoTooltip text="A composite score based on your surplus ratio, goal progress, and debt situation. 70+ is good, 50–70 is fair, below 50 needs attention." />
              </div>
              <HealthRing score={healthScore} />
            </div>
            <div className="card">
              <div className="label donut-card-label">SURPLUS ALLOCATION</div>
              <DonutChart data={donutData} />
              <div className="divider" />
              <div className="donut-note">
                Recommended split for your active track:{" "}
                <strong>{activeTrack?.name ?? "None selected"}</strong>
                {activeMilestone
                  ? ` — milestone: ${activeMilestone.title}.`
                  : "."}
              </div>
            </div>
          </div>
        </div>

        {/* Content tiles */}
        <div className="grid-2 content-tiles">
          <div className="card card-sm">
            <div className="label tile-label">UNDERSTAND YOUR PAY</div>
            <div className="tile-heading">
              Why your gross and take-home differ so much
            </div>
            <div className="tile-body">
              At your gross salary of {fmt(grossSalary)}, SARS takes a
              significant portion through PAYE. Add UIF contributions and the
              difference between gross and take-home can be 25–35%. This is why
              understanding your actual take-home - not your CTC - is the
              starting point for any financial plan.
            </div>
          </div>
          <div className="card card-sm">
            <div className="label tile-label">SA CONTEXT</div>
            <div className="tile-heading">
              What is Black Tax and how to plan around it
            </div>
            <div className="tile-body">
              Family support - often called "Black Tax" - is a real financial
              obligation for many South African earners. The{" "}
              {fmt(familySupport)}/month you contribute is valid and included in
              your fixed costs. Planning around it means building your own
              financial future without guilt - and without ignoring it.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
