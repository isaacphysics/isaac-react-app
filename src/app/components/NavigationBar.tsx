import React from "react";
import {Link} from "react-router-dom";
import {connect} from "react-redux";
import {RegisteredUserDTO} from "../../IsaacApiTypes";
import {AppState} from "../state/reducers";
import {Nav, Navbar, NavbarBrand, NavItem} from "reactstrap";

const stateToProps = (state: AppState) => (state && {user: state.user});

interface NavigationBarProps {
    user: RegisteredUserDTO | null
}
const NavigationBarComponent = ({user}: NavigationBarProps) => (
    <div>
        <Navbar light color="secondary" expand="sm">
            <NavbarBrand href="/">Isaac Computer Science</NavbarBrand>
            <Nav className="ml-auto" navbar>
                <NavItem>
                    <Link to="/">Home</Link>
                </NavItem>
                <NavItem>
                    <Link to="/questions/prog_files_04_aqa">Featured Question</Link>
                </NavItem>
                <NavItem>
                    <Link to="/account" disabled={!user}>My Account</Link>
                </NavItem>
                <NavItem>
                    <Link to="/assignments" disabled={!user}>My Assignments</Link>
                </NavItem>
                <NavItem>
                    {!user ? <Link to="/login">Log in</Link> : <Link to="/logout">Log out</Link>}
                </NavItem>
            </Nav>
        </Navbar>
    </div>
);

export const NavigationBar = connect(stateToProps)(NavigationBarComponent);
