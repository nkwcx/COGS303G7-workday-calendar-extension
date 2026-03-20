import { fetchSectionFromID } from "../backends/workday/idSearchApi";
import {
  CourseHighlightStatus,
  toCourseCodeVariants,
} from "../objects/CogsPersonalization";
import ExtensionStorage from "../objects/ExtensionStorage";
import Schedule from "../objects/Schedule";

const HIGHLIGHT_CLASS_BY_STATUS: Record<CourseHighlightStatus, string> = {
  requiredPending: "cogs-highlight-required",
  modulePending: "cogs-highlight-module",
  scheduled: "cogs-highlight-scheduled",
  conflict: "cogs-highlight-conflict",
};

const ALL_HIGHLIGHT_CLASSES = Object.values(HIGHLIGHT_CLASS_BY_STATUS);

let activeObserver: MutationObserver | null = null;
let highlightRefreshTimer: number | null = null;
let refreshVersion = 0;

const sectionCache = new Map<string, ReturnType<typeof fetchSectionFromID>>();

function isCourseSearchPage(): boolean {
  if (document.title.includes("Find Course Sections")) return true;
  return document.querySelector('[data-automation-id^="selectedItem_15194"]') !== null;
}

function extractCourseIdFromContainer(container: Element): string | null {
  const courseIdElement = container.querySelector(
    '[data-automation-id^="selectedItem_15194"]'
  );

  if (
    !courseIdElement ||
    !(courseIdElement instanceof HTMLElement) ||
    !courseIdElement.dataset.automationId
  ) {
    return null;
  }

  const automationIdParts = courseIdElement.dataset.automationId.split("_");
  const courseId = automationIdParts[1]?.split("$")[1];
  return courseId ?? null;
}

function clearHighlight(container: Element): void {
  container.classList.remove(...ALL_HIGHLIGHT_CLASSES);
  container.removeAttribute("data-cogs-highlight");
  if (container instanceof HTMLElement) {
    container.style.removeProperty("border-left");
    container.style.removeProperty("background-color");
  }
}

function setHighlight(container: Element, status: CourseHighlightStatus): void {
  clearHighlight(container);
  container.classList.add(HIGHLIGHT_CLASS_BY_STATUS[status]);
  container.setAttribute("data-cogs-highlight", status);
  if (!(container instanceof HTMLElement)) return;

  if (status === "requiredPending") {
    container.style.setProperty("border-left", "4px solid #1e7f3f", "important");
    container.style.setProperty(
      "background-color",
      "rgba(30, 127, 63, 0.14)",
      "important"
    );
  } else if (status === "modulePending") {
    container.style.setProperty("border-left", "4px solid #63b47a", "important");
    container.style.setProperty(
      "background-color",
      "rgba(99, 180, 122, 0.13)",
      "important"
    );
  } else if (status === "scheduled") {
    container.style.setProperty("border-left", "4px solid #7d7d7d", "important");
    container.style.setProperty(
      "background-color",
      "rgba(125, 125, 125, 0.16)",
      "important"
    );
  } else {
    container.style.setProperty("border-left", "4px solid #bf2f2f", "important");
    container.style.setProperty(
      "background-color",
      "rgba(191, 47, 47, 0.14)",
      "important"
    );
  }
}

function hasCourseMatch(code: string, normalizedCourseSet: Set<string>): boolean {
  return toCourseCodeVariants(code).some((variant) => normalizedCourseSet.has(variant));
}

function getCachedSection(courseId: string) {
  if (!sectionCache.has(courseId)) {
    sectionCache.set(courseId, fetchSectionFromID(courseId, { silent: true }));
  }
  return sectionCache.get(courseId)!;
}

