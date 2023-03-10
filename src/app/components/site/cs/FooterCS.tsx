/* eslint-disable react/jsx-no-target-blank */
import React from "react";
import {Container, Col, Row, ListGroup, ListGroupItem} from "reactstrap";
import {ListGroupFooter} from "../../elements/list-groups/ListGroupFooter";
import {ListGroupSocial} from "../../elements/list-groups/ListGroupSocial";
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
                    <Col xs={{size: 10}} md={{size: 5, offset: 0}} lg={{size: 2, offset: 5}}>
                        <ListGroupSocial />
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
                        <Col xs={{size: 12}} md={{size: 5}} lg={{size: 2}}>
                            <div>
                                <ListGroup className='d-flex flex-row link-list'>
                                    <ListGroupItem className='border-0 px-0 py-0 pb-1 bg-transparent'>
                                        <a href="https://www.raspberrypi.org/" target="_blank" rel="noopener" className="d-inline font-weight-bold">
                                            <img src="/assets/logos/ada_rpf_icon.svg" alt='Raspberry Pi website' className='org-logo' />
                                        </a>
                                    </ListGroupItem>
                                    <ListGroupItem className='border-0 px-0 py-0 pb-1 bg-transparent'>
                                        <a href="https://www.cam.ac.uk/" target="_blank" rel="noopener" className="d-inline font-weight-bold">
                                            <img src="/assets/logos/ada_cambridge_icon.svg" alt='University of Cambridge website' className='org-logo' />
                                        </a>
                                    </ListGroupItem>
                                </ListGroup>
                            </div>
                        </Col>
                    </Row>
                </div>
            </Container>
        </div>
    </footer>
);
