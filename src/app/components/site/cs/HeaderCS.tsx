import React from "react";
import {Link} from "react-router-dom";
import {selectors, useAppSelector} from "../../../state";
import {Col, Collapse, Container, Nav, Navbar, NavbarBrand, NavbarToggler, Row} from "reactstrap";
import {MainSearch} from "../../elements/MainSearch";
import {NavigationBarCS} from "./NavigationBarCS";
import {
    isAdmin,
    isAdminOrEventManager,
    isEventLeader,
    isStaff,
    isTeacherOrAbove,
    isTutorOrAbove,
    useDeviceSize
} from "../../../services";
import {LinkItem, MenuBadge, NavigationSection, useAssignmentsCount} from "../../navigation/NavigationBar";

export const HeaderCS = () => {
    const user = useAppSelector(selectors.user.orNull);
    const {assignmentsCount, quizzesCount} = useAssignmentsCount();

    const mainContentId = useAppSelector(selectors.mainContentId.orDefault);
    const deviceSize = useDeviceSize();

    const [isOpen, setIsOpen] = React.useState(false);

    return <header className="light" data-testid={"header"}>
        <Container>
            <Navbar expand="md">
                <Container className="px-0">
                    <NavbarBrand href="/" className="header-logo">
                        <img src="/assets/logos/ada_logo_3-stack_aqua_white_text.svg" alt="Ada Computer Science" />
                    </NavbarBrand>
                </Container>

                <a href={`#${mainContentId}`} className="skip-main">Skip to main content</a>

                <NavbarToggler onClick={() => setIsOpen(!isOpen)} />
                <Collapse isOpen={isOpen} navbar>
                    <NavigationSection title={<>My Ada {<MenuBadge count={assignmentsCount + quizzesCount} message="incomplete assignments and tests" />}</>}>
                        <LinkItem to="/assignments">My assignments {<MenuBadge count={assignmentsCount} message="incomplete assignments" />}</LinkItem>
                        <LinkItem to="/my_gameboards">My gameboards</LinkItem>
                        <LinkItem to="/progress">My progress</LinkItem>
                        <LinkItem to="/tests">My tests {<MenuBadge count={quizzesCount} message="incomplete tests" />}</LinkItem>
                        <LinkItem to="/student_rewards">Student rewards</LinkItem>
                    </NavigationSection>

                    {isTutorOrAbove(user) && <NavigationSection title="Teachers">
                        <LinkItem to="/groups">Manage groups</LinkItem>
                        <LinkItem to="/set_assignments">Set assignments</LinkItem>
                        <LinkItem to="/my_markbook">Markbook</LinkItem>
                        {isTeacherOrAbove(user) && <>
                            <LinkItem to="/set_tests">Manage tests</LinkItem>
                            <LinkItem to="/teaching_order">Suggested teaching order</LinkItem>
                        </>}
                    </NavigationSection>}

                    <NavigationSection title="Learn">
                        <LinkItem to="/topics/gcse">GCSE topics</LinkItem>
                        <LinkItem to="/topics/a_level">A level topics</LinkItem>
                        <LinkItem to="/gameboards/new">Question Finder</LinkItem>
                        <LinkItem to="/pages/workbooks_2020">Workbooks</LinkItem>
                        <LinkItem to="/glossary">Glossary</LinkItem>
                        <LinkItem to="/pages/computer_science_journeys_gallery">Computer science journeys</LinkItem>
                    </NavigationSection>

                    <NavigationSection title="Events">
                        {isTeacherOrAbove(user) && <LinkItem to="/events?show_reservations_only=true">My event reservations</LinkItem>}
                        <LinkItem to="/events?types=student">Student events</LinkItem>
                        <LinkItem to="/events?types=teacher">Teacher events</LinkItem>
                        <LinkItem to="/pages/event_types">Event formats</LinkItem>
                        <LinkItem to="/safeguarding">Safeguarding</LinkItem>
                    </NavigationSection>

                    <NavigationSection title={<React.Fragment>
                        <span className="d-md-none d-lg-inline">Help and support</span>
                        <span className="d-none d-md-inline d-lg-none">Support</span>
                    </React.Fragment>}>
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
                </Collapse>
            </Navbar>
        </Container>

        {/* TODO ADA remove old header */}
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
