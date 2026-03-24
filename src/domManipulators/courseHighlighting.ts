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
let legendCollapsed = false;

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

const LEGEND_ITEMS: { color: string; label: string }[] = [
  { color: "#1e7f3f", label: "Required — not completed" },
  { color: "#63b47a", label: "Module — not completed" },
  { color: "#7d7d7d", label: "Scheduled / completed" },
  { color: "#bf2f2f", label: "Time conflict" },
];

function setLegendCollapsed(wrapper: HTMLElement, collapsed: boolean): void {
  legendCollapsed = collapsed;
  const legend = wrapper.querySelector("#cogs-floating-legend") as HTMLElement;
  const toggle = wrapper.querySelector("#cogs-legend-toggle") as HTMLElement;
  if (legend) legend.style.display = collapsed ? "none" : "";
  if (toggle) toggle.style.display = collapsed ? "" : "none";
}

function updateLegendPosition(wrapper: HTMLElement): void {
  const sidebar = document.getElementById("react-container")?.parentElement;
  const isOpen = sidebar?.style.right === "0px";
  wrapper.style.right = isOpen ? "335px" : "20px";
}

function ensureFloatingLegend(visible: boolean): void {
  const existing = document.getElementById("cogs-legend-wrapper");

  if (!visible) {
    if (existing) existing.style.display = "none";
    return;
  }

  if (existing) {
    existing.style.display = "";
    updateLegendPosition(existing);
    return;
  }

  // Wrapper holds both the expanded legend and the collapsed toggle button
  const wrapper = document.createElement("div");
  wrapper.id = "cogs-legend-wrapper";
  updateLegendPosition(wrapper);

  // Re-position when sidebar opens/closes (watches for style changes on sidebar)
  const sidebar = document.getElementById("react-container")?.parentElement;
  if (sidebar) {
    new MutationObserver(() => updateLegendPosition(wrapper)).observe(sidebar, {
      attributes: true,
      attributeFilter: ["style"],
    });
  }

  // Collapsed state: info circle button
  const toggle = document.createElement("button");
  toggle.id = "cogs-legend-toggle";
  toggle.title = "Show highlight legend";
  toggle.textContent = "\u{1F4A1}";
  toggle.addEventListener("click", () => setLegendCollapsed(wrapper, false));

  // Expanded state: full legend panel
  const legend = document.createElement("div");
  legend.id = "cogs-floating-legend";

  const header = document.createElement("div");
  header.className = "cogs-legend-header";
  header.textContent = "COGS Highlights";

  const closeBtn = document.createElement("button");
  closeBtn.className = "cogs-legend-close";
  closeBtn.textContent = "\u00d7";
  closeBtn.title = "Collapse legend";
  closeBtn.addEventListener("click", () => setLegendCollapsed(wrapper, true));
  header.appendChild(closeBtn);
  legend.appendChild(header);

  for (const { color, label } of LEGEND_ITEMS) {
    const item = document.createElement("div");
    item.className = "cogs-legend-item";

    const swatch = document.createElement("span");
    swatch.className = "cogs-legend-swatch";
    swatch.style.backgroundColor = color;

    const text = document.createElement("span");
    text.textContent = label;

    item.appendChild(swatch);
    item.appendChild(text);
    legend.appendChild(item);
  }

  wrapper.appendChild(toggle);
  wrapper.appendChild(legend);
  document.body.appendChild(wrapper);

  // Apply initial collapsed state
  if (legendCollapsed) {
    legend.style.display = "none";
  } else {
    toggle.style.display = "none";
  }
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
    ensureFloatingLegend(false);
    return;
  }

  const selectedStream = config.streams[config.selectedStream];
  if (!selectedStream) {
    containers.forEach(clearHighlight);
    ensureFloatingLegend(false);
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

  ensureFloatingLegend(true);
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
