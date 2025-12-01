const baseStyles = `
:root {
  --orga-widget-font: "Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --orga-widget-bg: #ffffff;
  --orga-widget-border: #e2e8f0;
  --orga-widget-shadow: 0 12px 30px rgba(15, 23, 42, 0.18);
  --orga-widget-primary: #0f172a;
  --orga-widget-secondary: #475569;
  --orga-widget-accent: #2D9FBC;
//   --orga-widget-accent: #033147;
  --orga-widget-success: #10b981;
  --orga-widget-error: #ef4444;
  --orga-widget-radius: 18px;
}

.orga-widget-shell {
  position: relative;
}

.orga-widget-shell[data-theme="floating-badge"] {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 2147483646;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 12px;
}

.orga-widget__badge-button {
  width: 64px;
  height: 64px;
  border-radius: 999px;
  border: none;
  background: var(--orga-widget-accent);
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 15px 35px rgba(37, 99, 235, 0.35);
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  position: relative;
  overflow: visible;
}

.orga-widget__badge-button:hover {
  transform: translateY(-2px) scale(1.03);
}

.orga-widget__badge-button:active {
  transform: scale(0.97);
}

.orga-widget__badge-logo {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  object-fit: contain;
  position: relative;
  z-index: 1;
}

.orga-widget__badge-button::after {
  content: "";
  position: absolute;
  inset: -6px;
  border-radius: 999px;
  border: 2px solid transparent;
  opacity: 0;
  pointer-events: none;
}

.orga-widget__badge-button--connecting::after {
  border-color: var(--orga-widget-accent);
  opacity: 0.7;
  animation: orga-badge-pulse 1.4s ease-in-out infinite;
}

.orga-widget__badge-button--connected::after {
  border-color: var(--orga-widget-success);
  opacity: 0.9;
  animation: orga-badge-glow 1.8s ease-in-out infinite;
}

.orga-widget__badge-button--error::after {
  border-color: var(--orga-widget-error);
  opacity: 1;
  animation: orga-badge-error 1.1s ease-in-out infinite;
}

.orga-widget__badge-wave {
  position: absolute;
  inset: 18px;
  display: inline-flex;
  width: 28px;
  height: 24px;
  align-items: center;
  justify-content: center;
  opacity: 0.9;
  animation: orga-wave 1.2s ease-in-out infinite;
  z-index: 0;
  pointer-events: none;
}

.orga-widget__badge-wave::before,
.orga-widget__badge-wave::after {
  content: "";
  position: absolute;
  width: 3px;
  border-radius: 999px;
  background: #fff;
  bottom: 6px;
  opacity: 0.8;
}

.orga-widget__badge-wave::before {
  height: 12px;
  transform: translateX(-6px);
  animation: orga-wave 1.2s ease-in-out infinite;
}

.orga-widget__badge-wave::after {
  height: 8px;
  transform: translateX(6px);
  animation: orga-wave 1.2s ease-in-out infinite reverse;
}

.orga-widget__badge-error {
  position: absolute;
  top: -4px;
  right: -4px;
  width: 18px;
  height: 18px;
  border-radius: 999px;
  background: var(--orga-widget-error);
  color: #fff;
  font-size: 0.75rem;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 10px rgba(239, 68, 68, 0.35);
}

.orga-widget__panel {
  margin-top: 16px;
  font-family: var(--orga-widget-font);
  width: 360px;
  max-width: 100%;
  background: var(--orga-widget-bg);
  border: 1px solid var(--orga-widget-border);
  border-radius: var(--orga-widget-radius);
  box-shadow: var(--orga-widget-shadow);
  color: var(--orga-widget-primary);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.orga-widget-shell[data-theme="floating-badge"] .orga-widget__panel {
  margin-top: 0;
}

.orga-widget--panel .orga-widget__panel {
  position: relative;
}

.orga-widget--full .orga-widget__panel {
  width: min(680px, 100vw);
  height: min(680px, 100vh);
}

.orga-widget--full .orga-widget__body {
  flex: 1;
}

.orga-widget__header {
  padding: 16px 20px;
  border-bottom: 1px solid var(--orga-widget-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.orga-widget__title {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.orga-widget__title-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.orga-widget__logo {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  object-fit: contain;
  background: #fff;
  border: 1px solid rgba(15, 23, 42, 0.08);
}

.orga-widget__title h2 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
}

.orga-widget__title span {
  font-size: 0.8rem;
  color: var(--orga-widget-secondary);
}

.orga-widget__status {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 999px;
  text-transform: capitalize;
  background: #f1f5f9;
  color: var(--orga-widget-secondary);
}

.orga-widget__status--connected {
  background: rgba(16, 185, 129, 0.15);
  color: var(--orga-widget-success);
}

.orga-widget__status--connecting {
  background: rgba(37, 99, 235, 0.15);
  color: var(--orga-widget-accent);
}

.orga-widget__header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.orga-widget__close {
  border: none;
  background: transparent;
  color: var(--orga-widget-secondary);
  font-size: 1.25rem;
  cursor: pointer;
  line-height: 1;
  padding: 0 4px;
}

.orga-widget__body {
  padding: 16px 20px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
}

.orga-widget__body--full {
  gap: 16px;
}

.orga-widget__video {
  border: 1px solid var(--orga-widget-border);
  border-radius: 14px;
  overflow: hidden;
  background: #0f172a;
  position: relative;
  min-height: 140px;
  flex: 0 0 auto;
}

.orga-widget__video--panel {
  min-height: 200px;
}

.orga-widget__video--full {
  min-height: clamp(260px, 55vh, 420px);
  flex: 1 1 auto;
}

.orga-widget__video--badge {
  min-height: 150px;
}

.orga-widget__video video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.orga-widget__video-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 0.85rem;
  gap: 8px;
}

.orga-widget__video-toggle {
  position: absolute;
  bottom: 12px;
  right: 12px;
  background: rgba(15, 23, 42, 0.65);
  color: #fff;
  border: none;
  border-radius: 999px;
  padding: 6px 12px;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  backdrop-filter: blur(4px);
}

.orga-widget__transcript {
  border: 1px solid var(--orga-widget-border);
  border-radius: calc(var(--orga-widget-radius) - 4px);
  padding: 12px;
  max-height: 220px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: #f8fafc;
}

.orga-widget__empty-state {
  font-size: 0.85rem;
  color: var(--orga-widget-secondary);
  text-align: center;
}

.orga-widget__bubble {
  border-radius: 12px;
  padding: 10px 12px;
  font-size: 0.85rem;
  line-height: 1.4;
  max-width: 90%;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.08);
}

.orga-widget__bubble--assistant {
  align-self: flex-start;
  background: #ffffff;
  border: 1px solid var(--orga-widget-border);
}

.orga-widget__bubble--user {
  align-self: flex-end;
  background: var(--orga-widget-accent);
  color: #fff;
}

.orga-widget__bubble-meta {
  font-size: 0.7rem;
  opacity: 0.8;
  margin-bottom: 4px;
  display: flex;
  justify-content: space-between;
  gap: 8px;
}

.orga-widget__controls {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.orga-widget__button {
  flex: 1 1 auto;
  border: none;
  border-radius: 999px;
  padding: 10px 14px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s ease, transform 0.1s ease;
}

.orga-widget__button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.orga-widget__button--primary {
  background: var(--orga-widget-accent);
  color: #fff;
}

.orga-widget__button--danger {
  background: var(--orga-widget-error);
  color: #fff;
}

.orga-widget__button--outline {
  background: transparent;
  border: 1px solid var(--orga-widget-border);
  color: var(--orga-widget-primary);
}

.orga-widget__hint {
  font-size: 0.75rem;
  color: var(--orga-widget-secondary);
  text-align: center;
}

.orga-widget__error {
  background: rgba(239, 68, 68, 0.1);
  color: var(--orga-widget-error);
  font-size: 0.8rem;
  padding: 10px 12px;
  margin: 0 20px 16px;
  border-radius: 10px;
}

.orga-widget__footer {
  padding: 0 20px 16px;
  font-size: 0.75rem;
  color: var(--orga-widget-secondary);
  text-align: center;
}

.orga-widget__panel-footer {
  margin-top: auto;
}

@keyframes orga-badge-pulse {
  0% {
    transform: scale(0.95);
    opacity: 0.4;
  }
  50% {
    transform: scale(1);
    opacity: 0.9;
  }
  100% {
    transform: scale(0.95);
    opacity: 0.4;
  }
}

@keyframes orga-badge-glow {
  0% {
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.45);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(16, 185, 129, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
  }
}

@keyframes orga-badge-error {
  0% {
    transform: scale(0.95);
    opacity: 0.8;
  }
  50% {
    transform: scale(1.05);
    opacity: 1;
  }
  100% {
    transform: scale(0.95);
    opacity: 0.8;
  }
}

@keyframes orga-wave {
  0% {
    transform: translateY(0) scaleY(0.8);
    opacity: 0.7;
  }
  50% {
    transform: translateY(-2px) scaleY(1.1);
    opacity: 1;
  }
  100% {
    transform: translateY(0) scaleY(0.8);
    opacity: 0.7;
  }
}
`;

export { baseStyles };