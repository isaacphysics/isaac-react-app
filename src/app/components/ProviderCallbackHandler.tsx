import React, {useEffect} from 'react';
import {connect} from "react-redux";
import {Redirect, withRouter} from "react-router-dom";
import {handleProviderCallback} from "../state/actions";

const stateToProps = (state: any, props: any) => ({user: state.user});
const dispatchToProps = {handleProviderCallback: handleProviderCallback};

const ProviderCallbackHandlerComponent = (props: any) => {
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
