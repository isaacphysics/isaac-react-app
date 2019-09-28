import React from "react";
import {Link} from "react-router-dom";
import {connect} from "react-redux";
import {AppState} from "../../state/reducers";
import {Col, Container, Row} from "reactstrap";
import {RouteComponentProps, withRouter} from "react-router";
import {LoggedInUser} from "../../../IsaacAppTypes";
import {NavigationBar} from "./NavigationBar";
import {MainSearch} from "../elements/MainSearch";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const stateToProps = (state: AppState, _: RouteComponentProps) => (state && {user: state.user});

interface HeaderProps {
    user: LoggedInUser | null;
}

const HeaderComponent = ({user}: HeaderProps) => {
    return <header className="light">
        <Container className="container-fluid px-0">
            <Row>
                <Col>
                    <div className="header-bar mx-3 mx-md-0 py-3 d-md-flex">
                        <div className="header-logo">
                            <Link to="/home">
                                <img src="/assets/logo.svg" alt="Isaac Computer Science" />
                            </Link>
                        </div>

                        <a href="#main" className="skip-main">Skip to main content</a>

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

                    <NavigationBar />
                </Col>
            </Row>
        </Container>
    </header>;
};

export const Header = withRouter(connect(stateToProps)(HeaderComponent));
