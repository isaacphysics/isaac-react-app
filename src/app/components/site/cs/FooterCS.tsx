/* eslint-disable react/jsx-no-target-blank */
import React from "react";
import {Container, Col, Row, ListGroup, ListGroupItem} from "reactstrap";
import {ListGroupFooter} from "../../elements/list-groups/ListGroupFooter";
import {SocialLinksRow} from "../../elements/list-groups/SocialLinksRow";
import {Link} from "react-router-dom";

export const FooterCS = () => (
    <footer>
        <div className="footer-top d-print-none">
            <Container fluid className="py-5">
                <Row className="justify-content-between">
                    <Col xs={{size: 2}} lg={{size: 1}}>
                        <Link to="/">
                            <img
                                src="/assets/logos/ada_logo_stamp_aqua.svg"
                                className="footer-logo mb-4"
                                alt="Ada Computer Science homepage"
                            />
                        </Link>
                    </Col>
                    <Col xs={{size: 12}} md={{size: 10}} lg={{size: 3}}>
                        <ListGroupFooter />
                    </Col>
                    <Col xs={{size: 10}} md={{size: 5, offset: 0}} lg={{size: 4, offset: 2}} xl={{size: 3, offset: 5}} xxl={{size: 2, offset: 5}}>
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
                        <Col xs={{size: 12}} md={{size: 6}} className="footer-bottom-info">
                            <p>
                                All teaching materials on this site are available under a <a href="https://creativecommons.org/licenses/by-nc-sa/4.0" className="d-inline">CC BY-NC-SA 4.0</a> license, except where otherwise stated.
                            </p>
                        </Col>
                        <Col xs={{size: 12}} md={{size: 5}} lg={{size: 4}} xl={{size: 3}} xxl={{size: 2}}>
                            <Row className="align-items-center">
                                <Col>
                                    <a href="https://www.raspberrypi.org/" target="_blank" rel="noopener">
                                        <img src="/assets/logos/ada_rpf_icon.svg" alt='Raspberry Pi website' className='img-fluid' />
                                    </a>
                                </Col>
                                <Col>
                                    <a href="https://www.cam.ac.uk/" target="_blank" rel="noopener">
                                        <img src="/assets/logos/ada_cambridge_icon.svg" alt='University of Cambridge website' className='img-fluid' />
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
