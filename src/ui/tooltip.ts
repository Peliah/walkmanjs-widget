import type { Step, Theme } from '../types';

interface TooltipOptions {
  step: Step;
  currentIndex: number;
  totalSteps: number;
  theme: Theme;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
  onClose: () => void;
}

export function createTooltip(options: TooltipOptions): HTMLElement {
  const tooltip = document.createElement('div');
  tooltip.className = 'wjs-tooltip';
  tooltip.innerHTML = getTooltipHTML(options);
  document.body.appendChild(tooltip);

  attachEventListeners(tooltip, options);

  requestAnimationFrame(() => {
    tooltip.classList.add('wjs-tooltip--visible');
  });

  return tooltip;
}

export function updateTooltip(tooltip: HTMLElement, options: TooltipOptions): void {
  tooltip.classList.remove('wjs-tooltip--visible');

  setTimeout(() => {
    tooltip.innerHTML = getTooltipHTML(options);
    attachEventListeners(tooltip, options);

    requestAnimationFrame(() => {
      tooltip.classList.add('wjs-tooltip--visible');
    });
  }, 150);
}

export function removeTooltip(tooltip: HTMLElement): void {
  tooltip.classList.remove('wjs-tooltip--visible');
  setTimeout(() => {
    tooltip.remove();
  }, 200);
}

function getTooltipHTML(options: TooltipOptions): string {
  const { step, currentIndex, totalSteps } = options;
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === totalSteps - 1;

  return `
    <button class="wjs-tooltip__close" aria-label="Close">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M1 1L13 13M1 13L13 1" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
    </button>
    <div class="wjs-tooltip__content">
      <h4 class="wjs-tooltip__title">${escapeHTML(step.title)}</h4>
      <p class="wjs-tooltip__text">${escapeHTML(step.content)}</p>
    </div>
    <div class="wjs-tooltip__footer">
      <span class="wjs-tooltip__progress">Step ${currentIndex + 1} of ${totalSteps}</span>
      <div class="wjs-tooltip__actions">
        <button class="wjs-tooltip__btn wjs-tooltip__btn--skip">Skip</button>
        ${!isFirst ? '<button class="wjs-tooltip__btn wjs-tooltip__btn--prev">Back</button>' : ''}
        <button class="wjs-tooltip__btn wjs-tooltip__btn--next">
          ${isLast ? 'Finish' : 'Next'}
        </button>
      </div>
    </div>
  `;
}

function attachEventListeners(tooltip: HTMLElement, options: TooltipOptions): void {
  const closeBtn = tooltip.querySelector('.wjs-tooltip__close');
  const skipBtn = tooltip.querySelector('.wjs-tooltip__btn--skip');
  const prevBtn = tooltip.querySelector('.wjs-tooltip__btn--prev');
  const nextBtn = tooltip.querySelector('.wjs-tooltip__btn--next');

  closeBtn?.addEventListener('click', options.onClose);
  skipBtn?.addEventListener('click', options.onSkip);
  prevBtn?.addEventListener('click', options.onPrev);
  nextBtn?.addEventListener('click', options.onNext);
}

function escapeHTML(str: string): string {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

