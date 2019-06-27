import {createBrowserHistory} from "history";
import {changePage} from "../state/actions";

export const history = createBrowserHistory();

let previousPathname = window.location.pathname;

history.listen((location) => {
    const nextPathname = location.pathname;
    if (previousPathname != nextPathname) {
        changePage(location.pathname);
        previousPathname = nextPathname;
    }
});
