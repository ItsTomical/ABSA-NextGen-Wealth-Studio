import { useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import "./SimulationLab.css";
import propertyVsRentingImg from "../assets/property-vs-renting.png";
import carVsInvestImg from "../assets/car-vs-invest.png";
import localVsOffshoreImg from "../assets/local-vs-offshore.png";

function timeAgo(ts) {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  const hrs = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  if (hrs < 24) return `${hrs}h ago`;
  return `${days}d ago`;
}

const STUDIOS = [
  {
    id: "property-vs-rent",
    num: 1,
    title: "Property vs. Renting in Joburg",
    inputs: 10,
    time: "~5 min",
    highlight: "Break-even year",
    desc: "Compare buying a property vs renting and investing the difference over 5 years in Johannesburg.",
    color: "#2563EB",
    iconImg: propertyVsRentingImg,
  },
  {
    id: "car-vs-invest",
    num: 2,
    title: "Luxury Car vs. Invest the Difference",
    inputs: 9,
    time: "~4 min",
    highlight: "Opportunity cost",
    desc: "See the real cost of a financed luxury car vs a budget car with the difference invested monthly.",
    color: "#16a34a",
    iconImg: carVsInvestImg,
  },
  {
    id: "local-vs-offshore",
    num: 3,
    title: "Local vs. Offshore Allocation",
    inputs: 8,
    time: "~5 min",
    highlight: "ZAR rand effect",
    desc: "Compare keeping your investments in SA vs splitting them offshore, accounting for rand depreciation.",
    color: "#d97706",
    iconImg: localVsOffshoreImg,
  },
];

export default function SimulationLab() {
  const nav = useNavigate();
  const { profile, recordRun } = useUser();

  function runStudio(id) {
    recordRun(id);
    nav(`/simulation/${id}`);
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Simulation Lab</div>
      </div>

      <div className="page-body">
        <div className="card sim-explainer">
          <div className="sim-explainer-text">
            <strong className="sim-explainer-strong">New to this?</strong> The
            Simulation Lab lets you model big financial decisions before you
            make them. Each Studio is a focused scenario with real SA defaults,
            interactive inputs, and a clear verdict. The math is simplified but
            the logic is sound.
          </div>
        </div>

        <div className="grid-3 studios-grid">
          {STUDIOS.map((s) => (
            <div
              key={s.id}
              className="card studio-card"
              onClick={() => runStudio(s.id)}
            >
              <div
                className="studio-preview"
                style={{
                  background: `linear-gradient(135deg, ${s.color}18, ${s.color}08)`,
                  border: `1px solid ${s.color}22`,
                }}
              >
                {s.iconImg ? (
                  <img src={s.iconImg} alt="" className="studio-icon-img" />
                ) : (
                  s.icon
                )}
                <div
                  className="studio-highlight-badge"
                  style={{ color: s.color, background: `${s.color}18` }}
                >
                  {s.highlight}
                </div>
              </div>

              <div className="studio-num">STUDIO {s.num} OF 3</div>
              <div className="studio-title">{s.title}</div>
              <div className="studio-desc">{s.desc}</div>

              <div className="studio-footer">
                <div className="studio-meta">
                  {s.inputs} inputs · {s.time}
                </div>
                <button
                  className="btn btn-ghost studio-run-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    runStudio(s.id);
                  }}
                >
                  Run this studio →
                </button>
              </div>
            </div>
          ))}
        </div>

        {Object.keys(profile.lastRun).length > 0 && (
          <div className="card card-sm recent-bar">
            <span className="label">RECENTLY RUN</span>
            {STUDIOS.filter((s) => profile.lastRun[s.id])
              .sort((a, b) => profile.lastRun[b.id] - profile.lastRun[a.id])
              .map((s) => (
                <button
                  key={s.id}
                  className="btn btn-outline recent-item-btn"
                  onClick={() => runStudio(s.id)}
                >
                  {s.title} · {timeAgo(profile.lastRun[s.id])}
                </button>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
