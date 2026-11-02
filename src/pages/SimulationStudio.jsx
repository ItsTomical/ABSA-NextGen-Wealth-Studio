import { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { fmt, fmtK, SliderInput, Expandable } from "../components/UI";
import { useUser } from "../context/UserContext";
import "./SimulationStudio.css";

// ─── Property vs Rent ────────────────────────────────────────────────────────

function PropertyVsRent() {
  const { profile } = useUser();
  const [propPrice, setPropPrice] = useState(1800000);
  const [depositPct, setDepositPct] = useState(10);
  const [bondRate, setBondRate] = useState(10.5);
  const [bondTermYrs, setBondTermYrs] = useState(20);
  const [monthlyRent, setMonthlyRent] = useState(() => profile.rent || 12000);
  const [monthlyInvest, setMonthlyInvest] = useState(6000);
  const [propGrowth, setPropGrowth] = useState(6);

  const YEARS = 5;

  const data = useMemo(() => {
    const deposit = propPrice * (depositPct / 100);
    const loanAmt = propPrice - deposit;
    const r = bondRate / 100 / 12;
    const n = bondTermYrs * 12;
    const bondRepayment =
      (loanAmt * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    // 2026/2027 SARS transfer duty brackets
    let td = 0;
    if (propPrice > 13310000)    td = 1427786 + (propPrice - 13310000) * 0.13;
    else if (propPrice > 3993100) td = 216578  + (propPrice - 3993100)  * 0.13;
    else if (propPrice > 2994800) td = 106678  + (propPrice - 2994800)  * 0.11;
    else if (propPrice > 2329300) td = 53478   + (propPrice - 2329300)  * 0.08;
    else if (propPrice > 1663800) td = 13614   + (propPrice - 1663800)  * 0.06;
    else if (propPrice > 1210000) td =            (propPrice - 1210000)  * 0.03;
    const bondReg = propPrice * 0.015;
    const totalUpfront = deposit + td + bondReg;
    const investRate = 0.1 / 12;
    let buyNetWorth = -totalUpfront;
    let portfolio = 0;
    let propValue = propPrice;
    const rows = [{ year: 0, buy: 0, rent: 0 }];
    for (let m = 1; m <= YEARS * 12; m++) {
      propValue *= 1 + propGrowth / 100 / 12;
      buyNetWorth = propValue - loanAmt;
      const bondVsRent = bondRepayment - monthlyRent;
      const extraInvest = bondVsRent < 0 ? -bondVsRent : 0;
      portfolio = portfolio * (1 + investRate) + monthlyInvest + extraInvest;
      if (m % 12 === 0)
        rows.push({
          year: m / 12,
          buy: Math.round(buyNetWorth),
          rent: Math.round(portfolio),
        });
    }
    let breakEvenYear = null;
    for (let y = 6; y <= 25; y++) {
      let bv = propPrice * Math.pow(1 + propGrowth / 100, y) - loanAmt;
      let rv = 0;
      for (let m = 0; m < y * 12; m++)
        rv = rv * (1 + investRate) + monthlyInvest;
      if (bv > rv && !breakEvenYear) breakEvenYear = y;
    }
    const finalBuy = rows[rows.length - 1].buy;
    const finalRent = rows[rows.length - 1].rent;
    const diff = Math.abs(finalBuy - finalRent);
    const rentWins = finalRent > finalBuy;
    const verdict = rentWins
      ? `At ${YEARS} years, renting and investing wins by ${fmtK(diff)}. Buying starts to make more sense around Year ${breakEvenYear || "10+"}. Buy if you plan to stay long-term.`
      : `At ${YEARS} years, buying wins by ${fmtK(diff)}. Your property appreciation is outpacing your investment portfolio. This depends on property growth rates.`;
    return {
      rows,
      finalBuy,
      finalRent,
      breakEvenYear,
      verdict,
      bondRepayment,
      td,
      totalUpfront,
    };
  }, [
    propPrice,
    depositPct,
    bondRate,
    bondTermYrs,
    monthlyRent,
    monthlyInvest,
    propGrowth,
  ]);

  return (
    <div className="studio-layout">
      <div className="studio-input-panel">
        <div className="studio-input-title">Property vs. Renting in Joburg</div>
        <div className="studio-input-sub">Studio 1 of 3</div>
        <div className="label studio-input-section-label">BUYING SCENARIO</div>
        <SliderInput
          label="Property price"
          value={propPrice}
          min={900000}
          max={4000000}
          step={50000}
          onChange={setPropPrice}
        />
        <SliderInput
          label="Deposit %"
          value={depositPct}
          min={5}
          max={30}
          step={1}
          onChange={setDepositPct}
          format={(v) => v + "%"}
        />
        <SliderInput
          label="Bond interest rate"
          value={bondRate}
          min={8}
          max={15}
          step={0.25}
          onChange={setBondRate}
          format={(v) => v + "%"}
        />
        <SliderInput
          label="Bond term"
          value={bondTermYrs}
          min={10}
          max={30}
          step={1}
          onChange={setBondTermYrs}
          format={(v) => v + " years"}
        />
        <SliderInput
          label="Property growth %"
          value={propGrowth}
          min={2}
          max={12}
          step={0.5}
          onChange={setPropGrowth}
          format={(v) => v + "%"}
        />
        <div className="divider" />
        <div className="label studio-input-section-label">RENTING SCENARIO</div>
        <SliderInput
          label="Monthly rent"
          value={monthlyRent}
          min={5000}
          max={25000}
          step={500}
          onChange={setMonthlyRent}
        />
        <SliderInput
          label="Monthly investment"
          value={monthlyInvest}
          min={1000}
          max={20000}
          step={500}
          onChange={setMonthlyInvest}
        />
        <div className="divider" />
        <div className="studio-calc-summary">
          <div className="studio-calc-row">
            Bond repayment:{" "}
            <strong className="studio-calc-value">
              {fmt(data.bondRepayment)}/month
            </strong>
          </div>
          <div className="studio-calc-row">
            Transfer duty:{" "}
            <strong className="studio-calc-value">{fmt(data.td)}</strong>
          </div>
          <div className="studio-calc-row">
            Total upfront:{" "}
            <strong className="studio-calc-value--red">
              {fmtK(data.totalUpfront)}
            </strong>
          </div>
        </div>
      </div>

      <div className="studio-output-panel">
        <div className="card studio-chart-card">
          <div className="studio-chart-header">
            <div className="studio-chart-title">NET WORTH OVER TIME</div>
            <div className="studio-chart-legend">
              <span className="studio-legend-item">
                <span className="studio-legend-line studio-legend-line--solid" />{" "}
                Buy path
              </span>
              <span className="studio-legend-item">
                <span className="studio-legend-line studio-legend-line--dashed" />{" "}
                Rent + invest
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data.rows}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                dataKey="year"
                tickFormatter={(v) => `Y${v}`}
                tick={{ fontSize: 11 }}
              />
              <YAxis tickFormatter={fmtK} tick={{ fontSize: 11 }} width={60} />
              <Tooltip
                formatter={(v) => fmtK(v)}
                labelFormatter={(l) => `Year ${l}`}
              />
              <Line
                type="monotone"
                dataKey="buy"
                stroke="#0f1117"
                strokeWidth={2}
                dot={false}
                name="Buy path"
              />
              <Line
                type="monotone"
                dataKey="rent"
                stroke="#2563EB"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                name="Rent + invest"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="grid-3 studio-metrics-grid">
          <div className="card card-sm">
            <div className="label studio-metric-label">
              PROPERTY VALUE AT Y5
            </div>
            <div className="metric-sm">{fmtK(data.finalBuy)}</div>
          </div>
          <div className="card card-sm">
            <div className="label studio-metric-label">
              PORTFOLIO IF RENTING
            </div>
            <div className="metric-sm">{fmtK(data.finalRent)}</div>
          </div>
          <div className="card card-sm">
            <div className="label studio-metric-label">BUY BREAK-EVEN</div>
            <div className="metric-sm">Year {data.breakEvenYear || "10+"}</div>
          </div>
        </div>

        <div className="verdict-card studio-verdict">
          <div className="verdict-label">STUDIO VERDICT</div>
          <div className="verdict-text">{data.verdict}</div>
        </div>

        <div className="studio-explainers">
          <div className="label studio-explainers-label">
            EXPLAINERS — click to expand
          </div>
          <Expandable title="Transfer duty explained">
            Transfer duty is a government tax on property purchases, paid by the
            buyer to SARS. Under the 2026/2027 SARS table, properties up to
            R1,210,000 pay zero transfer duty. Above that, a sliding scale
            applies: 3% on value between R1,210,001 and R1,663,800; 6% up to
            R2,329,300; 8% up to R2,994,800; and 11–13% beyond that. On a
            R1.8M property you'll pay roughly R22K in transfer duty alone — on
            top of bond registration fees (~R27K). Always budget for these costs
            when saving for your deposit.
          </Expandable>
          <Expandable title="Why does renting often win at 5 years?">
            In the first few years of a bond, almost all your repayment goes to
            interest — not equity. At SA's prime rate (currently 10.50%), it
            takes 7–10 years before the equity build-up and property
            appreciation meaningfully outperform investing the equivalent in a
            diversified portfolio. This is why the buy decision is most sound
            when you plan to stay long-term (10+ years).
          </Expandable>
          <Expandable title="What is a bond and how does it work?">
            A home loan (bond) in South Africa is secured against the property.
            The bank pays the seller; you repay the bank monthly at the
            prevailing interest rate. The SA prime lending rate is currently
            10.50%. Most banks offer prime minus 0.5% to 1% to qualifying
            buyers.
          </Expandable>
        </div>

        <div className="card card-sm studio-prop-tip">
          <div className="studio-prop-tip-heading">
            Ready to start saving for your deposit?
          </div>
          <div className="studio-prop-tip-body">
            Your First Property Path track on the Strategy Tracks page shows you
            exactly how to get there, month by month.
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Car vs Invest ────────────────────────────────────────────────────────────

function CarVsInvest() {
  const [luxuryPrice, setLuxuryPrice] = useState(600000);
  const [budgetPrice, setBudgetPrice] = useState(200000);
  const [financeTerm, setFinanceTerm] = useState(72);
  const [carRate, setCarRate] = useState(11.5);
  const [insuranceDiff, setInsuranceDiff] = useState(1800);
  const [investRate, setInvestRate] = useState(10);

  const data = useMemo(() => {
    const r = carRate / 100 / 12;
    const calcRepayment = (p) =>
      (p * r * Math.pow(1 + r, financeTerm)) /
      (Math.pow(1 + r, financeTerm) - 1);
    const luxRepay = calcRepayment(luxuryPrice);
    const budRepay = calcRepayment(budgetPrice);
    const monthlySavings = luxRepay - budRepay + insuranceDiff;
    const rows = [{ year: 0, portfolio: 0, luxCost: 0 }];
    let portfolio = 0;
    let luxValueLost = 0;
    const ir = investRate / 100 / 12;
    for (let m = 1; m <= 60; m++) {
      portfolio = portfolio * (1 + ir) + monthlySavings;
      luxValueLost += luxRepay + insuranceDiff;
      if (m % 12 === 0)
        rows.push({
          year: m / 12,
          portfolio: Math.round(portfolio),
          luxCost: Math.round(luxValueLost),
        });
    }
    const finalPortfolio = rows[5].portfolio;
    const totalLuxCost = rows[5].luxCost;
    const verdict = `The luxury car costs you ~${fmt(monthlySavings)} more each month. Over 5 years, that's ${fmtK(finalPortfolio)} in investment growth you didn't build. It will also be worth roughly ${fmtK(luxuryPrice * 0.45)} by then — a depreciation loss of ~${fmtK(luxuryPrice * 0.55)}.`;
    return {
      rows,
      finalPortfolio,
      totalLuxCost,
      luxRepay,
      budRepay,
      monthlySavings,
      verdict,
    };
  }, [
    luxuryPrice,
    budgetPrice,
    financeTerm,
    carRate,
    insuranceDiff,
    investRate,
  ]);

  return (
    <div className="studio-layout">
      <div className="studio-input-panel">
        <div className="studio-input-title">
          Luxury Car vs. Invest the Difference
        </div>
        <div className="studio-input-sub">Studio 2 of 3</div>
        <div className="label studio-input-section-label">LUXURY CAR</div>
        <SliderInput
          label="Luxury car price"
          value={luxuryPrice}
          min={300000}
          max={1500000}
          step={25000}
          onChange={setLuxuryPrice}
        />
        <SliderInput
          label="Budget car price"
          value={budgetPrice}
          min={100000}
          max={500000}
          step={10000}
          onChange={setBudgetPrice}
        />
        <SliderInput
          label="Finance term (months)"
          value={financeTerm}
          min={48}
          max={84}
          step={12}
          onChange={setFinanceTerm}
          format={(v) => v + " months"}
        />
        <SliderInput
          label="Interest rate"
          value={carRate}
          min={9}
          max={18}
          step={0.25}
          onChange={setCarRate}
          format={(v) => v + "%"}
        />
        <SliderInput
          label="Monthly insurance difference"
          value={insuranceDiff}
          min={500}
          max={5000}
          step={100}
          onChange={setInsuranceDiff}
        />
        <div className="divider" />
        <div className="label studio-input-section-label">
          INVESTMENT ASSUMPTION
        </div>
        <SliderInput
          label="Annual return on investment"
          value={investRate}
          min={6}
          max={16}
          step={0.5}
          onChange={setInvestRate}
          format={(v) => v + "%"}
        />
        <div className="divider" />
        <div className="studio-calc-summary">
          <div className="studio-calc-row">
            Luxury repayment:{" "}
            <strong className="studio-calc-value">
              {fmt(data.luxRepay)}/month
            </strong>
          </div>
          <div className="studio-calc-row">
            Budget repayment:{" "}
            <strong className="studio-calc-value">
              {fmt(data.budRepay)}/month
            </strong>
          </div>
          <div className="studio-calc-row">
            Monthly you could save:{" "}
            <strong className="studio-calc-value--green">
              {fmt(data.monthlySavings)}
            </strong>
          </div>
        </div>
      </div>

      <div className="studio-output-panel">
        <div className="card studio-chart-card">
          <div className="studio-chart-title studio-chart-title--mb">
            PORTFOLIO GROWTH vs CAR COST (5 YEARS)
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data.rows.slice(1)}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                dataKey="year"
                tickFormatter={(v) => `Y${v}`}
                tick={{ fontSize: 11 }}
              />
              <YAxis tickFormatter={fmtK} tick={{ fontSize: 11 }} width={60} />
              <Tooltip
                formatter={(v) => fmtK(v)}
                labelFormatter={(l) => `Year ${l}`}
              />
              <Bar
                dataKey="portfolio"
                name="Investment portfolio"
                fill="#16a34a"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="luxCost"
                name="Luxury car total cost"
                fill="#dc2626"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="grid-2 studio-metrics-grid">
          <div className="card card-sm">
            <div className="label studio-metric-label">
              PORTFOLIO AT Y5 (IF INVESTED)
            </div>
            <div className="metric-sm studio-metric-value--green">
              {fmtK(data.finalPortfolio)}
            </div>
          </div>
          <div className="card card-sm">
            <div className="label studio-metric-label">
              TOTAL LUXURY CAR COST (5Y)
            </div>
            <div className="metric-sm studio-metric-value--red">
              {fmtK(data.totalLuxCost)}
            </div>
          </div>
        </div>

        <div className="verdict-card studio-verdict">
          <div className="verdict-label">STUDIO VERDICT</div>
          <div className="verdict-text">{data.verdict}</div>
        </div>

        <div className="studio-explainers">
          <div className="label studio-explainers-label">EXPLAINERS</div>
          <Expandable title="Depreciation: the silent killer">
            A new car loses roughly 15–20% of its value in year one, and 50–60%
            over 5 years. A R600,000 BMW bought today will be worth ~R270,000 in
            5 years. You're not just paying the finance — you're paying for the
            depreciation too.
          </Expandable>
          <Expandable title="Car finance rates in South Africa">
            SA car finance is typically at prime + 2–4%, making rates of 12–15%
            common. At 11.5% over 72 months, you'll pay roughly 40% above the
            car's purchase price in total. Always calculate the total cost of
            credit before signing.
          </Expandable>
        </div>
      </div>
    </div>
  );
}

// ─── Local vs Offshore ────────────────────────────────────────────────────────

function LocalVsOffshore() {
  const [monthly, setMonthly] = useState(5000);
  const [offshoreAlloc, setOffshoreAlloc] = useState(30);
  const [localReturn, setLocalReturn] = useState(9);
  const [offshoreReturn, setOffshoreReturn] = useState(11);
  const [randDepreciation, setRandDepreciation] = useState(5);

  const data = useMemo(() => {
    const ir = (rate) => rate / 100 / 12;
    const rows = [{ year: 0, fullLocal: 0, split: 0, fullOffshore: 0 }];
    let fullLocal = 0,
      split = 0,
      fullOffshore = 0;
    const randAdj = (1 + randDepreciation / 100) ** (1 / 12) - 1;
    const localShare = (100 - offshoreAlloc) / 100;
    const offshoreShare = offshoreAlloc / 100;
    for (let m = 1; m <= 60; m++) {
      fullLocal = fullLocal * (1 + ir(localReturn)) + monthly;
      const localGrowth = split * localShare * ir(localReturn);
      const offshoreGrowth =
        split * offshoreShare * (ir(offshoreReturn) + randAdj);
      split = split + localGrowth + offshoreGrowth + monthly;
      fullOffshore =
        fullOffshore * (ir(offshoreReturn) + randAdj + 1) + monthly;
      if (m % 12 === 0)
        rows.push({
          year: m / 12,
          fullLocal: Math.round(fullLocal),
          split: Math.round(split),
          fullOffshore: Math.round(fullOffshore),
        });
    }
    const verdict = `A ${offshoreAlloc}% offshore split returns ${fmtK(rows[5].split)} at 5 years — ${fmtK(rows[5].split - rows[5].fullLocal)} more than fully local. The rand's ~${randDepreciation}% annual depreciation boosts offshore returns in ZAR terms. Diversification reduces single-country risk.`;
    return { rows, verdict };
  }, [monthly, offshoreAlloc, localReturn, offshoreReturn, randDepreciation]);

  return (
    <div className="studio-layout">
      <div className="studio-input-panel">
        <div className="studio-input-title">Local vs. Offshore Allocation</div>
        <div className="studio-input-sub">Studio 3 of 3</div>
        <SliderInput
          label="Monthly investment amount"
          value={monthly}
          min={500}
          max={20000}
          step={500}
          onChange={setMonthly}
        />
        <SliderInput
          label="Offshore allocation %"
          value={offshoreAlloc}
          min={0}
          max={100}
          step={5}
          onChange={setOffshoreAlloc}
          format={(v) => v + "%"}
        />
        <SliderInput
          label="Local (JSE) annual return"
          value={localReturn}
          min={4}
          max={16}
          step={0.5}
          onChange={setLocalReturn}
          format={(v) => v + "%"}
        />
        <SliderInput
          label="Offshore annual return (USD)"
          value={offshoreReturn}
          min={4}
          max={18}
          step={0.5}
          onChange={setOffshoreReturn}
          format={(v) => v + "%"}
        />
        <SliderInput
          label="Rand depreciation p.a."
          value={randDepreciation}
          min={1}
          max={12}
          step={0.5}
          onChange={setRandDepreciation}
          format={(v) => v + "%"}
        />
      </div>

      <div className="studio-output-panel">
        <div className="card studio-chart-card">
          <div className="studio-chart-title studio-chart-title--mb">
            PORTFOLIO GROWTH COMPARISON (5 YEARS)
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data.rows}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis
                dataKey="year"
                tickFormatter={(v) => `Y${v}`}
                tick={{ fontSize: 11 }}
              />
              <YAxis tickFormatter={fmtK} tick={{ fontSize: 11 }} width={60} />
              <Tooltip
                formatter={(v) => fmtK(v)}
                labelFormatter={(l) => `Year ${l}`}
              />
              <Line
                type="monotone"
                dataKey="fullLocal"
                stroke="#0f1117"
                strokeWidth={2}
                dot={false}
                name="100% Local (JSE)"
              />
              <Line
                type="monotone"
                dataKey="split"
                stroke="#2563EB"
                strokeWidth={2}
                dot={false}
                name={`${100 - offshoreAlloc}/${offshoreAlloc} Split`}
              />
              <Line
                type="monotone"
                dataKey="fullOffshore"
                stroke="#d97706"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={false}
                name="100% Offshore"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="grid-3 studio-metrics-grid">
          <div className="card card-sm">
            <div className="label studio-metric-label">100% JSE AT Y5</div>
            <div className="metric-sm">
              {fmtK(data.rows[5]?.fullLocal || 0)}
            </div>
          </div>
          <div className="card card-sm">
            <div className="label studio-metric-label">
              {100 - offshoreAlloc}/{offshoreAlloc} SPLIT AT Y5
            </div>
            <div className="metric-sm studio-metric-value--blue">
              {fmtK(data.rows[5]?.split || 0)}
            </div>
          </div>
          <div className="card card-sm">
            <div className="label studio-metric-label">100% OFFSHORE AT Y5</div>
            <div className="metric-sm studio-metric-value--amber">
              {fmtK(data.rows[5]?.fullOffshore || 0)}
            </div>
          </div>
        </div>

        <div className="verdict-card studio-verdict">
          <div className="verdict-label">STUDIO VERDICT</div>
          <div className="verdict-text">{data.verdict}</div>
        </div>

        <div className="studio-explainers">
          <div className="label studio-explainers-label">EXPLAINERS</div>
          <Expandable title="Why do South Africans invest offshore?">
            The JSE represents less than 1% of global market capitalisation.
            Keeping all your money in SA concentrates both economic and
            political risk. Additionally, the rand has historically depreciated
            ~5–7% per year against major currencies.
          </Expandable>
          <Expandable title="How to invest offshore from South Africa">
            SARS allows individuals to externalise up to R10M per year via the
            annual foreign investment allowance. You can invest offshore via
            global ETFs through Absa Stockbrokers, rand-denominated offshore
            unit trusts, or direct offshore brokerage accounts.
          </Expandable>
        </div>
      </div>
    </div>
  );
}

// ─── Router ───────────────────────────────────────────────────────────────────

export default function SimulationStudio() {
  const { studioId } = useParams();
  const nav = useNavigate();

  const studioMap = {
    "property-vs-rent": {
      component: <PropertyVsRent />,
      title: "Studio 1: Property vs. Renting",
      num: "1 OF 3",
    },
    "car-vs-invest": {
      component: <CarVsInvest />,
      title: "Studio 2: Luxury Car vs. Invest",
      num: "2 OF 3",
    },
    "local-vs-offshore": {
      component: <LocalVsOffshore />,
      title: "Studio 3: Local vs. Offshore",
      num: "3 OF 3",
    },
  };

  const studio = studioMap[studioId];
  if (!studio) return <div className="page-body">Studio not found.</div>;

  return (
    <div>
      <div className="page-header studio-page-header">
        <div>
          <div className="studio-breadcrumb">
            <button
              className="studio-breadcrumb-link"
              onClick={() => nav("/simulation")}
            >
              Simulation Lab
            </button>
            {" / "}
            <strong>{studio.title}</strong>
          </div>
          <div className="studio-num-tag">STUDIO {studio.num}</div>
        </div>
        <button
          className="btn btn-outline studio-back-btn"
          onClick={() => nav("/simulation")}
        >
          Back ←
        </button>
      </div>
      {studio.component}
    </div>
  );
}
