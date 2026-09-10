/**
 * Browser security/ad extensions (Bitdefender `bis_skin_checked`,
 * doubleclick listeners, etc.) inject attributes into SSR HTML before React
 * hydrates. That makes the DOM disagree with the server markup and throws a
 * hydration mismatch even when our components are deterministic.
 *
 * This file runs after the document is loaded and before hydration
 * (Next.js instrumentation-client).
 */
const INJECTED_ATTRIBUTES = [
  "bis_skin_checked",
  "data-doubleclick-listener",
  "data-adblockkey",
] as const;

function stripInjectedAttributes(el: Element) {
  for (const name of INJECTED_ATTRIBUTES) {
    if (el.hasAttribute(name)) el.removeAttribute(name);
  }
}

function stripTree(root: ParentNode) {
  if (root instanceof Element) stripInjectedAttributes(root);
  root.querySelectorAll("*").forEach(stripInjectedAttributes);
}

stripTree(document.documentElement);

const observer = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    if (mutation.type === "attributes" && mutation.target instanceof Element) {
      stripInjectedAttributes(mutation.target);
    }
    if (mutation.type === "childList") {
      mutation.addedNodes.forEach((node) => {
        if (node instanceof Element) stripTree(node);
      });
    }
  }
});

observer.observe(document.documentElement, {
  subtree: true,
  childList: true,
  attributes: true,
  attributeFilter: [...INJECTED_ATTRIBUTES],
});

window.addEventListener(
  "load",
  () => {
    window.setTimeout(() => observer.disconnect(), 2500);
  },
  { once: true },
);
