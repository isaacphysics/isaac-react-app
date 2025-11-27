import React from "react";
import {Col, Row} from "reactstrap";
import {ListGroupFooter} from "../../elements/list-groups/ListGroupFooter";
import {SocialLinksRow} from "../../elements/list-groups/SocialLinks";
import {Link} from "react-router-dom";
import {ExternalLink} from "../../elements/ExternalLink";

export const FooterPhy = () => (
    <footer className="d-print-none px-7">
        <Row className="pt-7">
            <Col xl={{size: 3, offset: 0}}>
                <a href="https://www.cam.ac.uk/" target="_blank" rel="noopener" className="mt-2 mb-1 img-link">
                    <img src="/assets/common/logos/university_of_cambridge.svg" alt='University of Cambridge website' className='footer-org-logo' />
                </a>
                <div className="logo-text">
                    Supported by the {' '} <ExternalLink href="https://www.cam.ac.uk/" className="d-inline">
                        <u>University of Cambridge</u>
                    </ExternalLink> and <ExternalLink href="https://www.ogdentrust.com/" className="d-inline">
                        <u>The&nbsp;Ogden&nbsp;Trust</u>.
                    </ExternalLink>
                    <br />
                    Founded in collaboration with the {' '} <ExternalLink href="https://www.gov.uk/government/organisations/department-for-education" className="d-inline">
                        <u>Department for Education England</u>
                    </ExternalLink>.
                </div>
            </Col>
            <Col md={{size: 8, offset: 0}} lg={{size: 8, offset: 0}} xl={{size: 7, offset: 0}} className="d-flex flex-column justify-content-xl-end flex-sm-row mt-4">
                <ListGroupFooter />
            </Col>
            <Col md={{size: 4, offset: 0}} lg={{size: 3, offset: 1}} xl={{size: 2, offset: 0}} className="mt-sm-4">
                <SocialLinksRow />
            </Col>
        </Row>
        <Row className="logo-text pe-4 align-items-center">
            <Col lg={5}>
                All materials on this site are licensed under the {' '}
                <ExternalLink href="https://creativecommons.org/licenses/by/4.0/" className="d-inline">
                    <u>Creative&nbsp;Commons&nbsp;license</u>
                </ExternalLink> unless stated otherwise.
            </Col>
            <Col lg={7} className="d-flex pt-3 pb-4 pe-lg-3 column-gap-4 flex-wrap justify-content-start justify-content-lg-end">
                <Link to="/accessibility">Accessibility statement</Link>
                <Link to="/privacy">Privacy policy</Link>
                <Link to="/cookies">Cookie policy</Link>
                <Link to="/terms">Terms of use</Link>
            </Col>
        </Row>
    </footer>
);
