export type CourseHighlightStatus =
  | "requiredPending"
  | "scheduled"
  | "conflict";

export interface ICogsStreamDefinition {
  requiredCourses: string[];
  moduleCourses: string[];
}

export interface ICogsPersonalizationConfig {
  enabled: boolean;
  selectedStream: string;
  streams: Record<string, ICogsStreamDefinition>;
  completedCourses: string[];
  academicProgressUrl: string;
  statusPriority: CourseHighlightStatus[];
}

export const COGS_STREAM_OPTIONS = [
  "B.A. Cognition and Brain (Arts PSYC stream)",
  "B.A. Language (Arts LING stream)",
  "B.A. Mind, Language, and Computation (Arts PHIL stream)",
  "B.Sc. Cognition and Brain (Science PSYC stream)",
  "B.Sc. Computational Intelligence and Design (Science CPSC stream)",
] as const;

export type CogsStreamOption = (typeof COGS_STREAM_OPTIONS)[number];

export const STREAM_REQUIRED_NOTES: Record<CogsStreamOption, string> = {
  "B.A. Cognition and Brain (Arts PSYC stream)":
    "Non-course requirements such as communication/elective credits are excluded. For any disjunctions (e.g., one of/two of), all listed options are included for highlighting.",
  "B.A. Language (Arts LING stream)":
    "Non-course requirements such as communication/elective credits are excluded. For any disjunctions (e.g., one of/two of), all listed options are included for highlighting.",
  "B.A. Mind, Language, and Computation (Arts PHIL stream)":
    "Non-course requirements such as communication/elective credits are excluded. For any disjunctions (e.g., one of/three of), all listed options are included for highlighting.",
  "B.Sc. Cognition and Brain (Science PSYC stream)":
    "Non-course requirements such as communication/elective credits are excluded. For any disjunctions (e.g., one of/two of), all listed options are included for highlighting.",
  "B.Sc. Computational Intelligence and Design (Science CPSC stream)":
    "Non-course requirements such as communication/elective credits are excluded. For any disjunctions (e.g., one of), all listed options are included for highlighting.",
};

export const GLOBAL_COGS_MODULE_COURSES = [
  "ANTH 317",
  "ASIA 371",
  "ASIA 378",
  "ASIA 470",
  "ASTU 402",
  "APSC 402",
  "FRST 402",
  "LFS 402",
  "LLED 402",
  "PHAR 402",
  "AUDI 402",
  "AUDI 403",
  "BIOL 371",
  "BIOL 372",
  "BIOL 455",
  "BIOL 458",
  "BIOL 459",
  "CPSC 304",
  "CPSC 310",
  "CPSC 311",
  "CPSC 312",
  "CPSC 313",
  "CPSC 314",
  "CPSC 317",
  "CPSC 319",
  "CPSC 320",
  "CPSC 322",
  "CPSC 330",
  "CPSC 340",
  "CPSC 344",
  "CPSC 368",
  "CPSC 404",
  "CPSC 416",
  "CPSC 420",
  "CPSC 421",
  "CPSC 422",
  "CPSC 425",
  "CPSC 430",
  "CPSC 440",
  "CPSC 444",
  "CPSC 445",
  "CPSC 447",
  "FNEL 380",
  "INFO 300",
  "INFO 419",
  "ISCI 351",
  "KIN 482",
  "LING 300",
  "LING 311",
  "LING 313",
  "LING 314",
  "LING 319",
  "LING 327",
  "LING 342",
  "LING 345",
  "LING 405",
  "LING 410",
  "LING 421",
  "LING 425",
  "LING 431",
  "LING 432",
  "LING 447",
  "LING 451",
  "LING 452",
  "MATH 302",
  "MATH 303",
  "MATH 340",
  "MATH 344",
  "MATH 443",
  "MECH 421",
  "MUSC 320",
  "MUSC 415",
  "NSCI 301",
  "NSCI 302",
  "NSCI 303",
  "NSCI 311",
  "NSCI 401",
  "PHIL 320",
  "PHIL 320A",
  "PHIL 321",
  "PHIL 321A",
  "PHIL 322",
  "PHIL 322A",
  "PHIL 323",
  "PHIL 323A",
  "PHIL 324",
  "PHIL 326",
  "PHIL 326A",
  "PHIL 336",
  "PHIL 340",
  "PHIL 340A",
  "PHIL 351",
  "PHIL 369",
  "PHIL 369A",
  "PHIL 371",
  "PHIL 378",
  "PHIL 441",
  "PHIL 441A",
  "PHIL 441B",
  "PHIL 450",
  "PHIL 450A",
  "PHIL 451",
  "PHIL 451A",
  "PHIL 455",
  "PHIL 455A",
  "PHIL 470",
  "PSYC 301",
  "PSYC 304",
  "PSYC 309",
  "PSYC 309A",
  "PSYC 325",
  "PSYC 333",
  "PSYC 336",
  "PSYC 359",
  "PSYC 361",
  "PSYC 367",
  "PSYC 368",
  "PSYC 370",
  "PSYC 371",
  "PSYC 409",
  "PSYC 460",
  "PSYC 461",
  "PSYC 462",
  "PSYC 472",
  "STAT 301",
  "STAT 302",
  "STAT 306",
  "STAT 344",
  "STAT 406",
  "THTR 399",
];

