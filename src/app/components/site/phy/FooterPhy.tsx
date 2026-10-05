import React from "react";
import {Col, Row} from "reactstrap";
import {ListGroupFooter} from "../../elements/list-groups/ListGroupFooter";
import {SocialLinksRow} from "../../elements/list-groups/SocialLinks";
import {Link} from "react-router-dom";
import {ExternalLink} from "../../elements/ExternalLink";
import { Trans } from "react-i18next";
import i18next from "i18next";

export const FooterPhy = () => (
    <footer className="d-print-none px-7">
        <Row className="pt-7">
            <Col xl={{size: 3, offset: 0}}>
                <a href="https://www.cam.ac.uk/" target="_blank" rel="noopener" className="mt-2 mb-1 img-link">
                    <img src="/assets/common/logos/university_of_cambridge.svg" alt={i18next.t("sci:footer.cambridgeLogoAlt")} className='footer-org-logo' />
                </a>
                <div className="logo-text">
                    <Trans
                        i18nKey="sci:footer.supportText"
                        components={{
                            cambridgeLink: <ExternalLink href="https://www.cam.ac.uk/" className="d-inline" />,
                            u1: <u />,
                            ogdenTrustLink: <ExternalLink href="https://www.ogdentrust.com/" className="d-inline" />,
                            u2: <u />,
                            br: <br />,
                            dfeLink: <ExternalLink href="https://www.gov.uk/government/organisations/department-for-education" className="d-inline" />,
                            u3: <u />,
                        }}
                    />
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
                <Trans
                    i18nKey="sci:footer.licenseText"
                    components={{
                        creativeCommonsLink: <ExternalLink href="https://creativecommons.org/licenses/by/4.0/" className="d-inline" />,
                        u: <u />,
                    }}
                />
            </Col>
            <Col lg={7} className="d-flex pt-3 pb-4 pe-lg-3 column-gap-4 flex-wrap justify-content-start justify-content-lg-end">
                <Link to="/accessibility">{i18next.t("sci:footer.accessibilityLink")}</Link>
                <Link to="/privacy">{i18next.t("sci:footer.privacyLink")}</Link>
                <Link to="/cookies">{i18next.t("sci:footer.cookieLink")}</Link>
                <Link to="/terms">{i18next.t("sci:footer.termsLink")}</Link>
            </Col>
        </Row>
    </footer>
);
