import React, {useEffect} from 'react';
import {connect} from "react-redux";
import {Redirect} from "react-router-dom";
import {logOutUser} from "../../state/actions";
import {AppState} from "../../state/reducers";
import {LoggedInUser} from "../../../IsaacAppTypes";

const stateToProps = (state: AppState) => (state && {user: state.user});
const dispatchToProps = {logOutUser};

interface LogOutHandlerProps {
    user: LoggedInUser | null;
    logOutUser: () => void;
}
const LogOutHandlerComponent = ({user, logOutUser}: LogOutHandlerProps) => {
    useEffect(() => {logOutUser()});
    return <React.Fragment>
        {user && user.loggedIn ? <div>Logging out...</div> : <Redirect to="/" />}
    </React.Fragment>
};

export const LogOutHandler = connect(stateToProps, dispatchToProps)(LogOutHandlerComponent);
