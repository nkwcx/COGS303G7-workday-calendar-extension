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

export const DEFAULT_COGS_PERSONALIZATION_CONFIG: ICogsPersonalizationConfig = {
  enabled: false,
  selectedStream: "Custom Stream",
  streams: {
    "Custom Stream": {
      requiredCourses: [],
      moduleCourses: [],
    },
  },
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
