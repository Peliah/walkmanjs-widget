let highlightEl: HTMLElement | null = null;

export function createOverlay(opacity: number): HTMLElement {
  const overlay = document.createElement('div');
  overlay.className = 'wjs-overlay';
  overlay.style.setProperty('--wjs-overlay-opacity', opacity.toString());
  document.body.appendChild(overlay);

  requestAnimationFrame(() => {
    overlay.classList.add('wjs-overlay--visible');
  });

  return overlay;
}

export function removeOverlay(overlay: HTMLElement): void {
  overlay.classList.remove('wjs-overlay--visible');
  
  if (highlightEl) {
    highlightEl.classList.remove('wjs-highlight');
    highlightEl = null;
  }

  setTimeout(() => {
    overlay.remove();
  }, 200);
}

export function highlightElement(element: HTMLElement): void {
  if (highlightEl) {
    highlightEl.classList.remove('wjs-highlight');
  }

  element.classList.add('wjs-highlight');
  highlightEl = element;
}