async function getHighlightStatus(
  courseId: string,
  schedule: Schedule,
  currentSession: string,
  currentWorklist: number,
  requiredCourses: Set<string>,
  moduleCourses: Set<string>,
  completedCourses: Set<string>,
  statusPriority: CourseHighlightStatus[]
): Promise<CourseHighlightStatus | null> {
  const section = await getCachedSection(courseId);
  if (!section) return null;

  section.setWorklistNumber(currentWorklist);
  const code = section.getCode();
  const courseVariants = new Set(toCourseCodeVariants(code));

  const scheduledInCurrentView = schedule
    .getSections()
    .some(
      (scheduledSection) =>
        scheduledSection.getWorklistNumber() === currentWorklist &&
        scheduledSection.getSession() === currentSession &&
        hasCourseMatch(scheduledSection.getCode(), courseVariants)
    );

  const isRequiredCourse = hasCourseMatch(code, requiredCourses);
  const isModuleCourse = hasCourseMatch(code, moduleCourses);
  const isCompleted = hasCourseMatch(code, completedCourses);
  const hasConflict = schedule.getConflictSections(section).length > 0;

  const isTrackedCourse = isRequiredCourse || isModuleCourse;

  const statusFlags: Record<CourseHighlightStatus, boolean> = {
    scheduled: isCompleted || (scheduledInCurrentView && isTrackedCourse),
    conflict: isTrackedCourse && !isCompleted && hasConflict,
    requiredPending: isRequiredCourse && !isCompleted,
    modulePending: !isRequiredCourse && isModuleCourse && !isCompleted,
  };

  for (const status of statusPriority) {
    if (statusFlags[status]) {
      return status;
    }
  }

  return null;
}

async function refreshHighlights(): Promise<void> {
  if (!isCourseSearchPage()) return;

  const localVersion = ++refreshVersion;
  const [config, schedule, currentSession, currentWorklist] = await Promise.all([
    ExtensionStorage.getCogsPersonalizationConfig(),
    ExtensionStorage.getSchedule(),
    ExtensionStorage.getCurrentSession(),
    ExtensionStorage.getCurrentWorklistNumber(),
  ]);

  const courseIdNodes = document.querySelectorAll(
    '[data-automation-id^="selectedItem_15194"]'
  );
  const containers = Array.from(courseIdNodes)
    .map((node) => node.closest('[data-automation-id="compositeContainer"]'))
    .filter((node): node is Element => node !== null);

  if (!config.enabled) {
    containers.forEach(clearHighlight);
    return;
  }

  const selectedStream = config.streams[config.selectedStream];
  if (!selectedStream) {
    containers.forEach(clearHighlight);
    return;
  }

  const requiredCourses = new Set<string>(
    selectedStream.requiredCourses.flatMap((course) => toCourseCodeVariants(course))
  );
  const moduleCourses = new Set<string>(
    selectedStream.moduleCourses.flatMap((course) => toCourseCodeVariants(course))
  );
  const completedCourses = new Set<string>(
    config.completedCourses.flatMap((course) => toCourseCodeVariants(course))
  );

  await Promise.all(
    containers.map(async (container) => {
      if (localVersion !== refreshVersion) return;
      const courseId = extractCourseIdFromContainer(container);
      if (!courseId) {
        clearHighlight(container);
        return;
      }

      try {
        const status = await getHighlightStatus(
          courseId,
          schedule,
          currentSession,
          currentWorklist,
          requiredCourses,
          moduleCourses,
          completedCourses,
          config.statusPriority
        );
        if (localVersion !== refreshVersion) return;
        if (status) {
          setHighlight(container, status);
        } else {
          clearHighlight(container);
        }
      } catch (error) {
        console.error("Failed to compute course highlight", error);
        clearHighlight(container);
      }
    })
  );
}

function scheduleRefresh() {
  if (highlightRefreshTimer !== null) {
    window.clearTimeout(highlightRefreshTimer);
  }
  highlightRefreshTimer = window.setTimeout(() => {
    refreshHighlights();
  }, 250);
}

export function observeDOMAndHighlightCourses(): void {
  if (activeObserver) return;

  activeObserver = new MutationObserver(() => {
    scheduleRefresh();
  });

  activeObserver.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: false,
  });

  chrome.storage.onChanged.addListener((changes) => {
    if (
      changes.cogsPersonalization ||
      changes.schedule ||
      changes.currentSession ||
      changes.currentWorklistNumber
    ) {
      scheduleRefresh();
    }
  });

  scheduleRefresh();
}
