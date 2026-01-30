import {useCallback, useEffect} from "react";
import throttle from "lodash/throttle";
import {requestCurrentUser, useAppDispatch} from "../state";

const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];

function teardown(throttledFn: ReturnType<typeof throttle>) {
    throttledFn.cancel();
    events.forEach(event => {
        document.removeEventListener(event, throttledFn);
    });
}

export const useCheckCurrentUserOnActivity = (until?: boolean) => {
    const dispatch = useAppDispatch();

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const throttledCheckLoginStatus = useCallback(
        throttle(async () => {
            await dispatch(requestCurrentUser());
        }, 20000, {leading: true}),
        [dispatch]
    );

    useEffect(() => {
        // Register callbacks so we can detect when the user is on this tab or window and then check if we're logged in.
        events.forEach(event => {
            document.addEventListener(event, throttledCheckLoginStatus);
        });

        return () => {
            // Remove listeners on component unmount
            teardown(throttledCheckLoginStatus);
        };
    }, [throttledCheckLoginStatus]);

    useEffect(() => {
        if (until) {
            // Remove listeners if the component indicates we can stop polling.
            teardown(throttledCheckLoginStatus);
        }
    }, [until, throttledCheckLoginStatus]);
};

