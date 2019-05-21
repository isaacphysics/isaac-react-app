import store from "store";

const UserStore = store.namespace("user");
const USER_ID = "USER_ID";

export const getUserId = function(): any {
    return UserStore.get(USER_ID);
};

export const setUserId = function(id: any): boolean {
    try {
        UserStore.set(USER_ID, id);
        return getUserId() == id;
    } catch (e) {
        return false;
    }
};