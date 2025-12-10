import { WalkmanWidget } from './widget';
import type { Tour, Step } from './types';

declare global {
  interface Window {
    WalkmanJSTest?: {
      tour: Tour;
      steps: Step[];
    };
    WalkmanJS?: {
      start: () => void;
      stop: () => void;
      next: () => void;
      prev: () => void;
    };
  }
}

function init() {
  const testData = window.WalkmanJSTest;

  if (!testData) {
    console.error('WalkmanJS Demo: No test data found');
    return;
  }

  const { tour, steps } = testData;

  const widget = new WalkmanWidget({
    tour,
    steps,
    onStart: () => console.log('Tour started'),
    onStepView: (stepId) => console.log('Step viewed:', stepId),
    onStepComplete: (stepId) => console.log('Step completed:', stepId),
    onSkip: (stepId) => console.log('Step skipped:', stepId),
    onComplete: () => console.log('Tour completed'),
    onExit: () => console.log('Tour exited'),
  });

  window.WalkmanJS = {
    start: () => widget.start(),
    stop: () => widget.stop(),
    next: () => widget.next(),
    prev: () => widget.prev(),
  };

  // Auto-start after a short delay
  setTimeout(() => widget.start(), 500);
}

if (document.readyState === 'complete') {
  init();
} else {
  window.addEventListener('load', init);
}

