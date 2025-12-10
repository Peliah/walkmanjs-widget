import Shepherd from 'shepherd.js';
import type { Tour as ShepherdTour } from 'shepherd.js';
import type { Tour, Step, WidgetOptions, Theme } from './types';

export class WalkmanWidget {
  private shepherdTour: ShepherdTour;
  private tour: Tour;
  private steps: Step[];
  private stylesInjected: boolean = false;

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

    this.injectStyles();
    this.shepherdTour = this.createTour();
    this.addSteps();
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

  private createTour(): ShepherdTour {
    const theme = this.getTheme();

    const tour = new Shepherd.Tour({
      useModalOverlay: theme.overlayEnabled,
      defaultStepOptions: {
        classes: 'wjs-shepherd-step',
        scrollTo: { behavior: 'smooth', block: 'center' },
        cancelIcon: {
          enabled: true,
        },
      },
      keyboardNavigation: true,
      exitOnEsc: true,
    });

    // Tour events
    tour.on('start', () => {
      this.onStart?.();
    });

    tour.on('complete', () => {
      this.onComplete?.();
    });

    tour.on('cancel', () => {
      this.onExit?.();
    });

    return tour;
  }

  private addSteps(): void {
    this.steps.forEach((step, index) => {
      const isFirst = index === 0;
      const isLast = index === this.steps.length - 1;

      this.shepherdTour.addStep({
        id: step.stepId,
        title: step.title,
        text: step.content,
        attachTo: {
          element: step.targetSelector,
          on: step.position,
        },
        buttons: [
          ...(!isFirst ? [{
            text: 'Back',
            classes: 'wjs-btn wjs-btn--secondary',
            action: () => this.shepherdTour.back(),
          }] : []),
          {
            text: 'Skip',
            classes: 'wjs-btn wjs-btn--skip',
            action: () => {
              this.onSkip?.(step.stepId);
              this.shepherdTour.cancel();
            },
          },
          {
            text: isLast ? 'Finish' : 'Next',
            classes: 'wjs-btn wjs-btn--primary',
            action: () => {
              this.onStepComplete?.(step.stepId);
              if (isLast) {
                this.shepherdTour.complete();
              } else {
                this.shepherdTour.next();
              }
            },
          },
        ],
        when: {
          show: () => {
            this.onStepView?.(step.stepId);
          },
        },
        highlightClass: 'wjs-highlight',
        canClickTarget: true,
      });
    });
  }

  private injectStyles(): void {
    if (this.stylesInjected) return;
    this.stylesInjected = true;

    const theme = this.getTheme();

    // Import Shepherd's base styles
    const shepherdStyles = document.createElement('link');
    shepherdStyles.rel = 'stylesheet';
    shepherdStyles.href = 'https://cdn.jsdelivr.net/npm/shepherd.js@13/dist/css/shepherd.css';
    document.head.appendChild(shepherdStyles);

    // Custom WalkmanJS theme overrides
    const customStyles = document.createElement('style');
    customStyles.id = 'walkmanjs-styles';
    customStyles.textContent = `
      /* WalkmanJS Shepherd Theme */
      .shepherd-modal-overlay-container {
        opacity: ${theme.overlayOpacity} !important;
      }

      .shepherd-element {
        max-width: 380px;
        border-radius: ${theme.borderRadius}px;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        background: ${theme.backgroundColor};
        border: none;
      }

      .shepherd-element[data-popper-placement^='top'] > .shepherd-arrow,
      .shepherd-element[data-popper-placement^='bottom'] > .shepherd-arrow,
      .shepherd-element[data-popper-placement^='left'] > .shepherd-arrow,
      .shepherd-element[data-popper-placement^='right'] > .shepherd-arrow {
        border-color: transparent;
      }

      .shepherd-element .shepherd-arrow:before {
        background: ${theme.backgroundColor};
        border: none;
      }

      .shepherd-header {
        background: transparent;
        padding: 16px 16px 8px;
        border-bottom: none;
      }

      .shepherd-title {
        font-size: 16px;
        font-weight: 600;
        color: ${theme.textColor};
        margin: 0;
      }

      .shepherd-cancel-icon {
        color: ${theme.textColor};
        opacity: 0.4;
        font-size: 24px;
        font-weight: 300;
        transition: opacity 0.2s;
      }

      .shepherd-cancel-icon:hover {
        opacity: 0.8;
      }

      .shepherd-text {
        padding: 0 16px 16px;
        font-size: 14px;
        line-height: 1.6;
        color: ${theme.textColor};
        opacity: 0.7;
      }

      .shepherd-footer {
        padding: 12px 16px 16px;
        border-top: 1px solid rgba(0, 0, 0, 0.06);
        display: flex;
        justify-content: flex-end;
        gap: 8px;
      }

      /* WalkmanJS Buttons */
      .wjs-btn {
        padding: 8px 16px;
        border-radius: ${Math.max(4, theme.borderRadius - 4)}px;
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
        border: none;
        outline: none;
      }

      .wjs-btn--primary {
        background: ${theme.primaryColor};
        color: white;
      }

      .wjs-btn--primary:hover {
        background: ${theme.primaryColor};
        filter: brightness(1.1);
        transform: translateY(-1px);
      }

      .wjs-btn--secondary {
        background: transparent;
        color: ${theme.textColor};
        border: 1px solid rgba(0, 0, 0, 0.1);
      }

      .wjs-btn--secondary:hover {
        background: rgba(0, 0, 0, 0.05);
      }

      .wjs-btn--skip {
        background: transparent;
        color: ${theme.textColor};
        opacity: 0.5;
        padding: 8px 12px;
      }

      .wjs-btn--skip:hover {
        opacity: 0.8;
      }

      /* Highlight Effect */
      .wjs-highlight {
        position: relative !important;
        z-index: 9999 !important;
        box-shadow: 0 0 0 4px ${theme.primaryColor}40, 0 0 0 8px ${theme.primaryColor}20 !important;
        border-radius: 4px;
      }

      /* Animation */
      .shepherd-element {
        animation: wjs-fade-in 0.25s ease-out;
      }

      @keyframes wjs-fade-in {
        from {
          opacity: 0;
          transform: translateY(8px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      /* Keyboard hints */
      .shepherd-footer::after {
        content: '← → to navigate • Esc to close';
        display: block;
        position: absolute;
        bottom: -24px;
        left: 50%;
        transform: translateX(-50%);
        font-size: 11px;
        color: white;
        opacity: 0.6;
        white-space: nowrap;
      }

      /* Mobile responsive */
      @media (max-width: 480px) {
        .shepherd-element {
          max-width: calc(100vw - 32px);
          margin: 16px;
        }

        .shepherd-footer {
          flex-wrap: wrap;
        }

        .shepherd-footer::after {
          display: none;
        }
      }

      /* Reduced motion */
      @media (prefers-reduced-motion: reduce) {
        .shepherd-element {
          animation: none;
        }
      }
    `;
    document.head.appendChild(customStyles);
  }

  start(): void {
    this.shepherdTour.start();
  }

  stop(): void {
    this.shepherdTour.cancel();
  }

  next(): void {
    this.shepherdTour.next();
  }

  prev(): void {
    this.shepherdTour.back();
  }

  goTo(index: number): void {
    const step = this.steps[index];
    if (step) {
      this.shepherdTour.show(step.stepId);
    }
  }

  getCurrentStep(): number {
    const currentStep = this.shepherdTour.getCurrentStep();
    if (!currentStep) return -1;
    return this.steps.findIndex(s => s.stepId === currentStep.id);
  }

  isActive(): boolean {
    return this.shepherdTour.isActive();
  }
}
