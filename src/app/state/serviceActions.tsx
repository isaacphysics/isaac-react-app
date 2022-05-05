import {store} from "./store";
import {ACTION_TYPE} from "../services/constants";
import {history} from "../services/history";

// SERVICE ACTIONS (without dispatch)
export const changePage = (path: string) => {
    history.push(path);
};
export const registerPageChange = (path: string) => {
    store.dispatch({type: ACTION_TYPE.ROUTER_PAGE_CHANGE, path});
};
export const handleServerError = () => {
    store.dispatch({type: ACTION_TYPE.API_SERVER_ERROR});
};
export const handleApiGoneAway = () => {
    store.dispatch({type: ACTION_TYPE.API_GONE_AWAY});
};