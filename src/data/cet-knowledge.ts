/**
 * Structured admission content for the CET Counsellor.
 *
 * This file is the single content source today. It is shaped like CMS
 * documents (colleges, cutoffs, CAP rounds, categories) so it can later be
 * swapped for a headless CMS fetch without touching the chat logic.
 *
 * NOTE: figures below are indicative samples for demonstration and must be
 * replaced with verified official data before students rely on them.
 */

export type SeatCategory = {
  code: string;
  name: string;
  notes: string;
};

export type CollegeCutoff = {
  branch: string;
  /** Closing MHT-CET percentile per category code, Maharashtra State / Home University seats. */
  closingPercentile: Record<string, number>;
};

export type College = {
  id: string;
  name: string;
  shortName: string;
  city: string;
  type: "Government" | "Government-Aided" | "Autonomous" | "Private Unaided";
  dteCode: string;
  cutoffs: CollegeCutoff[];
};

export type CapRound = {
  id: string;
  name: string;
  purpose: string;
  keyPoints: string[];
};

export const seatCategories: SeatCategory[] = [
  { code: "OPEN", name: "Open / General", notes: "No reservation benefit; highest cutoffs." },
  { code: "OBC", name: "Other Backward Class", notes: "Needs caste certificate, caste validity and a Non-Creamy Layer certificate valid for the current financial year." },
  { code: "SC", name: "Scheduled Caste", notes: "Caste certificate and caste validity required. No Non-Creamy Layer needed." },
  { code: "ST", name: "Scheduled Tribe", notes: "Tribe certificate and tribe validity required. No Non-Creamy Layer needed." },
  { code: "VJNT", name: "VJ/DT (NT-A), NT-B, NT-C, NT-D", notes: "Separate sub-categories with separate cutoffs; Non-Creamy Layer certificate required." },
  { code: "SBC", name: "Special Backward Class", notes: "Non-Creamy Layer certificate required." },
  { code: "EWS", name: "Economically Weaker Section", notes: "10% horizontal-style quota for OPEN candidates; needs an EWS eligibility certificate for the current year." },
  { code: "TFWS", name: "Tuition Fee Waiver Scheme", notes: "Up to 5% seats, family income below the notified limit; tuition fee waived, other fees payable. Must be opted for separately in the CAP option form." },
  { code: "PWD", name: "Persons With Disability", notes: "5% horizontal reservation, 40%+ disability certificate from the competent authority." },
  { code: "DEF", name: "Defence", notes: "5% horizontal reservation for children of serving/ex-service personnel; requires a Defence certificate from the Zilla Sainik Board." },
  { code: "EXS", name: "Ex-Servicemen", notes: "Covered inside the Defence quota; discharge book and dependency certificate required." },
  { code: "ORPHAN", name: "Orphan", notes: "1% reservation, certificate from the Women & Child Development department." },
  { code: "MINORITY", name: "Linguistic / Religious Minority", notes: "Applies only in minority-status institutes; needs a minority declaration." },
];

