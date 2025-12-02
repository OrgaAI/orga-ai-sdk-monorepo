import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import {
  ConnectionState,
  ConversationItem,
  OrgaAudio,
  OrgaVideo,
  useOrgaAI,
} from "@orga-ai/react";
import { baseStyles } from "./styles";
import type { WidgetRuntimeConfig } from "./config";
import { buildCssVariableMap } from "./config";

let stylesInjected = false;
const ORGA_BADGE_ICON_DATA_URI =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iMTgiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik01My44ODQyIDI5Ljk3NzVDNTMuODg0MiAzMC4yMzQyIDUzLjY3NjIgMzAuNDQyIDUzLjQxOTYgMzAuNDQySDUwLjE0NDlDNDAuOTg0MSAzMC40NDIgMzMuNTU3OSAyMy4wMTU4IDMzLjU1NzkgMTMuODU1MVYxMC41ODA0QzMzLjU1NzkgMTAuMzI0IDMzLjc2NTkgMTAuMTE2IDM0LjAyMjYgMTAuMTE2SDQxLjc3MDlDNDguNDYxIDEwLjExNiA1My44ODQyIDE1LjUzOTIgNTMuODg0MiAyMi4yMjlWMjkuOTc3NVpNNTMuODg0MiA0MS43NzFDNTMuODg0MiA0OC40NjA5IDQ4LjQ2MSA1My44ODQgNDEuNzcwOSA1My44ODRIMzQuMDIyNkMzMy43NjU5IDUzLjg4NCAzMy41NTc5IDUzLjY3NjIgMzMuNTU3OSA1My40MTk2VjUwLjE0NDlDMzMuNTU3OSA0MC45ODQyIDQwLjk4NDEgMzMuNTU4IDUwLjE0NDkgMzMuNTU4SDUzLjQxOTZDNTMuNjc2MiAzMy41NTggNTMuODg0MiAzMy43NjYgNTMuODg0MiAzNC4wMjI0VjQxLjc3MVpNMzAuNDQyMSAxMy44NTUxQzMwLjQ0MjEgMjMuMDE1OCAyMy4wMTU5IDMwLjQ0MiAxMy44NTUxIDMwLjQ0MkgxMC41ODA0QzEwLjMyMzggMzAuNDQyIDEwLjExNiAzMC4yMzQyIDEwLjExNiAyOS45Nzc1VjIyLjIyOUMxMC4xMTYgMTUuNTM5MiAxNS41MzkxIDEwLjExNiAyMi4yMjkxIDEwLjExNkgyOS45Nzc3QzMwLjIzNDEgMTAuMTE2IDMwLjQ0MjEgMTAuMzI0IDMwLjQ0MjEgMTAuNTgwNFYxMy44NTUxWk0zMC40NDIxIDUzLjQxOTZDMzAuNDQyMSA1My42NzYyIDMwLjIzNDEgNTMuODg0IDI5Ljk3NzcgNTMuODg0SDIyLjIyOTFDMTUuNTM5MSA1My44ODQgMTAuMTE2IDQ4LjQ2MDkgMTAuMTE2IDQxLjc3MVYzNC4wMjI0QzEwLjExNiAzMy43NjYgMTAuMzIzOCAzMy41NTggMTAuNTgwNCAzMy41NThIMTMuODU1MUMyMy4wMTU5IDMzLjU1OCAzMC40NDIxIDQwLjk4NDIgMzAuNDQyMSA1MC4xNDQ5VjUzLjQxOTZaTTQxLjc3MzcgN0gyMi4yMjYzQzEzLjgzMTUgNyA3IDEzLjgzMTcgNyAyMi4yMjlWNDEuNzczNkM3IDUwLjE3MDkgMTMuODMxNSA1NyAyMi4yMjYzIDU3SDMySDQxLjc3MzdDNTAuMTY4NSA1NyA1NyA1MC4xNzA5IDU3IDQxLjc3MzZWMjIuMjI5QzU3IDEzLjgzMTcgNTAuMTY4NSA3IDQxLjc3MzcgN1oiIGZpbGw9IiMwMzMxNDciLz4KPC9zdmc+Cg==";

const injectBaseStyles = () => {
  if (stylesInjected || typeof document === "undefined") {
    return;
  }

  const styleTag = document.createElement("style");
  styleTag.dataset.orgaWidgetStyles = "true";
  styleTag.innerHTML = baseStyles;
  document.head.appendChild(styleTag);
  stylesInjected = true;
};

const statusLabel: Record<ConnectionState, string> = {
  new: "Ready",
  connecting: "Connecting",
  connected: "Connected",
  disconnected: "Disconnected",
  failed: "Failed",
  closed: "Closed",
};

