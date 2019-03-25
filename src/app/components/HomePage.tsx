import React from "react";
import {connect} from "react-redux";

const stateToProps = (state: any) => ({user: state.user});
const dispatchToProps = null;
const HomePageComponent = ({user}: any) => (
    <div>
        <h2>Home</h2>
        <p>Hello {user.givenName}!</p>
    </div>
);
export const HomePage = connect(stateToProps, dispatchToProps)(HomePageComponent);
