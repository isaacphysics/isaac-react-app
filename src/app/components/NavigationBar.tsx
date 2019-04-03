import React from "react";
import {Link} from "react-router-dom";
import {connect} from "react-redux";
import {RegisteredUserDTO} from "../../IsaacApiTypes";
import {AppState} from "../state/reducers";

const stateToProps = (state: AppState) => (state && {user: state.user});

interface NavigationBarProps {
    user: RegisteredUserDTO | null
}
const NavigationBarComponent = ({user}: NavigationBarProps) => (
    <ul>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/questions/action_reaction_pairs">Featured Question</Link></li>
        {!user && <li><Link to="/login">Log in</Link></li>}
        {user && <React.Fragment>
            <li><Link to="/account">My Account</Link></li>
            <li><Link to="/assignments">My Assignments</Link></li>
            <li><Link to="/logout">Log out</Link></li>
        </React.Fragment>}
    </ul>
);

export const NavigationBar = connect(stateToProps)(NavigationBarComponent);
