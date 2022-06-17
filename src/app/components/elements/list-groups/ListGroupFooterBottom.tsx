import React from "react";
import {ListGroup, ListGroupItem} from "reactstrap";
import {ExternalLink} from "../ExternalLink";
import {siteSpecific} from "../../../services/siteConstants";

export const ListGroupFooterBottom = () => siteSpecific(
    // Physics
    <div className="w-100">
        <div className='text-center'>
            All materials on this site are licensed under the {" "}
            <ExternalLink href="https://creativecommons.org/licenses/by/4.0/">
                <strong>Creative&nbsp;Commons&nbsp;license</strong>
            </ExternalLink>, unless stated otherwise.
        </div>
    </div>,
    // Computer Science
    <div className='footer-links footer-bottom'>
        <ListGroup className='d-flex flex-wrap flex-row'>
            <ListGroupItem className='footer-bottom-info border-0 px-0 py-0 bg-transparent'>
                <p className='pt-2 mb-lg-0'>
                    All teaching materials on this site are available under the&nbsp;
                    <ExternalLink href="https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/" className="d-inline text-dark font-weight-bold">
                        Open Government Licence v3.0
                    </ExternalLink>, except where otherwise stated.
                </p>
            </ListGroupItem>

            <ListGroupItem className='footer-bottom-logos border-0 px-0 py-0 pb-4 pb-md-1 bg-transparent d-flex justify-content-between d-print-none'>
                <ExternalLink href="https://teachcomputing.org/">
                    <img src="/assets/logos/ncce.png" alt='National Centre for Computing Education website' className='logo-mr' height="57px" />
                </ExternalLink>
                <ExternalLink href="https://teachcomputing.org">
                    <img src="/assets/logos/teach-computing.svg" alt='Teach Computing website' className="logo-mr" height="57px" />
                </ExternalLink>
                <ExternalLink href="https://www.raspberrypi.org/">
                    <img src="/assets/logos/raspberry-pi.png" alt='Raspberry Pi website' className='logo-mr' height="57px" />
                </ExternalLink>
                <ExternalLink href="https://isaacphysics.org/">
                    <img src="/assets/logos/isaacphysics.png" alt='Issac Physics website' className='logo-mr' height="57px" />
                </ExternalLink>
            </ListGroupItem>
        </ListGroup>
    </div>
);
