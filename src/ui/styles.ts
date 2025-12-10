import type { Theme } from '../types';

let stylesInjected = false;

export function injectStyles(theme: Theme): void {
  if (stylesInjected) return;
  stylesInjected = true;

  const styles = `
    /* Overlay - covers the entire screen */
    .wjs-overlay {
      position: fixed;
      inset: 0;
      z-index: 99998;
      pointer-events: none;
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .wjs-overlay--visible {
      opacity: 1;
    }

    /* Overlay background using box-shadow on spotlight */
    .wjs-spotlight {
      position: fixed;
      z-index: 99998;
      border-radius: 8px;
      box-shadow: 0 0 0 9999px rgba(0, 0, 0, var(--wjs-overlay-opacity, 0.5));
      transition: top 0.3s ease, left 0.3s ease, width 0.3s ease, height 0.3s ease;
      pointer-events: none;
    }

    /* Highlighted element - clickable and above overlay */
    .wjs-highlight {
      position: relative;
      z-index: 99999 !important;
      pointer-events: auto !important;
    }

    /* Tooltip container */
    .wjs-tooltip {
      position: fixed;
      z-index: 100000;
      width: 340px;
      max-width: calc(100vw - 32px);
      background-color: ${theme.backgroundColor};
      color: ${theme.textColor};
      border-radius: ${theme.borderRadius}px;
      box-shadow: 
        0 20px 25px -5px rgba(0, 0, 0, 0.1),
        0 10px 10px -5px rgba(0, 0, 0, 0.04),
        0 0 0 1px rgba(0, 0, 0, 0.05);
      opacity: 0;
      transform: scale(0.95);
      transition: opacity 0.2s ease, transform 0.2s ease;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    }

    .wjs-tooltip--visible {
      opacity: 1;
      transform: scale(1);
    }

    /* Arrow pointing to target */
    .wjs-tooltip__arrow {
      position: absolute;
      width: 14px;
      height: 14px;
      background-color: ${theme.backgroundColor};
      transform: rotate(45deg);
      z-index: -1;
    }

    .wjs-tooltip__arrow[data-placement^="top"] {
      box-shadow: 1px 1px 1px rgba(0, 0, 0, 0.03);
    }

    .wjs-tooltip__arrow[data-placement^="bottom"] {
      box-shadow: -1px -1px 1px rgba(0, 0, 0, 0.03);
    }

    .wjs-tooltip__arrow[data-placement^="left"] {
      box-shadow: 1px -1px 1px rgba(0, 0, 0, 0.03);
    }

    .wjs-tooltip__arrow[data-placement^="right"] {
      box-shadow: -1px 1px 1px rgba(0, 0, 0, 0.03);
    }

    /* Close button */
    .wjs-tooltip__close {
      position: absolute;
      top: 12px;
      right: 12px;
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: none;
      border: none;
      cursor: pointer;
      color: ${theme.textColor}60;
      border-radius: 6px;
      transition: background-color 0.15s ease, color 0.15s ease;
    }

    .wjs-tooltip__close:hover {
      background-color: ${theme.textColor}10;
      color: ${theme.textColor};
    }

    .wjs-tooltip__close:focus {
      outline: 2px solid ${theme.primaryColor};
      outline-offset: 2px;
    }

    /* Content area */
    .wjs-tooltip__content {
      padding: 24px 24px 16px;
    }

    .wjs-tooltip__title {
      margin: 0 0 8px;
      font-size: 17px;
      font-weight: 600;
      line-height: 1.4;
      padding-right: 28px;
      color: ${theme.textColor};
    }

    .wjs-tooltip__text {
      margin: 0;
      font-size: 14px;
      line-height: 1.6;
      color: ${theme.textColor}B3;
    }

    /* Footer with progress and buttons */
    .wjs-tooltip__footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 24px;
      border-top: 1px solid ${theme.textColor}0D;
      gap: 16px;
    }

    /* Progress indicator */
    .wjs-tooltip__progress {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .wjs-tooltip__progress-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background-color: ${theme.textColor}20;
      transition: background-color 0.2s ease, transform 0.2s ease;
    }

    .wjs-tooltip__progress-dot--active {
      background-color: ${theme.primaryColor};
      transform: scale(1.2);
    }

    .wjs-tooltip__progress-dot--completed {
      background-color: ${theme.primaryColor}80;
    }

    /* Action buttons */
    .wjs-tooltip__actions {
      display: flex;
      gap: 8px;
    }

    .wjs-tooltip__btn {
      padding: 10px 18px;
      font-size: 14px;
      font-weight: 500;
      border: none;
      border-radius: ${Math.max(6, theme.borderRadius - 2)}px;
      cursor: pointer;
      transition: all 0.15s ease;
      font-family: inherit;
    }

    .wjs-tooltip__btn:focus {
      outline: 2px solid ${theme.primaryColor};
      outline-offset: 2px;
    }

    .wjs-tooltip__btn--skip {
      background: transparent;
      color: ${theme.textColor}80;
      padding: 10px 12px;
    }

    .wjs-tooltip__btn--skip:hover {
      color: ${theme.textColor};
      background-color: ${theme.textColor}08;
    }

    .wjs-tooltip__btn--prev {
      background-color: ${theme.textColor}0A;
      color: ${theme.textColor};
    }

    .wjs-tooltip__btn--prev:hover {
      background-color: ${theme.textColor}15;
    }

    .wjs-tooltip__btn--next {
      background-color: ${theme.primaryColor};
      color: #FFFFFF;
    }

    .wjs-tooltip__btn--next:hover {
      background-color: ${theme.primaryColor}E6;
      transform: translateY(-1px);
    }

    .wjs-tooltip__btn--next:active {
      transform: translateY(0);
    }

    /* Keyboard hint */
    .wjs-tooltip__kbd-hint {
      font-size: 11px;
      color: ${theme.textColor}50;
      text-align: center;
      padding: 8px 24px 16px;
    }

    .wjs-tooltip__kbd {
      display: inline-block;
      padding: 2px 6px;
      font-family: monospace;
      font-size: 10px;
      background-color: ${theme.textColor}0A;
      border-radius: 4px;
      margin: 0 2px;
    }

    /* Responsive styles */
    @media (max-width: 480px) {
      .wjs-tooltip {
        width: calc(100vw - 24px);
        max-width: none;
      }

      .wjs-tooltip__content {
        padding: 20px 20px 12px;
      }

      .wjs-tooltip__footer {
        flex-direction: column;
        padding: 12px 20px 16px;
        gap: 12px;
      }

      .wjs-tooltip__progress {
        order: 2;
      }

      .wjs-tooltip__actions {
        width: 100%;
        justify-content: flex-end;
        order: 1;
      }

      .wjs-tooltip__kbd-hint {
        display: none;
      }
    }

    /* Reduced motion */
    @media (prefers-reduced-motion: reduce) {
      .wjs-tooltip,
      .wjs-spotlight,
      .wjs-overlay,
      .wjs-tooltip__btn {
        transition: none;
      }
    }
  `;

  const styleEl = document.createElement('style');
  styleEl.id = 'wjs-styles';
  styleEl.textContent = styles;
  document.head.appendChild(styleEl);
}
