import {history} from "./history";

history.listen((location, action) => {
    if (["PUSH", "REPLACE"].includes(action)) {
        (window as any).followedAtLeastOneSoftLink = true;
        window.scrollTo({top: 0, left: 0, behavior: "auto"});
    }
});

export function scrollVerticallyIntoView(element: Element, offset: number = 0) {
    const yPosition = element.getBoundingClientRect().top + pageYOffset + offset;
    window.scrollTo(0, yPosition);
}
