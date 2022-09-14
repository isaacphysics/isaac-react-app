import {KEY, LOADING_FAILURE_VALUE, persistence} from "./";

// TODO there'll probably be a way to use this in a way that lets the compiler do even more checking for us
export enum FIRST_LOGIN_STATE {
    FIRST_LOGIN = "firstLogin",
    SUBSEQUENT_LOGIN = "subsequentLogin"
}

export const isFirstLoginInPersistence = () => {
    let firstLogin = persistence.session.load(KEY.FIRST_LOGIN);
    return ((firstLogin !== LOADING_FAILURE_VALUE) && (firstLogin !== FIRST_LOGIN_STATE.SUBSEQUENT_LOGIN));
};
