import React from "react";
import {Col, ListGroup, ListGroupItem, Row} from "reactstrap";
import {SITE_TITLE, siteSpecific, SOCIAL_LINKS} from "../../../services";
import {ExternalLink} from "../ExternalLink";

const getSocialIconForSite = (name: string) => {
    return siteSpecific(
        `/assets/${name}_icon.svg`,
        `/assets/logos/ada_${name}_icon.svg`
    )
}

export const SocialLinksRow = () => {
    return (
        <div className='footer-links footer-links-social'>
            <h2 className="h5">Get social</h2>
            {
                siteSpecific(
                    // Physics
                    <ListGroup className='mt-3 pb-5 py-lg-3 link-list d-md-flex flex-row'>
                        {Object.entries(SOCIAL_LINKS).map(([_, {name, href}]) =>
                            <ListGroupItem key={name} className='border-0 px-0 py-0 pb-1 bg-transparent'>
                                <ExternalLink href={href}>
                                    <img src={getSocialIconForSite(name.toLowerCase())} alt={`${SITE_TITLE} on ${name}`}
                                         className='social-logo'/>
                                </ExternalLink>
                            </ListGroupItem>
                        )}
                    </ListGroup>,

                    // CS
                    <Row className='mt-3 pb-5 py-lg-3 d-md-flex'>
                        {Object.entries(SOCIAL_LINKS).map(([_, {name, href}]) =>
                            <Col key={name}>
                                <ExternalLink href={href}>
                                    <img src={getSocialIconForSite(name.toLowerCase())} alt={`${SITE_TITLE} on ${name}`}
                                         className='img-fluid'/>
                                </ExternalLink>
                            </Col>
                        )}
                    </Row>
                )
            }
        </div>
    );
};
