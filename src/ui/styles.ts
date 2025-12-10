import type { Theme } from '../types';

let stylesInjected = false;

export function injectStyles(theme: Theme): void {
  if (stylesInjected) return;
  stylesInjected = true;

  const styles = `
    .wjs-overlay {
      position: fixed;
      inset: 0;
      background-color: rgba(0, 0, 0, var(--wjs-overlay-opacity, 0.5));
      z-index: 99998;
      opacity: 0;
      transition: opacity 0.2s ease;
      pointer-events: none;
    }

    .wjs-overlay--visible {
      opacity: 1;
    }

    .wjs-highlight {
      position: relative;
      z-index: 99999 !important;
      box-shadow: 0 0 0 4px ${theme.primaryColor}40;
      border-radius: 4px;
    }

    .wjs-tooltip {
      position: fixed;
      z-index: 100000;
      width: 320px;
      max-width: calc(100vw - 24px);
      background-color: ${theme.backgroundColor};
      color: ${theme.textColor};
      border-radius: ${theme.borderRadius}px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05);
      opacity: 0;
      transform: translateY(8px);
      transition: opacity 0.2s ease, transform 0.2s ease;
    }

    .wjs-tooltip--visible {
      opacity: 1;
      transform: translateY(0);
    }

    .wjs-tooltip__arrow {
      position: absolute;
      width: 12px;
      height: 12px;
      background-color: ${theme.backgroundColor};
      transform: rotate(45deg);
      box-shadow: -1px -1px 1px rgba(0, 0, 0, 0.05);
    }

    .wjs-tooltip__arrow[data-placement^="top"] {
      box-shadow: 1px 1px 1px rgba(0, 0, 0, 0.05);
    }

    .wjs-tooltip__arrow[data-placement^="bottom"] {
      box-shadow: -1px -1px 1px rgba(0, 0, 0, 0.05);
    }

    .wjs-tooltip__arrow[data-placement^="left"] {
      box-shadow: 1px -1px 1px rgba(0, 0, 0, 0.05);
    }

    .wjs-tooltip__arrow[data-placement^="right"] {
      box-shadow: -1px 1px 1px rgba(0, 0, 0, 0.05);
    }

    .wjs-tooltip__close {
      position: absolute;
      top: 12px;
      right: 12px;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: none;
      border: none;
      cursor: pointer;
      color: ${theme.textColor}80;
      border-radius: 4px;
      transition: background-color 0.15s ease, color 0.15s ease;
    }

    .wjs-tooltip__close:hover {
      background-color: ${theme.textColor}10;
      color: ${theme.textColor};
    }

    .wjs-tooltip__content {
      padding: 20px 20px 16px;
    }

    .wjs-tooltip__title {
      margin: 0 0 8px;
      font-size: 16px;
      font-weight: 600;
      line-height: 1.3;
      padding-right: 24px;
    }

    .wjs-tooltip__text {
      margin: 0;
      font-size: 14px;
      line-height: 1.5;
      opacity: 0.8;
    }

    .wjs-tooltip__footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 20px;
      border-top: 1px solid ${theme.textColor}10;
    }

    .wjs-tooltip__progress {
      font-size: 12px;
      color: ${theme.textColor}60;
    }

    .wjs-tooltip__actions {
      display: flex;
      gap: 8px;
    }

    .wjs-tooltip__btn {
      padding: 8px 16px;
      font-size: 13px;
      font-weight: 500;
      border: none;
      border-radius: ${Math.max(4, theme.borderRadius - 4)}px;
      cursor: pointer;
      transition: background-color 0.15s ease, opacity 0.15s ease;
    }

    .wjs-tooltip__btn--skip {
      background: none;
      color: ${theme.textColor}60;
      padding: 8px 12px;
    }

    .wjs-tooltip__btn--skip:hover {
      color: ${theme.textColor};
    }

    .wjs-tooltip__btn--prev {
      background-color: ${theme.textColor}10;
      color: ${theme.textColor};
    }

    .wjs-tooltip__btn--prev:hover {
      background-color: ${theme.textColor}20;
    }

    .wjs-tooltip__btn--next {
      background-color: ${theme.primaryColor};
      color: #FFFFFF;
    }

    .wjs-tooltip__btn--next:hover {
      opacity: 0.9;
    }

    @media (max-width: 480px) {
      .wjs-tooltip {
        width: calc(100vw - 24px);
        left: 12px !important;
        right: 12px;
      }

      .wjs-tooltip__footer {
        flex-direction: column;
        gap: 12px;
      }

      .wjs-tooltip__actions {
        width: 100%;
        justify-content: flex-end;
      }
    }
  `;

  const styleEl = document.createElement('style');
  styleEl.id = 'wjs-styles';
  styleEl.textContent = styles;
  document.head.appendChild(styleEl);
}

