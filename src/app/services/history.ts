import {createBrowserHistory} from "history";
import {registerPageChange} from "../state/actions";

export const history = createBrowserHistory();

let previousPathname = window.location.pathname;

history.listen(listener => {
    const nextPathname = listener.pathname;
    if (previousPathname != nextPathname) {
        registerPageChange(listener.pathname);
        previousPathname = nextPathname;
    }
});
