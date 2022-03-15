import {history} from "./history";
import { isDefined } from './miscUtils';

// WARNING: the listener here doesn't seem to have an action parameter anywhere to be seen so I'm commenting this block out.
history.listen(_listener => {
    // if (["PUSH", "REPLACE"].includes(action) && previousPathname !== listener.pathname) {
    //     previousPathname = listener.pathname;
    //     (window as any).followedAtLeastOneSoftLink = true;
    //     try {
    //         window.scrollTo({top: 0, left: 0, behavior: "auto"});
    //     } catch (e) {
    //         // Some older browsers, notably Safari, don't support the new spec used above!
    //         window.scrollTo(0, 0);
    //     }
    // }
});

export function scrollVerticallyIntoView(element: Element, offset = 0): void {
    const yPosition = element.getBoundingClientRect().top + window.scrollY + offset;
    if (isDefined(yPosition)) {
        window.scrollTo(0, yPosition);
    }
}
