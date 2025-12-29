import {decorate, isDefined} from "./";
import { Action } from "history";

const hasPageGroupSpecificScroll = (prevPathname: string | undefined, pathname: string, reducedMotion: boolean): boolean => {
    const prevPathnameParts = prevPathname?.split("/") || [];
    const pathnameParts = pathname.split("/");

    // books and revision should only scroll to the page title, not the top of the page, when switching sections
    if (
        (prevPathnameParts[1] === "books" && pathnameParts[1] === "books" && pathnameParts[2] && prevPathnameParts[2] === pathnameParts[2]) ||
        (prevPathnameParts[1] === "revision" && pathnameParts[1] === "revision")
    ) {
        if (reducedMotion) return true;

        const pageTitle = document.querySelector("#page-title");
        if (pageTitle) scrollVerticallyIntoView(pageTitle);
        return true;
    }

    return false;
};

export const scrollTopOnPageLoad = (reducedMotion: boolean) => (previousPathname: string | undefined, pathname: string) => {
    if (hasPageGroupSpecificScroll(previousPathname, pathname, reducedMotion)) {
        return;
    }
    
    (window as any).followedAtLeastOneSoftLink = true;

    safeScrollTo({top: 0, left: 0, behavior: reducedMotion ? "instant" : "auto"});
};

export function scrollVerticallyIntoView(element: Element, offset = 0): void {
    const yPosition = element.getBoundingClientRect().top + window.scrollY + offset;
    if (isDefined(yPosition)) {
        safeScrollTo(0, yPosition);
    }
}

// this function exists to wrap window.scrollTo in both a timeout and a try/catch to fix various browser issues.
// timeout: https://stackoverflow.com/questions/24616322/mobile-safari-why-is-window-scrollto0-0-not-scrolling-to-0-0
// try-catch: https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollTo compatibility table for Safari options.behaviour
const safeScrollTo = decorate(window.scrollTo, original => {
    setTimeout(() => {
        try {
            original();
        } catch {
            window.scrollTo(0, 0);
        }
    }, 10);
});
