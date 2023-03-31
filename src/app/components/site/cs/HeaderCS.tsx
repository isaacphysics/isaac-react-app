import React, {useState} from "react";
import {selectors, useAppSelector} from "../../../state";
import {Collapse, Nav, Navbar, NavbarBrand, NavbarToggler} from "reactstrap";
import {
    isAdmin,
    isAdminOrEventManager,
    isEventLeader, isLoggedIn,
    isStaff,
    isTeacherOrAbove,
    isTutorOrAbove, PATHS
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

    const closeWholeNavbar = () => {
        setIsOpen(false);
        setIsSearchOpen(false);
    };

    return <header className="light" data-testid={"header"}>
        <Navbar expand="nav" className={"px-0 px-nav-3 pb-0 pb-nav-2"}>
            <NavbarBrand href="/" className="header-logo ml-3 mb-2 mb-nav-0 link-light">
                <img src="/assets/logos/ada_logo_3-stack_aqua_white_text.svg" alt="Ada Computer Science" />
            </NavbarBrand>

            <a href={`#${mainContentId}`} className="skip-main position-absolute">Skip to main content</a>

            <button aria-label="Toggle search bar" className={"ml-auto mr-4 search-toggler d-nav-none"} onClick={() => setIsSearchOpen(!isSearchOpen)}>
                <span className={"search-toggler-icon"}/>
            </button>
            <NavbarToggler className={classNames("mr-4", {"open": isOpen})} onClick={() => setIsOpen(!isOpen)} />

            <MenuOpenContext.Provider value={{menuOpen: isOpen, setMenuOpen: setIsOpen}}>
                <Collapse className={"search-collapse p-3 p-nav-0 mr-nav-2 border-nav-0"} isOpen={isSearchOpen} navbar>
                    <AdaHeaderSearch className={"ml-nav-2 d-nav-inline-block d-block"} onSearch={closeWholeNavbar} />
                </Collapse>
                <Collapse isOpen={isOpen} navbar>
                    <Nav navbar className={"w-100"}>
                        <NavigationSection topLevelLink to="/" title={"Home"}/>

                        <NavigationSection title="Learn">
                            <LinkItem to="/topics">Topics</LinkItem>
                            <LinkItem to={PATHS.QUESTION_FINDER}>Questions</LinkItem>
                            {/* <LinkItem to="/pages/workbooks_2020">Workbooks</LinkItem> Hidden for Ada launch */}
                            <LinkItem to="/glossary">Glossary</LinkItem>
                            <LinkItem to="/pages/computer_science_stories">CS stories</LinkItem>
                            <LinkItem to={"/exam_specifications"}>Exam specifications</LinkItem>
                        </NavigationSection>

                        {isTutorOrAbove(user) && <NavigationSection title="Teach">
                            <LinkItem to="/groups">Groups</LinkItem>
                            <LinkItem to={PATHS.SET_ASSIGNMENTS}>Set quizzes</LinkItem>
                            <LinkItem to={PATHS.ASSIGNMENT_PROGRESS}>Markbook</LinkItem>
                            {isTeacherOrAbove(user) && <>
                                {/*<LinkItem to="/set_tests">Manage tests</LinkItem>*/}
                                <LinkItem to="/teaching_order">Suggested teaching order</LinkItem>
                            </>}
                        </NavigationSection>}

                        {isLoggedIn(user) && <NavigationSection title={<>My Ada {<MenuBadge count={assignmentsCount/* + quizzesCount*/} message="incomplete assignments" />}</>}>
                            <LinkItem to="/assignments">My assignments {<MenuBadge count={assignmentsCount} message="incomplete assignments" />}</LinkItem>
                            <LinkItem to={PATHS.MY_GAMEBOARDS}>My quizzes</LinkItem>
                            <LinkItem to="/progress">My progress</LinkItem>
                            <LinkItem to="/account">My account</LinkItem>
                            {/*<LinkItem to="/tests">My tests {<MenuBadge count={quizzesCount} message="incomplete tests" />}</LinkItem>*/}
                            {/*<LinkItem to="/student_rewards">Student rewards</LinkItem>*/}
                        </NavigationSection>}

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
    </header>;
};
