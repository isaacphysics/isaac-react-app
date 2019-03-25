import React from "react";
import {Link} from "react-router-dom";
import {connect} from "react-redux";

const stateToProps = (state: {user: object}) => ({user: state.user});

const NavBarContent = ({user}: {user: object | null}) => (
    <ul>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/questions/action_reaction_pairs">Question</Link></li>
        <li>{user ? <Link to="/logout">Log out</Link> : <Link to="/login">Log in</Link>}</li>
    </ul>
);

export const NavBar = connect(stateToProps)(NavBarContent);
