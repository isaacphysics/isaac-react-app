import {createBrowserHistory} from "history";
import {changePage} from "../state/actions";

export const history = createBrowserHistory();

export function redirectToPageNotFound() {
    const failedPath = history.location.pathname;
    history.push({pathname:`/404${failedPath}`, state:{overridePathname: failedPath}})
}

let previousPathname = window.location.pathname;

history.listen((location) => {
    const nextPathname = location.pathname;
    if (previousPathname != nextPathname) {
        changePage(location.pathname);
        previousPathname = nextPathname;
    }
});
