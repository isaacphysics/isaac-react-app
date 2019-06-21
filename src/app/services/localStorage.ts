/* eslint-disable no-console */
const $window = window;

export const save = function save(key: string, value: string) {
    try {
        $window.localStorage.setItem(key, value);
        return true;
    } catch (e) {
        console.error("Failed to save to local storage. This might be a browser restriction.", e);
        return false;
    }
};

export const load = function load(key: string) {
    try {
        return $window.localStorage.getItem(key);
    } catch (e) {
        console.error("Failed to read from local storage. This might be a browser restriction.", e);
        return null;
    }
};

export const remove = function remove(key: string) {
    try {
        $window.localStorage.removeItem(key);
        return true;
    } catch (e) {
        console.error("Failed to remove from local storage. This might be a browser restriction.", e);
        return false;
    }
};

export const clear = function clear() {
    try {
        $window.localStorage.clear();
        return true;
    } catch (e) {
        console.error("Failed to clear local storage. This might be a browser restriction.", e);
        return false;
    }
};

export const session = {
    save: function sessionSave(key: string, value: string) {
        try {
            $window.sessionStorage.setItem(key, value);
            return true;
        } catch (e) {
            console.error("Failed to save to session storage. This might be a browser restriction.", e);
            return false;
        }
    },

    load: function sessionLoad(key: string) {
        try {
            return $window.sessionStorage.getItem(key);
        } catch (e) {
            console.error("Failed to read from session storage. This might be a browser restriction.", e);
            return null;
        }
    },

    remove: function sessionRemove(key: string) {
        try {
            return $window.sessionStorage.removeItem(key);
            return true;
        } catch (e) {
            console.error("Failed to remove from session storage. This might be a browser restriction.", e);
            return false;
        }
    },

    clear: function clear() {
        try {
            return $window.sessionStorage.clear();
            return true;
        } catch (e) {
            console.error("Failed to clear session storage. This might be a browser restriction.", e);
            return false;
        }
    },
};
