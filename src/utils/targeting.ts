import type { Targeting } from '../types';

export function shouldShowTour(targeting: Targeting | undefined, currentUrl: string): boolean {
  if (!targeting?.urlPattern) return true;

  switch (targeting.urlMatchType) {
    case 'exact':
      return currentUrl === targeting.urlPattern;
    case 'contains':
      return currentUrl.includes(targeting.urlPattern);
    case 'regex':
      try {
        return new RegExp(targeting.urlPattern).test(currentUrl);
      } catch {
        return false;
      }
    default:
      return true;
  }
}

export function hasSeenTour(tourId: string, frequency: string): boolean {
  const key = `walkmanjs_${tourId}`;

  switch (frequency) {
    case 'once':
      return localStorage.getItem(key) !== null;
    case 'session':
      return sessionStorage.getItem(key) !== null;
    case 'always':
      return false;
    default:
      return false;
  }
}

export function markTourSeen(tourId: string, frequency: string): void {
  const key = `walkmanjs_${tourId}`;

  if (frequency === 'once') {
    localStorage.setItem(key, 'true');
  } else if (frequency === 'session') {
    sessionStorage.setItem(key, 'true');
  }
}

export function initTrigger(targeting: Targeting | undefined, startTour: () => void): void {
  switch (targeting?.triggerType) {
    case 'delay':
      setTimeout(startTour, (targeting.triggerDelay || 0) * 1000);
      break;
    case 'click':
      // For click trigger, the tour is started manually via WalkmanJS.start()
      break;
    case 'pageload':
    default:
      // Wait for DOM to be ready
      if (document.readyState === 'complete') {
        setTimeout(startTour, 100);
      } else {
        window.addEventListener('load', () => setTimeout(startTour, 100));
      }
      break;
  }
}

