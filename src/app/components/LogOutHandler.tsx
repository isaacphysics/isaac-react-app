import React, {useEffect} from 'react';
import {connect} from "react-redux";
import {Redirect} from "react-router";
import {logOutUser} from "../state/actions";

const stateToProps = (state: {user: object | null}) => ({user: state.user});
const dispatchToProps = {logOutUser};

const LogOutHandlerComponent = ({user, logOutUser}: any) => {
    useEffect(() => {logOutUser()});
    return <React.Fragment>
        {user ? <div>Logging out...</div> : <Redirect to="/" />}
    </React.Fragment>
};

export const LogOutHandler = connect(stateToProps, dispatchToProps)(LogOutHandlerComponent);
