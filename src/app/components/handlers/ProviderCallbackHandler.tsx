import React, {useEffect} from 'react';
import {connect} from "react-redux";
import {Redirect, withRouter} from "react-router-dom";
import {handleProviderCallback} from "../../state/actions";
import {AppState} from "../../state/reducers";
import {AuthenticationProvider, RegisteredUserDTO} from "../../../IsaacApiTypes";

const stateToProps = (state: AppState) => (state && {user: state.user});
const dispatchToProps = {handleProviderCallback: handleProviderCallback};

interface ProviderCallbackHandlerProps {
    match: {params: {provider: AuthenticationProvider}},
    location: {search: string},
    user: RegisteredUserDTO | null,
    handleProviderCallback: (provider: AuthenticationProvider, search: string) => void
}

const ProviderCallbackHandlerComponent = (props: ProviderCallbackHandlerProps) => {
    const {match: {params: {provider}}, location: {search}, user, handleProviderCallback} = props;

    useEffect(() => {
        handleProviderCallback(provider, search);
    }, []);

    const nextPage = '/'; // TODO MT handle afterAuth in local storage
    return <React.Fragment>
        {user ?
            (user.firstLogin ? <Redirect to="/account" /> : <Redirect to={nextPage} />) :
            <div>Signing in...</div>
        }
    </React.Fragment>;
};

export const ProviderCallbackHandler =
    withRouter(connect(stateToProps, dispatchToProps)(ProviderCallbackHandlerComponent));
