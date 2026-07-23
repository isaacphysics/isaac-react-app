import React, {useCallback, useEffect, useRef} from 'react';
import {handleProviderCallback, useAppDispatch} from "../../state";
import {AuthenticationProvider} from "../../../IsaacApiTypes";
import {IsaacSpinner} from "./IsaacSpinner";
import { useLocation, useNavigate, useParams } from 'react-router';

export const ProviderCallbackHandler = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const {provider} = useParams<{provider: AuthenticationProvider}>();
    const dispatch = useAppDispatch();
    const ignoreRef = useRef(false);

    const providerCallback = useCallback(() => {
        if (provider) {
            void handleProviderCallback(dispatch, navigate, provider, location.search);
        }
    }, [dispatch, navigate, provider, location.search]);

    useEffect(() => {
        if (!ignoreRef.current) {
            ignoreRef.current = true;
            // avoid strict mode issues; handleProviderCallback *must* be called only once
            // this is precisely the pitfall described in https://react.dev/learn/synchronizing-with-effects#how-to-handle-the-effect-firing-twice-in-development,
            // but the callback function is not idempotent (and this is out of our control), so none of the other solutions are appropriate here
            providerCallback();
        }
    }, [providerCallback]);

    return <React.Fragment>
        <div className="w-100 text-center">
            <h2 className="pt-7 pb-2">Signing in...</h2>
            <IsaacSpinner />
        </div>
    </React.Fragment>;
};
