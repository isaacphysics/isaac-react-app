import React from "react";
import {ListGroup, ListGroupItem, Link} from "reactstrap";

const ExternalLink = ({href, children}: {href: string; children: any}) => (
    <a href={href} target="_blank" rel="noopener noreferrer">
        {children}
    </a>
);

export const ListGroupFooterBottom = () => (
    <div className='footer-links footer-bottom'>
        <ListGroup className='d-flex flex-wrap flex-row'>
            <ListGroupItem className='footer-bottom-info border-0 px-0 py-0 pb-1 bg-transparent'>
                <p>
                    All materials on this site are licensed under the Creative Commons
                    License, unless stated otherwise.
                </p>
            </ListGroupItem>

            <ListGroupItem className='footer-bottom-logos border-0 px-0 py-0 pb-1 bg-transparent d-flex justify-content-between'>
                <ExternalLink href="https://isaacphysics.org/">
                    <img src="/assets/logos/isaacphysics.png" alt='Issac link' className='logo-mr' height="57px" />
                </ExternalLink>
                <ExternalLink href="https://www.raspberrypi.org/">
                    <img src="/assets/logos/raspberry-pi.png" alt='Raspberry Pi link' className='logo-mr' height="57px" />
                </ExternalLink>
                <ExternalLink href="https://teachcomputing.org/">
                    <img src="/assets/logos/ncce.png" alt='NCCE link' className='logo-mr' height="57px" />
                </ExternalLink>
            </ListGroupItem>
        </ListGroup>
    </div>
);
