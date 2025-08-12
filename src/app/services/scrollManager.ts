import {isDefined} from "./";
import { Action } from "history";

const hasPageGroupSpecificScroll = (prevPathname: string | undefined, pathname: string, reducedMotion: boolean): boolean => {
    const prevPathnameParts = prevPathname?.split("/") || [];
    const pathnameParts = pathname.split("/");

    // books should only scroll to the page title, not the top of the page, when switching sections
    if (prevPathnameParts[1] === "books" && pathnameParts[1] === "books" && pathnameParts[2] && prevPathnameParts[2] === pathnameParts[2]) {
        if (reducedMotion) return true;

        const pageTitle = document.querySelector("#page-title");
        if (pageTitle) scrollVerticallyIntoView(pageTitle);
        return true;
    }

    return false;
};

export const scrollTopOnPageLoad = (reducedMotion: boolean) => (previousPathname: string | undefined, pathname: string, action: Action) => {
    if (["PUSH", "REPLACE"].includes(action)) {
            
        if (hasPageGroupSpecificScroll(previousPathname, pathname, reducedMotion)) {
            return;
        }
        
        (window as any).followedAtLeastOneSoftLink = true;
        try {
            window.scrollTo({top: 0, left: 0, behavior: reducedMotion ? "instant" : "auto"});
        } catch {
            // Some older browsers, notably Safari, don't support the new spec used above!
            window.scrollTo(0, 0);
        }
    }
};

export function scrollVerticallyIntoView(element: Element, offset = 0): void {
    const yPosition = element.getBoundingClientRect().top + window.scrollY + offset;
    if (isDefined(yPosition)) {
        window.scrollTo(0, yPosition);
    }
}
