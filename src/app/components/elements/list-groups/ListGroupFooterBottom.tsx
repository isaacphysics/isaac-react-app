import React from "react";
import {ListGroup, ListGroupItem} from "reactstrap";
import {SITE, SITE_SUBJECT} from "../../../services/siteConstants";
import {ExternalLink} from "../ExternalLink";

export const ListGroupFooterBottom = () => (
    SITE_SUBJECT === SITE.CS ?
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
                    <ExternalLink href="https://www.raspberrypi.org/">
                        <img src="/assets/logos/raspberry-pi.png" alt='Raspberry Pi website' className='logo-mr' height="57px" />
                    </ExternalLink>
                    <ExternalLink href="https://isaacphysics.org/">
                        <img src="/assets/logos/isaacphysics.png" alt='Issac Physics website' className='logo-mr' height="57px" />
                    </ExternalLink>
                </ListGroupItem>
            </ListGroup>
        </div>
        :
        <div className="w-100">
            <div className='float-md-right text-right'>
                All materials on this site are licensed under the<br />
                <ExternalLink href="https://creativecommons.org/licenses/by/4.0/">
                    <strong>Creative Commons license</strong>
                </ExternalLink>, unless stated otherwise.
            </div>
            <div className='left'>
                A&nbsp;<ExternalLink href="https://www.gov.uk/government/organisations/department-for-education">
                    <strong>Department for Education</strong></ExternalLink> project <br /> at the{' '}
                <ExternalLink href="https://www.cam.ac.uk"><strong>University of Cambridge</strong></ExternalLink>,
                <br />supported by{' '}
                <ExternalLink href="https://www.ogdentrust.com/"><strong>The Ogden Trust</strong></ExternalLink>.
            </div>
        </div>
);
