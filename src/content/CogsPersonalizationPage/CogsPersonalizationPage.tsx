import { useState, useEffect } from "react";
import "./CogsPersonalizationPage.css";
import ExtensionStorage from "../../objects/ExtensionStorage";
import {
  DEFAULT_COGS_PERSONALIZATION_CONFIG,
  parseCourseCodes,
} from "../../objects/CogsPersonalization";
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
  const [academicProgressUrlInput, setAcademicProgressUrlInput] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);
  const [savedBadge, setSavedBadge] = useState(false);

  useEffect(() => {
    ExtensionStorage.getCogsPersonalizationConfig().then((config) => {
      const stream = config.streams[config.selectedStream];
      setIsEnabled(config.enabled);
      setStreamName(config.selectedStream);
      setRequiredCoursesInput((stream?.requiredCourses ?? []).join("\n"));
      setModuleCoursesInput((stream?.moduleCourses ?? []).join("\n"));
      setCompletedCoursesInput(config.completedCourses.join("\n"));
      setAcademicProgressUrlInput(config.academicProgressUrl);
      setIsLoaded(true);
    });
  }, []);

  // Auto-save with debounce
  useEffect(() => {
    if (!isLoaded) return;

    const timeout = window.setTimeout(async () => {
      const trimmedStreamName = streamName.trim() || "Custom Stream";
      const existingConfig =
        await ExtensionStorage.getCogsPersonalizationConfig();
      await ExtensionStorage.setCogsPersonalizationConfig({
        ...existingConfig,
        enabled: isEnabled,
        selectedStream: trimmedStreamName,
        streams: {
          ...existingConfig.streams,
          [trimmedStreamName]: {
            requiredCourses: parseCourseCodes(requiredCoursesInput),
            moduleCourses: parseCourseCodes(moduleCoursesInput),
          },
        },
        completedCourses: parseCourseCodes(completedCoursesInput),
        academicProgressUrl: academicProgressUrlInput.trim(),
      });
      setSavedBadge(true);
      window.setTimeout(() => setSavedBadge(false), 1500);
    }, 400);

    return () => window.clearTimeout(timeout);
  }, [
    isLoaded,
    isEnabled,
    streamName,
    requiredCoursesInput,
    moduleCoursesInput,
    completedCoursesInput,
    academicProgressUrlInput,
  ]);

  const toggleEnabled = async (checked: boolean) => {
    setIsEnabled(checked);
    const existingConfig = await ExtensionStorage.getCogsPersonalizationConfig();
    await ExtensionStorage.setCogsPersonalizationConfig({
      ...existingConfig,
      enabled: checked,
    });
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
        <label className="cogs-field-label">Stream Name</label>
        <input
          className="cogs-input"
          placeholder="e.g. Computational Intelligence"
          value={streamName}
          onChange={(e) => setStreamName(e.target.value)}
        />
      </div>

      <div className="cogs-page-field">
        <label className="cogs-field-label">
          Required Courses (one per line or comma separated)
        </label>
        <textarea
          className="cogs-textarea"
          value={requiredCoursesInput}
          onChange={(e) => setRequiredCoursesInput(e.target.value)}
          placeholder={"COGS_V 200\nCOGS_V 201"}
        />
      </div>

      <div className="cogs-page-field">
        <label className="cogs-field-label">
          Module Courses (one per line or comma separated)
        </label>
        <textarea
          className="cogs-textarea"
          value={moduleCoursesInput}
          onChange={(e) => setModuleCoursesInput(e.target.value)}
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

      <div className="cogs-page-field">
        <label className="cogs-field-label">Academic Progress URL</label>
        <input
          className="cogs-input"
          placeholder="Paste Workday academic progress page URL"
          value={academicProgressUrlInput}
          onChange={(e) => setAcademicProgressUrlInput(e.target.value)}
        />
      </div>

      <div className="cogs-legend">
        <span className="cogs-legend-title">Highlight Legend</span>
        <div className="cogs-legend-row">
          <span className="cogs-legend-swatch cogs-legend-green" />
          <span>Required / module — not completed</span>
        </div>
        <div className="cogs-legend-row">
          <span className="cogs-legend-swatch cogs-legend-grey" />
          <span>Already scheduled</span>
        </div>
        <div className="cogs-legend-row">
          <span className="cogs-legend-swatch cogs-legend-red" />
          <span>Time conflict</span>
        </div>
      </div>
    </div>
  );
};

export default CogsPersonalizationPage;
