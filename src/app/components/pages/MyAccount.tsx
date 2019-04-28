import React from "react";
import {connect} from "react-redux";
import {RegisteredUserDTO} from "../../../IsaacApiTypes";
import {AppState} from "../../state/reducers";

const stateToProps = (state: AppState) => ({user: state ? state.user : null});
const dispatchToProps = null;

interface AccountPageProps {user: RegisteredUserDTO | null}
const AccountPageComponent = ({user}: AccountPageProps) => (
    <div>
        {user &&
            <h2>{user.givenName}'s Account Page</h2>
        }
        <p>Hello!</p>
    </div>
);
export const MyAccount = connect(stateToProps, dispatchToProps)(AccountPageComponent);