export const capRounds: CapRound[] = [
  {
    id: "registration",
    name: "Registration & Document Verification",
    purpose: "Create the CET CELL application, upload documents and get them verified.",
    keyPoints: [
      "Fill the online application on the State CET Cell portal and pay the fee.",
      "Upload SSC, HSC, CET/JEE scorecard, domicile, caste/validity/Non-Creamy Layer, EWS, PWD or Defence certificates as applicable.",
      "Verification can be online (e-scrutiny) or at a Facilitation Centre.",
      "Provisional merit list is published; raise grievances in the objection window.",
    ],
  },
  {
    id: "cap1",
    name: "CAP Round 1",
    purpose: "First allotment based on merit and your option form preferences.",
    keyPoints: [
      "Fill option form with as many genuine preferences as possible, in true order of liking.",
      "If allotted your first preference you must accept and report; the seat is auto-frozen.",
      "For other allotments choose Freeze (keep seat, exit CAP), Betterment (keep seat, stay for a better one) or Not Accept.",
      "Report online and pay the seat acceptance fee before the deadline or the allotment lapses.",
    ],
  },
  {
    id: "cap2",
    name: "CAP Round 2",
    purpose: "Fresh allotment from vacant, cancelled and newly added seats.",
    keyPoints: [
      "Option form can be edited fully; earlier preferences are not carried forward automatically.",
      "Candidates who chose Betterment in Round 1 keep the old seat if nothing better is allotted.",
      "Cutoffs usually drop slightly compared with Round 1 in most branches.",
    ],
  },
  {
    id: "cap3",
    name: "CAP Round 3",
    purpose: "Final CAP allotment before institute-level rounds.",
    keyPoints: [
      "Allotment in Round 3 is binding; Betterment is not available.",
      "Not reporting after allotment can block you from institute-level admission in some years.",
      "Remaining vacancies then move to institute-level / spot rounds run by colleges.",
    ],
  },
  {
    id: "ilr",
    name: "Institute Level Round (Spot Round)",
    purpose: "Colleges fill leftover and forfeited seats directly.",
    keyPoints: [
      "Apply directly to each college with your CET/JEE score and documents.",
      "Merit lists are published college-wise; there is no central allotment.",
      "Useful for students who missed CAP or want a specific private college.",
    ],
  },
];

export const colleges: College[] = [
  {
    id: "coep",
    name: "College of Engineering, Pune (COEP Technological University)",
    shortName: "COEP",
    city: "Pune",
    type: "Autonomous",
    dteCode: "6006",
    cutoffs: [
      { branch: "Computer Engineering", closingPercentile: { OPEN: 99.74, OBC: 99.36, EWS: 99.55, SC: 97.9, ST: 94.8, VJNT: 97.2, TFWS: 99.5, PWD: 92.1, DEF: 96.4 } },
      { branch: "Electronics & Telecommunication", closingPercentile: { OPEN: 99.1, OBC: 98.3, EWS: 98.7, SC: 95.2, ST: 90.6, VJNT: 94.8, TFWS: 98.6, PWD: 87.5, DEF: 93.2 } },
      { branch: "Mechanical Engineering", closingPercentile: { OPEN: 98.2, OBC: 96.9, EWS: 97.6, SC: 91.4, ST: 86.3, VJNT: 92.5, TFWS: 97.4, PWD: 80.2, DEF: 89.9 } },
    ],
  },
  {
    id: "vjti",
    name: "Veermata Jijabai Technological Institute",
    shortName: "VJTI",
    city: "Mumbai",
    type: "Autonomous",
    dteCode: "3012",
    cutoffs: [
      { branch: "Computer Engineering", closingPercentile: { OPEN: 99.8, OBC: 99.45, EWS: 99.62, SC: 98.3, ST: 95.4, VJNT: 97.8, TFWS: 99.6, PWD: 93.0, DEF: 96.9 } },
      { branch: "Information Technology", closingPercentile: { OPEN: 99.6, OBC: 99.1, EWS: 99.3, SC: 97.4, ST: 93.9, VJNT: 96.9, TFWS: 99.4, PWD: 90.8, DEF: 95.5 } },
      { branch: "Civil Engineering", closingPercentile: { OPEN: 96.8, OBC: 94.5, EWS: 95.9, SC: 86.7, ST: 80.4, VJNT: 89.6, TFWS: 95.7, PWD: 72.3, DEF: 84.1 } },
    ],
  },
  {
    id: "sppu-pict",
    name: "Pune Institute of Computer Technology",
    shortName: "PICT",
    city: "Pune",
    type: "Private Unaided",
    dteCode: "6175",
    cutoffs: [
      { branch: "Computer Engineering", closingPercentile: { OPEN: 99.4, OBC: 98.8, EWS: 99.1, SC: 96.5, ST: 92.7, VJNT: 96.1, TFWS: 99.2, PWD: 88.9, DEF: 94.7 } },
      { branch: "Information Technology", closingPercentile: { OPEN: 99.0, OBC: 98.1, EWS: 98.6, SC: 95.1, ST: 90.2, VJNT: 94.6, TFWS: 98.8, PWD: 85.4, DEF: 92.6 } },
    ],
  },
  {
    id: "sggs",
    name: "Shri Guru Gobind Singhji Institute of Engineering and Technology",
    shortName: "SGGSIE&T",
    city: "Nanded",
    type: "Government-Aided",
    dteCode: "2508",
    cutoffs: [
      { branch: "Computer Science & Engineering", closingPercentile: { OPEN: 98.6, OBC: 97.4, EWS: 98.0, SC: 93.8, ST: 88.5, VJNT: 94.0, TFWS: 98.2, PWD: 82.7, DEF: 91.0 } },
      { branch: "Electrical Engineering", closingPercentile: { OPEN: 95.3, OBC: 92.6, EWS: 94.2, SC: 84.1, ST: 77.9, VJNT: 87.3, TFWS: 94.5, PWD: 68.4, DEF: 81.2 } },
    ],
  },
  {
    id: "gcoea",
    name: "Government College of Engineering, Amravati",
    shortName: "GCOEA",
    city: "Amravati",
    type: "Government",
    dteCode: "1002",
    cutoffs: [
      { branch: "Computer Science & Engineering", closingPercentile: { OPEN: 97.9, OBC: 96.2, EWS: 97.1, SC: 91.8, ST: 85.6, VJNT: 92.4, TFWS: 97.5, PWD: 78.9, DEF: 88.4 } },
      { branch: "Mechanical Engineering", closingPercentile: { OPEN: 92.1, OBC: 88.4, EWS: 90.7, SC: 77.5, ST: 70.2, VJNT: 81.9, TFWS: 91.3, PWD: 60.1, DEF: 74.6 } },
    ],
  },
  {
    id: "wce",
    name: "Walchand College of Engineering",
    shortName: "WCE",
    city: "Sangli",
    type: "Government-Aided",
    dteCode: "6139",
    cutoffs: [
      { branch: "Computer Science & Engineering", closingPercentile: { OPEN: 98.4, OBC: 97.0, EWS: 97.8, SC: 92.9, ST: 87.1, VJNT: 93.5, TFWS: 98.0, PWD: 80.5, DEF: 90.2 } },
      { branch: "Civil Engineering", closingPercentile: { OPEN: 90.6, OBC: 86.2, EWS: 88.9, SC: 74.3, ST: 66.8, VJNT: 79.4, TFWS: 89.7, PWD: 55.2, DEF: 71.0 } },
    ],
  },
];

