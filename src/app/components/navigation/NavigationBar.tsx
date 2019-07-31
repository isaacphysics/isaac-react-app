import React, {useState} from "react";
import {Link} from "react-router-dom";
import {connect} from "react-redux";
import {AppState} from "../../state/reducers";
import {Badge, Collapse, DropdownItem, DropdownToggle, DropdownMenu, Nav, Navbar, NavbarToggler, UncontrolledDropdown} from "reactstrap";
import {RouteComponentProps, withRouter} from "react-router";
import {LoggedInUser} from "../../../IsaacAppTypes";
import {isAdmin, isStaff} from "../../services/user";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const stateToProps = (state: AppState, _: RouteComponentProps) => (state && {user: state.user});

interface NavigationBarProps {
    user: LoggedInUser | null;
}

const NavigationBarComponent = ({user}: NavigationBarProps) => {
    const [menuOpen, setMenuOpen] = useState(false);

    const DropdownItemComingSoon = ({children, className}: {children: React.ReactNode; className: string}) => (
        <DropdownItem tag={Link} to="/coming_soon" className={`${className}`} aria-disabled="true">
            <span className="mr-2 text-muted">{children}</span>
            <Badge  color="light" className="border-secondary border bg-white ml-auto mr-1">Coming soon</Badge>
        </DropdownItem>
    );

    const closeMenuIfMobile = () => {
        setMenuOpen(false);
    };

    return <Navbar className="main-nav p-0" color="light" light expand="md">
        <NavbarToggler onClick={() => setMenuOpen(!menuOpen)}>Menu</NavbarToggler>

        <Collapse isOpen={menuOpen} navbar className="px-0 mx-0 px-xl-5 mx-xl-5">
            <Nav navbar className="justify-content-between">

                <UncontrolledDropdown nav inNavbar>
                    <DropdownToggle nav caret className="p-3 ml-3 mr-3">
                        About us
                    </DropdownToggle>
                    <DropdownMenu className="p-3 pt-0 m-0 ml-lg-4" onClick={closeMenuIfMobile}>
                        <DropdownItem tag={Link} to="/about" className="pl-4 py-3 p-md-3">
                            What we do
                        </DropdownItem>
                        <DropdownItem tag="a" href="https://isaaccomputerscience.org/events" target="_blank" rel="noopener noreferrer" className="pl-4 py-3 p-md-3">
                            Events (Eventbrite)
                        </DropdownItem>
                    </DropdownMenu>
                </UncontrolledDropdown>

                <UncontrolledDropdown nav inNavbar>
                    <DropdownToggle nav caret className="p-3 ml-3 mr-3">
                        <p className="m-0"><span className="d-md-none d-lg-inline">{"For "}</span> Students</p>
                    </DropdownToggle>
                    <DropdownMenu className="p-3 pt-0 m-0 ml-lg-4" onClick={closeMenuIfMobile}>
                        <DropdownItem tag={Link} to="/students" className="pl-4 py-3 p-md-3">
                            For students
                        </DropdownItem>
                        <DropdownItem tag={Link} to="/assignments" className="pl-4 py-3 p-md-3">
                            My assignments
                        </DropdownItem>
                        <DropdownItemComingSoon className="pl-4 py-3 p-md-3">
                            My gameboards
                        </DropdownItemComingSoon>
                        <DropdownItemComingSoon className="pl-4 py-3 p-md-3">
                            My progress
                        </DropdownItemComingSoon>
                        {/*<DropdownItemComingSoon className="pl-4 py-3 p-md-3">*/}
                        {/*    Problem-solving*/}
                        {/*</DropdownItemComingSoon>*/}
                    </DropdownMenu>
                </UncontrolledDropdown>

                <UncontrolledDropdown nav inNavbar>
                    <DropdownToggle nav caret className="p-3 ml-3 mr-3">
                        <p className="m-0"><span className="d-md-none d-lg-inline">{"For "}</span> Teachers</p>
                    </DropdownToggle>
                    <DropdownMenu className="p-3 pt-0 m-0 ml-lg-4" onClick={closeMenuIfMobile}>
                        <DropdownItem tag={Link} to="/teachers" className="pl-4 py-3 p-md-3">
                            For teachers
                        </DropdownItem>
                        <DropdownItem tag={Link} to="/set_assignments" className="pl-4 py-3 p-md-3">
                            Set assignments
                        </DropdownItem>
                        <DropdownItem tag={Link} to="/assignment_progress" className="pl-4 py-3 p-md-3">
                            Assignment progress
                        </DropdownItem>
                        <DropdownItem tag={Link} to="/groups" className="pl-4 py-3 p-md-3">
                            Manage groups
                        </DropdownItem>
                    </DropdownMenu>
                </UncontrolledDropdown>

                <UncontrolledDropdown nav inNavbar>
                    <DropdownToggle nav caret className="p-3 ml-3 mr-3">
                        Topics
                    </DropdownToggle>
                    <DropdownMenu className="p-3 pt-0 m-0 ml-lg-4" onClick={closeMenuIfMobile}>
                        <DropdownItem tag={Link} to="/topics" className="pl-4 py-3 p-md-3">
                            All topics
                        </DropdownItem>
                        <DropdownItemComingSoon className="pl-4 py-3 p-md-3">
                            Syllabus view
                        </DropdownItemComingSoon>
                        <DropdownItemComingSoon className="pl-4 py-3 p-md-3">
                            Suggested teaching
                        </DropdownItemComingSoon>
                    </DropdownMenu>
                </UncontrolledDropdown>

                <UncontrolledDropdown nav inNavbar>
                    <DropdownToggle nav caret className="p-3 ml-3 mr-3">
                        <span className="m-0"><span className="d-md-none d-lg-inline">{"Help and "}</span> Support</span>
                    </DropdownToggle>
                    <DropdownMenu className="p-3 pt-0 m-0 ml-lg-4" onClick={closeMenuIfMobile}>
                        <DropdownItem tag={Link} to="/support/teacher" className="pl-4 py-3 p-md-3">
                            Teacher support
                        </DropdownItem>
                        <DropdownItem tag={Link} to="/support/student"  className="pl-4 py-3 p-md-3">
                            Student support
                        </DropdownItem>
                        <DropdownItem tag={Link} to="/contact" className="pl-4 py-3 p-md-3">
                            Contact us
                        </DropdownItem>
                    </DropdownMenu>
                </UncontrolledDropdown>

                {isStaff(user) &&
                    <UncontrolledDropdown nav inNavbar>
                        <DropdownToggle nav caret className="p-3 ml-3 mr-3">
                            Admin
                        </DropdownToggle>
                        <DropdownMenu className="p-0 pl-md-3 m-0" onClick={closeMenuIfMobile}>
                            <DropdownItem tag={Link} to="/admin" className="pl-4 py-3 p-md-3">
                                Admin tools
                            </DropdownItem>
                            {isAdmin(user) && <DropdownItem tag={Link} to="/admin/usermanager" className="pl-4 py-3 p-md-3">
                                User manager
                            </DropdownItem>}
                            <DropdownItem tag={Link} to="/admin/stats" className="pl-4 py-3 p-md-3">
                                Site statistics
                            </DropdownItem>
                            <DropdownItem tag={Link} to="/admin/content_errors" className="pl-4 py-3 p-md-3">
                                Content errors
                            </DropdownItem>
                        </DropdownMenu>
                    </UncontrolledDropdown>
                }
            </Nav>
        </Collapse>
    </Navbar>;
};

export const NavigationBar = withRouter(connect(stateToProps)(NavigationBarComponent));
