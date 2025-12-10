import { computePosition, flip, shift, offset } from '@floating-ui/dom';
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

  private async positionTooltip(
    targetEl: HTMLElement,
    position: 'top' | 'bottom' | 'left' | 'right'
  ): Promise<void> {
    if (!this.tooltipEl) return;

    const placement = position;

    const { x, y } = await computePosition(targetEl, this.tooltipEl, {
      placement,
      middleware: [offset(12), flip(), shift({ padding: 8 })],
    });

    Object.assign(this.tooltipEl.style, {
      left: `${x}px`,
      top: `${y}px`,
    });
  }

  private cleanup(): void {
    if (this.tooltipEl) {
      removeTooltip(this.tooltipEl);
      this.tooltipEl = null;
    }
    if (this.overlayEl) {
      removeOverlay(this.overlayEl);
      this.overlayEl = null;
    }
  }
}

