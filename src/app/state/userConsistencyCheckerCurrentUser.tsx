import {clear, KEY, load, save} from "../services/localStorage";

export const getUserId = function(): any {
    return load(KEY.CURRENT_USER_ID);
};

export const setUserId = function(id: any): boolean {
    if (id === undefined) {
        return clear();
    }
    return save(KEY.CURRENT_USER_ID, id);
};
