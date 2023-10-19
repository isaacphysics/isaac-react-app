import { history, isDefined } from "./";

let previousPathname = "";
history.listen((location, action) => {
  if (["PUSH", "REPLACE"].includes(action) && previousPathname !== location.pathname) {
    previousPathname = location.pathname;
    (window as any).followedAtLeastOneSoftLink = true;
    try {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    } catch (e) {
      // Some older browsers, notably Safari, don't support the new spec used above!
      window.scrollTo(0, 0);
    }
  }
});

export function scrollVerticallyIntoView(element: Element, offset = 0): void {
  const yPosition = element.getBoundingClientRect().top + window.scrollY + offset;
  if (isDefined(yPosition)) {
    window.scrollTo(0, yPosition);
  }
}
