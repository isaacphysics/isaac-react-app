import React from "react";
import {Link} from "react-router-dom";
import {ListGroup, ListGroupItem} from "reactstrap";

interface FooterLinkProps {
    linkTo: string;
    children?: React.ReactNode | string;
}

const FooterLink = ({linkTo, children}: FooterLinkProps ) => {
    return <ListGroupItem className="border-0 px-0 py-0 bg-transparent align-items-stretch">
        <Link className="footerLink py-2" to={linkTo}>
            {children}
        </Link>
    </ListGroupItem>
};

let key = 0;
const footerLinks = 
    {
        left: [
            <FooterLink key={key++} linkTo="/about">About us</FooterLink>,
            <FooterLink key={key++} linkTo="/contact">Contact us</FooterLink>,
            <FooterLink key={key++} linkTo="/accessibility">Accessibility <span className="d-none d-md-inline">statement</span></FooterLink>,
        ],
        right: [
            <FooterLink key={key++} linkTo="/privacy">Privacy policy</FooterLink>,
            <FooterLink key={key++} linkTo="/terms">Terms of use</FooterLink>,
            <FooterLink key={key++} linkTo="/cookies">Cookie policy</FooterLink>,
        ]
    };

export const ListGroupFooter = () => (
    <div className="footer-links">
        <h2 className="h5">Links</h2>
        <div className="d-flex flex-row pt-lg-3">
            <ListGroup className="w-50 mb-3 link-list">
                {footerLinks.left}
            </ListGroup>
            <ListGroup className="w-50 mb-3 link-list">
                {footerLinks.right}
            </ListGroup>
        </div>
    </div>
);
