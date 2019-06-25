import React, {useEffect} from 'react';
import {connect} from "react-redux";
import {withRouter} from "react-router-dom";
import {handleProviderCallback} from "../../state/actions";
import {AppState} from "../../state/reducers";
import {AuthenticationProvider} from "../../../IsaacApiTypes";
import {LoggedInUser} from "../../../IsaacAppTypes";
import {Spinner} from "reactstrap";

const stateToProps = (state: AppState) => (state && {user: state.user});
const dispatchToProps = {handleProviderCallback: handleProviderCallback};

interface ProviderCallbackHandlerProps {
    match: {params: {provider: AuthenticationProvider}};
    location: {search: string};
    user: LoggedInUser | null;
    handleProviderCallback: (provider: AuthenticationProvider, search: string) => void;
}

const ProviderCallbackHandlerComponent = (props: ProviderCallbackHandlerProps) => {
    const {match: {params: {provider}}, location: {search}, user, handleProviderCallback} = props;

    useEffect(() => {
        handleProviderCallback(provider, search);
    }, [handleProviderCallback, provider, search]);

    return <React.Fragment>
        <div className="w-100 text-center">
            <h2 className="pt-5 pb-2">Signing in...</h2>
            <Spinner color="primary" />
        </div>
    </React.Fragment>;
};

export const ProviderCallbackHandler =
    withRouter(connect(stateToProps, dispatchToProps)(ProviderCallbackHandlerComponent));
