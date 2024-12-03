import React from "react";
import {Link} from "react-router-dom";
import {selectors, useAppSelector} from "../../../state";
import {Button, Col, Container, Row, UncontrolledTooltip} from "reactstrap";
import {MainSearch} from "../../elements/MainSearch";
import {NavigationBarPhy} from "./NavigationBarPhy";
import {HeaderStreakGauge} from "../../elements/views/StreakGauge";
import {useDeviceSize} from "../../../services";

export const HeaderPhy = () => {
    const user = useAppSelector(selectors.user.orNull);
    const streakRecord = useAppSelector(selectors.user.snapshot);
    const mainContentId = useAppSelector(selectors.mainContentId.orDefault);
    const deviceSize = useDeviceSize();
    return <header className="bg-white" data-testid={"header"}>
        <Container className="container-fluid px-0">
            <Row className="align-items-center">
                <Col className="d-grid">
                    <div className="d-flex justify-content-between mx-3 mx-md-0">
                        <div className="header-logo">
                            <Link to="/">
                                <img src="/assets/phy/logo.svg" alt="Isaac Physics" className="d-none d-md-block d-print-block p-3"/>
                                <img src="/assets/phy/logo-small.svg" alt="Isaac Physics" className="d-sm-block d-md-none d-print-none p-3"/>
                            </Link>
                        </div>

                        <a href={`#${mainContentId}`} className="skip-main">Skip to main content</a>

                        {/* <div className="m-md-0 d-none d-md-block d-flex align-self-center d-print-none ps-4">
                            {user?.loggedIn &&
                                <React.Fragment>
                                    <div id="header-progress" className="d-none d-md-block">
                                        Streak:
                                        <HeaderStreakGauge streakRecord={streakRecord}/>
                                    </div>
                                    <UncontrolledTooltip placement="bottom" autohide={false} target="header-progress">
                                        The weekly streak indicates the number of consecutive weeks you have been active on Isaac.
                                        <br/><br/>Answer at least <b>ten question parts</b> correctly per week to fill up your weekly progress bar and increase your streak!
                                    </UncontrolledTooltip>
                                </React.Fragment>}
                        </div> */}

                        {/* <div className="header-links ms-auto pe-3 px-md-3 d-flex align-items-center d-print-none pt-lg-3">
                            {user &&
                                (!user.loggedIn ?
                                    <React.Fragment>
                                        <div className="login mx-5 mx-sm-2">
                                            <Link to="/login">
                                                <span>LOG IN</span>
                                            </Link>
                                        </div>
                                        <div className="signup m-0 me-md-4 ms-md-3">
                                            <Link to="/register">
                                                <span>SIGN UP</span>
                                            </Link>
                                        </div>
                                    </React.Fragment>
                                    :
                                    <React.Fragment>
                                        <div className="my-account mx-5 mx-sm-2">
                                            <Link to="/account">
                                                {user.givenName && user.givenName.length <= 20 &&
                                                    <strong className="d-md-block d-none">Hello {user.givenName}</strong>
                                                }
                                                <span>{`${!["xs"].includes(deviceSize) ? "MY " : ""}ACCOUNT`}</span>
                                            </Link>
                                        </div>
                                        <div className="logout m-0 me-md-4 ms-md-3">
                                            <Link to="/logout">
                                                <span>LOG OUT</span>
                                            </Link>
                                        </div>
                                    </React.Fragment>
                                )
                            }
                        </div> */}

                        <div className="d-flex justify-content-end align-items-center flex-wrap p-3">
                            <Link className="px-3" to="/about">About Isaac</Link>
                            <Link className="px-3" to="/questions">Question finder</Link>
                            <Link className="px-3" to="/concepts">Concepts</Link>
                            <Link className="px-3" to="/news">News</Link>
                            <Link className="px-3" to="/events">Events</Link>
                            <Link className="px-3" to="/books">Books</Link>
                            {/* TODO: replace with dropdown */}
                            <Link className="ps-3 pe-4" to="/">Help</Link> 
                            {user && user.loggedIn 
                                ? <>
                                    <Link className="ps-3 pe-3 h-70 border-start align-content-center" to="/admin">
                                        <img src="/assets/phy/icons/settings-cog.svg" alt="Admin" className="no-print"/>
                                    </Link>
                                    <Link to="/logout">Log out</Link>
                                </>
                                : <Button color="solid">Sign up / log in</Button>
                            }
                        </div>

                        {/* <div className="header-search m-md-0 ms-md-auto align-items-center d-print-none pt-3">
                            <MainSearch />
                        </div> */}
                    </div>
                    <NavigationBarPhy/>
                </Col>
            </Row>
        </Container>
    </header>;
};
