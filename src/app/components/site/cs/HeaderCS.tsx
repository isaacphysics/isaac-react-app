import React, {useState} from "react";
import {selectors, useAppSelector} from "../../../state";
import {Collapse, Input, Nav, Navbar, NavbarBrand, NavbarToggler} from "reactstrap";
import {
    isAdmin,
    isAdminOrEventManager,
    isEventLeader, isLoggedIn,
    isStaff,
    isTeacherOrAbove,
    isTutorOrAbove
} from "../../../services";
import {LinkItem, MenuBadge, MenuOpenContext, NavigationSection, useAssignmentsCount} from "../../navigation/NavigationBar";
import classNames from "classnames";
import {AdaHeaderSearch} from "../../elements/SearchInputs";

export const HeaderCS = () => {
    const user = useAppSelector(selectors.user.orNull);
    const {assignmentsCount, quizzesCount} = useAssignmentsCount();

    const mainContentId = useAppSelector(selectors.mainContentId.orDefault);

    const [isOpen, setIsOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    return <header className="light" data-testid={"header"}>
        <Navbar expand="nav" className={"px-0 px-nav-3 pb-0 pb-nav-2"}>
            <NavbarBrand href="/" className="header-logo ml-3 mb-2 mb-nav-0">
                <img src="/assets/logos/ada_logo_3-stack_aqua_white_text.svg" alt="Ada Computer Science" />
            </NavbarBrand>

            <a href={`#${mainContentId}`} className="skip-main">Skip to main content</a>

            <button aria-label="Toggle search bar" className={"ml-auto mr-4 search-toggler d-nav-none"} onClick={() => setIsSearchOpen(!isSearchOpen)}>
                <span className={"search-toggler-icon"}/>
            </button>
            <NavbarToggler className={classNames("mr-4", {"open": isOpen})} onClick={() => setIsOpen(!isOpen)} />

            <MenuOpenContext.Provider value={{menuOpen: isOpen, setMenuOpen: setIsOpen}}>
                <Collapse className={"search-collapse p-3 p-nav-0 mr-nav-2 border-nav-0"} isOpen={isSearchOpen} navbar>
                    <AdaHeaderSearch className={"ml-nav-2 d-nav-inline-block d-block"} />
                </Collapse>
                <Collapse isOpen={isOpen} navbar>
                    <Nav navbar className={"w-100"}>
                        <NavigationSection topLevelLink to="/" title={"Home"}/>

                        <NavigationSection title="Learn">
                            <LinkItem to="/topics">Topics</LinkItem>
                            <LinkItem to="/quizzes/new">Question Finder</LinkItem>
                            <LinkItem to="/pages/workbooks_2020">Workbooks</LinkItem>
                            <LinkItem to="/glossary">Glossary</LinkItem>
                            <LinkItem to="/pages/computer_science_journeys_gallery">Computer science journeys</LinkItem>
                        </NavigationSection>

                        {isTutorOrAbove(user) && <NavigationSection title="Teach">
                            <LinkItem to="/groups">Manage groups</LinkItem>
                            <LinkItem to="/set_assignments">Set assignments</LinkItem>
                            <LinkItem to="/my_markbook">Markbook</LinkItem>
                            {isTeacherOrAbove(user) && <>
                                {/*<LinkItem to="/set_tests">Manage tests</LinkItem>*/}
                                <LinkItem to="/teaching_order">Suggested teaching order</LinkItem>
                            </>}
                        </NavigationSection>}

                        <NavigationSection title={<>My Ada {<MenuBadge count={assignmentsCount/* + quizzesCount*/} message="incomplete assignments" />}</>}>
                            <LinkItem to="/assignments">My assignments {<MenuBadge count={assignmentsCount} message="incomplete assignments" />}</LinkItem>
                            <LinkItem to="/my_gameboards">My gameboards</LinkItem>
                            <LinkItem to="/progress">My progress</LinkItem>
                            {/*<LinkItem to="/tests">My tests {<MenuBadge count={quizzesCount} message="incomplete tests" />}</LinkItem>*/}
                            <LinkItem to="/student_rewards">Student rewards</LinkItem>
                        </NavigationSection>

                        <NavigationSection title={"Help"}>
                            <LinkItem to="/support/teacher">Teacher support</LinkItem>
                            <LinkItem to="/support/student">Student support</LinkItem>
                            <LinkItem to="/contact">Contact us</LinkItem>
                        </NavigationSection>

                        {(isStaff(user) || isEventLeader(user)) && <NavigationSection title="Admin">
                            {isStaff(user) && <LinkItem to="/admin">Admin tools</LinkItem>}
                            {isAdmin(user) && <LinkItem to="/admin/usermanager">User manager</LinkItem>}
                            {(isEventLeader(user) || isAdminOrEventManager(user)) && <LinkItem to="/admin/events">Event admin</LinkItem>}
                            {isStaff(user) && <LinkItem to="/admin/stats">Site statistics</LinkItem>}
                            {isStaff(user) && <LinkItem to="/admin/content_errors">Content errors</LinkItem>}
                        </NavigationSection>}

                        <div className={"navbar-separator d-nav-none d-block"}/>

                        {!isLoggedIn(user)
                            ? <>
                                <NavigationSection className={"ml-nav-auto text-center text-left-nav"} topLevelLink to="/register" title={"Sign up"}/>
                                <NavigationSection className={"text-center text-left-nav"} topLevelLink to="/login" title={"Log in"}/>
                            </>
                            : <NavigationSection className={"ml-nav-auto text-center text-left-nav"} topLevelLink to="/logout" title={"Log out"}/>
                        }

                        <div className={"navbar-separator d-nav-none d-block"}/>
                    </Nav>
                </Collapse>
            </MenuOpenContext.Provider>
        </Navbar>

        {/* FIXME ADA remove old header */}
        {/*<Container className="container-fluid px-0">*/}
        {/*    <Row>*/}
        {/*        <Col>*/}
        {/*            <div className="header-bar mx-3 mx-md-0 py-3 d-md-flex">*/}
        {/*                <div className="header-logo">*/}
        {/*                    <Link to="/">*/}
        {/*                        <img src="/assets/logo.svg" alt="Ada Computer Science" />*/}
        {/*                    </Link>*/}
        {/*                </div>*/}

        {/*                <a href={`#${mainContentId}`} className="skip-main">Skip to main content</a>*/}

        {/*                <div className="header-links ml-auto pr-3 px-md-3 d-flex align-items-center d-print-none">*/}
        {/*                    {user &&*/}
        {/*                        (!user.loggedIn ?*/}
        {/*                            <React.Fragment>*/}
        {/*                                <div className="login mx-5 mx-sm-2">*/}
        {/*                                    <Link to="/login">*/}
        {/*                                        <span>LOG IN</span>*/}
        {/*                                    </Link>*/}
        {/*                                </div>*/}
        {/*                                <div className="signup m-0 mr-md-4 ml-md-3">*/}
        {/*                                    <Link to="/register">*/}
        {/*                                        <span>SIGN UP</span>*/}
        {/*                                    </Link>*/}
        {/*                                </div>*/}
        {/*                            </React.Fragment>*/}
        {/*                            :*/}
        {/*                            <React.Fragment>*/}
        {/*                                <div className="my-account mx-5 mx-sm-2">*/}
        {/*                                    <Link to="/account">*/}
        {/*                                        <span>{`${!["xs"].includes(deviceSize) ? "MY " : ""}ACCOUNT`}</span>*/}
        {/*                                    </Link>*/}
        {/*                                </div>*/}
        {/*                                <div className="logout m-0 mr-md-4 ml-md-3">*/}
        {/*                                    <Link to="/logout">*/}
        {/*                                        <span>LOG OUT</span>*/}
        {/*                                    </Link>*/}
        {/*                                </div>*/}
        {/*                            </React.Fragment>*/}
        {/*                        )*/}
        {/*                    }*/}
        {/*                </div>*/}

        {/*                <div className="header-search m-md-0 ml-md-auto align-items-center d-print-none">*/}
        {/*                    <MainSearch />*/}
        {/*                </div>*/}
        {/*            </div>*/}

        {/*            <NavigationBarCS />*/}
        {/*        </Col>*/}
        {/*    </Row>*/}
        {/*</Container>*/}
    </header>;
};
