import {createBrowserHistory} from "history";
import {changePage} from "../state/actions";

export const history = createBrowserHistory();

history.listen((location) => {
    changePage(location.pathname);
});
