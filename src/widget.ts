import { computePosition, flip, shift, offset, autoUpdate, arrow } from '@floating-ui/dom';
import { createTooltip, updateTooltip, removeTooltip } from './ui/tooltip';
import { createOverlay, removeOverlay, highlightElement } from './ui/overlay';
import { injectStyles } from './ui/styles';
import type { Tour, Step, WidgetOptions, Theme } from './types';

export class WalkmanWidget {
  private tour: Tour;
  private steps: Step[];
  private currentIndex: number = 0;
  private isActive: boolean = false;
  private tooltipEl: HTMLElement | null = null;
  private overlayEl: HTMLElement | null = null;
  private arrowEl: HTMLElement | null = null;
  private cleanupAutoUpdate: (() => void) | null = null;

  private onStart?: () => void;
  private onStepView?: (stepId: string) => void;
  private onStepComplete?: (stepId: string) => void;
  private onSkip?: (stepId: string) => void;
  private onComplete?: () => void;
  private onExit?: () => void;

  constructor(options: WidgetOptions) {
    this.tour = options.tour;
    this.steps = options.steps;
    this.onStart = options.onStart;
    this.onStepView = options.onStepView;
    this.onStepComplete = options.onStepComplete;
    this.onSkip = options.onSkip;
    this.onComplete = options.onComplete;
    this.onExit = options.onExit;

    injectStyles(this.getTheme());
  }

  private getTheme(): Theme {
    return this.tour.theme || {
      primaryColor: '#FF6500',
      backgroundColor: '#FFFFFF',
      textColor: '#0B192C',
      borderRadius: 8,
      overlayEnabled: true,
      overlayOpacity: 0.5,
    };
  }

  start(): void {
    if (this.isActive) return;
    this.isActive = true;
    this.currentIndex = 0;
    this.onStart?.();
    this.showStep();
  }

  stop(): void {
    if (!this.isActive) return;
    this.isActive = false;
    this.cleanup();
    this.onExit?.();
  }

  next(): void {
    if (!this.isActive) return;

    const currentStep = this.steps[this.currentIndex];
    this.onStepComplete?.(currentStep.stepId);

    if (this.currentIndex < this.steps.length - 1) {
      this.currentIndex++;
      this.showStep();
    } else {
      this.complete();
    }
  }

  prev(): void {
    if (!this.isActive || this.currentIndex === 0) return;
    this.currentIndex--;
    this.showStep();
  }

  skip(): void {
    if (!this.isActive) return;

    const currentStep = this.steps[this.currentIndex];
    this.onSkip?.(currentStep.stepId);

    if (this.currentIndex < this.steps.length - 1) {
      this.currentIndex++;
      this.showStep();
    } else {
      this.stop();
    }
  }

  private complete(): void {
    this.isActive = false;
    this.cleanup();
    this.onComplete?.();
  }

  private showStep(): void {
    const step = this.steps[this.currentIndex];
    const targetEl = document.querySelector(step.targetSelector) as HTMLElement | null;

    if (!targetEl) {
      console.warn(`WalkmanJS: Target element not found: ${step.targetSelector}`);
      if (this.currentIndex < this.steps.length - 1) {
        this.currentIndex++;
        this.showStep();
      } else {
        this.complete();
      }
      return;
    }

    this.onStepView?.(step.stepId);

    targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });

    const theme = this.getTheme();

    if (theme.overlayEnabled) {
      if (!this.overlayEl) {
        this.overlayEl = createOverlay(theme.overlayOpacity);
      }
      highlightElement(targetEl);
    }

    if (!this.tooltipEl) {
      this.tooltipEl = createTooltip({
        step,
        currentIndex: this.currentIndex,
        totalSteps: this.steps.length,
        theme,
        onNext: () => this.next(),
        onPrev: () => this.prev(),
        onSkip: () => this.skip(),
        onClose: () => this.stop(),
      });
    } else {
      updateTooltip(this.tooltipEl, {
        step,
        currentIndex: this.currentIndex,
        totalSteps: this.steps.length,
        theme,
        onNext: () => this.next(),
        onPrev: () => this.prev(),
        onSkip: () => this.skip(),
        onClose: () => this.stop(),
      });
    }

    this.positionTooltip(targetEl, step.position);
  }

  private positionTooltip(
    targetEl: HTMLElement,
    position: 'top' | 'bottom' | 'left' | 'right'
  ): void {
    if (!this.tooltipEl) return;

    // Cleanup previous auto-update listener
    if (this.cleanupAutoUpdate) {
      this.cleanupAutoUpdate();
      this.cleanupAutoUpdate = null;
    }

    // Create arrow element if it doesn't exist
    if (!this.arrowEl) {
      this.arrowEl = document.createElement('div');
      this.arrowEl.className = 'wjs-tooltip__arrow';
      this.tooltipEl.appendChild(this.arrowEl);
    }

    const updatePosition = async () => {
      if (!this.tooltipEl || !this.arrowEl) return;

      const { x, y, placement, middlewareData } = await computePosition(targetEl, this.tooltipEl, {
        placement: position,
        middleware: [
          offset(12),
          flip({
            fallbackAxisSideDirection: 'start',
            crossAxis: false,
            padding: 16,
          }),
          shift({ 
            padding: 16,
            crossAxis: true,
            limiter: {
              fn: (state) => {
                // Ensure tooltip stays fully within viewport
                return state;
              },
              options: {}
            }
          }),
          arrow({ element: this.arrowEl, padding: 8 }),
        ],
      });

      // Apply tooltip position
      Object.assign(this.tooltipEl.style, {
        left: `${x}px`,
        top: `${y}px`,
      });

      // Position the arrow
      const arrowX = middlewareData.arrow?.x;
      const arrowY = middlewareData.arrow?.y;
      const staticSide = {
        top: 'bottom',
        right: 'left',
        bottom: 'top',
        left: 'right',
      }[placement.split('-')[0]] as string;

      Object.assign(this.arrowEl.style, {
        left: arrowX != null ? `${arrowX}px` : '',
        top: arrowY != null ? `${arrowY}px` : '',
        right: '',
        bottom: '',
        [staticSide]: '-6px',
      });

      // Update arrow rotation based on placement
      this.arrowEl.dataset.placement = placement;
    };

    // Initial position update
    updatePosition();

    // Auto-update position on scroll, resize, or layout changes
    this.cleanupAutoUpdate = autoUpdate(targetEl, this.tooltipEl, updatePosition, {
      ancestorScroll: true,
      ancestorResize: true,
      elementResize: true,
      layoutShift: true,
    });
  }

  private cleanup(): void {
    // Cleanup auto-update listener
    if (this.cleanupAutoUpdate) {
      this.cleanupAutoUpdate();
      this.cleanupAutoUpdate = null;
    }
    if (this.tooltipEl) {
      removeTooltip(this.tooltipEl);
      this.tooltipEl = null;
    }
    if (this.overlayEl) {
      removeOverlay(this.overlayEl);
      this.overlayEl = null;
    }
    this.arrowEl = null;
  }
}

