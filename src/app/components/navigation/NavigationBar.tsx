import React from "react";
import {Link} from "react-router-dom";
import {connect} from "react-redux";
import {AppState} from "../../state/reducers";
import * as RS from "reactstrap";
import {SearchButton} from "../content/SearchButton";
import {LoggedInUser} from "../../../IsaacAppTypes";

const stateToProps = (state: AppState) => (state && {user: state.user});

interface NavigationBarProps {
    user: LoggedInUser | null;
}
const NavigationBarComponent = ({user}: NavigationBarProps) => {
    const DropdownItemComingSoon = (props: {children: string}) => {
        return <RS.DropdownItem className="disabled" aria-disabled="true">
            {props.children} <RS.Badge color="light">Coming Soon</RS.Badge>
        </RS.DropdownItem>
    };

    return <React.Fragment>
        <RS.Navbar light color="primary" expand="sm">
            <RS.NavbarBrand tag={Link} to="/">
                <img src="/assets/logo_black.png" height={60} alt="Isaac Computer Science"/>
            </RS.NavbarBrand>
            <RS.Nav className="ml-auto" navbar>
                {user && ( !user.loggedIn ?
                    (
                        <React.Fragment>
                            <RS.NavItem>
                                <RS.NavLink tag={Link} to="/login">LOGIN</RS.NavLink>
                            </RS.NavItem>
                            <RS.NavItem>
                                <RS.NavLink tag={Link} to="/register">SIGN UP</RS.NavLink>
                            </RS.NavItem>
                        </React.Fragment>
                    ) : (
                        <React.Fragment>
                            <RS.NavItem>
                                <RS.NavLink tag={Link} to="/account">MY ACCOUNT</RS.NavLink>
                            </RS.NavItem>
                            <RS.NavItem>
                                <RS.NavLink tag={Link} to="/logout">LOG OUT</RS.NavLink>
                            </RS.NavItem>
                        </React.Fragment>
                    )
                )}
                <RS.Form inline>
                    <RS.FormGroup className="search--main-group">
                        <RS.Input type="search" name="search" placeholder="Search" aria-label="Search" />
                        <SearchButton />
                    </RS.FormGroup>
                </RS.Form>
            </RS.Nav>
        </RS.Navbar>
        <RS.Navbar light color="white" expand="sm">
            <RS.Nav className="mx-auto" navbar>
                <RS.UncontrolledDropdown nav inNavbar>
                    <RS.DropdownToggle nav caret>
                        About Us
                    </RS.DropdownToggle>
                    <RS.DropdownMenu>
                        <DropdownItemComingSoon>What We Do</DropdownItemComingSoon>
                        <DropdownItemComingSoon>News</DropdownItemComingSoon>
                        <DropdownItemComingSoon>Get Involved</DropdownItemComingSoon>
                        <DropdownItemComingSoon>Isaac Physics</DropdownItemComingSoon>
                        <DropdownItemComingSoon>Events</DropdownItemComingSoon>
                    </RS.DropdownMenu>
                </RS.UncontrolledDropdown>

                <RS.UncontrolledDropdown nav inNavbar>
                    <RS.DropdownToggle nav caret>
                        For Students
                    </RS.DropdownToggle>
                    <RS.DropdownMenu>
                        <DropdownItemComingSoon>My Gameboards</DropdownItemComingSoon>
                        <DropdownItemComingSoon>My Assignments</DropdownItemComingSoon>
                        <DropdownItemComingSoon>My Progress</DropdownItemComingSoon>
                        <DropdownItemComingSoon>Problem Solving</DropdownItemComingSoon>
                    </RS.DropdownMenu>
                </RS.UncontrolledDropdown>

                <RS.UncontrolledDropdown nav inNavbar>
                    <RS.DropdownToggle nav caret>
                        For Teachers
                    </RS.DropdownToggle>
                    <RS.DropdownMenu>
                        <DropdownItemComingSoon>Set Assignments</DropdownItemComingSoon>
                        <DropdownItemComingSoon>Assignment Progress</DropdownItemComingSoon>
                        <DropdownItemComingSoon>Manage Groups</DropdownItemComingSoon>
                        <DropdownItemComingSoon>My Progress</DropdownItemComingSoon>
                    </RS.DropdownMenu>
                </RS.UncontrolledDropdown>

                <RS.UncontrolledDropdown nav inNavbar>
                    <RS.DropdownToggle nav caret>
                        Topics
                    </RS.DropdownToggle>
                    <RS.DropdownMenu>
                        <RS.DropdownItem><Link to="/topics">All Topics</Link></RS.DropdownItem>
                        <DropdownItemComingSoon>Syllabus View</DropdownItemComingSoon>
                        <DropdownItemComingSoon>Suggested Teaching</DropdownItemComingSoon>
                    </RS.DropdownMenu>
                </RS.UncontrolledDropdown>

                <RS.UncontrolledDropdown nav inNavbar>
                    <RS.DropdownToggle nav caret>
                        Help and Support
                    </RS.DropdownToggle>
                    <RS.DropdownMenu>
                        <DropdownItemComingSoon>Teacher Support</DropdownItemComingSoon>
                        <DropdownItemComingSoon>Student Support</DropdownItemComingSoon>
                        <DropdownItemComingSoon>Contact Us</DropdownItemComingSoon>
                    </RS.DropdownMenu>
                </RS.UncontrolledDropdown>

                {user && user.loggedIn && user.role == "ADMIN" &&
                    <RS.UncontrolledDropdown nav inNavbar>
                        <RS.DropdownToggle nav caret>
                            Admin
                        </RS.DropdownToggle>
                        <RS.DropdownMenu>
                            <RS.DropdownItem><Link to="/admin">Admin Tools</Link></RS.DropdownItem>
                        </RS.DropdownMenu>
                    </RS.UncontrolledDropdown>
                }
            </RS.Nav>
        </RS.Navbar>
    </React.Fragment>;
};

export const NavigationBar = connect(stateToProps)(NavigationBarComponent);
