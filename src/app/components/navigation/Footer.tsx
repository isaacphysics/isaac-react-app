import React from "react";
import {Container, Col, Row} from "reactstrap";
import {ListGroupFooter} from "../elements/ListGroupFooter";
import {ListGroupSocial} from "../elements/ListGroupSocial";
import {ListGroupFooterBottom} from "../elements/ListGroupFooterBottom";
import {Link} from "react-router-dom";

const ExternalLink = ({href, children}: {href: string; children: any}) => (
    // eslint-disable-next-line react/jsx-no-target-blank
    <a href={href} target="_blank" rel="noopener" className="d-inline font-weight-bold">
        {children}
    </a>
);

export const Footer = () => (
    <footer>
        <div className="footerTop">
            <Container>
                <Row className="pt-5 px-3 px-sm-0 pb-3 pb-md-5">
                    <Col className="footer-links logo-col">
                        <div className="d-flex flex-row">
                            <Link to="/">
                                <img
                                    src="/assets/logo-inverse.svg"
                                    className="footerLogo"
                                    alt="Isaac Computer Science logo"
                                />
                            </Link>
                        </div>
                        <div className=" logo-text">
                            <p>
                                A <ExternalLink href="https://www.gov.uk/government/organisations/department-for-education">Department for Education</ExternalLink> project,
                                part of the <ExternalLink href="https://teachcomputing.org/">National Centre for Computing Education</ExternalLink> and created by
                                the <ExternalLink href="https://www.cam.ac.uk/">University of Cambridge</ExternalLink> and
                                the <ExternalLink href="https://www.raspberrypi.org/">Raspberry Pi Foundation</ExternalLink>.
                            </p>
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
                <Row className="pt-3 px-3 px-sm-0 pb-3">
                    <ListGroupFooterBottom />
                </Row>
            </Container>
        </div>
    </footer>
);
