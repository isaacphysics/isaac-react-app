// SERVICE ACTIONS (w/o dispatch)
import {history, KEY, persistence} from "../../services";
import {store, routerPageChange, errorSlice} from "../";

export const changePage = (path: string) => {
    history.push(path);
};

export const registerPageChange = (path: string) => {
    store.dispatch(routerPageChange(path));
};

export const handleServerError = () => {
    store.dispatch(errorSlice.actions.apiServerError());
};

export const handleApiGoneAway = () => {
    store.dispatch(errorSlice.actions.apiGoneAway());
};

export const setAssignBoardPath = (path: string) => {
    persistence.save(KEY.ASSIGN_BOARD_PATH, path);
};
