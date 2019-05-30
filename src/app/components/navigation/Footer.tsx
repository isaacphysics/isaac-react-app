import React from "react";
import {Container, Col, Row} from "reactstrap";
import {ListGroupFooter} from "../elements/ListGroupFooter";
import {ListGroupSocial} from "../elements/ListGroupSocial";
import {ListGroupFooterBottom} from "../elements/ListGroupFooterBottom";

export const Footer = () => (
    <footer>
        <div className="footerTop">
            <Container>
                <Row className="pt-5 px-3 px-sm-0 pb-3 pb-md-5">
                    <Col className="footer-links logo-col">
                        <div className="d-flex flex-row">
                            <img
                                src="/assets/logo-inverse.svg"
                                className="footerLogo"
                                alt="Isaac Computer Science logo"
                            />
                        </div>
                        <div className="d-flex flex-row logo-text">
                            A Department for Education project at the University of
                            Cambridge.
                        </div>
                    </Col>
                    <Col md="6" lg="6" className="mt-4 mt-md-0">
                        <ListGroupFooter />
                    </Col>
                    <Col xs="12" sm="5" lg="3" className="mt-4 mt-lg-0">
                        <ListGroupSocial />
                    </Col>
                </Row>
            </Container>
        </div>
        <div className="footerBottom">
            <Container>
                <Row className="pt-5 px-3 px-sm-0 pb-3 pb-md-5">
                    <ListGroupFooterBottom />
                </Row>
            </Container>
        </div>
    </footer>
);
