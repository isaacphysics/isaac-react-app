import React from "react";
import {Link} from "react-router-dom";
import {connect} from "react-redux";

const stateToProps = (state: {user: object}) => ({user: state.user});

const NavBarContent = ({user}: {user: object | null}) => (
    <ul>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/questions/action_reaction_pairs">Featured Question</Link></li>
        {!user ?
            <li><Link to="/login">Log in</Link></li> :
            <React.Fragment>
                <li><Link to="/account">My Account</Link></li>
                <li><Link to="/assignments">My Assignments</Link></li>
                <li><Link to="/logout">Log out</Link></li>
            </React.Fragment>
        }
    </ul>
);

export const NavigationBar = connect(stateToProps)(NavBarContent);
