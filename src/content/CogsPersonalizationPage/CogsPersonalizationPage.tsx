import { useState, useEffect } from "react";
import "./CogsPersonalizationPage.css";
import ExtensionStorage from "../../objects/ExtensionStorage";
import {
  COGS_STREAM_OPTIONS,
  DEFAULT_COGS_PERSONALIZATION_CONFIG,
  DEFAULT_COGS_STREAMS,
  STREAM_REQUIRED_NOTES,
  normalizeCourseCode,
  parseCourseCodes,
} from "../../objects/CogsPersonalization";
import Schedule from "../../objects/Schedule";
import InfoSquareIcon from "../Icons/InfoSquareIcon";
import SettingInfoModal from "../Setting/SettingInfoModal/SettingInfoModal";

const highlightInfo = (
  <div>
    <p>
      Personalized COGS highlighting colors course cards in Find Course Sections
      based on your stream and completed courses.
    </p>
    <br />
    <p>
      Green: required or module course not yet completed. Grey: already
      scheduled in current worklist/session. Red: conflicts with scheduled
      courses.
    </p>
  </div>
);

const CogsPersonalizationPage = () => {
  const [showInfoModal, setShowInfoModal] = useState<JSX.Element | null>(null);
  const [isEnabled, setIsEnabled] = useState(false);
  const [streamName, setStreamName] = useState(
    DEFAULT_COGS_PERSONALIZATION_CONFIG.selectedStream
  );
  const [requiredCoursesInput, setRequiredCoursesInput] = useState("");
  const [moduleCoursesInput, setModuleCoursesInput] = useState("");
  const [completedCoursesInput, setCompletedCoursesInput] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);
  const [savedBadge, setSavedBadge] = useState(false);

  const extractCompletedCoursesFromPage = (): string[] => {
    const completedCourseCodes = new Set<string>();
    const codeRegex = /\b[A-Z]{3,5}(?:_[A-Z])?\s+[0-9]{2,3}[A-Z]?\b/g;

    const courseContainers = Array.from(
      document.querySelectorAll<HTMLElement>(
        '[data-automation-id="table"], [role="row"], tr'
      )
    );

    for (const container of courseContainers) {
      const text = container.innerText?.trim() ?? "";
      if (!text) continue;

      const matches = text.match(codeRegex) ?? [];
      for (const match of matches) {
        completedCourseCodes.add(normalizeCourseCode(match));
      }
    }

    return Array.from(completedCourseCodes);
  };

  const isLikelyAcademicPage = (): boolean => {
    const href = window.location.href;
    const title = document.title;
    return (
      /myworkday\.com\/ubc\//i.test(href) &&
      (href.includes("10089$") ||
        /Academic\s+Progress|Academic\s+History/i.test(title) ||
        Boolean(
          document.querySelector(
            '[data-automation-id="tabLabel"][title="Academic Progress"], [data-automation-id="tabLabel"][title="Academic History"]'
          )
        ))
    );
  };

  useEffect(() => {
    ExtensionStorage.getCogsPersonalizationConfig().then((config) => {
      const stream =
        DEFAULT_COGS_STREAMS[config.selectedStream] ??
        DEFAULT_COGS_STREAMS[DEFAULT_COGS_PERSONALIZATION_CONFIG.selectedStream];
      setIsEnabled(config.enabled);
      setStreamName(config.selectedStream);
      setRequiredCoursesInput((stream?.requiredCourses ?? []).join("\n"));
      setModuleCoursesInput((stream?.moduleCourses ?? []).join("\n"));
      setCompletedCoursesInput(config.completedCourses.join("\n"));
      setIsLoaded(true);
    });
  }, []);

  // Auto-save with debounce
  useEffect(() => {
    if (!isLoaded) return;

    const timeout = window.setTimeout(async () => {
      const trimmedStreamName =
        streamName.trim() || DEFAULT_COGS_PERSONALIZATION_CONFIG.selectedStream;
      const existingConfig =
        await ExtensionStorage.getCogsPersonalizationConfig();
      await ExtensionStorage.setCogsPersonalizationConfig({
        ...existingConfig,
        enabled: isEnabled,
        selectedStream: trimmedStreamName,
        completedCourses: parseCourseCodes(completedCoursesInput),
      });
      setSavedBadge(true);
      window.setTimeout(() => setSavedBadge(false), 1500);
    }, 400);

    return () => window.clearTimeout(timeout);
  }, [
    isLoaded,
    isEnabled,
    streamName,
    completedCoursesInput,
  ]);

  const toggleEnabled = async (checked: boolean) => {
    setIsEnabled(checked);
    const existingConfig = await ExtensionStorage.getCogsPersonalizationConfig();
    await ExtensionStorage.setCogsPersonalizationConfig({
      ...existingConfig,
      enabled: checked,
    });
  };

  const selectStream = (nextStream: string) => {
    const stream = DEFAULT_COGS_STREAMS[nextStream];

    setStreamName(nextStream);
    setRequiredCoursesInput((stream?.requiredCourses ?? []).join("\n"));
    setModuleCoursesInput((stream?.moduleCourses ?? []).join("\n"));
  };

  const importCompletedCoursesFromCurrentPage = async () => {
    if (!isLikelyAcademicPage()) {
      alert(
        "Open your Workday Academic Progress or Academic History page first, then click import."
      );
      return;
    }

    const completedCoursesFromPage = extractCompletedCoursesFromPage();
    if (completedCoursesFromPage.length === 0) {
      alert(
        "No courses were detected. Expand your academic records/tables on Workday and try again."
      );
      return;
    }

    const mergedCourses = Array.from(
      new Set([
        ...parseCourseCodes(completedCoursesInput),
        ...completedCoursesFromPage,
      ])
    );

    setCompletedCoursesInput(mergedCourses.join("\n"));
    alert(`Imported ${completedCoursesFromPage.length} completed courses.`);
  };

  return (
    <div className="cogs-page-container">
      {showInfoModal && (
        <SettingInfoModal
          onClose={() => setShowInfoModal(null)}
          content={showInfoModal}
        />
      )}

      <div className="cogs-page-header">
        <span className="cogs-page-title">COGS Personalization</span>
        <div className="cogs-page-header-right">
          {savedBadge && <span className="cogs-saved-badge">Saved ✓</span>}
          <InfoSquareIcon
            size={16}
            onClick={() => setShowInfoModal(highlightInfo)}
          />
        </div>
      </div>

      <div className="cogs-page-row">
        <label className="cogs-label">Enable Highlighting</label>
        <label className="cogs-toggle">
          <input
            type="checkbox"
            checked={isEnabled}
            onChange={(e) => toggleEnabled(e.target.checked)}
          />
          <span className="cogs-slider"></span>
        </label>
      </div>

      <div className="cogs-page-field">
        <label className="cogs-field-label">Select Stream</label>
        <div className="cogs-stream-list" role="radiogroup" aria-label="COGS stream selection">
          {COGS_STREAM_OPTIONS.map((option) => {
            const isSelected = streamName === option;
            return (
              <button
                key={option}
                type="button"
                role="radio"
                aria-checked={isSelected}
                className={`cogs-stream-option${isSelected ? " is-selected" : ""}`}
                onClick={() => selectStream(option)}
              >
                <span
                  className={`cogs-stream-check${isSelected ? " is-selected" : ""}`}
                  aria-hidden="true"
                />
                <span className="cogs-stream-label">{option}</span>
              </button>
            );
          })}
        </div>
        <div className="cogs-stream-note">
          {STREAM_REQUIRED_NOTES[
            streamName as keyof typeof STREAM_REQUIRED_NOTES
          ]}
        </div>
        <div className="cogs-progress-note">
          To import completed courses, open your Workday Academic Progress or
          Academic History page, then click the import button below.
        </div>
        <button
          type="button"
          className="cogs-import-btn"
          onClick={importCompletedCoursesFromCurrentPage}
        >
          Import from Academic Progress Page
        </button>
      </div>

      <div className="cogs-page-field">
        <label className="cogs-field-label">
          Required Courses (stream defaults)
        </label>
        <textarea
          className="cogs-textarea"
          value={requiredCoursesInput}
          readOnly
          placeholder={"COGS_V 200\nCOGS_V 201"}
        />
      </div>

      <div className="cogs-page-field">
        <label className="cogs-field-label">
          Module Courses (program defaults)
        </label>
        <textarea
          className="cogs-textarea"
          value={moduleCoursesInput}
          readOnly
          placeholder={"CPSC_V 121\nPSYC_V 101"}
        />
      </div>

      <div className="cogs-page-field">
        <label className="cogs-field-label">
          Completed Courses (one per line or comma separated)
        </label>
        <textarea
          className="cogs-textarea"
          value={completedCoursesInput}
          onChange={(e) => setCompletedCoursesInput(e.target.value)}
          placeholder={"COGS_V 100\nMATH_V 100"}
        />
      </div>

      <button
        type="button"
        className="cogs-reset-btn"
        onClick={async () => {
          if (
            !window.confirm(
              "Reset all COGS data? This will clear your stream selection, completed courses, and entire schedule. This cannot be undone."
            )
          )
            return;

          await ExtensionStorage.setCogsPersonalizationConfig(
            DEFAULT_COGS_PERSONALIZATION_CONFIG
          );
          await ExtensionStorage.setSchedule(new Schedule());

          const defaultStream =
            DEFAULT_COGS_STREAMS[
              DEFAULT_COGS_PERSONALIZATION_CONFIG.selectedStream
            ];
          setIsEnabled(DEFAULT_COGS_PERSONALIZATION_CONFIG.enabled);
          setStreamName(DEFAULT_COGS_PERSONALIZATION_CONFIG.selectedStream);
          setRequiredCoursesInput(
            (defaultStream?.requiredCourses ?? []).join("\n")
          );
          setModuleCoursesInput(
            (defaultStream?.moduleCourses ?? []).join("\n")
          );
          setCompletedCoursesInput("");

          alert("COGS data has been reset.");
        }}
      >
        Reset COGS Data
      </button>

    </div>
  );
};

export default CogsPersonalizationPage;
