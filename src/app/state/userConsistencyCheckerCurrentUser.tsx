import store from "store";

const UserStore = store.namespace("user");
const USER_ID = "USER_ID";

export const setUserId = function(id: any) {
    UserStore.set(USER_ID, id);
};

export const getUserId = function(): any {
    return UserStore.get(USER_ID);
};