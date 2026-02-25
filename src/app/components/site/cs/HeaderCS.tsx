import React, {useState} from "react";
import {selectors, useAppSelector} from "../../../state";
import {Collapse, Nav, Navbar, NavbarBrand, NavbarToggler} from "reactstrap";
import {
    isAdmin,
    isAdminOrEventManager,
    isEventLeader,
    isLoggedIn,
    isStaff,
    isTutorOrAbove,
    PATHS
} from "../../../services";
import {
    LinkItem,
    MenuBadge,
    MenuOpenContext,
    NavigationSection,
    useAssignmentsCount
} from "../../navigation/NavigationBar";
import classNames from "classnames";
import {AdaHeaderSearch} from "../../elements/SearchInputs";
import { useNavigate } from "react-router";

export const HeaderCS = () => {
    const user = useAppSelector(selectors.user.orNull);
    const {assignmentsCount, quizzesCount} = useAssignmentsCount();

    const mainContentId = useAppSelector(selectors.mainContentId.orDefault);

    const [isOpen, setIsOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    const navigate = useNavigate();

    const closeWholeNavbar = () => {
        setIsOpen(false);
        setIsSearchOpen(false);
    };

    return <header className="light" data-testid={"header"}>
        <Navbar expand="nav" className={"px-0 px-nav-3 pb-0 pb-nav-2"}>
            <NavbarBrand href="/" className="header-logo ms-3 mb-2 mb-nav-0 link-light">
                <img src="/assets/common/logos/ada_logo_3-stack_aqua_white_text.svg" alt="Ada Computer Science" />
            </NavbarBrand>

            <a href={`#${mainContentId}`} className="skip-main position-absolute">Skip to main content</a>

            <button aria-label="Toggle search bar" className={"ms-auto me-4 search-toggler d-nav-none"} onClick={() => setIsSearchOpen(!isSearchOpen)}>
                <span className={"search-toggler-icon"}/>
            </button>
            <NavbarToggler className={classNames("me-4", {"open": isOpen})} onClick={() => setIsOpen(!isOpen)} />

            <MenuOpenContext.Provider value={{menuOpen: isOpen, setMenuOpen: setIsOpen}}>
                <Collapse className={"search-collapse p-3 p-nav-0 me-nav-2 border-nav-0"} isOpen={isSearchOpen} navbar>
                    <AdaHeaderSearch className={"ms-nav-2 d-nav-inline-block d-block"} onSearch={(s) => {
                        void navigate(`/search?query=${encodeURIComponent(s)}`);
                        closeWholeNavbar();
                    }} clearOnSearch />
                </Collapse>
                <Collapse isOpen={isOpen} navbar>
                    <Nav navbar className={"w-100"}>
                        <NavigationSection topLevelLink to="/" title={"Home"}/>

                        <NavigationSection title="Resources">
                            <LinkItem to="/topics">Topics</LinkItem>
                            <LinkItem to={PATHS.QUESTION_FINDER}>Questions</LinkItem>
                            <LinkItem to="/projects">Projects</LinkItem>
                            <LinkItem to="/glossary">Glossary</LinkItem>
                            <LinkItem to={"/exam_specifications"}>Specifications</LinkItem>
                        </NavigationSection>

                        <NavigationSection title="Students">
                            <LinkItem to="/students">Ada CS for students</LinkItem>
                            <LinkItem to="/pages/stem_smart_programme">STEM SMART</LinkItem>
                            <LinkItem to="/pages/student_challenges">Challenges</LinkItem>
                            <LinkItem to="/support/student">Support</LinkItem>
                        </NavigationSection>

                        <NavigationSection title="Teachers">
                            <LinkItem to="/teachers">Ada CS for teachers</LinkItem>
                            <LinkItem to="/teaching_order">Suggested teaching order</LinkItem>
                            <LinkItem to="/pages/online_courses">Online courses</LinkItem>
                            <LinkItem to="/teacher_mentoring">Mentoring programme</LinkItem>
                            <LinkItem to="/support/teacher">Support</LinkItem>
                        </NavigationSection>

                        <NavigationSection className={"text-start-nav"} topLevelLink to="/contact" title={"Contact us"}/>

                        <div className={"navbar-separator d-nav-none d-block"}/>

                        {!isLoggedIn(user)
                            ? <>
                                <NavigationSection className={"ms-nav-auto text-center text-start-nav"} topLevelLink to="/register" title={"Sign up"}/>
                                <NavigationSection className={"text-center text-start-nav"} topLevelLink to="/login" title={"Log in"}/>
                            </>
                            :
                            <>
                                <div className={"ms-nav-auto"}></div>
                                {(isStaff(user) || isEventLeader(user)) && <NavigationSection title="Admin">
                                    {isStaff(user) && <LinkItem to="/admin">Admin tools</LinkItem>}
                                    {isAdmin(user) && <LinkItem to="/admin/usermanager">User manager</LinkItem>}
                                    {(isEventLeader(user) || isAdminOrEventManager(user)) && <LinkItem to="/admin/events">Event admin</LinkItem>}
                                    {isStaff(user) && <LinkItem to="/admin/stats">Site statistics</LinkItem>}
                                    {isStaff(user) && <LinkItem to="/admin/content_errors">Content errors</LinkItem>}
                                </NavigationSection>}
                                <NavigationSection title={<>My Ada {<MenuBadge count={assignmentsCount + quizzesCount} message="incomplete assignments" data-testid="my-assignments-badge" />}</>}>
                                    {isTutorOrAbove(user) ?
                                        <>
                                            <LinkItem to="/dashboard">Overview</LinkItem>
                                            <LinkItem to="/groups">Teaching groups</LinkItem>
                                            <LinkItem to={PATHS.SET_ASSIGNMENTS}>Manage assignments</LinkItem>
                                            <LinkItem to="/set_tests">Manage tests</LinkItem>
                                            <LinkItem to={PATHS.ASSIGNMENT_PROGRESS}>Markbook</LinkItem>
                                            <LinkItem to={PATHS.MY_ASSIGNMENTS}>Work to do {<MenuBadge count={assignmentsCount} message="incomplete assignments" />}</LinkItem>
                                        </>
                                        :
                                        <>
                                            <LinkItem to={PATHS.MY_ASSIGNMENTS}>My assignments {<MenuBadge count={assignmentsCount} message="incomplete assignments" />}</LinkItem>
                                            <LinkItem to="/tests">My tests {<MenuBadge count={quizzesCount} message="incomplete tests" />}</LinkItem>
                                            <LinkItem to="/progress">My progress</LinkItem>
                                        </>
                                    }
                                    <LinkItem to="/account">My account</LinkItem>
                                </NavigationSection>
                                <div className={"navbar-separator d-nav-none d-block"}/>
                                <NavigationSection className={"text-center text-start-nav"} topLevelLink to="/logout" title={"Log out"}/>
                            </>
                        }

                        <div className={"navbar-separator d-nav-none d-block"}/>
                    </Nav>
                </Collapse>
            </MenuOpenContext.Provider>
        </Navbar>
    </header>;
};
