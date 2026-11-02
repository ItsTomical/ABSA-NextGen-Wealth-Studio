import { createContext, useContext, useState } from "react";
import { TRACKS } from "../data/tracks";

const UserContext = createContext(null);

const DEFAULT_PROFILE = {
  name: "Sipho Dlamini",
  initials: "SD",
  email: "",
  grossSalary: 52000,
  rent: 9500,
  carRepayment: 0,
  medicalAid: 1800,
  studentLoan: 2500,
  familySupport: 4700,
  subscriptions: 800,
  lastMonthSurplus: 19500,
  lastRun: {},
  activeTrack: "first-property",
  milestoneProgress: {
    "first-property": {
      0: "done",
      1: "active",
      2: "todo",
      3: "todo",
      4: "todo",
    },
  },
  actionsDone: { "open-absa-pocket": true },
  goals: {
    emergencyFund: { target: 90000, saved: 40500 },
    depositSavings: { target: 180000, saved: 14400 },
    raInvesting: { target: 50000, saved: 0 },
    debtPayoff: { target: 30000, saved: 0 },
  },
};

function calcTakeHome(gross) {
  // SA PAYE brackets 2026/2027
  const annual = gross * 12;
  let tax = 0;
  if (annual <= 245100) tax = annual * 0.18;
  else if (annual <= 383100) tax = 44118 + (annual - 245100) * 0.26;
  else if (annual <= 530200) tax = 79998 + (annual - 383100) * 0.31;
  else if (annual <= 695800) tax = 125599 + (annual - 530200) * 0.36;
  else if (annual <= 887000) tax = 185215 + (annual - 695800) * 0.39;
  else if (annual <= 1878600) tax = 259783 + (annual - 887000) * 0.41;
  else tax = 666339 + (annual - 1878600) * 0.45;

  // Primary rebate
  tax = Math.max(0, tax - 17820);
  // Medical aid credit 2026/2027
  const medCredit = 376 * 12;
  tax = Math.max(0, tax - medCredit);
  // UIF: 1% capped at R177.12/month
  const uif = Math.min(gross * 0.01, 177.12);
  const monthlyTax = tax / 12;
  return Math.round(gross - monthlyTax - uif);
}

const STORAGE_KEY = "absa_nextgen_profile";

function loadProfile() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return { ...DEFAULT_PROFILE, ...JSON.parse(saved) };
  } catch {}
  return DEFAULT_PROFILE;
}

function saveProfile(p) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
  } catch {}
}

export function UserProvider({ children }) {
  const [profile, setProfileRaw] = useState(loadProfile);

  function setProfile(updater) {
    setProfileRaw((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      saveProfile(next);
      return next;
    });
  }

  const takeHome = calcTakeHome(profile.grossSalary);
  const fixedCosts =
    profile.rent +
    profile.carRepayment +
    profile.medicalAid +
    profile.studentLoan +
    profile.familySupport +
    profile.subscriptions;
  const surplus = takeHome - fixedCosts;

  const healthScore = (() => {
    const savingsRate = takeHome > 0 ? (surplus / takeHome) * 100 : 0;
    const efPct  = (profile.goals.emergencyFund.saved  / profile.goals.emergencyFund.target)  * 100;
    const raPct  = (profile.goals.raInvesting.saved    / profile.goals.raInvesting.target)    * 100;
    const depPct = (profile.goals.depositSavings.saved / profile.goals.depositSavings.target) * 100;
    // Include car repayment as debt alongside student loan
    const dti = profile.grossSalary > 0
      ? ((profile.studentLoan + profile.carRepayment) / profile.grossSalary) * 100
      : 0;

    // Savings rate — 50 pts, reaches max at 40% savings rate
    const savingsScore = Math.min(50, Math.max(0, savingsRate * (50 / 40)));
    // Debt health  — 25 pts, loses 0.625 pts per DTI percentage point, 0 at 40% DTI
    const debtScore    = Math.max(0, 25 - dti * 0.625);
    // Emergency fund — 15 pts, linear
    const efScore      = (efPct  / 100) * 15;
    // RA / investing — 7 pts, linear
    const raScore      = (raPct  / 100) * 7;
    // Deposit savings — 3 pts, linear
    const depScore     = (depPct / 100) * 3;

    // Round once at the end to avoid compounding rounding noise per component
    return Math.min(100, Math.max(0, Math.round(savingsScore + debtScore + efScore + raScore + depScore)));
  })();

  const updateProfile = (key, value) =>
    setProfile((p) => ({ ...p, [key]: value }));
  const toggleAction = (id) =>
    setProfile((p) => ({
      ...p,
      actionsDone: { ...p.actionsDone, [id]: !p.actionsDone[id] },
    }));

  const updateMilestoneStatus = (trackId, idx, status) =>
    setProfile((p) => ({
      ...p,
      milestoneProgress: {
        ...p.milestoneProgress,
        [trackId]: {
          ...p.milestoneProgress?.[trackId],
          [idx]: status,
        },
      },
    }));

  const recordRun = (studioId) =>
    setProfile((p) => ({
      ...p,
      lastRun: { ...p.lastRun, [studioId]: Date.now() },
    }));

  const activateTrack = (trackId) =>
    setProfile((p) => {
      const track = TRACKS.find((t) => t.id === trackId);
      const defaultProgress = track
        ? Object.fromEntries(
            track.milestones.map((_, i) => [i, i === 0 ? "active" : "todo"])
          )
        : {};
      return {
        ...p,
        activeTrack: trackId,
        milestoneProgress: {
          ...p.milestoneProgress,
          [trackId]: p.milestoneProgress?.[trackId] ?? defaultProgress,
        },
      };
    });

  return (
    <UserContext.Provider
      value={{
        profile,
        setProfile,
        updateProfile,
        takeHome,
        fixedCosts,
        surplus,
        healthScore,
        toggleAction,
        updateMilestoneStatus,
        activateTrack,
        recordRun,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) throw new Error("useUser must be used inside UserProvider");
  return context;
}
