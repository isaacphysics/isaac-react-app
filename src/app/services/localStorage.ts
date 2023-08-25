/* eslint-disable no-console */
export enum KEY {
    AFTER_AUTH_PATH = "afterAuthPath",
    CURRENT_USER_ID = "currentUserId",
    FIRST_LOGIN = "firstLogin",
    REQUIRED_MODAL_SHOWN_TIME = "requiredModalShownTime",
    RECONFIRM_USER_CONTEXT_SHOWN_TIME = "reconfirmStageExamBoardShownTime",
    LOGIN_OR_SIGN_UP_MODAL_SHOWN_TIME = "loginOrSignUpModalShownTime",
    EMAIL_CONFIRMATION_MODAL_SHOWN_TIME = "emailconfirmationModalShownTime",
    LAST_NOTIFICATION_TIME = "lastNotificationTime",
    ANONYMISE_USERS = "anonymiseUsers",
    MOST_RECENT_ALL_TOPICS_PATH = "mostRecentAllTopicsPath",
    FIRST_ANON_QUESTION = "firstAnonQuestion",
    ASSIGN_BOARD_PATH = "assignBoardPath",
}

export const LOADING_FAILURE_VALUE = null;

const save = function save(key: KEY, value: string) {
    try {
        window.localStorage.setItem(key, value);
        return true;
    } catch (e) {
        console.error("Failed to save to local storage. This might be a browser restriction.", e);
        return false;
    }
};

const load = function load(key: KEY) {
    try {
        return window.localStorage.getItem(key);
    } catch (e) {
        console.error("Failed to read from local storage. This might be a browser restriction.", e);
        return LOADING_FAILURE_VALUE;
    }
};

const remove = function remove(key: KEY) {
    try {
        window.localStorage.removeItem(key);
        return true;
    } catch (e) {
        console.error("Failed to remove from local storage. This might be a browser restriction.", e);
        return false;
    }
};

const pop = function pop(key: KEY) {
    try {
        const item = window.localStorage.getItem(key);
        window.localStorage.removeItem(key);
        return item;
    } catch (e) {
        console.error("Failed to pop from local storage. This might be a browser restriction.", e);
        return undefined;
    }
};

const clear = function clear() {
    try {
        window.localStorage.clear();
        return true;
    } catch (e) {
        console.error("Failed to clear local storage. This might be a browser restriction.", e);
        return false;
    }
};

const session = {
    save: function sessionSave(key: KEY, value: string) {
        try {
            window.sessionStorage.setItem(key, value);
            return true;
        } catch (e) {
            console.error("Failed to save to session storage. This might be a browser restriction.", e);
            return false;
        }
    },

    load: function sessionLoad(key: KEY) {
        try {
            return window.sessionStorage.getItem(key);
        } catch (e) {
            console.error("Failed to read from session storage. This might be a browser restriction.", e);
            return LOADING_FAILURE_VALUE;
        }
    },

    remove: function sessionRemove(key: KEY) {
        try {
            window.sessionStorage.removeItem(key);
            return true;
        } catch (e) {
            console.error("Failed to remove from session storage. This might be a browser restriction.", e);
            return false;
        }
    },

    clear: function clear() {
        try {
            window.sessionStorage.clear();
            return true;
        } catch (e) {
            console.error("Failed to clear session storage. This might be a browser restriction.", e);
            return false;
        }
    },
};

export const persistence = {
    save,
    load,
    remove,
    pop,
    clear,
    session
};
