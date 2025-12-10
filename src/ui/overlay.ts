let spotlightEl: HTMLElement | null = null;
let previousHighlight: HTMLElement | null = null;

export function createOverlay(opacity: number): HTMLElement {
  const overlay = document.createElement('div');
  overlay.className = 'wjs-overlay';
  overlay.style.setProperty('--wjs-overlay-opacity', opacity.toString());
  document.body.appendChild(overlay);

  // Create spotlight element (the cutout)
  spotlightEl = document.createElement('div');
  spotlightEl.className = 'wjs-spotlight';
  document.body.appendChild(spotlightEl);

  requestAnimationFrame(() => {
    overlay.classList.add('wjs-overlay--visible');
  });

  return overlay;
}

export function removeOverlay(overlay: HTMLElement): void {
  overlay.classList.remove('wjs-overlay--visible');
  
  if (previousHighlight) {
    previousHighlight.classList.remove('wjs-highlight');
    previousHighlight = null;
  }

  if (spotlightEl) {
    spotlightEl.remove();
    spotlightEl = null;
  }

  setTimeout(() => {
    overlay.remove();
  }, 200);
}

export function highlightElement(element: HTMLElement): void {
  // Remove previous highlight
  if (previousHighlight) {
    previousHighlight.classList.remove('wjs-highlight');
  }

  // Add highlight class to element
  element.classList.add('wjs-highlight');
  previousHighlight = element;

  // Position the spotlight cutout around the element
  updateSpotlight(element);

  // Update spotlight on scroll/resize
  const updateHandler = () => updateSpotlight(element);
  window.addEventListener('scroll', updateHandler, { passive: true });
  window.addEventListener('resize', updateHandler, { passive: true });

  // Store cleanup function
  (element as any)._wjsCleanup = () => {
    window.removeEventListener('scroll', updateHandler);
    window.removeEventListener('resize', updateHandler);
  };
}

function updateSpotlight(element: HTMLElement): void {
  if (!spotlightEl) return;

  const rect = element.getBoundingClientRect();
  const padding = 8;

  Object.assign(spotlightEl.style, {
    top: `${rect.top - padding}px`,
    left: `${rect.left - padding}px`,
    width: `${rect.width + padding * 2}px`,
    height: `${rect.height + padding * 2}px`,
  });
}

export function cleanupHighlight(element: HTMLElement): void {
  if ((element as any)._wjsCleanup) {
    (element as any)._wjsCleanup();
    delete (element as any)._wjsCleanup;
  }
  element.classList.remove('wjs-highlight');
}
