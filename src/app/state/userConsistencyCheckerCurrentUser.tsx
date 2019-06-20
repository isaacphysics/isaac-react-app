import {save, load, clear} from "../services/localStorage";

const USER_ID = "currentUserId";

export const getUserId = function(): any {
    return load(USER_ID);
};

export const setUserId = function(id: any): boolean {
    if (id === undefined) {
        return clear();
    }
    return save(USER_ID, id);
};
