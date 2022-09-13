import React, {useEffect} from 'react';
import {handleProviderCallback, useAppDispatch} from "../../state";
import {withRouter} from "react-router-dom";
import {AuthenticationProvider} from "../../../IsaacApiTypes";
import {IsaacSpinner} from "./IsaacSpinner";

interface ProviderCallbackHandlerProps {
    match: {params: {provider: AuthenticationProvider}};
    location: {search: string};
}
export const ProviderCallbackHandler = withRouter((props: ProviderCallbackHandlerProps) => {
    const {match: {params: {provider}}, location: {search}} = props;
    const dispatch = useAppDispatch();
    useEffect(() => {dispatch(handleProviderCallback(provider, search))}, [dispatch, provider, search]);

    return <React.Fragment>
        <div className="w-100 text-center">
            <h2 className="pt-5 pb-2">Signing in...</h2>
            <IsaacSpinner />
        </div>
    </React.Fragment>;
});