const formatTimestamp = (timestamp?: string) => {
  if (!timestamp) {
    return "";
  }
  try {
    return new Intl.DateTimeFormat(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(timestamp));
  } catch {
    return "";
  }
};

type WidgetAppProps = {
  config: WidgetRuntimeConfig;
};

export const WidgetApp = ({ config }: WidgetAppProps) => {
  const {
    startSession,
    endSession,
    toggleMic,
    toggleCamera,
    connectionState,
    conversationItems,
    isMicOn,
    isCameraOn,
    aiAudioStream,
    userVideoStream,
  } = useOrgaAI();

  const [error, setError] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const transcriptRef = useRef<HTMLDivElement | null>(null);
  const panelId = useId();
  const isFloatingTheme = config.theme === "floating-badge";
  const [isBadgeOpen, setIsBadgeOpen] = useState(!isFloatingTheme);

  const isConnected = connectionState === "connected";
  const isConnecting = connectionState === "connecting";
  const showTranscript = config.features.transcript === "panel";
  const showVideoPreview = config.features.videoPreview !== "hidden";
  const allowVideoToggle = config.features.videoPreview === "optional";

  useEffect(() => {
    injectBaseStyles();
  }, []);

  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [conversationItems]);

  useEffect(() => {
    if (!isFloatingTheme) {
      setIsBadgeOpen(true);
    }
  }, [config.theme, isFloatingTheme]);

  const handleSessionToggle = async () => {
    setError(null);
    setIsBusy(true);
    try {
      if (isConnected) {
        await endSession();
      } else {
        await startSession();
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to update session";
      setError(message);
    } finally {
      setIsBusy(false);
    }
  };

  const handleMicToggle = async () => {
    setError(null);
    setIsBusy(true);
    try {
      await toggleMic();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to toggle microphone";
      setError(message);
    } finally {
      setIsBusy(false);
    }
  };

  const handleCameraToggle = async () => {
    setError(null);
    setIsBusy(true);
    try {
      await toggleCamera();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to toggle camera";
      setError(message);
    } finally {
      setIsBusy(false);
    }
  };

  const transcript = useMemo<ConversationItem[]>(() => {
    return conversationItems.slice(-50);
  }, [conversationItems]);

  const cssVariables = useMemo(() => buildCssVariableMap(config), [config]);

  const primaryButtonStyle = useMemo<CSSProperties>(
    () => ({
      backgroundColor: config.branding.accentColor,
      color: "#ffffff",
    }),
    [config.branding.accentColor]
  );

  const outlineButtonStyle = useMemo<CSSProperties>(
    () => ({
      borderColor: config.branding.accentColor,
      // Color is handled by CSS variable --orga-widget-button-outline-text
    }),
    [config.branding.accentColor]
  );

  const renderBadgeIcon = () => {
    const badgeIconSrc =
      config.branding.badgeIconUrl || ORGA_BADGE_ICON_DATA_URI;

    return (
      <img
        src={badgeIconSrc}
        alt={config.branding.logoAlt ?? `${config.branding.brandName} logo`}
        className="orga-widget__badge-logo orga-widget__badge-logo--full"
        loading="lazy"
        decoding="async"
      />
    );
  };

  const renderTranscript = () => {
    if (!showTranscript) {
      return null;
    }

    return (
      <div className="orga-widget__transcript" ref={transcriptRef}>
        {transcript.length === 0 ? (
          <p className="orga-widget__empty-state">
            Start a session to see live transcriptions and responses.
          </p>
        ) : (
          transcript.map((item, index) => (
            <div
              key={`${item.conversationId}-${index}`}
              className={`orga-widget__bubble orga-widget__bubble--${item.sender}`}
            >
              <div className="orga-widget__bubble-meta">
                <span>{item.sender === "assistant" ? "Orga" : "You"}</span>
                <span>{formatTimestamp(item.timestamp)}</span>
              </div>
              <p>{item.content.message}</p>
            </div>
          ))
        )}
      </div>
    );
  };

  const videoClassName = useMemo(() => {
    if (config.theme === "full") {
      return "orga-widget__video orga-widget__video--full";
    }
    if (config.theme === "panel") {
      return "orga-widget__video orga-widget__video--panel";
    }
    return "orga-widget__video orga-widget__video--badge";
  }, [config.theme]);

  const bodyClassName = useMemo(() => {
    return [
      "orga-widget__body",
      config.theme === "full" ? "orga-widget__body--full" : "",
    ]
      .filter(Boolean)
      .join(" ");
  }, [config.theme]);

  const renderVideo = () => {
    if (!showVideoPreview) {
      return null;
    }

    return (
      <div className={videoClassName}>
        {isCameraOn && userVideoStream ? (
          <OrgaVideo
            stream={userVideoStream}
            muted
            playsInline
            autoPlay
            data-testid="orga-widget-video"
          />
        ) : (
          <div className="orga-widget__video-placeholder">
            <span>{isCameraOn ? "Loading camera…" : "Camera off"}</span>
          </div>
        )}
        {allowVideoToggle && (
          <button
            type="button"
            className="orga-widget__video-toggle"
            onClick={handleCameraToggle}
            disabled={isBusy || !isConnected}
          >
            {isCameraOn ? "Turn camera off" : "Turn camera on"}
          </button>
        )}
      </div>
    );
  };

  const renderControls = () => {
    return (
      <div className="orga-widget__controls">
        <button
          type="button"
          className={`orga-widget__button ${
            isConnected
              ? "orga-widget__button--danger"
              : "orga-widget__button--primary"
          }`}
          style={primaryButtonStyle}
          onClick={handleSessionToggle}
          disabled={isBusy || isConnecting}
        >
          {isConnected
            ? "Disconnect"
            : isConnecting
            ? "Connecting..."
            : "Start session"}
        </button>

        <button
          type="button"
          className="orga-widget__button orga-widget__button--outline"
          style={outlineButtonStyle}
          onClick={handleMicToggle}
          disabled={!isConnected || isBusy}
        >
          {isMicOn ? "Mute mic" : "Enable mic"}
        </button>

        {allowVideoToggle && (
          <button
            type="button"
            className="orga-widget__button orga-widget__button--outline"
            style={outlineButtonStyle}
            onClick={handleCameraToggle}
            disabled={!isConnected || isBusy}
          >
            {isCameraOn ? "Disable camera" : "Enable camera"}
          </button>
        )}
      </div>
    );
  };

  const renderCloseButton = () => {
    if (!isFloatingTheme) {
      return null;
    }
    return (
      <button
        type="button"
        className="orga-widget__close"
        onClick={() => setIsBadgeOpen(false)}
        aria-label="Close widget"
      >
        ×
      </button>
    );
  };

  const panelClassName = useMemo(() => {
    return "orga-widget__panel";
  }, []);

  const panel = (
    <div className={panelClassName}>
      <div className="orga-widget__header">
        <div className="orga-widget__title">
          <div className="orga-widget__title-row">
            {config.branding.logoUrl && (
              <img
                src={config.branding.logoUrl}
                alt={config.branding.logoAlt ?? config.branding.brandName}
                className="orga-widget__logo"
                loading="lazy"
                decoding="async"
              />
            )}
            <div>
              <h2>{config.branding.brandName}</h2>
              {config.branding.tagline && (
                <span>{config.branding.tagline}</span>
              )}
            </div>
          </div>
        </div>
        <div className="orga-widget__header-actions">
          <span
            className={`orga-widget__status orga-widget__status--${connectionState}`}
          >
            {statusLabel[connectionState]}
          </span>
          {renderCloseButton()}
        </div>
      </div>

      <div className={bodyClassName}>
        {renderVideo()}
        {renderTranscript()}
        {renderControls()}
      </div>

      {error && <div className="orga-widget__error orga-badge_error">{error}</div>}

      <OrgaAudio stream={aiAudioStream} />
    </div>
  );

  if (isFloatingTheme) {
    const hasError = Boolean(error);
    const badgeState = hasError
      ? "error"
      : isConnected
      ? "connected"
      : isConnecting
      ? "connecting"
      : "idle";

    return (
      <div
        className="orga-widget-shell"
        data-theme="floating-badge"
        data-open={isBadgeOpen}
        style={cssVariables}
      >
        {!isBadgeOpen && (
          <button
            type="button"
            className={`orga-widget__badge-button orga-widget__badge-button--${badgeState}`}
            onClick={() => setIsBadgeOpen(true)}
            aria-expanded={isBadgeOpen}
            aria-controls={panelId}
            aria-label={
              hasError
                ? "Widget error. Open to view details."
                : isConnected
                ? "Connected to Orga assistant"
                : "Open Orga assistant"
            }
          >
            <span className="orga-widget__badge-wave" aria-hidden="true" />
            {hasError && (
              <span
                className="orga-widget__badge-error"
                aria-hidden="true"
                title="Widget error"
              >
                !
              </span>
            )}
            {renderBadgeIcon()}
          </button>
        )}
        <div
          id={panelId}
          hidden={!isBadgeOpen}
          aria-hidden={!isBadgeOpen}
        >
          {panel}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`orga-widget-shell orga-widget--${config.theme}`}
      data-theme={config.theme}
      style={cssVariables}
    >
      {panel}
    </div>
  );
};