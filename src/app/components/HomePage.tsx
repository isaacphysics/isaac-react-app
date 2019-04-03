import React from "react";
import {connect} from "react-redux";
import {RegisteredUserDTO} from "../../IsaacApiTypes";
import {AppState} from "../state/reducers";

const stateToProps = (state: AppState) => ({user: state ? state.user : null});
const dispatchToProps = null;

interface HomePageProps {
    user: RegisteredUserDTO | null
}
export const HomePageComponent = ({user}: HomePageProps) => (
    <div>
        <h2>Home</h2>
        <p>Hi {user && user.givenName}!</p>
    </div>
);
export const HomePage = connect(stateToProps, dispatchToProps)(HomePageComponent);
