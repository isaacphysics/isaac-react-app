import React from "react";
import {ListGroup, ListGroupItem} from "reactstrap";
import {SITE, SITE_SUBJECT} from "../../../services/siteConstants";
import {ExternalLink} from "../ExternalLink";

interface Links {
    name: string;
    href: string;
}

const links: {[site in SITE]: Links[]} = {
    cs: [
        {name: "Facebook", href: "https://www.facebook.com/IsaacComputerScience/"},
        {name: "Twitter", href: "https://twitter.com/isaaccompsci"},
        {name: "Instagram", href: "https://www.instagram.com/isaaccompsci/"},
        {name: "YouTube", href: "https://www.youtube.com/channel/UC-qoIYj8kgR8RZtQphrRBYQ/"}
    ],
    physics: [
        {name: "Facebook", href: "https://www.facebook.com/isaacphysicsUK"},
        {name: "Twitter", href: "https://twitter.com/isaacphysics"},
        {name: "YouTube", href: "https://www.youtube.com/user/isaacphysics/"}
    ]
};
export const ListGroupSocial = () => {
    return (
        <div className='footer-links footer-links-social'>
            <h5>Get social</h5>
            <ListGroup className='mt-3 pb-5 py-lg-3 link-list d-md-flex flex-row'>
                {links[SITE_SUBJECT].map(({name, href}) =>
                    <ListGroupItem key={name} className='border-0 px-0 py-0 pb-1 bg-transparent'>
                        <ExternalLink href={href}>
                            <img src={`/assets/${name.toLowerCase()}_icon.svg`} alt={`Isaac ${SITE_SUBJECT} on ${name}`} className='logo-mr'/>
                        </ExternalLink>
                    </ListGroupItem>
                )}
            </ListGroup>
        </div>
    );
};
