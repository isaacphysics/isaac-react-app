import * as persistance from "./localStorage";
import {KEY, LOADING_FAILURE_VALUE} from "./localStorage";

export enum FIRST_LOGIN_STATE {
    BANNER_NOT_SHOWN = "bannerNotShown",
    BANNER_SHOWN = "bannerShown"
}

export const isFirstLoginInPersistance = () => {
    return persistance.session.load(KEY.FIRST_LOGIN) !== LOADING_FAILURE_VALUE;
};
