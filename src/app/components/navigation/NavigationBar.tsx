import React, {useState} from "react";
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
    const [menuOpen, setMenuOpen] = useState(false);

    const DropdownItemComingSoon = ({children, className}: {children: string; className: string}) => (
        <RS.DropdownItem className={`${className}`} aria-disabled="true">
            <Link to="/pages/coming_soon">{children}</Link>
            <RS.Badge color="secondary" className="ml-2 mr-1">Coming Soon</RS.Badge>
        </RS.DropdownItem>
    );

    return <React.Fragment>
        <RS.Navbar light color="primary" expand="sm">
            <RS.NavbarBrand tag={Link} to="/" className="header-logo">
                <img src="/assets/logo.svg" alt="Isaac Computer Science"/>
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

        <div id="main-nav-container" className="mx-0 px-0">
            <RS.Row className="mx-0 px-0">
                <RS.Col md={{size: 10, offset: 1}} lg={{size: 8, offset: 2}} className="p-0">
                    <RS.Navbar className="main-nav p-0" color="light" light expand="md">
                        <RS.NavbarToggler onClick={() => setMenuOpen(!menuOpen)}>MENU</RS.NavbarToggler>
                        <RS.Collapse isOpen={menuOpen} navbar>
                            <RS.Nav navbar className="justify-content-between">

                                <RS.UncontrolledDropdown nav inNavbar>
                                    <RS.DropdownToggle nav caret className="py-3 pl-3 pr-6">
                                        About Us
                                    </RS.DropdownToggle>
                                    <RS.DropdownMenu className="p-0 pb-3 pl-3 m-0">
                                        <RS.DropdownItem className="px-3 pt-3">
                                            <Link to="/about">What We Do</Link>
                                        </RS.DropdownItem>
                                        {/*<DropdownItemComingSoon className="px-3 pt-3">*/}
                                        {/*    News*/}
                                        {/*</DropdownItemComingSoon>*/}
                                        <DropdownItemComingSoon className="px-3 pt-3">
                                            Get Involved
                                        </DropdownItemComingSoon>
                                        <DropdownItemComingSoon className="px-3 pt-3">
                                            Isaac Physics
                                        </DropdownItemComingSoon>
                                        <DropdownItemComingSoon className="px-3 pt-3">
                                            Events
                                        </DropdownItemComingSoon>
                                    </RS.DropdownMenu>
                                </RS.UncontrolledDropdown>

                                <RS.UncontrolledDropdown nav inNavbar>
                                    <RS.DropdownToggle nav caret className="py-3 pl-3 pr-6">
                                        For Students
                                    </RS.DropdownToggle>
                                    <RS.DropdownMenu className="p-0 pb-3 pl-3 m-0">
                                        <DropdownItemComingSoon className="px-3 pt-3">
                                            My Gameboards
                                        </DropdownItemComingSoon>
                                        <DropdownItemComingSoon className="px-3 pt-3">
                                            My Assignments
                                        </DropdownItemComingSoon>
                                        <DropdownItemComingSoon className="px-3 pt-3">
                                            My Progress
                                        </DropdownItemComingSoon>
                                        <DropdownItemComingSoon className="px-3 pt-3">
                                            Problem Solving
                                        </DropdownItemComingSoon>
                                    </RS.DropdownMenu>
                                </RS.UncontrolledDropdown>
                                <RS.UncontrolledDropdown nav inNavbar>
                                    <RS.DropdownToggle nav caret className="py-3 pl-3 pr-6">
                                        For Teachers
                                    </RS.DropdownToggle>
                                    <RS.DropdownMenu caret className="p-0 pb-3 pl-3 m-0">
                                        <DropdownItemComingSoon className="px-3 pt-3">
                                            Set Assignments
                                        </DropdownItemComingSoon>
                                        <DropdownItemComingSoon className="px-3 pt-3">
                                            Assignment Progress
                                        </DropdownItemComingSoon>
                                        <DropdownItemComingSoon className="px-3 pt-3">
                                            Manage Groups
                                        </DropdownItemComingSoon>
                                        <DropdownItemComingSoon className="px-3 pt-3">
                                            My Progress
                                        </DropdownItemComingSoon>
                                    </RS.DropdownMenu>
                                </RS.UncontrolledDropdown>

                                <RS.UncontrolledDropdown nav inNavbar>
                                    <RS.DropdownToggle nav caret className="py-3 pl-3 pr-6">
                                        Topics
                                    </RS.DropdownToggle>
                                    <RS.DropdownMenu className="p-0 pb-3 pl-3 m-0">
                                        <RS.DropdownItem className="px-3 pt-3">
                                            <Link to="/topics">All Topics</Link>
                                        </RS.DropdownItem>
                                        <DropdownItemComingSoon className="px-3 pt-3">
                                            Syllabus View
                                        </DropdownItemComingSoon>
                                        <DropdownItemComingSoon className="px-3 pt-3">
                                            Suggested Teaching
                                        </DropdownItemComingSoon>
                                    </RS.DropdownMenu>
                                </RS.UncontrolledDropdown>

                                <RS.UncontrolledDropdown nav inNavbar>
                                    <RS.DropdownToggle nav caret className="py-3 pl-3 pr-6">
                                        Help and Support
                                    </RS.DropdownToggle>
                                    <RS.DropdownMenu className="p-0 pb-3 pl-3 m-0">
                                        <DropdownItemComingSoon className="px-3 pt-3">
                                            Teacher Support
                                        </DropdownItemComingSoon>
                                        <DropdownItemComingSoon className="px-3 pt-3">
                                            Student Support
                                        </DropdownItemComingSoon>
                                        <DropdownItemComingSoon className="px-3 pt-3">
                                            Contact Us
                                        </DropdownItemComingSoon>
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
                        </RS.Collapse>
                    </RS.Navbar>
                </RS.Col>
            </RS.Row>
        </div>
    </React.Fragment>;
};

export const NavigationBar = connect(stateToProps)(NavigationBarComponent);
