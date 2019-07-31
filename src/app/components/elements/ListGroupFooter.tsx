import React from "react";
import {Link} from "react-router-dom";
import {ListGroup, ListGroupItem} from "reactstrap";

export const ListGroupFooter = () => (
    <div className="footer-links">
        <h5>Links</h5>
        <div className="d-flex flex-row pt-lg-3">
            <ListGroup className="w-50 mb-3 link-list">

                <ListGroupItem className="border-0 px-0 py-0 bg-transparent">
                    <Link className="footerLink py-2" to="/about">About us</Link>
                </ListGroupItem>
                <ListGroupItem className="border-0 px-0 py-0 bg-transparent align-items-stretch">
                    <Link className="footerLink py-2" to="/contact">Contact us</Link>
                </ListGroupItem>
                <ListGroupItem className="border-0 px-0 py-0 bg-transparent align-items-stretch">
                    <a className="py-2" href="https://isaaccomputerscience.org/events" target="_blank" rel="noopener noreferrer">Events</a>
                </ListGroupItem>

            </ListGroup>
            <ListGroup className="w-50 mb-3 link-list">

                <ListGroupItem className="border-0 px-0 py-0 bg-transparent">
                    <Link className="footerLink py-2" to="/privacy">Privacy Policy</Link>
                </ListGroupItem>
                <ListGroupItem className="border-0 px-0 py-0 bg-transparent align-items-stretch">
                    <Link className="footerLink py-2" to="/terms">Terms of Use</Link>
                </ListGroupItem>
                <ListGroupItem className="border-0 px-0 py-0 bg-transparent">
                    <Link className="footerLink py-2" to="/cookies">Cookie Policy</Link>
                </ListGroupItem>

            </ListGroup>
        </div>
    </div>
);
