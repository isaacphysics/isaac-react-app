import React from "react";
import {Container, Col, Row} from "reactstrap";
import {ListGroupFooter} from "../../elements/list-groups/ListGroupFooter";
import {Link} from "react-router-dom";
import {SocialLinksRow} from "../../elements/list-groups/SocialLinks";

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
                    <Col md="4" className="logo-col">
                        <div className="d-flex flex-row">
                            <Link to="/">
                                <img
                                    src="/assets/phy/logo-small.svg"
                                    className="footer-logo"
                                    alt="Isaac Physics homepage"
                                />
                            </Link>
                        </div>
                        <div className="footer-links logo-text pt-3 mt-1">
                            <a href="https://www.cam.ac.uk/" target="_blank" rel="noopener" className="mt-2 mb-3">
                                <img src="/assets/common/logos/university_of_cambridge.svg" alt='University of Cambridge website' className='footer-org-logo' />
                            </a>
                            Funded by&nbsp;<ExternalLink href="https://www.gov.uk/government/organisations/department-for-education">
                            <strong>Department for Education</strong>
                            </ExternalLink>.
                            <br />Supported by {' '}
                            <ExternalLink href="https://www.ogdentrust.com/">
                                <strong>The&nbsp;Ogden&nbsp;Trust</strong>
                            </ExternalLink>.
                        </div>
                    </Col>
                    <Col md={{size: 7, offset: 1}} lg={{size: 5, offset: 0}} className="pt-5 mt-4 mt-md-0">
                        <ListGroupFooter />
                    </Col>
                    <Col md="5" lg="3" className="pt-5 mt-4 mt-lg-0">
                        <SocialLinksRow />
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
