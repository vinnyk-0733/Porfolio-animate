export interface VisualActivity {
  active: boolean;
  reducedMotion: boolean;
  compact: boolean;
  touch: boolean;
}

type Listener = () => void;
const scrollListeners = new Set<Listener>();
let scrolling = false;
let scrollTimer: ReturnType<typeof setTimeout> | undefined;

function onScroll() {
  if (!scrolling) {
    scrolling = true;
    document.documentElement.dataset.visualScrolling = "true";
    scrollListeners.forEach((listener) => listener());
  }
  clearTimeout(scrollTimer);
  scrollTimer = setTimeout(() => {
    scrolling = false;
    delete document.documentElement.dataset.visualScrolling;
    scrollListeners.forEach((listener) => listener());
  }, 180);
}

function subscribeScroll(listener: Listener) {
  if (scrollListeners.size === 0) {
    // Capture scrolls from nested panels too, without blocking touch input.
    window.addEventListener("scroll", onScroll, { passive: true, capture: true });
  }
  scrollListeners.add(listener);
  return () => {
    scrollListeners.delete(listener);
    if (scrollListeners.size === 0) {
      window.removeEventListener("scroll", onScroll, true);
      clearTimeout(scrollTimer);
      scrolling = false;
      delete document.documentElement.dataset.visualScrolling;
    }
  };
}

/** Notify only on activity transitions; never drive React state on scroll frames. */
export function watchVisualActivity(
  element: Element,
  callback: (state: VisualActivity) => void,
  { pauseOffscreen = true, pauseOnScroll = true }: {
    pauseOffscreen?: boolean;
    pauseOnScroll?: boolean;
  } = {},
): () => void {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const compact = window.matchMedia("(max-width: 767px)");
  const touch = window.matchMedia("(hover: none), (pointer: coarse)");
  const bounds = element.getBoundingClientRect();
  let inView = bounds.width > 0 && bounds.height > 0 && bounds.bottom > 0
    && bounds.right > 0 && bounds.top < window.innerHeight && bounds.left < window.innerWidth;
  let previous = "";
  let disposed = false;
  const notify = () => {
    if (disposed) return;
    const state: VisualActivity = {
      active: (!pauseOffscreen || inView) && !document.hidden && (!pauseOnScroll || !scrolling),
      reducedMotion: reduced.matches,
      compact: compact.matches,
      touch: touch.matches,
    };
    const signature = `${state.active}/${state.reducedMotion}/${state.compact}/${state.touch}`;
    if (signature === previous) return;
    previous = signature;
    callback(state);
  };
  const unsubscribe = pauseOnScroll ? subscribeScroll(notify) : () => {};
  const observer = pauseOffscreen ? new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting && entry.intersectionRatio > 0;
    notify();
  }) : null;
  observer?.observe(element);
  document.addEventListener("visibilitychange", notify);
  reduced.addEventListener("change", notify);
  compact.addEventListener("change", notify);
  touch.addEventListener("change", notify);
  notify();

  return () => {
    disposed = true;
    observer?.disconnect();
    document.removeEventListener("visibilitychange", notify);
    reduced.removeEventListener("change", notify);
    compact.removeEventListener("change", notify);
    touch.removeEventListener("change", notify);
    unsubscribe();
  };
}
