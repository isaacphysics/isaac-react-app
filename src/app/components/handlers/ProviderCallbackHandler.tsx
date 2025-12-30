import React, {useEffect} from 'react';
import {handleProviderCallback, useAppDispatch} from "../../state";
import {AuthenticationProvider} from "../../../IsaacApiTypes";
import {IsaacSpinner} from "./IsaacSpinner";
import { useLocation, useParams } from 'react-router';

export const ProviderCallbackHandler = () => {
    const location = useLocation();
    const {provider} = useParams<{provider: AuthenticationProvider}>();
    const dispatch = useAppDispatch();
    useEffect(() => provider && void dispatch(handleProviderCallback(provider, location.search)), [dispatch, provider, location.search]);

    return <React.Fragment>
        <div className="w-100 text-center">
            <h2 className="pt-7 pb-2">Signing in...</h2>
            <IsaacSpinner />
        </div>
    </React.Fragment>;
};
