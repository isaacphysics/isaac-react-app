import React, {useEffect} from 'react';
import {
    getRTKQueryErrorMessage,
    mutationSucceeded,
    useCheckProviderCallbackMutation
} from "../../state";
import {withRouter} from "react-router-dom";
import {AuthenticationProvider} from "../../../IsaacApiTypes";
import {IsaacSpinner} from "./IsaacSpinner";
import {history, KEY, persistence} from "../../services";

interface ProviderCallbackHandlerProps {
    match: {params: {provider: AuthenticationProvider}};
    location: {search: string};
}
export const ProviderCallbackHandler = withRouter((props: ProviderCallbackHandlerProps) => {
    const {match: {params: {provider}}, location: {search}} = props;
    const [handleProviderCallback] = useCheckProviderCallbackMutation();

    useEffect(() => {
        handleProviderCallback({provider, params: search}).then(response => {
            if (mutationSucceeded(response)) {
                const nextPage = persistence.load(KEY.AFTER_AUTH_PATH);
                persistence.remove(KEY.AFTER_AUTH_PATH);
                history.push(nextPage?.replace("#!", "") || "/account");
            } else {
                history.push("/auth_error", { errorMessage: getRTKQueryErrorMessage(response.error).message });
            }
        });
    }, [provider, search]);

    return <>
        <div className="w-100 text-center">
            <h2 className="pt-5 pb-2">Signing in...</h2>
            <IsaacSpinner />
        </div>
    </>;
});
