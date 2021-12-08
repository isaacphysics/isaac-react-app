import {createBrowserHistory} from "history";
import {registerPageChange} from "../state/actions";

export const history = createBrowserHistory();

let previousPathname = window.location.pathname;

history.listen(({location}) => {
    const nextPathname = location.pathname;
    if (previousPathname != nextPathname) {
        registerPageChange(location.pathname);
        previousPathname = nextPathname;
    }
});
