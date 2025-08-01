import {useCallback, useEffect, useState} from "react";
import {getUserId, redirectTo, requestCurrentUser, selectors, useAppDispatch, useAppSelector} from "../state";
import {KEY, persistence} from "./localStorage";
import throttle from "lodash/throttle";

export const setAfterRenewPath = () => {
    persistence.session.save(KEY.AFTER_SESSION_RENEW_PATH, window.location.pathname);
};

export const useSessionExpired = (): [string, () => void] => {
    const dispatch = useAppDispatch();
    const user = useAppSelector(selectors.user.orNull);

    const [target, setTarget] = useState<string>("/login");

    const clearRenewPath = () => {
        persistence.session.remove(KEY.AFTER_SESSION_RENEW_PATH);
    };

    const throttledCheckLoginStatus = useCallback(
        throttle(() => {
            dispatch(requestCurrentUser());
        }, 20000, {leading: true}),
        []
    );

    useEffect(() => {
        // Register callbacks so we can detect when the user is on the tab, and then check if we're logged in.
        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];

        events.forEach(event => {
            document.addEventListener(event, throttledCheckLoginStatus);
        });

        return () => {
            throttledCheckLoginStatus.cancel();
            events.forEach(event => {
                document.removeEventListener(event, throttledCheckLoginStatus);
            });
        };
    }, [throttledCheckLoginStatus]);

    useEffect(() => {
        const targetFromSessionStorage = persistence.session.load(KEY.AFTER_SESSION_RENEW_PATH);

        if(targetFromSessionStorage) {
            setTarget(targetFromSessionStorage);

            if(user && user.loggedIn && getUserId()) {
                // If the user has logged back in elsewhere, automatically restore the page
                clearRenewPath();
                redirectTo(targetFromSessionStorage);
            }
        }
    }, [user]);

    return [target, clearRenewPath];
};