export const REQUIRED_COURSES_BY_STREAM: Record<CogsStreamOption, string[]> = {
  "B.A. Cognition and Brain (Arts PSYC stream)": [
    "PSYC 100",
    "PSYC 101",
    "PSYC 102",
    "CPSC 110",
    "CPSC 103",
    "CPSC 107",
    "CPSC 121",
    "LING 100",
    "LING 142",
    "LING 209",
    "LING 222",
    "LING 308",
    "LING 433",
    "COGS 200",
    "PSYC 217",
    "PSYC 218",
    "STAT 200",
    "STAT 201",
    "STAT 251",
    "PHIL 220",
    "PHIL 222",
    "COGS 300",
    "COGS 303",
    "COGS 401",
    "COGS 402",
    "PHIL 321",
    "PHIL 326",
    "PHIL 351",
    "PHIL 441",
    "PHIL 451",
    "PHIL 455",
    "PSYC 365",
  ],
  "B.A. Language (Arts LING stream)": [
    "LING 100",
    "LING 142",
    "LING 209",
    "LING 222",
    "LING 308",
    "LING 433",
    "PSYC 100",
    "PSYC 101",
    "PSYC 102",
    "CPSC 110",
    "CPSC 103",
    "CPSC 107",
    "CPSC 121",
    "COGS 200",
    "LING 200",
    "LING 201",
    "PSYC 217",
    "PSYC 218",
    "STAT 200",
    "STAT 201",
    "STAT 251",
    "PHIL 220",
    "PHIL 222",
    "COGS 300",
    "COGS 303",
    "COGS 401",
    "COGS 402",
    "PHIL 321",
    "PHIL 326",
    "PHIL 351",
    "PHIL 441",
    "PHIL 451",
    "PHIL 455",
    "PSYC 365",
  ],
  "B.A. Mind, Language, and Computation (Arts PHIL stream)": [
    "PSYC 100",
    "PSYC 101",
    "PSYC 102",
    "CPSC 110",
    "CPSC 103",
    "CPSC 107",
    "CPSC 121",
    "LING 100",
    "LING 142",
    "LING 209",
    "LING 222",
    "LING 308",
    "LING 433",
    "COGS 200",
    "PHIL 220",
    "PHIL 222",
    "PHIL 240",
    "PHIL 250",
    "STAT 200",
    "STAT 201",
    "STAT 251",
    "PSYC 218",
    "COGS 300",
    "COGS 303",
    "COGS 401",
    "COGS 402",
    "PSYC 304",
    "PSYC 324",
    "PSYC 344",
    "PSYC 309",
    "PSYC 365",
    "PHIL 321",
    "PHIL 326",
    "PHIL 351",
    "PHIL 441",
    "PHIL 451",
    "PHIL 455",
  ],
  "B.Sc. Cognition and Brain (Science PSYC stream)": [
    "SCIE 113",
    "CPSC 110",
    "CPSC 103",
    "CPSC 107",
    "CPSC 121",
    "MATH 100",
    "MATH 110",
    "MATH 120",
    "MATH 180",
    "MATH 101",
    "MATH 121",
    "COGS 200",
    "LING 100",
    "LING 142",
    "LING 209",
    "LING 222",
    "LING 308",
    "LING 345",
    "LING 433",
    "PHIL 220",
    "PHIL 222",
    "PSYC 100",
    "PSYC 101",
    "PSYC 102",
    "STAT 200",
    "STAT 201",
    "COGS 300",
    "COGS 303",
    "COGS 401",
    "COGS 402",
    "PHIL 321",
    "PHIL 326",
    "PHIL 351",
    "PHIL 441",
    "PHIL 451",
    "PHIL 455",
    "PSYC 365",
  ],
  "B.Sc. Computational Intelligence and Design (Science CPSC stream)": [
    "SCIE 113",
    "CPSC 110",
    "CPSC 103",
    "CPSC 107",
    "CPSC 121",
    "MATH 100",
    "MATH 110",
    "MATH 120",
    "MATH 180",
    "MATH 101",
    "MATH 121",
    "COGS 200",
    "CPSC 210",
    "CPSC 221",
    "LING 100",
    "LING 142",
    "LING 209",
    "LING 222",
    "LING 308",
    "LING 345",
    "LING 433",
    "PHIL 220",
    "PHIL 222",
    "STAT 200",
    "STAT 201",
    "STAT 251",
    "COGS 300",
    "COGS 303",
    "COGS 401",
    "COGS 402",
    "CPSC 320",
    "CPSC 322",
    "DSCI 320",
    "CPSC 330",
    "CPSC 340",
    "PHIL 321",
    "PHIL 326",
    "PHIL 351",
    "PHIL 441",
    "PHIL 451",
    "PHIL 455",
    "PSYC 365",
  ],
};

