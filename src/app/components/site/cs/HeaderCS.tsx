import React from "react";
import {Link} from "react-router-dom";
import {useSelector} from "react-redux";
import {Col, Container, Row} from "reactstrap";
import {MainSearch} from "../../elements/MainSearch";
import {NavigationBarCS} from "./NavigationBarCS";
import {selectors} from "../../../state/selectors";

export const HeaderCS = () => {
    const user = useSelector(selectors.user.orNull);
    const mainContentId = useSelector(selectors.mainContentId.orDefault);
    return <header className="light">
        <Container className="container-fluid px-0">
            <Row>
                <Col>
                    <div className="header-bar mx-3 mx-md-0 py-3 d-md-flex">
                        <div className="header-logo">
                            <Link to="/">
                                <img src="/assets/logo.svg" alt="Isaac Computer Science" />
                            </Link>
                        </div>

                        <a href={`#${mainContentId}`} className="skip-main">Skip to main content</a>

                        <div className="header-links ml-auto pr-3 px-md-3 d-flex align-items-center d-print-none">
                            {user &&
                                (!user.loggedIn ?
                                    <React.Fragment>
                                        <div className="login mx-5 mx-sm-2">
                                            <Link to="/login">
                                                <span>LOG IN</span>
                                            </Link>
                                        </div>
                                        <div className="signup m-0 mr-md-4 ml-md-3">
                                            <Link to="/register">
                                                <span>SIGN UP</span>
                                            </Link>
                                        </div>
                                    </React.Fragment>
                                    :
                                    <React.Fragment>
                                        <div className="my-account mx-5 mx-sm-2">
                                            <Link to="/account">
                                                <span>MY ACCOUNT</span>
                                            </Link>
                                        </div>
                                        <div className="logout m-0 mr-md-4 ml-md-3">
                                            <Link to="/logout">
                                                <span>LOG OUT</span>
                                            </Link>
                                        </div>
                                    </React.Fragment>
                                )
                            }
                        </div>

                        <div className="header-search m-md-0 ml-md-auto align-items-center d-print-none">
                            <MainSearch />
                        </div>
                    </div>

                    <NavigationBarCS />
                </Col>
            </Row>
        </Container>
    </header>;
};
