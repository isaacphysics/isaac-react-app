import {createBrowserHistory} from "history";
import {changePage} from "../state/actions";

export const history = createBrowserHistory();

export function redirectToPageNotFound() {
    const failedPath = history.location.pathname;
    history.push({pathname:`/404${failedPath}`, state:{overridePathname: failedPath}})
}

history.listen((location) => {
    changePage(location.pathname);
});
