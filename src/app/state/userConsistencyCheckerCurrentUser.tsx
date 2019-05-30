import {save, load, remove} from "../services/localStorage";

const USER_ID = "currentUserId";

export const getUserId = function(): any {
    return load(USER_ID);
};

export const setUserId = function(id: any): boolean {
    if (id === undefined) {
        return remove(USER_ID);
    }
    return save(USER_ID, id);
};