/** Run a Pages Router navigation with the native View Transitions API. */
export function prefersReducedMotion() {
  return typeof window !== 'undefined'
    && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}

export function navigateWithViewTransition(navigate) {
  if (typeof document === 'undefined' || prefersReducedMotion() || typeof document.startViewTransition !== 'function') {
    return navigate();
  }
  try {
    const transition = document.startViewTransition(() => navigate());
    transition.finished.catch(() => {});
    return transition.finished;
  } catch {
    return navigate();
  }
}
