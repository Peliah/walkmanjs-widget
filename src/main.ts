import { WalkmanWidget } from './widget';
import { ConvexAPI } from './api';
import { shouldShowTour, hasSeenTour, markTourSeen, initTrigger } from './utils/targeting';
import { getOrCreateVisitorId } from './utils/visitor';

declare const __CONVEX_URL__: string;

(async function () {
  const script = document.currentScript as HTMLScriptElement | null;
  if (!script) {
    console.error('WalkmanJS: Could not find script element');
    return;
  }

  const tourId = script.dataset.tourId;
  const apiKey = script.dataset.apiKey;
  const convexUrl = __CONVEX_URL__;

  if (!tourId || !apiKey) {
    console.error('WalkmanJS: Missing data-tour-id or data-api-key');
    return;
  }

  if (!convexUrl) {
    console.error('WalkmanJS: Missing Convex URL');
    return;
  }

  const api = new ConvexAPI(convexUrl);

  try {
    // Validate API key
    const isValid = await api.validateApiKey(apiKey);

    if (!isValid) {
      console.error('WalkmanJS: Invalid API key');
      return;
    }

    // Fetch tour
    const tour = await api.getTour(tourId);

    if (!tour || tour.status !== 'active') {
      console.log('WalkmanJS: Tour not found or not active');
      return;
    }

    // Check targeting
    if (!shouldShowTour(tour.targeting, window.location.href)) {
      console.log('WalkmanJS: URL targeting not matched');
      return;
    }

    if (hasSeenTour(tourId, tour.targeting?.frequency || 'once')) {
      console.log('WalkmanJS: Tour already seen');
      return;
    }

    // Fetch steps
    const steps = await api.getSteps(tourId);

    if (steps.length < 1) {
      console.log('WalkmanJS: No steps found');
      return;
    }

    const sortedSteps = steps.sort((a, b) => a.order - b.order);
    const visitorId = getOrCreateVisitorId();

    // Track event helper
    const trackEvent = async (event: string, stepId?: string) => {
      try {
        await api.trackEvent({ tourId, visitorId, event, stepId });
      } catch (e) {
        console.warn('WalkmanJS: Failed to track event', e);
      }
    };

    // Create widget (now powered by Shepherd.js)
    const widget = new WalkmanWidget({
      tour,
      steps: sortedSteps,
      onStart: () => trackEvent('tour_started'),
      onStepView: (stepId) => trackEvent('step_viewed', stepId),
      onStepComplete: (stepId) => trackEvent('step_completed', stepId),
      onSkip: (stepId) => trackEvent('step_skipped', stepId),
      onComplete: () => {
        trackEvent('tour_completed');
        markTourSeen(tourId, tour.targeting?.frequency || 'once');
      },
      onExit: () => trackEvent('tour_exited'),
    });

    // Handle trigger
    initTrigger(tour.targeting, () => widget.start());

    // Expose global API
    (window as any).WalkmanJS = {
      start: () => widget.start(),
      stop: () => widget.stop(),
      next: () => widget.next(),
      prev: () => widget.prev(),
      goTo: (index: number) => widget.goTo(index),
      isActive: () => widget.isActive(),
      getCurrentStep: () => widget.getCurrentStep(),
    };

    console.log('WalkmanJS: Widget initialized (powered by Shepherd.js)');
  } catch (error) {
    console.error('WalkmanJS: Error initializing widget', error);
  }
})();
