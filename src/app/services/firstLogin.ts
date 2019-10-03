import * as persistence from "./localStorage";
import {KEY, LOADING_FAILURE_VALUE} from "./localStorage";

// TODO there'll probably be a way to use this in a way that lets the compiler do even more checking for us
export enum FIRST_LOGIN_STATE {
    BANNER_NOT_SHOWN = "bannerNotShown",
    BANNER_SHOWN = "bannerShown"
}

export const isFirstLoginInPersistence = () => {
    return persistence.session.load(KEY.FIRST_LOGIN) !== (LOADING_FAILURE_VALUE || FIRST_LOGIN_STATE.BANNER_SHOWN);
};
