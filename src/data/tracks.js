export const TRACKS = [
  {
    id: "first-property",
    label: "Track A",
    name: "First Property Path",
    tagline: "Rent now, own sooner",
    bestFor: "Renters targeting property in 3–5 years with stable income",
    netWorthTarget: "Deposit + bond affordability achieved",
    sacrifices: ["Offshore investing", "Car upgrades", "Travel"],
    prioritises: ["Deposit building", "Debt clearance", "Emergency fund"],

    philosophy:
      "Property in South Africa requires patience and planning. While 100% bonds are possible, saving a deposit improves your approval chances and interest rate. This track focuses on building a strong financial base before purchasing.",

    rules: [
      {
        id: "has-debt",
        check: (user) => user.debt > 0,
        message:
          "Prioritise clearing high-interest debt before aggressively saving for a deposit.",
      },
      {
        id: "low-surplus",
        check: (user) => user.surplus < 3000,
        message:
          "Your surplus is currently low — consider adjusting your timeline or reducing expenses.",
      },
      {
        id: "no-emergency",
        check: (user) => user.emergencyFundMonths < 3,
        message:
          "Build your emergency fund first before focusing fully on a property deposit.",
      },
    ],

    milestones: [
      {
        year: 1,
        title: "Emergency fund complete",
        desc: "Build 3 months of expenses based on your income and spending. Automate monthly savings to reach this goal.",
        allocation: { deposit: 20, emergency: 55, ra: 5, lifestyle: 20 },
        status: "not-started",
        actions: [
          { id: "open-savings", text: "Open an Absa MoneyBuilder or Notice Deposit account for your emergency fund" },
          { id: "automate-saving", text: "Set up a monthly debit order through Absa Online Banking" },
          { id: "control-spending", text: "Keep lifestyle spending stable" },
        ],
      },
      {
        year: 2,
        title: "Deposit building begins",
        desc: "Redirect more of your surplus toward your property deposit.",
        allocation: { deposit: 45, emergency: 20, ra: 10, lifestyle: 25 },
        status: "not-started",
        actions: [
          { id: "increase-deposit", text: "Increase deposit contribution" },
          { id: "clear-debt", text: "Reduce high-interest debt" },
          { id: "check-affordability", text: "Use the Absa Home Loan affordability calculator to set your target" },
        ],
      },
      {
        year: 3,
        title: "Deposit ready",
        desc: "Begin property search and prepare for additional costs.",
        allocation: { deposit: 30, emergency: 10, ra: 15, lifestyle: 45 },
        status: "not-started",
        actions: [
          { id: "get-preapproval", text: "Apply for Absa Home Loan pre-approval online" },
          { id: "plan-costs", text: "Save for transfer duty and bond registration costs" },
          { id: "start-search", text: "Start viewing properties within your pre-approved range" },
        ],
      },
      {
        year: 4,
        title: "Purchase property",
        desc: "Secure your bond and complete the purchase.",
        allocation: { deposit: 0, emergency: 20, ra: 20, lifestyle: 60 },
        status: "not-started",
        actions: [
          { id: "submit-application", text: "Submit your Absa Home Loan application" },
          { id: "legal-process", text: "Complete the transfer process with your conveyancer" },
          { id: "insurance", text: "Arrange building and home contents insurance through Absa Insurance" },
        ],
      },
      {
        year: 5,
        title: "Shift to investing",
        desc: "Redirect savings into long-term investments.",
        allocation: { deposit: 0, emergency: 15, ra: 30, lifestyle: 55 },
        status: "not-started",
        actions: [
          { id: "start-ra", text: "Open an Absa RA through Absa Investments to start tax-deductible contributions" },
          { id: "start-etf", text: "Start ETF investing via Absa Stockbrokers" },
          { id: "review-bond", text: "Request an Absa home loan rate review — rates may have improved" },
        ],
      },
    ],
  },

  {
    id: "balanced-lifestyle",
    label: "Track B",
    name: "Balanced Lifestyle & Investing",
    tagline: "Grow wealth, enjoy life",
    bestFor: "Users balancing investing with lifestyle",
    netWorthTarget: "Steady portfolio growth over time",
    sacrifices: ["Early property ownership"],
    prioritises: ["ETF investing", "Retirement savings", "Lifestyle balance"],
    philosophy:
      "Wealth and quality of life are not mutually exclusive. This track channels a meaningful portion of surplus into tax-advantaged accounts and diversified ETFs while leaving room for the experiences that make life worthwhile. The goal is steady, consistent growth — not sacrifice.",

    milestones: [
      {
        year: 1,
        title: "Emergency fund + first investments",
        desc: "Establish a 3-month emergency buffer and open your first investment account simultaneously. Even modest early contributions benefit substantially from compounding over a long time horizon.",
        status: "not-started",
        allocation: { deposit: 0, emergency: 40, ra: 30, lifestyle: 30 },
        actions: [
          { id: "b-open-tfsa", text: "Open an Absa Tax-Free Investment Account through Absa Stockbrokers" },
          { id: "b-etf-debit", text: "Set up a monthly ETF debit order for at least R500/month via Absa Stockbrokers" },
          { id: "b-money-market", text: "Park your emergency fund in an Absa MoneyBuilder or 32-day Notice Deposit" },
        ],
      },
      {
        year: 2,
        title: "TFSA maxed, RA contributions begin",
        desc: "Take full advantage of your annual tax-free savings allowance and open a retirement annuity. RA contributions reduce your taxable income by up to 27.5% of gross income — a meaningful return before markets even move.",
        status: "not-started",
        allocation: { deposit: 0, emergency: 15, ra: 50, lifestyle: 35 },
        actions: [
          { id: "b-max-tfsa", text: "Max your Absa TFSA contribution (R46,000/year) into a global index fund" },
          { id: "b-open-ra", text: "Open an Absa Retirement Annuity through Absa Investments" },
          { id: "b-ra-deduction", text: "Contribute up to 27.5% of gross income to your Absa RA for the full tax deduction" },
        ],
      },
      {
        year: 3,
        title: "Offshore diversification begins",
        desc: "Introduce global exposure to hedge against rand depreciation. Offshore investments in world index funds provide currency diversification and access to companies unavailable on the JSE.",
        status: "not-started",
        allocation: { deposit: 0, emergency: 10, ra: 55, lifestyle: 35 },
        actions: [
          { id: "b-offshore-account", text: "Open an Absa Stockbrokers international trading account for offshore exposure" },
          { id: "b-global-etf", text: "Invest in a global index ETF such as MSCI World or S&P 500 through Absa Stockbrokers" },
          { id: "b-allocation-review", text: "Review local-to-offshore split and adjust toward a 60/40 target" },
        ],
      },
      {
        year: 4,
        title: "Contributions scale with income",
        desc: "As your salary grows, resist lifestyle inflation and direct the increment into investments. Your contribution rate matters more than individual fund selection at this stage.",
        status: "not-started",
        allocation: { deposit: 0, emergency: 5, ra: 60, lifestyle: 35 },
        actions: [
          { id: "b-increase-contributions", text: "Increase monthly contributions by your annual salary increase percentage" },
          { id: "b-tax-return", text: "Claim your Absa RA deductions on your SARS eFiling tax return" },
          { id: "b-fee-review", text: "Review your Absa investment portfolio performance and rebalance if needed" },
        ],
      },
      {
        year: 5,
        title: "Consolidated wealth base",
        desc: "You have built a multi-account investment portfolio with real compounding momentum. Shift focus to maintaining discipline, reducing lifestyle creep, and setting a clear 10-year net worth target.",
        status: "not-started",
        allocation: { deposit: 0, emergency: 5, ra: 65, lifestyle: 30 },
        actions: [
          { id: "b-benchmark-review", text: "Review total portfolio performance against benchmark indices" },
          { id: "b-rebalance", text: "Rebalance if any asset class has drifted more than 5% from target" },
          { id: "b-fi-target", text: "Set a 10-year financial independence target with an Absa financial adviser" },
        ],
      },
    ],
  },

  {
    id: "aggressive-global",
    label: "Track C",
    name: "Aggressive Global Investor",
    tagline: "Accelerate with global exposure",
    bestFor: "High savers targeting long-term growth",
    netWorthTarget: "High-growth offshore portfolio",
    sacrifices: ["Local property", "Short-term spending"],
    prioritises: ["Offshore investing", "Compound growth"],
    philosophy:
      "South Africa represents less than 1% of global market capitalisation. For a high earner with a long time horizon, concentrating wealth locally is a structural risk. This track prioritises global index investing from day one, uses every available SA tax wrapper, and builds toward financial independence through disciplined compounding.",

    milestones: [
      {
        year: 1,
        title: "Emergency buffer + offshore entry",
        desc: "Build a lean 3-month emergency fund quickly and begin offshore investing immediately. Rand depreciation is a long-term certainty — early currency diversification is one of the most durable decisions you can make.",
        status: "not-started",
        allocation: { deposit: 0, emergency: 25, ra: 55, lifestyle: 20 },
        actions: [
          { id: "c-offshore-account", text: "Open an Absa Stockbrokers international trading account for offshore exposure" },
          { id: "c-msci-world", text: "Invest in an MSCI World index ETF from your first month via Absa Stockbrokers" },
          { id: "c-lifestyle-cap", text: "Cap lifestyle spending at current levels to maximise investable surplus" },
        ],
      },
      {
        year: 2,
        title: "Max SA tax wrappers before scaling",
        desc: "Before adding more unstructured offshore exposure, maximise your TFSA and RA contributions. South Africa's tax-free savings and RA tax deduction together can save you tens of thousands annually — use them fully.",
        status: "not-started",
        allocation: { deposit: 0, emergency: 10, ra: 65, lifestyle: 25 },
        actions: [
          { id: "c-max-tfsa", text: "Max your Absa TFSA (R46,000/year) into a global equity index fund" },
          { id: "c-ra-275", text: "Contribute 27.5% of gross income to your Absa RA for the maximum tax deduction" },
          { id: "c-offshore-split", text: "Review current offshore exposure vs 40% portfolio target" },
        ],
      },
      {
        year: 3,
        title: "Offshore allocation at full scale",
        desc: "Once SA tax wrappers are saturated, direct additional surplus offshore via a discretionary account. Aim for 40–50% of total investments outside South Africa, spread across global index ETFs.",
        status: "not-started",
        allocation: { deposit: 0, emergency: 5, ra: 70, lifestyle: 25 },
        actions: [
          { id: "c-offshore-40pct", text: "Increase offshore allocation to 40% of monthly investment budget via Absa Stockbrokers" },
          { id: "c-global-etf-options", text: "Evaluate global ETFs available on Absa Stockbrokers: MSCI World, S&P 500, or Nasdaq-100" },
          { id: "c-rand-hedge-review", text: "Review the rand-hedge composition of your total portfolio" },
        ],
      },
      {
        year: 4,
        title: "Portfolio at critical mass",
        desc: "A growing portfolio requires active stewardship. Annual rebalancing and fee reviews prevent return leakage. Avoid performance chasing — stick to your target allocation regardless of short-term market noise.",
        status: "not-started",
        allocation: { deposit: 0, emergency: 5, ra: 70, lifestyle: 25 },
        actions: [
          { id: "c-annual-rebalance", text: "Rebalance your Absa portfolio annually to maintain target allocation" },
          { id: "c-ra-fund-review", text: "Review your Absa RA fund performance against benchmark and switch if needed" },
          { id: "c-discretionary-account", text: "Open an Absa Stockbrokers discretionary account for flexibility beyond TFSA and RA limits" },
        ],
      },
      {
        year: 5,
        title: "FI trajectory confirmed",
        desc: "Your compounding is now doing significant work on your behalf. Shift focus to calculating your financial independence number, protecting your portfolio from lifestyle inflation, and planning the transition from accumulation to drawdown.",
        status: "not-started",
        allocation: { deposit: 0, emergency: 5, ra: 70, lifestyle: 25 },
        actions: [
          { id: "c-fi-number", text: "Calculate your FI number (25× annual expenses using the 4% rule)" },
          { id: "c-planner", text: "Stress-test your projections with an Absa financial adviser" },
          { id: "c-income-diversify", text: "Explore income diversification: consulting income, equity, or side business" },
        ],
      },
    ],
  },

  {
    id: "debt-destroyer",
    label: "Track D",
    name: "Debt Destroyer",
    tagline: "Eliminate debt, rebuild",
    bestFor: "Users with high debt levels",
    netWorthTarget: "Debt-free with surplus income",
    sacrifices: ["Lifestyle spending", "Early investing"],
    prioritises: ["Debt elimination", "Emergency fund", "Interest savings"],
    philosophy:
      "High-interest debt is a guaranteed negative return. Paying off a 20% personal loan is equivalent to earning 20% risk-free — no investment reliably beats that. This track front-loads debt elimination, accepts short-term lifestyle constraints, and then redirects freed cash flow into wealth building from a clean base.",

    milestones: [
      {
        year: 1,
        title: "Debt audit and emergency buffer",
        desc: "List every debt, its interest rate, and minimum payment. Build a small emergency fund to avoid adding new debt when unexpected costs arise. Direct all remaining surplus at your highest-interest obligation.",
        status: "not-started",
        allocation: { deposit: 50, emergency: 30, ra: 5, lifestyle: 15 },
        actions: [
          { id: "d-debt-list", text: "List all debts with balances, interest rates, and minimum payments" },
          { id: "d-emergency-1month", text: "Save 1 month of expenses in a separate account before overpaying debt" },
          { id: "d-avalanche", text: "Direct all surplus at the highest-interest debt first (avalanche method)" },
        ],
      },
      {
        year: 2,
        title: "High-interest debt cleared",
        desc: "Personal loans and credit card balances should be eliminated. Each debt you clear frees up cash flow to attack the next one — the snowball effect accelerates from here.",
        status: "not-started",
        allocation: { deposit: 35, emergency: 20, ra: 15, lifestyle: 30 },
        actions: [
          { id: "d-close-cards", text: "Close or freeze credit cards once paid off to avoid re-accumulation" },
          { id: "d-redirect-payment", text: "Redirect cleared debt payments immediately to the next obligation" },
          { id: "d-credit-score", text: "Check your credit score via Absa Online Banking — it should be improving as debt clears" },
        ],
      },
      {
        year: 3,
        title: "Only low-interest debt remains",
        desc: "Vehicle finance or a student loan may still be in play, but at single-digit interest rates. The maths now favour investing alongside finishing the debt rather than paying it down aggressively.",
        status: "not-started",
        allocation: { deposit: 15, emergency: 15, ra: 35, lifestyle: 35 },
        actions: [
          { id: "d-vehicle-review", text: "Review whether overpaying vehicle finance beats investing at current rates" },
          { id: "d-start-tfsa", text: "Open an Absa Tax-Free Investment Account and begin investing freed-up cash flow" },
          { id: "d-ra-begin", text: "Start Absa RA contributions to reduce taxable income while debt concludes" },
        ],
      },
      {
        year: 4,
        title: "Debt-free, investing begins in earnest",
        desc: "All high-cost debt is eliminated. The cash flow you were using for repayments is now fully redirected to building net worth. Max your tax wrappers and establish an investment routine.",
        status: "not-started",
        allocation: { deposit: 0, emergency: 10, ra: 55, lifestyle: 35 },
        actions: [
          { id: "d-max-tfsa", text: "Max your Absa TFSA contribution (R46,000/year) into a diversified ETF" },
          { id: "d-ra-275", text: "Contribute up to 27.5% of income to your Absa RA for the full tax deduction" },
          { id: "d-net-worth-target", text: "Set a net worth milestone for Year 5 with a specific rand figure" },
        ],
      },
      {
        year: 5,
        title: "Foundation rebuilt, wealth compounding",
        desc: "You are now debt-free with a growing investment portfolio and healthy emergency fund. The discipline applied to debt elimination translates directly into investment discipline. Maintain contribution habits and resist lifestyle inflation.",
        status: "not-started",
        allocation: { deposit: 0, emergency: 5, ra: 60, lifestyle: 35 },
        actions: [
          { id: "d-offshore-entry", text: "Introduce offshore exposure via an Absa Stockbrokers international trading account" },
          { id: "d-contribution-increase", text: "Increase monthly investment contributions by your salary increase percentage" },
          { id: "d-financial-plan", text: "Engage an Absa financial adviser to map the next five years of wealth building" },
        ],
      },
    ],
  },
];
