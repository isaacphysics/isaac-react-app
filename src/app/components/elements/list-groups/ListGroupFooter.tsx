import React from "react";
import {Link} from "react-router-dom";
import {ListGroup} from "reactstrap";
import {isAda, siteSpecific} from "../../../services";
import classNames from "classnames";

interface FooterLinkProps {
    linkTo: string;
    children?: React.ReactNode | string;
}
const FooterLink = ({linkTo, children}: FooterLinkProps ) => {
    return <li className={classNames({"my-1": isAda})}>
        <Link className="footer-link" to={linkTo}>
            {children}
        </Link>
    </li>;
};

let key = 0;
const footerLinksPhy = {
    left: [
        <FooterLink key={key++} linkTo="/about">About Isaac</FooterLink>,
        <FooterLink key={key++} linkTo="/news">News</FooterLink>,
        <FooterLink key={key++} linkTo="/events">Events</FooterLink>,
        <FooterLink key={key++} linkTo="/books">Books</FooterLink>,
        <FooterLink key={key++} linkTo="/contact">Contact us</FooterLink>,
    ],
    right: [
        <p className="footer-link-header" key={key++}>Explore by subject</p>,
        <FooterLink key={key++} linkTo="/physics">Physics</FooterLink>,
        <FooterLink key={key++} linkTo="/maths">Maths</FooterLink>,
        <FooterLink key={key++} linkTo="/chemistry">Chemistry</FooterLink>,
        <FooterLink key={key++} linkTo="/biology">Biology</FooterLink>,
    ]
};

const footerLinksAda = {
    left: [
        <FooterLink key={key++} linkTo="/about">About us</FooterLink>,
        <FooterLink key={key++} linkTo="/contact">Contact us</FooterLink>,
        <FooterLink key={key++} linkTo="/cookies">Cookie policy</FooterLink>
    ],
    right: [
        <FooterLink key={key++} linkTo="/terms">Terms of use</FooterLink>,
        <FooterLink key={key++} linkTo="/privacy">Privacy policy</FooterLink>,
        <FooterLink key={key++} linkTo="/accessibility">
            Access&shy;ibility <span className="d-none d-md-inline">statement</span>
        </FooterLink>
    ]
};

export const ListGroupFooter = () => (
    siteSpecific(
        // Physics
        <>
            <ListGroup className="mb-3 w-max-content me-sm-5">
                {footerLinksPhy.left}
            </ListGroup>
            <ListGroup className="mb-3 w-max-content me-xl-4">
                {footerLinksPhy.right}
            </ListGroup>
        </>,

        // CS
        <div className="footer-links py-0">
            <div className="d-flex flex-row">
                <ListGroup className="w-50 mb-3 me-3 link-list">
                    {footerLinksAda.left}
                </ListGroup>
                <ListGroup className="w-50 mb-3 link-list">
                    {footerLinksAda.right}
                </ListGroup>
            </div>
        </div>
    )
);
