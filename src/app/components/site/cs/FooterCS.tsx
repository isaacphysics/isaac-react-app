import React from "react";
import {Container, Col, Row} from "reactstrap";
import {ListGroupFooter} from "../../elements/list-groups/ListGroupFooter";
import {Link} from "react-router-dom";
import {SocialLinksRow} from "../../elements/list-groups/SocialLinks";

export const FooterCS = () => (
    <footer>
        <div className="footer-top d-print-none">
            <Container fluid className="py-5">
                <Row className="justify-content-start">
                    <Col xs={"auto"} className={"me-5 mb-4 mb-md-0"}>
                        <Link to="/">
                            <img
                                src="/assets/common/logos/ada_logo_stamp_aqua.svg"
                                className="footer-logo"
                                alt="Ada Computer Science homepage"
                            />
                        </Link>
                    </Col>
                    <Col xs={12} md={8} lg={"auto"}>
                        <ListGroupFooter />
                    </Col>
                    <Col className={"float-end ms-lg-auto"} lg={"auto"}>
                        <SocialLinksRow />
                    </Col>
                </Row>
            </Container>
        </div>
        <div className="footer-bottom">
            <Container fluid>
                <div className='footer-rule mb-4' />
                <div className='footer-links footer-bottom pb-5'>
                    <Row className="justify-content-between">
                        <Col xs={{size: 12}} md={{size: 7, order: 2}} lg={{size: 8}} xl={{size: 9}} className="text-cs-white text-start text-md-end">
                            <p>
                                All teaching materials on this site are available under a <a href="https://creativecommons.org/licenses/by-nc-sa/4.0" className="d-inline link-light text-white">CC BY-NC-SA 4.0</a> license, except where otherwise stated.
                            </p>
                        </Col>
                        <Col xs={{size: 12}} md={{size: 5, order: 1}} lg={{size: 4}} xl={{size: 3}} className="col-xxl-2">
                            <Row className="align-items-center">
                                <Col>
                                    <a href="https://www.cam.ac.uk/" target="_blank" rel="noopener">
                                        <img src="/assets/common/logos/university_of_cambridge.svg" alt='University of Cambridge website' className='img-fluid footer-org-logo' />
                                    </a>
                                </Col>
                                <Col>
                                    <a href="https://www.raspberrypi.org/" target="_blank" rel="noopener">
                                        <img src="/assets/common/logos/ada_rpf_icon.svg" alt='Raspberry Pi website' className='img-fluid footer-org-logo' />
                                    </a>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                </div>
            </Container>
        </div>
    </footer>
);
