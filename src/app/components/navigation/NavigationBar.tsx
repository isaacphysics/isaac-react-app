import React from "react";
import {Link} from "react-router-dom";
import {connect} from "react-redux";
import {RegisteredUserDTO} from "../../../IsaacApiTypes";
import {AppState} from "../../state/reducers";
import * as ReactStrap from "reactstrap";

const stateToProps = (state: AppState) => (state && {user: state.user});

interface NavigationBarProps {
    user: RegisteredUserDTO | null
}
const NavigationBarComponent = ({user}: NavigationBarProps) => {
    const DropdownItemComingSoon = (props: {children: string}) => {
        return <ReactStrap.DropdownItem className="disabled" aria-disabled="true">
            {props.children} <ReactStrap.Badge color="light">Coming Soon</ReactStrap.Badge>
        </ReactStrap.DropdownItem>
    };

    return <div>
        <ReactStrap.Navbar light color="secondary" expand="sm">
            <ReactStrap.NavbarBrand to="/">Isaac Computer Science</ReactStrap.NavbarBrand>
            <ReactStrap.Nav className="ml-auto" navbar>

                <ReactStrap.UncontrolledDropdown nav inNavbar>
                    <ReactStrap.DropdownToggle nav caret>
                        About Us
                    </ReactStrap.DropdownToggle>
                    <ReactStrap.DropdownMenu>
                        <DropdownItemComingSoon>What We Do</DropdownItemComingSoon>
                        <DropdownItemComingSoon>News</DropdownItemComingSoon>
                        <DropdownItemComingSoon>Get Involved</DropdownItemComingSoon>
                        <DropdownItemComingSoon>Isaac Physics</DropdownItemComingSoon>
                        <DropdownItemComingSoon>Events</DropdownItemComingSoon>
                    </ReactStrap.DropdownMenu>
                </ReactStrap.UncontrolledDropdown>

                <ReactStrap.UncontrolledDropdown nav inNavbar>
                    <ReactStrap.DropdownToggle nav caret>
                        For Students
                    </ReactStrap.DropdownToggle>
                    <ReactStrap.DropdownMenu>
                        <DropdownItemComingSoon>My Gameboards</DropdownItemComingSoon>
                        <DropdownItemComingSoon>My Assignments</DropdownItemComingSoon>
                        <DropdownItemComingSoon>My Progress</DropdownItemComingSoon>
                        <DropdownItemComingSoon>Problem Solving</DropdownItemComingSoon>
                    </ReactStrap.DropdownMenu>
                </ReactStrap.UncontrolledDropdown>

                <ReactStrap.UncontrolledDropdown nav inNavbar>
                    <ReactStrap.DropdownToggle nav caret>
                        For Teachers
                    </ReactStrap.DropdownToggle>
                    <ReactStrap.DropdownMenu>
                        <DropdownItemComingSoon>Set Assignments</DropdownItemComingSoon>
                        <DropdownItemComingSoon>Assignment Progress</DropdownItemComingSoon>
                        <DropdownItemComingSoon>Manage Groups</DropdownItemComingSoon>
                        <DropdownItemComingSoon>My Progress</DropdownItemComingSoon>
                    </ReactStrap.DropdownMenu>
                </ReactStrap.UncontrolledDropdown>

                <ReactStrap.UncontrolledDropdown nav inNavbar>
                    <ReactStrap.DropdownToggle nav caret>
                        Topics
                    </ReactStrap.DropdownToggle>
                    <ReactStrap.DropdownMenu>
                        <ReactStrap.DropdownItem><Link to="/topics">All Topics</Link></ReactStrap.DropdownItem>
                        <DropdownItemComingSoon>Syllabus View</DropdownItemComingSoon>
                        <DropdownItemComingSoon>Suggested Teaching</DropdownItemComingSoon>
                    </ReactStrap.DropdownMenu>
                </ReactStrap.UncontrolledDropdown>

                <ReactStrap.UncontrolledDropdown nav inNavbar>
                    <ReactStrap.DropdownToggle nav caret>
                        Help and Support
                    </ReactStrap.DropdownToggle>
                    <ReactStrap.DropdownMenu>
                        <DropdownItemComingSoon>Teacher Support</DropdownItemComingSoon>
                        <DropdownItemComingSoon>Student Support</DropdownItemComingSoon>
                        <DropdownItemComingSoon>Contact Us</DropdownItemComingSoon>
                    </ReactStrap.DropdownMenu>
                </ReactStrap.UncontrolledDropdown>

                {user && <ReactStrap.NavItem>
                    <Link to="/account">My Account</Link>
                </ReactStrap.NavItem>}

                <ReactStrap.NavItem>
                    {!user ? <Link to="/login">Log in</Link> : <Link to="/logout">Log out</Link>}
                </ReactStrap.NavItem>
            </ReactStrap.Nav>
        </ReactStrap.Navbar>
    </div>;
};

export const NavigationBar = connect(stateToProps)(NavigationBarComponent);
