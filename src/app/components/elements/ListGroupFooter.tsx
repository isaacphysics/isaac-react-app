import React from "react";
import {ListGroup, ListGroupItem, Link} from "reactstrap";

export const ListGroupFooter = () => (
    <div className="footer-links">
        <h5>Links</h5>
        <div className="d-flex flex-row">
            <ListGroup className="w-50 mb-3 link-list">

                <ListGroupItem className="border-0 px-0 py-0 pb-1 bg-transparent">
                    <a className="footerLink" href="https://google.com">About Us</a>
                </ListGroupItem>
                <ListGroupItem className="border-0 px-0 py-0 pb-1 bg-transparent align-items-stretch">
                    <a className="footerLink" href="https://google.com">Contact us</a>
                </ListGroupItem>

                <ListGroupItem className="border-0 px-0 py-0 pb-1 bg-transparent">
                    <a className="footerLink" href="https://google.com">
                        Privacy Policy
                    </a>
                </ListGroupItem>

            </ListGroup>
            <ListGroup className="w-50 mb-3 link-list">

                <ListGroupItem className="border-0 px-0 py-0 pb-1 bg-transparent align-items-stretch">
                    <a className="footerLink" href="https://google.com">
                        Terms of Use
                    </a>
                </ListGroupItem>

                <ListGroupItem className="border-0 px-0 py-0 pb-1 bg-transparent">
                    <a className="footerLink" href="https://google.com">
                        Why Computer Science?
                    </a>
                </ListGroupItem>
                <ListGroupItem className="border-0 px-0 py-0 pb-1 bg-transparent align-items-stretch">
                    <a className="footerLink" href="https://google.com">
                        Publications
                    </a>
                </ListGroupItem>
            </ListGroup>
        </div>
    </div>
);
