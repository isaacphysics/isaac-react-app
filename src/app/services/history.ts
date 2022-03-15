import {createBrowserHistory} from "history";
import {registerPageChange} from "../state/actions";

export const history = createBrowserHistory();

let previousPathname = window.location.pathname;

// I can't pick the right type for this one but it does eventually seem to contain a location field so...
history.listen(listener => {
    const nextPathname = listener.pathname;
    if (previousPathname != nextPathname) {
        registerPageChange(listener.pathname);
        previousPathname = nextPathname;
    }
});
