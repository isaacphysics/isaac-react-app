import React from "react";
import {Container, Col, Row} from "reactstrap";
import {ListGroupFooter} from "../../elements/list-groups/ListGroupFooter";
import {ListGroupSocial} from "../../elements/list-groups/ListGroupSocial";
import {Link} from "react-router-dom";

const ExternalLink = ({href, children}: {href: string; children: any}) => (
    // eslint-disable-next-line react/jsx-no-target-blank
    <a href={href} target="_blank" rel="noopener" className="d-inline font-weight-bold">
        {children}
    </a>
);

export const FooterPhy = () => (
    <footer>
        <div className="footer-top d-print-none">
            <Container>
                <Row className="px-3 px-sm-0 pb-3 pb-md-4">
                    <Col md="4" lg="3" className="logo-col">
                        <div className="d-flex flex-row">
                            <Link to="/">
                                <img
                                    src="/assets/phy/logo-small.svg"
                                    className="footer-logo"
                                    alt="Isaac Physics homepage"
                                />
                            </Link>
                        </div>
                        <div className="footer-links logo-text pt-3">
                            A&nbsp;<ExternalLink href="https://www.gov.uk/government/organisations/department-for-education">
                                <strong>Department for Education</strong>
                            </ExternalLink> project at the {' '}
                            <ExternalLink href="https://www.cam.ac.uk">
                                <strong>University&nbsp;of&nbsp;Cambridge</strong>
                            </ExternalLink>,
                            <br />supported by {' '}
                            <ExternalLink href="https://www.ogdentrust.com/">
                                <strong>The&nbsp;Ogden&nbsp;Trust</strong>
                            </ExternalLink>.
                        </div>
                    </Col>
                    <Col md={{size: 7, offset: 1}} lg={{size: 5, offset: 1}} className="pt-5 mt-4 mt-md-0">
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
                    <div className="w-100">
                        <div className='text-center'>
                            All materials on this site are licensed under the {" "}
                            <ExternalLink href="https://creativecommons.org/licenses/by/4.0/">
                                <strong>Creative&nbsp;Commons&nbsp;license</strong>
                            </ExternalLink>, unless stated otherwise.
                        </div>
                    </div>
                </Row>
            </Container>
        </div>
    </footer>
);
