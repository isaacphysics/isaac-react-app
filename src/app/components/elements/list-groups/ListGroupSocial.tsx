import React from "react";
import {ListGroup, ListGroupItem} from "reactstrap";
import {SITE_SUBJECT_TITLE, SOCIAL_LINKS} from "../../../services";
import {ExternalLink} from "../ExternalLink";

export const ListGroupSocial = () => {
    return (
        <div className='footer-links footer-links-social'>
            <h2 className="h5">Get social</h2>
            <ListGroup className='mt-3 pb-5 py-lg-3 link-list d-md-flex flex-row'>
                {Object.entries(SOCIAL_LINKS).map(([_, {name, href}]) =>
                    <ListGroupItem key={name} className='border-0 px-0 py-0 pb-1 bg-transparent'>
                        <ExternalLink href={href}>
                            <img src={`/assets/${name.toLowerCase()}_icon.svg`} alt={`Isaac ${SITE_SUBJECT_TITLE} on ${name}`} className='logo-mr'/>
                        </ExternalLink>
                    </ListGroupItem>
                )}
            </ListGroup>
        </div>
    );
};
