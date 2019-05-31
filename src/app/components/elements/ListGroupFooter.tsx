import React from "react";
import {Link} from "react-router-dom";
import {ListGroup, ListGroupItem} from "reactstrap";

export const ListGroupFooter = () => (
    <div className="footer-links">
        <h5>Links</h5>
        <div className="d-flex flex-row">
            <ListGroup className="w-50 mb-3 link-list">

                <ListGroupItem className="border-0 px-0 py-0 pb-1 bg-transparent">
                    <Link className="footerLink" to="/about">About Us</Link>
                </ListGroupItem>
                <ListGroupItem className="border-0 px-0 py-0 pb-1 bg-transparent align-items-stretch">
                    <Link className="footerLink" to="/contact">Contact us</Link>
                </ListGroupItem>

                <ListGroupItem className="border-0 px-0 py-0 pb-1 bg-transparent">
                    <Link className="footerLink" to="/privacy">Privacy Policy</Link>
                </ListGroupItem>

            </ListGroup>
            <ListGroup className="w-50 mb-3 link-list">

                <ListGroupItem className="border-0 px-0 py-0 pb-1 bg-transparent align-items-stretch">
                    <Link className="footerLink" to="/terms">Terms of Use</Link>
                </ListGroupItem>

                <ListGroupItem className="border-0 px-0 py-0 pb-1 bg-transparent">
                    <Link className="footerLink" to="/cookies">Cookie Policy</Link>
                </ListGroupItem>
                <ListGroupItem className="border-0 px-0 py-0 pb-1 bg-transparent align-items-stretch">
                    <Link className="footerLink" href="/cyberessentials">Cyber Essentials</Link>
                </ListGroupItem>
            </ListGroup>
        </div>
    </div>
);
