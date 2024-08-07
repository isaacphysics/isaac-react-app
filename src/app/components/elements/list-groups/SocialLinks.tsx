import React from "react";
import {ListGroup, ListGroupItem} from "reactstrap";
import {SITE_TITLE, siteSpecific, SOCIAL_LINKS} from "../../../services";
import {ExternalLink} from "../ExternalLink";

const getSocialIcon = (name: string) => {
    if (name === "x (twitter)") {
        return "/assets/common/logos/x_icon.svg";
    }
    return `/assets/common/logos/${name}_icon.svg`;
};

export const SocialLinksRow = () => {
    return (
        <div className='footer-links footer-links-social'>
            {
                siteSpecific(
                    // Physics
                    <>
                    <h5>Get social</h5>
                        <ListGroup className='mt-3 pb-5 py-lg-3 link-list d-md-flex flex-row'>
                            {Object.entries(SOCIAL_LINKS).map(([_, {name, href}]) =>
                                <ListGroupItem key={name} className='border-0 px-0 py-0 pb-1 bg-transparent'>
                                    <ExternalLink href={href}>
                                        <img src={getSocialIcon(name.toLowerCase())} alt={`${SITE_TITLE} on ${name}`}
                                             className='social-logo'/>
                                    </ExternalLink>
                                </ListGroupItem>
                            )}
                        </ListGroup>
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
