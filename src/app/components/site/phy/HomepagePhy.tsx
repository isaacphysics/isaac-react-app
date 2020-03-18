import React, {useEffect} from "react";
import {connect} from "react-redux";
import {Link} from "react-router-dom";
import {Button, Col, Container, Row} from "reactstrap";
import {AppState} from "../../../state/reducers";
import {LoggedInUser} from "../../../../IsaacAppTypes";
import {NewsCarousel} from "../../elements/NewsCarousel";
import {SITE_SUBJECT_TITLE} from "../../../services/siteConstants";

const stateToProps = (state: AppState) => ({user: state ? state.user : null});
const dispatchToProps = null;

interface HomePageProps {
    user: LoggedInUser | null;
}
export const HomepageComponent = ({user}: HomePageProps) => {
    useEffect( () => {
        document.title = "Isaac " + SITE_SUBJECT_TITLE;
    }, []);
    return <div id="homepage" className="pb-5">
        <section id="call-to-action" className="homepageHero">
            <Container className="pt-4">
                <Row className="d-none d-md-flex mt-3">
                    <Col>
                        <h2 className="h5">Mastering Physics by Solving Problems<span className="d-none d-md-inline">: from School to University!</span></h2>
                    </Col>
                </Row>
                <Row className="py-4">
                    <Col xs={12} md={6}>
                        <table className="homepagePhyTable homepageLearn"><tbody>
                            <tr>
                                <th rowSpan={3}><span>Learn</span></th>
                                <td className="h5"><Link to="/gcse">GCSE</Link></td>
                            </tr>
                            <tr>
                                <td className="h5"><Link to="/alevel">A Level</Link></td>
                            </tr>
                            <tr>
                                <td className="h5"><Link to="/support/student">Student Support</Link></td>
                            </tr>
                        </tbody></table>
                    </Col>
                    <Col xs={12} md={6}>
                        <table className="homepagePhyTable homepageTeach"><tbody>
                            <tr>
                                <th rowSpan={3}><span>Teach</span></th>
                                <td className="h5"><Link to="/teacher_features">Teacher Features</Link></td>
                            </tr>
                            <tr>
                                <td className="h5"><Link to="/pages/teacher_cpd">Teacher CPD</Link></td>
                            </tr>
                            <tr>
                                <td className="h5"><Link to="/support/teacher">Teacher Support</Link></td>
                            </tr>
                        </tbody></table>
                    </Col>
                </Row>
            </Container>
        </section>

        <section>
            <Container>
                {!(user && user.loggedIn) && <Row>
                    <Col size={6} className="pb-4 pt-1 text-center">
                        <Button size="lg" tag={Link} to={user && user.loggedIn ? "/topics" : "/register"} color="secondary" block>
                            {user && user.loggedIn ? "Find a topic" : "Sign up"}
                        </Button>
                    </Col>
                    <Col size={6} className="pb-4 pt-1 text-center">
                        <Button size="lg" tag={Link} to={user && user.loggedIn ? "/search" : "/login"} color="primary" outline block>
                            {user && user.loggedIn ? "Search the site" : "Log in"}
                        </Button>
                    </Col>
                </Row>}
            </Container>
        </section>

        <section id="news">
            <Container>
                <Row className="eventList pt-1 pattern-03-reverse">
                    <NewsCarousel descending={true} subject="physics" />
                </Row>
            </Container>
        </section>

        {!(user && user.loggedIn) && <section className="row">
            <Container>
                <Col className="mt-4 py-4 px-5 d-flex align-items-center flex-column flex-md-row border bg-white">
                    <h3 className="text-center text-md-left mr-md-4 mr-lg-0 mb-3 mb-md-0">
                        Sign up to track your progress
                    </h3>
                    <Button tag={Link} size="lg" className="ml-md-auto mr-md-3 mr-lg-5 btn-xl" to={"/register"}>
                        Sign up
                    </Button>
                </Col>
            </Container>
        </section>}
    </div>
};

export const HomepagePhy = connect(stateToProps, dispatchToProps)(HomepageComponent);
