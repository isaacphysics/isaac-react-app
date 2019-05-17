import React from 'react';
import {connect} from "react-redux";
import {AppState} from "../../state/reducers";
import {RegisteredUserDTO} from "../../../IsaacApiTypes";

const stateToProps = (state: AppState) => ({});

const dispatchToProps = null;

interface AdminPageProps {user: RegisteredUserDTO}

const AdminPageComponent = ({user}: AdminPageProps) => {
    return <div id="admin-page">
        <h1>Isaac Administration</h1>
        <div>
            Hi, {user.givenName}!
        </div>
    </div>;
};

export const Admin = connect(stateToProps, dispatchToProps)(AdminPageComponent);
