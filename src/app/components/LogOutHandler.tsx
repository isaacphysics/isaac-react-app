import React, {useEffect} from 'react';
import {connect} from "react-redux";
import {Redirect} from "react-router-dom";
import {logOutUser} from "../state/actions";
import {AppState} from "../state/reducers";
import {RegisteredUserDTO} from "../../IsaacApiTypes";

const stateToProps = (state: AppState) => (state && {user: state.user});
const dispatchToProps = {logOutUser};

interface LogOutHandlerProps {
    user: RegisteredUserDTO | null,
    logOutUser: () => void
}
const LogOutHandlerComponent = ({user, logOutUser}: LogOutHandlerProps) => {
    useEffect(() => {logOutUser()});
    return <React.Fragment>
        {user ? <div>Logging out...</div> : <Redirect to="/" />}
    </React.Fragment>
};

export const LogOutHandler = connect(stateToProps, dispatchToProps)(LogOutHandlerComponent);