export const jeeNotes = [
  "JEE Main candidates compete in the same CAP for Maharashtra seats; the CET Cell converts JEE Main percentile into the state merit list for a limited seat share.",
  "A candidate holding both MHT-CET and JEE Main scores is considered in both merit lists, and the better allotment is offered.",
  "Maharashtra domicile decides Home University (HU), Other than Home University (OHU) and State Level seat eligibility.",
  "All India / Outside Maharashtra candidates are eligible only for the limited OMS seat share and pay institute-level fees.",
];

/** Compact context string handed to the model on every conversation. */
export function buildKnowledgeContext(): string {
  const categoryLines = seatCategories
    .map((c) => `- ${c.code} (${c.name}): ${c.notes}`)
    .join("\n");

  const roundLines = capRounds
    .map((r) => `### ${r.name}\nPurpose: ${r.purpose}\n${r.keyPoints.map((p) => `- ${p}`).join("\n")}`)
    .join("\n\n");

  const collegeLines = colleges
    .map((col) => {
      const rows = col.cutoffs
        .map(
          (cut) =>
            `  - ${cut.branch}: ` +
            Object.entries(cut.closingPercentile)
              .map(([cat, pct]) => `${cat} ${pct}`)
              .join(", "),
        )
        .join("\n");
      return `- ${col.name} (${col.shortName}), ${col.city}, ${col.type}, DTE code ${col.dteCode}\n${rows}`;
    })
    .join("\n");

  return [
    "## Seat categories",
    categoryLines,
    "",
    "## CAP rounds",
    roundLines,
    "",
    "## Indicative closing MHT-CET percentiles (Maharashtra State seats, recent year)",
    collegeLines,
    "",
    "## MHT-CET vs JEE notes",
    jeeNotes.map((n) => `- ${n}`).join("\n"),
  ].join("\n");
}
