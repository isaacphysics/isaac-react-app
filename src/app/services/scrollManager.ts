import {history} from "./history";

history.listen((location, action) => {
    if (["PUSH", "REPLACE"].includes(action)) {
        (window as any).followedAtLeastOneSoftLink = true;
        try {
            window.scrollTo({top: 0, left: 0, behavior: "auto"});
        } catch (e) {
            // Some older browsers, notably Safari, don't support the new spec used above!
            window.scrollTo(0, 0);
        }
    }
});

export function scrollVerticallyIntoView(element: Element) {
    const yPosition = element.getBoundingClientRect().top + pageYOffset;
    if (yPosition) {
        window.scrollTo(0, yPosition);
    }
}
