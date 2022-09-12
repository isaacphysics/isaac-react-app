import {persistence, KEY} from "../../services";

export const getUserId = function(): any {
    return persistence.load(KEY.CURRENT_USER_ID);
};

export const setUserId = function(id: any): boolean {
    if (id === undefined) {
        const cleared = persistence.clear();
        const clearedSession = persistence.session.clear();
        return cleared && clearedSession;
    }
    return persistence.save(KEY.CURRENT_USER_ID, id);
};
