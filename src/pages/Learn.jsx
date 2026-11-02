import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { fmt } from "../components/UI";
import "./Learn.css";

function getMarginalRate(annualIncome) {
  if (annualIncome <= 245100) return 18;
  if (annualIncome <= 383100) return 26;
  if (annualIncome <= 530200) return 31;
  if (annualIncome <= 695800) return 36;
  if (annualIncome <= 887000) return 39;
  if (annualIncome <= 1878600) return 41;
  return 45;
}

const TERMS = {
  TAX: [
    {
      id: "paye",
      name: "PAYE",
      full: "Pay As You Earn",
      category: "Tax",
      what: `PAYE is the system SARS uses to collect income tax from employees. Your employer deducts it monthly from your salary before you receive it. South Africa uses a progressive tax system. Higher earners pay a higher percentage on each tier, not on their full income.`,
      saContext: (profile) => {
        const annual = profile.grossSalary * 12;
        const rate = getMarginalRate(annual);
        return `In the current SA tax system, rates start at 18% and go up to 45%. At your gross salary of ${fmt(profile.grossSalary)} per month (${fmt(annual)} annually), you fall in the ${rate}% marginal bracket. Your effective rate is lower because only income above each threshold is taxed at that rate.`;
      },
      proTip: `Check your IRP5 at year-end. If your employer has not been deducting correctly, you could face a large SARS bill. RA contributions can reduce your taxable income and generate a refund.`,
      relatedTerms: [
        "Effective tax rate",
        "Marginal tax rate",
        "RA tax deduction",
        "UIF",
      ],
      whereAppears: [
        "Money Snapshot",
        "RA Opportunity tile",
        "Tax year-end nudge",
      ],
    },
    {
      id: "effective-tax-rate",
      name: "Effective tax rate",
      full: "Actual percentage of income paid in tax",
      category: "Tax",
      what: `Your effective tax rate is the actual percentage of your total income that you pay in tax, not the highest bracket you fall into. Because South Africa uses a tiered system, only income above each threshold is taxed at the higher rate.`,
      saContext: (profile, takeHome) => {
        const deductions = profile.grossSalary - takeHome;
        const effectiveRate = Math.round((deductions / profile.grossSalary) * 100);
        const rate = getMarginalRate(profile.grossSalary * 12);
        return `At your salary of ${fmt(profile.grossSalary)} per month, you pay roughly ${fmt(deductions)} in PAYE and UIF — about ${effectiveRate}% of your gross — even though your marginal rate is ${rate}%. This gap is why understanding effective rate matters more for budgeting.`;
      },
      proTip: `You can reduce your effective rate by increasing deductible contributions such as RA and medical aid.`,
      relatedTerms: ["PAYE", "Marginal tax rate", "RA tax deduction"],
      whereAppears: ["Money Snapshot"],
    },
    {
      id: "ra-tax-deduction",
      name: "RA tax deduction",
      full: "Retirement Annuity tax benefit",
      category: "Tax",
      what: `Contributions to a Retirement Annuity are tax-deductible up to 27.5% of your taxable income, capped at R430,000 per year. This means you pay less PAYE when you contribute.`,
      saContext: (profile) => {
        const contribution = Math.round(profile.grossSalary * 0.1);
        const taxableAfter = profile.grossSalary - contribution;
        const rate = getMarginalRate(profile.grossSalary * 12);
        const saving = Math.round(contribution * (rate / 100));
        return `If you contribute ${fmt(contribution)}/month (10% of your salary), SARS taxes you as if you earned ${fmt(taxableAfter)}. At your marginal rate of ${rate}%, that is roughly ${fmt(saving)} less tax per month. Your RA also grows tax-free inside the fund.`;
      },
      proTip: `You can make additional RA contributions before 28 February to increase your refund or reduce your tax bill.`,
      relatedTerms: ["PAYE", "TFSA", "Compound interest"],
      whereAppears: ["Money Snapshot nudge", "Dashboard tax tile"],
    },
    {
      id: "uif",
      name: "UIF",
      full: "Unemployment Insurance Fund",
      category: "Tax",
      what: `UIF is a compulsory government fund that provides short-term relief if you lose your job, become ill, or need maternity leave. Both you and your employer contribute 1% each, but contributions are capped.`,
      saContext: (profile) => {
        const uif = Math.min(profile.grossSalary * 0.01, 177.12);
        const capped = uif >= 177.12;
        return `The monthly cap is R177.12 for employees. At ${fmt(profile.grossSalary)}/month, you ${capped ? "pay the capped amount of R177.12" : `pay ${fmt(uif)}`}. UIF is administered by the Department of Employment and Labour.`;
      },
      proTip: `Ensure your employer is registered and paying UIF. If you are retrenched, UIF can help bridge the gap.`,
      relatedTerms: ["PAYE"],
      whereAppears: ["Money Snapshot"],
    },
    {
      id: "capital-gains-tax",
      name: "Capital gains tax",
      full: "Tax on profit from selling assets",
      category: "Tax",
      what: `CGT is the tax you pay on the profit when you sell an asset such as property, shares, or unit trusts for more than you paid. In South Africa, individuals have an annual exclusion of R50,000 and only 40% of the gain is included in your taxable income.`,
      saContext: `If you sell a property for R2.5M that you bought for R1.8M, your gain is R700,000. After the primary residence exclusion of R3M, CGT often does not apply to a main home. For investment property or shares, planning your exits carefully can reduce CGT.`,
      proTip: `Investments held inside a TFSA or RA are CGT-free on exit.`,
      relatedTerms: ["TFSA", "RA tax deduction", "Effective tax rate"],
      whereAppears: ["Strategy Tracks"],
    },
    {
      id: "medical-aid-credit",
      name: "Medical aid credit",
      full: "Monthly PAYE reduction for medical aid",
      category: "Tax",
      what: `If you contribute to a registered medical aid scheme, SARS gives you a monthly tax credit that reduces your PAYE.`,
      saContext: `The credit is R376 per month each for the main member and first dependant, and R254 per month for each additional dependant.`,
      proTip: `Make sure your employer is applying this credit correctly to reduce your PAYE.`,
      relatedTerms: ["PAYE", "UIF"],
      whereAppears: ["Money Snapshot"],
    },
    {
      id: "marginal-tax-rate",
      name: "Marginal tax rate",
      full: "The tax rate on your last rand of income",
      category: "Tax",
      what: `Your marginal tax rate is the percentage of tax paid on each additional rand you earn above a bracket threshold. South Africa uses a progressive system — you don't pay your highest rate on all your income, only on the portion above each threshold.`,
      saContext: (profile) => {
        const annual = profile.grossSalary * 12;
        const rate = getMarginalRate(annual);
        return `At ${fmt(profile.grossSalary)}/month (${fmt(annual)}/year), your marginal rate is ${rate}%. Any additional income — a bonus, freelance work, or RA withdrawal — will be taxed at ${rate}% at the margin.`;
      },
      proTip: `RA contributions reduce your taxable income, effectively shielding some of your earnings from your highest bracket.`,
      relatedTerms: ["PAYE", "Effective tax rate", "RA tax deduction"],
      whereAppears: ["Money Snapshot", "Learn & Glossary"],
    },
    {
      id: "tax-year",
      name: "Tax year",
      full: "South Africa's March to February financial year",
      category: "Tax",
      what: `South Africa's tax year runs from 1 March to the last day of February — not January to December. This affects when you file your return, when RA contributions count, and when your employer reconciles your PAYE.`,
      saContext: `The SARS filing season typically opens in July for individual taxpayers. Any RA contributions made before 28 February count toward the current tax year's deduction — this is often the most overlooked deadline in personal tax planning.`,
      proTip: `Make additional RA top-up contributions before 28 February to maximise your deduction for the current tax year.`,
      relatedTerms: ["RA tax deduction", "PAYE", "Marginal tax rate"],
      whereAppears: ["Dashboard nudge", "Strategy Tracks"],
    },
  ],

  PROPERTY: [
    {
      id: "transfer-duty",
      name: "Transfer duty",
      full: "Government tax on property purchases",
      category: "Property",
      what: `Transfer duty is a government tax paid by the buyer when purchasing a property. It is calculated on a sliding scale and must be paid before the property is registered in your name.`,
      saContext: `Properties under R1,210,000 pay zero transfer duty. Above that, a sliding scale applies — 3% on value between R1,210,001 and R1,663,800, then 6% up to R2,329,300, rising to 13% above R13,310,000. For a R1.8M property, transfer duty is approximately R22,000. On top of this, budget for bond registration fees of about R27,000 and conveyancing fees of about R15,000.`,
      proTip: `Do not forget bond and legal costs when saving. Many first-time buyers underestimate the total upfront cash required.`,
      relatedTerms: ["Bond registration", "Deposit"],
      whereAppears: ["Simulation Studio 1", "First Property Path"],
    },
    {
      id: "bond-registration",
      name: "Bond registration",
      full: "Legal cost of registering your home loan",
      category: "Property",
      what: `When your bank approves your home loan, a conveyancing attorney registers the bond at the Deeds Office. This is a required legal step and comes with a cost.`,
      saContext: `On a bond of around R1.6M, registration fees are typically between R26,000 and R30,000 depending on the tariff.`,
      proTip: `Get pre-approved before house hunting. It improves your negotiating position and avoids wasted time.`,
      relatedTerms: ["Transfer duty", "Deposit", "LTV"],
      whereAppears: ["Simulation Studio 1", "First Property Path"],
    },
    {
      id: "deposit",
      name: "Deposit",
      full: "Upfront cash payment on a property purchase",
      category: "Property",
      what: `A deposit is the portion of the property price you pay upfront in cash. The bank finances the remainder through a home loan. While 100% bonds are possible in South Africa, a deposit improves your approval chances and typically earns you a better interest rate.`,
      saContext: `A 10% deposit on a R1.8M property is R180,000. Banks view a deposit as a sign of financial discipline — this often translates to a 0.25–0.5% reduction in your bond rate, saving tens of thousands over the loan term.`,
      proTip: `Even a 5% deposit is better than none. Keep the funds in an Absa MoneyBuilder or Notice Deposit account while you save so it earns interest.`,
      relatedTerms: ["Bond registration", "Transfer duty", "LTV", "Prime rate"],
      whereAppears: ["Simulation Studio 1", "First Property Path"],
    },
    {
      id: "prime-rate",
      name: "Prime rate",
      full: "The benchmark lending rate used by SA banks",
      category: "Property",
      what: `The prime lending rate is the base interest rate South African banks use to price loans. It sits 3.5% above the repo rate, which is set by the South African Reserve Bank (SARB). When the SARB changes the repo rate, prime moves with it.`,
      saContext: `As of 2026, the prime rate is 10.50% (repo rate 7.00%). Most home loans are priced at prime or prime minus a small discount for strong credit profiles. A 1% difference on a R1.6M bond saves or costs roughly R1,000–R1,300 per month.`,
      proTip: `Negotiate your bond rate. A strong credit profile and a deposit can get you below prime — which compounds significantly over a 20-year term.`,
      relatedTerms: ["Deposit", "LTV", "Bond registration"],
      whereAppears: ["Simulation Studio 1"],
    },
    {
      id: "ltv",
      name: "LTV",
      full: "Loan-to-Value ratio",
      category: "Property",
      what: `LTV is the percentage of a property's value that you are borrowing. A R1.8M property with a R1.62M bond has an LTV of 90% — the remaining 10% is your deposit. The lower your LTV, the less risk the bank carries, and the better rate you typically receive.`,
      saContext: `SA banks can approve bonds up to 100% LTV, but properties with LTV above 80% may attract a slightly higher rate or stricter approval criteria. As your property value grows and your bond reduces, your LTV improves — you can use this to renegotiate your rate.`,
      proTip: `Request a bond rate review from Absa Home Loans once your LTV drops below 80% through repayments or property appreciation.`,
      relatedTerms: ["Deposit", "Prime rate", "Bond registration"],
      whereAppears: ["Simulation Studio 1", "First Property Path"],
    },
  ],

  INVESTING: [
    {
      id: "etf",
      name: "ETF",
      full: "Exchange-Traded Fund",
      category: "Investing",
      what: `An ETF is a basket of shares or bonds that trades on a stock exchange like a single share. Instead of picking individual stocks, you buy a fund that tracks an index.`,
      saContext: `In South Africa, ETFs are available through Absa Stockbrokers. Popular options include MSCI World and S&P 500 index ETFs. Costs are typically between 0.1% and 0.4% per year.`,
      proTip: `ETFs inside a TFSA grow completely tax-free. Max your TFSA first before investing elsewhere.`,
      relatedTerms: ["TFSA", "Compound interest", "Offshore allocation"],
      whereAppears: ["Balanced Lifestyle Track", "Aggressive Global Track"],
    },
    {
      id: "compound-interest",
      name: "Compound interest",
      full: "Interest earned on interest",
      category: "Investing",
      what: `Compound interest means your returns earn returns. If you invest R1,000 and earn 10%, you have R1,100. The next year you earn returns on the full amount.`,
      saContext: `At a 10% return, R5,000 per month grows to about R380,000 after 5 years and roughly R1.7M to R1.9M after 15 years. Time is the most important factor.`,
      proTip: `Reinvest dividends automatically. This accelerates compounding over time.`,
      relatedTerms: ["ETF", "TFSA", "RA tax deduction"],
      whereAppears: ["All tracks", "Simulation Studio 3"],
    },
    {
      id: "offshore-allocation",
      name: "Offshore allocation",
      full: "Portion of your portfolio held in foreign assets",
      category: "Investing",
      what: `Offshore allocation means holding part of your portfolio in foreign currencies such as USD, EUR, or GBP.`,
      saContext: `South Africa represents less than 1% of global markets. The rand has weakened from around R8 per dollar in 2011 to roughly R18 to R19 today. SARS allows two routes offshore: the Single Discretionary Allowance (SDA) of R2M/year requires no prior SARS approval, while the Foreign Capital Allowance (FCA) of R10M/year requires a tax clearance certificate.`,
      proTip: `Offshore ETFs give global exposure without needing to move money abroad manually. Use the SDA first — no SARS approval needed up to R2M/year.`,
      relatedTerms: ["ETF", "Compound interest"],
      whereAppears: ["Simulation Studio 3", "Aggressive Global Track"],
    },
    {
      id: "tfsa",
      name: "TFSA",
      full: "Tax-Free Savings Account",
      category: "Investing",
      what: `A TFSA is a government-regulated savings vehicle where all returns are completely tax-free, including interest, dividends, and capital gains.`,
      saContext: `The annual contribution limit is R46,000 and the lifetime limit is R500,000.`,
      proTip: `Never withdraw unless necessary. Withdrawals permanently reduce your lifetime contribution room.`,
      relatedTerms: ["RA tax deduction", "ETF", "Compound interest"],
      whereAppears: ["Debt Destroyer Track", "Dashboard nudge"],
    },
    {
      id: "net-worth",
      name: "Net worth",
      full: "What you own minus what you owe",
      category: "Investing",
      what: `Net worth = assets (property, investments, savings, car value) minus liabilities (mortgage, car finance, student loans, credit cards). It's the single best measure of your financial health over time.`,
      saContext: `Many South African professionals focus on income, not net worth. Two people earning the same salary can have wildly different net worths depending on their savings rate, debt levels, and investment behaviour.`,
      proTip: `Calculate your net worth every 6 months. Seeing it grow, even by R10,000, is motivating and keeps you accountable to your strategy track.`,
      relatedTerms: ["Compound interest", "ETF", "Savings rate", "Financial independence"],
      whereAppears: ["All tracks", "Dashboard health score"],
    },
    {
      id: "ra",
      name: "Retirement Annuity",
      full: "Long-term tax-advantaged retirement savings vehicle",
      category: "Investing",
      what: `A Retirement Annuity (RA) is a long-term savings product designed for retirement. Contributions are tax-deductible, growth inside the fund is tax-free, and funds are only accessible from age 55. At retirement, you can take up to one-third as a lump sum (the first R726,000 is tax-free) and must use the remainder to buy an annuity income.`,
      saContext: (profile) => {
        const annual = profile.grossSalary * 12;
        const maxContrib = Math.min(annual * 0.275, 430000);
        const monthly = Math.round(maxContrib / 12);
        return `You can contribute up to 27.5% of gross income, capped at R430,000/year. At your salary, that is up to ${fmt(monthly)}/month in tax-deductible contributions. Absa offers RAs through Absa Investments.`;
      },
      proTip: `An RA is not just for retirement — it is one of the most tax-efficient vehicles available to a salaried employee. Start with even R500/month.`,
      relatedTerms: ["RA tax deduction", "TFSA", "Compound interest", "Tax year"],
      whereAppears: ["Dashboard goals", "All Strategy Tracks"],
    },
    {
      id: "dti",
      name: "Debt-to-income ratio",
      full: "Monthly debt repayments as a percentage of gross income",
      category: "Investing",
      what: `Your debt-to-income (DTI) ratio measures total monthly debt repayments as a percentage of gross monthly income. It is a key metric banks use when assessing bond affordability and a useful indicator of your own financial health.`,
      saContext: (profile) => {
        const totalDebt = profile.studentLoan + profile.carRepayment;
        const dti = profile.grossSalary > 0
          ? ((totalDebt / profile.grossSalary) * 100).toFixed(1)
          : 0;
        return `Your current DTI is ${dti}%. SA banks typically allow a total debt load of up to 40% of gross income for bond approval. Below 10% is considered healthy — it means debt is not constraining your ability to save or invest.`;
      },
      proTip: `Reducing your DTI before applying for an Absa Home Loan improves both your approval chances and the interest rate you are offered.`,
      relatedTerms: ["Net worth", "Savings rate", "Compound interest"],
      whereAppears: ["Dashboard — Money Snapshot", "Debt Destroyer Track"],
    },
    {
      id: "savings-rate",
      name: "Savings rate",
      full: "Percentage of take-home pay saved or invested",
      category: "Investing",
      what: `Your savings rate is the percentage of your after-tax income that you save or invest each month. It is one of the most powerful levers in personal finance — a higher savings rate compresses the time it takes to reach financial goals far more than chasing higher returns.`,
      saContext: (profile, takeHome) => {
        const fixedCosts = profile.rent + profile.carRepayment + profile.medicalAid + profile.studentLoan + profile.familySupport + profile.subscriptions;
        const surplus = takeHome - fixedCosts;
        const rate = takeHome > 0 ? Math.max(0, Math.round((surplus / takeHome) * 100)) : 0;
        return `Your current savings rate is approximately ${rate}%. Financial planners typically recommend 20% or above for meaningful wealth accumulation. Above 30% significantly accelerates your path to financial independence.`;
      },
      proTip: `Focus on your savings rate before optimising investment returns. A 5% improvement in savings rate has more long-term impact than a 2% improvement in portfolio returns.`,
      relatedTerms: ["Net worth", "Compound interest", "Financial independence"],
      whereAppears: ["Dashboard — Money Snapshot", "All Strategy Tracks"],
    },
    {
      id: "black-tax",
      name: "Black Tax",
      full: "Financial support obligations to family members",
      category: "Investing",
      what: `"Black Tax" is the informal term for the financial support many South African professionals — particularly first-generation earners — provide to family members. It includes sending money home, covering school fees, medical costs, or supporting parents with no pension. It is a recurring financial obligation for a significant portion of the working population.`,
      saContext: `Studies suggest between 40% and 70% of Black South African professionals support family members financially. This is not a flaw in a budget — it is a structural reality. The key is to plan around it explicitly rather than treating it as an irregular expense that disrupts your savings goals.`,
      proTip: `Include family support as a fixed line item in your budget. This prevents it from derailing savings goals and helps you plan honestly for both obligations.`,
      relatedTerms: ["Savings rate", "Net worth", "Debt-to-income ratio"],
      whereAppears: ["Dashboard — SA Context tile", "Money Snapshot"],
    },
    {
      id: "financial-independence",
      name: "Financial independence",
      full: "Having enough invested to live off returns indefinitely",
      category: "Investing",
      what: `Financial independence (FI) means your investment portfolio generates enough passive income to cover your living expenses permanently — you no longer need to work to sustain your lifestyle. It is typically calculated using the 4% rule: withdraw 4% of your portfolio per year, and it should last indefinitely based on historical market returns.`,
      saContext: `Your FI number = annual expenses × 25. If you spend R20,000/month (R240,000/year), you need R6M invested. In South Africa, offshore diversification is especially important for FI planning given rand depreciation risk and local market concentration.`,
      proTip: `Track your FI progress as a percentage: (annual passive income ÷ annual expenses) × 100. Even reaching 10% means you have meaningful financial buffer.`,
      relatedTerms: ["Compound interest", "Offshore allocation", "Net worth", "Savings rate"],
      whereAppears: ["Aggressive Global Track", "Simulation Studio 3"],
    },
  ],
};

