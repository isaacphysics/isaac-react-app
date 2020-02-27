import React, {useEffect} from 'react';
import {connect} from "react-redux";
import {logOutUser} from "../../state/actions";
import {AppState} from "../../state/reducers";
import {LoggedInUser} from "../../../IsaacAppTypes";
import {Spinner} from "reactstrap";

const stateToProps = (state: AppState) => (state && {user: state.user});
const dispatchToProps = {logOutUser};

interface LogOutHandlerProps {
    user: LoggedInUser | null;
    logOutUser: () => void;
}
const LogOutHandlerComponent = ({user, logOutUser}: LogOutHandlerProps) => {
    useEffect(() => {logOutUser()});
    return <React.Fragment>
        <div className="w-100 text-center">
            <h2 className="pt-5 pb-2">
                Logging out...
            </h2>
            <Spinner color="primary" />
        </div>
    </React.Fragment>
};

export const LogOutHandler = connect(stateToProps, dispatchToProps)(LogOutHandlerComponent);
