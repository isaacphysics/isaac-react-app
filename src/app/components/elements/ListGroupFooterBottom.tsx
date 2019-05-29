import React from "react";
import {ListGroup, ListGroupItem, Link} from "reactstrap";

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
                <img src="/assets/isaac-logo.svg" alt='Issac link' className='logo-mr' height="57px" width="121px"/>
                <img src="/assets/raspberrypi-logo.svg" alt='Raspberry Pi link' className='logo-mr' height="57px" width="37px"/>
                <img src="/assets/stem-logo.svg" alt='Stem link' className='logo-mr' height="57px" width="82px"/>
                <img src="/assets/bcs-logo.svg" alt='BCS link' className='logo-mr' height="57px" width="46px"/>
            </ListGroupItem>
        </ListGroup>
    </div>
);
