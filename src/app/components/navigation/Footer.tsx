import React from "react";
import {Container, Col, Row} from "reactstrap";
import {ListGroupFooter} from "../elements/list-groups/ListGroupFooter";
import {ListGroupSocial} from "../elements/list-groups/ListGroupSocial";
import {ListGroupFooterBottom} from "../elements/list-groups/ListGroupFooterBottom";
import {Link} from "react-router-dom";
import {SITE_SUBJECT, SITE} from "../../services/siteConstants";
import {ListGroupPhysics} from "../elements/list-groups/ListGroupPhysics";

const ExternalLink = ({href, children}: {href: string; children: any}) => (
    // eslint-disable-next-line react/jsx-no-target-blank
    <a href={href} target="_blank" rel="noopener" className="d-inline font-weight-bold">
        {children}
    </a>
);

export const Footer = () => (
    <footer>
        <div className="footerTop d-print-none">
            <Container>
                <Row className="px-3 px-sm-0 pb-3 pb-md-5">
                    {SITE_SUBJECT === SITE.CS ?
                        <Col md='4' lg='3' className="pt-5 logo-col">
                            <div className="d-flex flex-row">
                                <Link to="/">
                                    <img
                                        src="/assets/logo-inverse.svg"
                                        className="footerLogo"
                                        alt="Isaac Computer Science homepage"
                                    />
                                </Link>
                            </div>
                            <div className="pt-5 footer-links logo-text pt-3">
                                <p>
                                    A <ExternalLink href="https://www.gov.uk/government/organisations/department-for-education">Department for Education</ExternalLink> project,
                                    part of the <ExternalLink href="https://teachcomputing.org/">National Centre for Computing Education</ExternalLink> and created by
                                    the <ExternalLink href="https://www.cam.ac.uk/">University of Cambridge</ExternalLink> and
                                    the <ExternalLink href="https://www.raspberrypi.org/">Raspberry Pi Foundation</ExternalLink>.
                                </p>
                            </div>
                        </Col>
                        :
                        <Col md="4" lg="3" className="logo-col">
                            <div className="d-flex flex-row">
                                <Link to="/">
                                    <img
                                        src="/assets/phy/logo-small.svg"
                                        className="footerLogo"
                                        alt="Isaac Physics homepage"
                                    />
                                </Link>
                            </div>
                        </Col>
                    }
                    <Col
                        md={{size: 7, offset: 1}}
                        lg={{size: 5, offset: 1}}
                        className="pt-5 mt-4 mt-md-0"
                    >
                        <ListGroupFooter />
                    </Col>
                    <Col md="5" lg="3" className="pt-5 mt-4 mt-lg-0">
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
