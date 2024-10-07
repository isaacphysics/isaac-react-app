import React from "react";
import {Col, Row} from "reactstrap";
import {SITE_TITLE, siteSpecific, SOCIAL_LINKS} from "../../../services";
import {ExternalLink} from "../ExternalLink";

const getSocialIcon = (name: string) => {
    if (name === "x (twitter)") {
        return "/assets/common/logos/x_icon.svg";
    }
    return `/assets/common/logos/${name}_icon.svg`;
};

export const SocialLinksRow = () => {
    const linksByColumn = [Object.entries(SOCIAL_LINKS).slice(0, 2), Object.entries(SOCIAL_LINKS).slice(2, 4)];
    return (
        <div className='footer-links footer-links-social'>
            {
                siteSpecific(
                    // Physics
                    <>
                        <h5>Get social</h5>
                        <Row>
                            {linksByColumn.map((column, index) => (
                                <Col key={index}>
                                    {column.map(([_, {name, href}]) =>
                                        <ExternalLink href={href}  key={name}>
                                            <img src={getSocialIcon(name.toLowerCase())} alt={`${SITE_TITLE} on ${name}`}
                                                className='social-logo'/>
                                        </ExternalLink>
                                    )}
                                </Col>
                            ))}
                        </Row>
                    </>,
                    // CS
                    <>
                        <h2>Get social</h2>
                        <div className='mt-1 text-nowrap'>
                            {Object.entries(SOCIAL_LINKS).map(([_, {name, href}]) =>
                                <div className={"me-3 d-inline-block"} key={name}>
                                    <ExternalLink href={href}>
                                        <img src={getSocialIcon(name.toLowerCase())} alt={`${SITE_TITLE} on ${name}`}
                                            className='img-fluid footer-social-logo'/>
                                    </ExternalLink>
                                </div>
                            )}
                        </div>
                    </>
                )
            }
        </div>
    );
};
