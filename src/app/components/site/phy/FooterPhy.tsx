import React from "react";
import {Col, Row} from "reactstrap";
import {ListGroupFooter} from "../../elements/list-groups/ListGroupFooter";
import {SocialLinksRow} from "../../elements/list-groups/SocialLinks";
import {Link} from "react-router-dom";
import {ExternalLink} from "../../elements/ExternalLink";

export const FooterPhy = () => (
    <footer>
        <div className="footer-top d-print-none px-5">           
            <Row className="pt-5">
                <Col xl={{size: 3, offset: 0}}>
                    <a href="https://www.cam.ac.uk/" target="_blank" rel="noopener" className="mt-2 mb-1">
                        <img src="/assets/common/logos/university_of_cambridge.svg" alt='University of Cambridge website' width="160px" className='footer-org-logo' />
                    </a>
                    <div className="footer-links logo-text">
                            Funded by {' '} <ExternalLink href="https://www.cam.ac.uk/" className="d-inline">
                            <u>University of Cambridge</u>.
                        </ExternalLink>        
                        <br />Supported by {' '} <ExternalLink href="https://www.gov.uk/government/organisations/department-for-education" className="d-inline">
                            <u>Department for Education</u>
                        </ExternalLink> and {' '} 
                        <ExternalLink href="https://www.ogdentrust.com/" className="d-inline">
                            <u>The&nbsp;Ogden&nbsp;Trust</u>.
                        </ExternalLink>
                    </div>
                </Col>
                <Col xl={{size: 6, offset: 0}} lg={{size: 8, offset: 0}} md={{size: 8, offset: 0}} className="mt-4">
                    <ListGroupFooter />
                </Col>
                <Col lg={{size: 3, offset: 0}} md={{size: 4, offset: 0}} className="mt-4">
                    <SocialLinksRow />
                </Col>
            </Row>
            <Row className="footer-links logo-text">
                <Col lg={{size: 5, offset: 0}}>
                    All materials on this site are licensed under the {' '}
                    <ExternalLink href="https://creativecommons.org/licenses/by/4.0/" className="d-inline">
                        <u>Creative&nbsp;Commons&nbsp;license</u>
                    </ExternalLink> unless stated otherwise.
                </Col>
                <Col lg={{size: 6, offset: 1}} className="pt-3 pb-4 footer-link footer-links-aligned">
                    <Row>
                        <Col>
                            <Link to="/accessibility">Accessibility statement</Link>
                        </Col>
                        <Col>
                            <Link to="/privacy">Privacy policy</Link>
                        </Col>
                        <Col>
                            <Link to="/cookies">Cookie policy</Link>
                        </Col>
                        <Col>
                            <Link to="/terms">Terms of use</Link>
                        </Col>
                    </Row>                   
                </Col>    
            </Row>           
        </div>
    </footer>
);
