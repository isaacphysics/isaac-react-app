import {Dispatch, Middleware, MiddlewareAPI} from "redux";
import {ACTION_TYPE} from "../services/constants";

let lastFocused: Element | null = null;

// When a modal is closed, this tries to focus the last element that was focused before it opened. If no element exists,
// we try to focus the page title. This is for accessibility, mostly to help when navigating the site with a screen-reader.
export const modalFocusMiddleware: Middleware = (api: MiddlewareAPI) => (next: Dispatch) => action => {
    switch (action.type) {
        case ACTION_TYPE.ACTIVE_MODAL_OPEN:
            // Before modal open, record the element that is currently focused
            lastFocused = document.activeElement;
            break;
        case ACTION_TYPE.ACTIVE_MODAL_CLOSE:
            // Before modal close, try to focus the last focused element, otherwise focus the main heading (if it exists)
            if (lastFocused !== null && typeof (lastFocused as HTMLElement)?.focus === "function") {
                (lastFocused as HTMLElement)?.focus();
                lastFocused = null;
            } else {
                document.getElementById("main-heading")?.focus();
            }
    }

    return next(action);
};
