import { useState } from "react";

const _zar = new Intl.NumberFormat("en-ZA", {
  style: "currency",
  currency: "ZAR",
  maximumFractionDigits: 0,
});

export function fmt(n) {
  return _zar.format(Math.round(n));
}

export function fmtK(n) {
  if (n >= 1_000_000) return "R " + (n / 1_000_000).toFixed(2) + "M";
  if (n >= 1000) return "R " + Math.round(n / 1000) + "K";
  return fmt(n);
}

export function InfoTooltip({ text }) {
  const [show, setShow] = useState(false);
  return (
    <span className="tooltip-wrap">
      <button
        className="info-icon"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onClick={() => setShow((v) => !v)}
      >
        ⓘ
      </button>
      {show && <span className="tooltip">{text}</span>}
    </span>
  );
}

export function ProgressBar({ pct, color = "red" }) {
  return (
    <div className="progress-track">
      <div
        className={`progress-fill progress-${color}`}
        style={{ width: `${Math.min(100, pct)}%` }}
      />
    </div>
  );
}

export function SliderInput({
  label,
  value,
  min,
  max,
  step = 1000,
  onChange,
  format = fmt,
}) {
  const id = "slider-" + label.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="slider-wrap">
      <div className="slider-header">
        <label className="slider-label" htmlFor={id}>{label}</label>
        <span className="slider-value">{format(value)}</span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}

export function Expandable({ title, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ marginBottom: 8 }}>
      <div className="expandable-header" onClick={() => setOpen((v) => !v)}>
        <span style={{ fontSize: 13, fontWeight: 600 }}>{title}</span>
        <span style={{ color: "var(--text-muted)", fontSize: 12 }}>
          {open ? "▲" : "▼"}
        </span>
      </div>
      {open && <div className="expandable-body">{children}</div>}
    </div>
  );
}

export function HealthRing({ score }) {
  const r = 44;
  const circ = 2 * Math.PI * r;
  const pct = score / 100;
  const dash = circ * pct;
  const color = score >= 70 ? "#16a34a" : score >= 50 ? "#d97706" : "#dc2626";
  return (
    <div className="health-ring-wrap">
      <svg
        width="110"
        height="110"
        viewBox="0 0 110 110"
        className="health-ring-svg"
      >
        <circle
          cx="55"
          cy="55"
          r={r}
          fill="none"
          stroke="var(--surface-2)"
          strokeWidth="9"
        />
        <circle
          cx="55"
          cy="55"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="9"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          transform="rotate(-90 55 55)"
          style={{ transition: "stroke-dasharray 0.6s ease" }}
        />
        <text
          x="55"
          y="52"
          textAnchor="middle"
          fontSize="20"
          fontWeight="700"
          fill="var(--text-primary)"
          fontFamily="DM Mono, monospace"
        >
          {score}
        </text>
        <text
          x="55"
          y="66"
          textAnchor="middle"
          fontSize="10"
          fill="var(--text-muted)"
          fontFamily="DM Mono, monospace"
        >
          /100
        </text>
      </svg>
      <span style={{ fontSize: 12, fontWeight: 600, color }}>
        {score >= 70 ? "Good" : score >= 50 ? "Fair" : "Needs work"}
      </span>
    </div>
  );
}

export function DonutChart({ data }) {
  // data: [{label, value, color}]
  const total = data.reduce((s, d) => s + d.value, 0);
  const cx = 50,
    cy = 50,
    r = 36,
    inner = 22;
  let angle = -90;
  const paths = data.map((d) => {
    const slice = (d.value / total) * 360;
    const start = angle;
    angle += slice;
    const startRad = (start * Math.PI) / 180;
    const endRad = ((start + slice) * Math.PI) / 180;
    const x1 = cx + r * Math.cos(startRad),
      y1 = cy + r * Math.sin(startRad);
    const x2 = cx + r * Math.cos(endRad),
      y2 = cy + r * Math.sin(endRad);
    const ix1 = cx + inner * Math.cos(startRad),
      iy1 = cy + inner * Math.sin(startRad);
    const ix2 = cx + inner * Math.cos(endRad),
      iy2 = cy + inner * Math.sin(endRad);
    const large = slice > 180 ? 1 : 0;
    return (
      <path
        key={d.label}
        d={`M${ix1},${iy1} L${x1},${y1} A${r},${r},0,${large},1,${x2},${y2} L${ix2},${iy2} A${inner},${inner},0,${large},0,${ix1},${iy1}`}
        fill={d.color}
      />
    );
  });
  return (
    <div className="donut-wrap">
      <svg
        viewBox="0 0 100 100"
        width="100"
        height="100"
        style={{ flexShrink: 0 }}
      >
        {paths}
      </svg>
      <div className="donut-legend">
        {data.map((d) => (
          <div className="legend-item" key={d.label}>
            <div className="legend-dot" style={{ background: d.color }} />
            <span>{d.label}</span>
            <span
              style={{
                marginLeft: "auto",
                fontFamily: "DM Mono",
                fontSize: 11,
                fontWeight: 500,
              }}
            >
              {Math.round((d.value / total) * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