const ALL_TERMS = [...TERMS.TAX, ...TERMS.PROPERTY, ...TERMS.INVESTING];

export default function Learn() {
  const { profile, takeHome } = useUser();
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedTerm, setSelectedTerm] = useState(() => {
    const id = searchParams.get("term");
    return (id && ALL_TERMS.find((t) => t.id === id)) || ALL_TERMS[0];
  });

  const filtered = ALL_TERMS.filter((t) => {
    const matchCat = activeCategory === "All" || t.category === activeCategory;
    const matchSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.full.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const grouped = {
    Tax: filtered.filter((t) => t.category === "Tax"),
    Property: filtered.filter((t) => t.category === "Property"),
    Investing: filtered.filter((t) => t.category === "Investing"),
  };

  const badgeClass = (cat) =>
    cat === "Tax"
      ? "badge-amber"
      : cat === "Property"
        ? "badge-blue"
        : "badge-green";

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Learn & Glossary</div>
      </div>

      <div className="page-body">
        <div className="learn-layout">
          {/* Left: glossary sidebar */}
          <div className="glossary-sidebar">
            <div className="glossary-search">
              <input
                type="text"
                className="search-input"
                placeholder="Search - PAYE, ETF..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="glossary-tabs">
              {["All", "Tax", "Property", "Investing"].map((c) => (
                <button
                  key={c}
                  className={`tab-pill ${activeCategory === c ? "active" : ""}`}
                  onClick={() => setActiveCategory(c)}
                >
                  {c}
                </button>
              ))}
            </div>
            <div className="glossary-list">
              {Object.entries(grouped).map(
                ([section, terms]) =>
                  terms.length > 0 && (
                    <div key={section}>
                      <div className="glossary-section-header">
                        {section.toUpperCase()}
                      </div>
                      {terms.map((t) => (
                        <button
                          key={t.id}
                          className={`glossary-term ${selectedTerm?.id === t.id ? "active" : ""}`}
                          onClick={() => setSelectedTerm(t)}
                        >
                          {t.name}
                        </button>
                      ))}
                    </div>
                  ),
              )}
            </div>
          </div>

          {/* Right: term detail */}
          {selectedTerm && (
            <div className="learn-detail">
              <div className="learn-detail-header">
                <div>
                  <div className="learn-term-name">{selectedTerm.name}</div>
                  <div className="learn-term-full">{selectedTerm.full}</div>
                </div>
                <span
                  className={`badge ${badgeClass(selectedTerm.category)} learn-term-badge`}
                >
                  {selectedTerm.category}
                </span>
              </div>

              <div className="divider" />

              <div className="learn-section">
                <div className="label learn-section-label">WHAT IT MEANS</div>
                <p className="learn-section-body">{selectedTerm.what}</p>
              </div>

              {/* Your numbers - PAYE only */}
              {selectedTerm.id === "paye" && (
                <div className="card learn-numbers-card">
                  <div className="label" style={{ marginBottom: 10 }}>
                    YOUR NUMBERS
                  </div>
                  <div className="learn-numbers-row">
                    <span className="learn-numbers-label">
                      Gross monthly salary
                    </span>
                    <span className="learn-numbers-value">
                      {fmt(profile.grossSalary)}
                    </span>
                  </div>
                  <div className="learn-numbers-row">
                    <span className="learn-numbers-label">
                      Estimated PAYE deduction
                    </span>
                    <span className="learn-numbers-value--red">
                      {fmt(profile.grossSalary - takeHome)} / month
                    </span>
                  </div>
                </div>
              )}

              <div className="learn-section">
                <div className="label learn-section-label">
                  SOUTH AFRICAN CONTEXT
                </div>
                <p className="learn-section-body">
                  {typeof selectedTerm.saContext === "function"
                    ? selectedTerm.saContext(profile, takeHome)
                    : selectedTerm.saContext}
                </p>
              </div>

              <div className="learn-section">
                <div className="label learn-section-label">
                  WHERE THIS APPEARS IN YOUR PLAN
                </div>
                <div className="learn-tags">
                  {selectedTerm.whereAppears.map((w) => (
                    <span key={w} className="badge badge-grey">
                      {w} →
                    </span>
                  ))}
                </div>
              </div>

              <div className="learn-section">
                <div className="label learn-section-label">RELATED TERMS</div>
                <div className="learn-related-terms">
                  {selectedTerm.relatedTerms.map((r) => {
                    const term = ALL_TERMS.find((t) => t.name === r);
                    return (
                      <button
                        key={r}
                        className="btn btn-outline learn-related-btn"
                        onClick={() => term && setSelectedTerm(term)}
                      >
                        {r}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="learn-pro-tip">
                <div className="learn-pro-tip-label">PRO TIP</div>
                <p className="learn-pro-tip-body">{selectedTerm.proTip}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
