import {history, isDefined} from "./";

const hasPageGroupSpecificScroll = (prevPathname: string, pathname: string): boolean => {
    const prevPathnameParts = prevPathname.split("/");
    const pathnameParts = pathname.split("/");

    // books
    if (prevPathnameParts[1] === "books" && pathnameParts[1] === "books" && prevPathnameParts[2] === pathnameParts[2]) {
        const pageTitle = document.querySelector("#page-title");
        if (pageTitle) scrollVerticallyIntoView(pageTitle);
        return true;
    }

    return false;
};

let previousPathname = "";
history.listen((location, action) => {
    if (["PUSH", "REPLACE"].includes(action)) {
        
        if (hasPageGroupSpecificScroll(previousPathname, location.pathname)) {
            return;
        }
        
        if (previousPathname !== location.pathname) {
            previousPathname = location.pathname;
            (window as any).followedAtLeastOneSoftLink = true;
            try {
                window.scrollTo({top: 0, left: 0, behavior: "auto"});
            } catch (e) {
                // Some older browsers, notably Safari, don't support the new spec used above!
                window.scrollTo(0, 0);
            }
        }
    }
});

export function scrollVerticallyIntoView(element: Element, offset = 0): void {
    const yPosition = element.getBoundingClientRect().top + window.scrollY + offset;
    if (isDefined(yPosition)) {
        window.scrollTo(0, yPosition);
    }
}
