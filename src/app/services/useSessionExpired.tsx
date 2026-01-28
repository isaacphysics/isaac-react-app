import {useEffect, useState} from "react";
import {getUserId, redirectTo, selectors, useAppSelector} from "../state";
import {KEY, persistence} from "./localStorage";
import {useCheckCurrentUserOnActivity} from "./useCheckCurrentUserOnActivity";

export const setAfterRenewPath = () => {
    persistence.session.save(KEY.AFTER_SESSION_RENEW_PATH, window.location.href);
};

export const useSessionExpired = (): [string, () => void] => {
    const user = useAppSelector(selectors.user.orNull);
    const loggedBackIn = !!user && user.loggedIn && getUserId();

    const [target, setTarget] = useState<string>("/login");
    useCheckCurrentUserOnActivity(loggedBackIn);

    const clearRenewPath = () => {
        persistence.session.remove(KEY.AFTER_SESSION_RENEW_PATH);
    };

    useEffect(() => {
        const targetFromSessionStorage = persistence.session.load(KEY.AFTER_SESSION_RENEW_PATH);

        if(targetFromSessionStorage) {
            setTarget(targetFromSessionStorage);

            if(loggedBackIn) {
                // If the user has logged back in elsewhere, automatically restore the page
                clearRenewPath();
                redirectTo(targetFromSessionStorage);
            }
        }
    }, [loggedBackIn]);

    return [target, clearRenewPath];
};
