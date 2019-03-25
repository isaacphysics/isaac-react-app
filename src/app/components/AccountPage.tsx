import React from "react";
import {connect} from "react-redux";

const stateToProps = (state: any) => ({user: state.user});
const dispatchToProps = null;
const AccountPageComponent = ({user}: any) => (
    <div>
        <h2>{user.givenName}'s Account Page</h2>
        <p>Hello!</p>
    </div>
);
export const AccountPage = connect(stateToProps, dispatchToProps)(AccountPageComponent);
