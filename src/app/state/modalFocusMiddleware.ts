import {Dispatch, Middleware, MiddlewareAPI} from "redux";
import {ACTION_TYPE} from "../services/constants";

const lastFocusedStack: Element[] = [];

// When a modal is closed, this tries to focus the last element that was focused before it opened. If no element exists,
// we try to focus the page title. This is for accessibility, mostly to help when navigating the site with a screen-reader.
export const modalFocusMiddleware: Middleware = (api: MiddlewareAPI) => (next: Dispatch) => action => {
    const state = api.getState();

    switch (action.type) {
        case ACTION_TYPE.ACTIVE_MODAL_OPEN:
            // Before modal open, record the element that is currently focused
            if (document.activeElement) lastFocusedStack.push(document.activeElement);
            break;
        case ACTION_TYPE.ACTIVE_MODAL_CLOSE: {
            const lastFocusedElement = lastFocusedStack.pop() as HTMLElement;
            // Before modal close, try to focus the last focused element, otherwise focus the main heading (if it exists)
            if (lastFocusedElement && typeof lastFocusedElement.focus === "function") {
                lastFocusedElement.focus();
            } else {
                document.getElementById(state?.mainContentId || "main")?.focus();
            }
        }
    }

    return next(action);
};