export const DEFAULT_COGS_STREAMS: Record<string, ICogsStreamDefinition> =
  Object.fromEntries(
    COGS_STREAM_OPTIONS.map((streamName) => [
      streamName,
      {
        requiredCourses: REQUIRED_COURSES_BY_STREAM[streamName],
        moduleCourses: GLOBAL_COGS_MODULE_COURSES,
      },
    ])
  );

export const DEFAULT_COGS_PERSONALIZATION_CONFIG: ICogsPersonalizationConfig = {
  enabled: false,
  selectedStream: COGS_STREAM_OPTIONS[0],
  streams: DEFAULT_COGS_STREAMS,
  completedCourses: [],
  academicProgressUrl: "",
  statusPriority: ["scheduled", "conflict", "requiredPending"],
};

export function normalizeCourseCode(input: string): string {
  return input.trim().toUpperCase().replace(/\s+/g, " ");
}

function extractSubjectAndNumber(input: string): {
  subject: string;
  campus: string;
  number: string;
} | null {
  const normalized = normalizeCourseCode(input);
  if (!normalized) return null;

  const match = normalized.match(
    /\b([A-Z]{3,5})(?:_([A-Z]))?\s*([0-9]{2,3}[A-Z]?)\b/
  );
  if (!match) return null;

  return {
    subject: match[1],
    campus: match[2] ?? "",
    number: match[3],
  };
}

export function toCourseCodeVariants(code: string): string[] {
  const normalized = normalizeCourseCode(code);
  if (!normalized) return [];

  const extracted = extractSubjectAndNumber(normalized);
  if (!extracted) {
    const withoutCampus = normalized.replace(/_([A-Z])(?=\s*\d)/, "");
    return Array.from(new Set([normalized, withoutCampus]));
  }

  const withCampus = extracted.campus
    ? `${extracted.subject}_${extracted.campus} ${extracted.number}`
    : `${extracted.subject} ${extracted.number}`;
  const withoutCampus = `${extracted.subject} ${extracted.number}`;
  const tightNoSpace = `${extracted.subject}${extracted.number}`;

  return Array.from(new Set([normalized, withCampus, withoutCampus, tightNoSpace]));
}

export function parseCourseCodes(rawText: string): string[] {
  return rawText
    .split(/[\n,]/)
    .map((value) => {
      const extracted = extractSubjectAndNumber(value);
      if (extracted) {
        return extracted.campus
          ? `${extracted.subject}_${extracted.campus} ${extracted.number}`
          : `${extracted.subject} ${extracted.number}`;
      }
      return normalizeCourseCode(value);
    })
    .filter((value) => value.length > 0);
}
