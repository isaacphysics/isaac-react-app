import React, {useState} from "react";
import {Link} from "react-router-dom";
import {connect} from "react-redux";
import {AppState} from "../../state/reducers";
import {Badge, Col, Collapse, DropdownItem, DropdownToggle, DropdownMenu, Row, Nav, Navbar, NavbarToggler, UncontrolledDropdown} from "reactstrap";
import {RouteComponentProps, withRouter} from "react-router";
import {LoggedInUser} from "../../../IsaacAppTypes";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const stateToProps = (state: AppState, _: RouteComponentProps) => (state && {user: state.user});

interface NavigationBarProps {
    user: LoggedInUser | null;
}

const NavigationBarComponent = ({user}: NavigationBarProps) => {
    const [menuOpen, setMenuOpen] = useState(false);

    const DropdownItemComingSoon = ({children, className}: {children: string; className: string}) => (
        <DropdownItem className={`${className}`} aria-disabled="true">
            <Link to="/coming_soon">{children}</Link>
            <Badge color="secondary" className="ml-2 mr-1">Coming Soon</Badge>
        </DropdownItem>
    );

    return <Navbar className="main-nav p-0" color="light" light expand="md" >
        <NavbarToggler onClick={() => setMenuOpen(!menuOpen)}>Menu</NavbarToggler>

        <Collapse isOpen={menuOpen} navbar>
            <Nav navbar className="justify-content-between">

                <UncontrolledDropdown nav inNavbar>
                    <DropdownToggle nav caret className="py-3 pl-3 pr-6">
                        About Us
                    </DropdownToggle>
                    <DropdownMenu className="p-0 pb-3 pl-3 m-0">
                        <DropdownItem className="pl-4 py-3 p-md-3">
                            <Link to="/about">What We Do</Link>
                        </DropdownItem>
                        {/*<DropdownItemComingSoon className="pl-4 py-3 p-md-3">*/}
                        {/*    News*/}
                        {/*</DropdownItemComingSoon>*/}
                        <DropdownItemComingSoon className="pl-4 py-3 p-md-3">
                            Get Involved
                        </DropdownItemComingSoon>
                        <DropdownItemComingSoon className="pl-4 py-3 p-md-3">
                            Isaac Physics
                        </DropdownItemComingSoon>
                        <DropdownItemComingSoon className="pl-4 py-3 p-md-3">
                            Events
                        </DropdownItemComingSoon>
                    </DropdownMenu>
                </UncontrolledDropdown>

                <UncontrolledDropdown nav inNavbar>
                    <DropdownToggle nav caret className="py-3 pl-3 pr-6">
                        For Students
                    </DropdownToggle>
                    <DropdownMenu className="p-0 pb-3 pl-3 m-0">
                        <DropdownItemComingSoon className="pl-4 py-3 p-md-3">
                            My Gameboards
                        </DropdownItemComingSoon>
                        <DropdownItemComingSoon className="pl-4 py-3 p-md-3">
                            My Assignments
                        </DropdownItemComingSoon>
                        <DropdownItemComingSoon className="pl-4 py-3 p-md-3">
                            My Progress
                        </DropdownItemComingSoon>
                        <DropdownItemComingSoon className="pl-4 py-3 p-md-3">
                            Problem Solving
                        </DropdownItemComingSoon>
                    </DropdownMenu>
                </UncontrolledDropdown>

                <UncontrolledDropdown nav inNavbar>
                    <DropdownToggle nav caret className="py-3 pl-3 pr-6">
                        For Teachers
                    </DropdownToggle>
                    <DropdownMenu className="p-0 pb-3 pl-3 m-0">
                        <DropdownItemComingSoon className="pl-4 py-3 p-md-3">
                            Set Assignments
                        </DropdownItemComingSoon>
                        <DropdownItemComingSoon className="pl-4 py-3 p-md-3">
                            Assignment Progress
                        </DropdownItemComingSoon>
                        <DropdownItemComingSoon className="pl-4 py-3 p-md-3">
                            Manage Groups
                        </DropdownItemComingSoon>
                        <DropdownItemComingSoon className="pl-4 py-3 p-md-3">
                            My Progress
                        </DropdownItemComingSoon>
                    </DropdownMenu>
                </UncontrolledDropdown>

                <UncontrolledDropdown nav inNavbar>
                    <DropdownToggle nav caret className="py-3 pl-3 pr-6">
                        Topics
                    </DropdownToggle>
                    <DropdownMenu className="p-0 pb-3 pl-3 m-0">
                        <DropdownItem className="pl-4 py-3 p-md-3">
                            <Link to="/topics">All Topics</Link>
                        </DropdownItem>
                        <DropdownItemComingSoon className="pl-4 py-3 p-md-3">
                            Syllabus View
                        </DropdownItemComingSoon>
                        <DropdownItemComingSoon className="pl-4 py-3 p-md-3">
                            Suggested Teaching
                        </DropdownItemComingSoon>
                    </DropdownMenu>
                </UncontrolledDropdown>

                <UncontrolledDropdown nav inNavbar>
                    <DropdownToggle nav caret className="py-3 pl-3 pr-6">
                        Help and Support
                    </DropdownToggle>
                    <DropdownMenu className="p-0 pb-3 pl-3 m-0">
                        <DropdownItemComingSoon className="pl-4 py-3 p-md-3">
                            Teacher Support
                        </DropdownItemComingSoon>
                        <DropdownItemComingSoon className="pl-4 py-3 p-md-3">
                            Student Support
                        </DropdownItemComingSoon>
                        <DropdownItemComingSoon className="pl-4 py-3 p-md-3">
                            Contact Us
                        </DropdownItemComingSoon>
                    </DropdownMenu>
                </UncontrolledDropdown>

                {user && user.loggedIn && user.role == "ADMIN" &&
                    <UncontrolledDropdown nav inNavbar>
                        <DropdownToggle nav caret className="py-3 pl-3 pr-6">
                            Admin
                        </DropdownToggle>
                        <DropdownMenu className="p-0 pl-md-3 m-0">
                            <DropdownItem className="pl-4 py-3 p-md-3">
                                <Link to="/admin">Admin Tools</Link>
                            </DropdownItem>
                        </DropdownMenu>
                    </UncontrolledDropdown>
                }
            </Nav>
        </Collapse>
    </Navbar>;
};

export const NavigationBar = withRouter(connect(stateToProps)(NavigationBarComponent));
