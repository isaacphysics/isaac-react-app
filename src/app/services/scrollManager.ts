import {history} from "./history";

history.listen((location, action) => {
    if (["PUSH", "REPLACE"].includes(action)) {
        window.scrollTo({top: 0, left: 0, behavior: "auto"});
    }
});

export function scrollVerticallyIntoView(element: Element) {
    const yPosition = element.getBoundingClientRect().top + pageYOffset;
    window.scrollTo(0, yPosition);
}
