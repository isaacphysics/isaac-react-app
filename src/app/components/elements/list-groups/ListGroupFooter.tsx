import React from "react";
import {Link} from "react-router-dom";
import {ListGroup, ListGroupItem} from "reactstrap";
import {SITE, SITE_SUBJECT} from "../../../services/siteConstants";
import {ListGroupPhysics} from "./ListGroupPhysics";

const setOne = <>
    <ListGroupItem className="border-0 px-0 py-0 bg-transparent">
        <Link className="footerLink py-2" to="/about">About us</Link>
    </ListGroupItem>
    <ListGroupItem className="border-0 px-0 py-0 bg-transparent align-items-stretch">
        <Link className="footerLink py-2" to="/contact">Contact us</Link>
    </ListGroupItem>
    <ListGroupItem className="border-0 px-0 py-0 bg-transparent align-items-stretch">
        <Link className="footerLink py-2" to="/accessibility">Accessibility <span className="d-none d-md-inline">statement</span></Link>
    </ListGroupItem>
</>;

export const ListGroupFooter = () => (
    <div className="footer-links">
        <h5>Links</h5>
        <div className="d-flex flex-row pt-lg-3">
            {SITE_SUBJECT === SITE.PHY ? <ListGroupPhysics/> :
                <ListGroup className="w-50 mb-3 link-list">
                    {setOne}
                </ListGroup>}
            <ListGroup className="w-50 mb-3 link-list">
                {SITE_SUBJECT === SITE.PHY && setOne}
                <ListGroupItem className="border-0 px-0 py-0 bg-transparent">
                    <Link className="footerLink py-2" to="/privacy">Privacy policy</Link>
                </ListGroupItem>
                <ListGroupItem className="border-0 px-0 py-0 bg-transparent align-items-stretch">
                    <Link className="footerLink py-2" to="/terms">Terms of use</Link>
                </ListGroupItem>
                <ListGroupItem className="border-0 px-0 py-0 bg-transparent">
                    <Link className="footerLink py-2" to="/cookies">Cookie policy</Link>
                </ListGroupItem>
            </ListGroup>
        </div>
    </div>
);
