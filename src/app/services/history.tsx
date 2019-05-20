import {createBrowserHistory} from "history";
import {store} from "../state/store";
import {changePage} from "../state/actions";

export const history = createBrowserHistory();

history.listen((location) => {
    store.dispatch(changePage(location.pathname));
});
