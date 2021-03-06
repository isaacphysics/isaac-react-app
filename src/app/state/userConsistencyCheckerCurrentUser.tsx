import {clear, KEY, load, save, session} from "../services/localStorage";

export const getUserId = function(): any {
    return load(KEY.CURRENT_USER_ID);
};

export const setUserId = function(id: any): boolean {
    if (id === undefined) {
        let cleared = clear();
        let clearedSession = session.clear();
        return cleared && clearedSession;
    }
    return save(KEY.CURRENT_USER_ID, id);
};
