import React from "react";
import {Container, Col, Row} from "reactstrap";
import {ListGroupFooter} from "../../elements/list-groups/ListGroupFooter";
import {Link} from "react-router-dom";
import {SocialLinksRow} from "../../elements/list-groups/SocialLinks";

export const PrintableLogo = ({logo, alt, dataSite}: {logo: string, alt: string, dataSite: string}) => {
    return <>
        <img src={`/assets/common/logos/${logo}_white.svg`} alt={alt} className="no-print img-fluid footer-org-logo" data-site={dataSite} />
        <img src={`/assets/common/logos/${logo}_black.svg`} alt={alt} className="only-print img-fluid footer-org-logo" data-site={dataSite} />
    </>;
};

export const FooterCS = () => (
    <footer>
        <div className="footer-top d-print-none">
            <Container fluid className="py-7">
                <Row className="justify-content-start">
                    <Col xs={"auto"} className={"me-7 mb-4 mb-md-0"}>
                        <Link to="/" className="d-block">
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
                <div className='footer-links footer-bottom pb-7'>
                    <Row className="justify-content-between">
                        <Col xs={{size: 12}} md={{size: 6, order: 2}} lg={{size: 6}} xl={{size: 6}} className="text-cs-white text-start text-md-end">
                            <p>
                                All teaching materials on this site are available under a <a href="https://creativecommons.org/licenses/by-nc-sa/4.0" className="d-inline link-light text-white">CC BY-NC-SA 4.0</a> license, except where otherwise stated.
                            </p>
                        </Col>
                        <Col xs={{size: 12}} md={{size: 6, order: 1}} lg={{size: 6}} xl={{size: 6}} className="col-xxl-2">
                            <div className="logo-grid">
                                <a href="https://www.cam.ac.uk/" target="_blank" rel="noopener">
                                    <PrintableLogo logo="university_of_cambridge" alt="University of Cambridge website" dataSite="uoc" />
                                </a>
                                <a href="https://www.raspberrypi.org/" target="_blank" rel="noopener">
                                    <PrintableLogo logo="rpf" alt="Raspberry Pi website" dataSite="rpf" />
                                </a>
                                <PrintableLogo logo="funded_by_uk_govt" alt="Funded by the UK Government" dataSite="ukgovt" />
                                <PrintableLogo logo="techfirst" alt="The TechFirst logo" dataSite="techfirst" />
                                
                            </div>
                        </Col>
                        
                    </Row>
                </div>
            </Container>
        </div>
    </footer>
);
