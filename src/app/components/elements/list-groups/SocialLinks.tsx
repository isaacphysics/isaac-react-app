import React from "react";
import {SITE_TITLE, siteSpecific, SOCIAL_LINKS} from "../../../services";
import {ExternalLink} from "../ExternalLink";

const getSocialIcon = (name: string) => {
    if (name === "x (twitter)") {
        return siteSpecific("/assets/phy/logos/x_icon.svg", "/assets/common/logos/x_icon.svg");
    }
    return siteSpecific(`/assets/phy/logos/${name}_icon.svg`, `/assets/common/logos/${name}_icon.svg`);
};

export const SocialLinksRow = () => {
    return (
        <div className='footer-links footer-links-social'>
            {
                siteSpecific(
                    // Physics
                    <>
                        <p className="pb-2 pt-2 footer-link-header">Follow us</p>
                        <div className='mt-1 text-nowrap'>
                            {Object.entries(SOCIAL_LINKS).map(([_, {name, href}]) =>
                                <div className={"me-1 d-inline-block"} key={name}>
                                    <ExternalLink href={href}>
                                        <img src={getSocialIcon(name.toLowerCase())} alt={`${SITE_TITLE} on ${name}`}
                                            className='img-fluid footer-social-logo'/>
                                    </ExternalLink>
                                </div>
                            )}
                        </div>
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
