import React from "react";
import {Link} from "react-router-dom";
import {ListGroup} from "reactstrap";
import {isAda, siteSpecific} from "../../../services";
import classNames from "classnames";
import { Trans } from 'react-i18next'
import i18next from 'i18next'

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
        <FooterLink key={key++} linkTo="/about">{i18next.t('aboutIsaac', 'About Isaac')}</FooterLink>,
        <FooterLink key={key++} linkTo="/news">{i18next.t('news', 'News')}</FooterLink>,
        <FooterLink key={key++} linkTo="/pages/stem_smart">{i18next.t('stemSmart', 'STEM SMART')}</FooterLink>,
        <FooterLink key={key++} linkTo="/books">{i18next.t('books', 'Books')}</FooterLink>,
        <FooterLink key={key++} linkTo="/publications">{i18next.t('publications', 'Publications')}</FooterLink>,
        <FooterLink key={key++} linkTo="/contact">{i18next.t('contactUs2', 'Contact us')}</FooterLink>,
    ],
    right: [
        <FooterLink key={key++} linkTo="/physics">{i18next.t('physics', 'Physics')}</FooterLink>,
        <FooterLink key={key++} linkTo="/maths">{i18next.t('maths', 'Maths')}</FooterLink>,
        <FooterLink key={key++} linkTo="/chemistry">{i18next.t('chemistry', 'Chemistry')}</FooterLink>,
        <FooterLink key={key++} linkTo="/biology">{i18next.t('biology', 'Biology')}</FooterLink>,
        <FooterLink key={key++} linkTo="/computer_science">{i18next.t('computerScience2', 'Computer science')}</FooterLink>,
    ]
};

const footerLinksAda = {
    left: [
        <FooterLink key={key++} linkTo="/about">{i18next.t('aboutUs2', 'About us')}</FooterLink>,
        <FooterLink key={key++} linkTo="/contact">{i18next.t('contactUs2', 'Contact us')}</FooterLink>,
        <FooterLink key={key++} linkTo="/cookies">{i18next.t('cookiePolicy2', 'Cookie policy')}</FooterLink>
    ],
    right: [
        <FooterLink key={key++} linkTo="/terms">{i18next.t('termsOfUse', 'Terms of use')}</FooterLink>,
        <FooterLink key={key++} linkTo="/privacy">{i18next.t('privacyPolicy3', 'Privacy policy')}</FooterLink>,
        <FooterLink key={key++} linkTo="/accessibility">Access&shy;ibility <span className="d-none d-md-inline">statement</span></FooterLink>
    ]
};

export const ListGroupFooter = () => (
    siteSpecific(
        // Physics
        <>
            <ListGroup className="mb-3 w-max-content me-sm-7">
                {footerLinksPhy.left}
            </ListGroup>
            <div className="mb-3 w-max-content me-xl-4">
                <p className="footer-link-header">{i18next.t('exploreBySubject', 'Explore by subject')}</p>
                <ListGroup>
                    {footerLinksPhy.right}
                </ListGroup>
            </div>
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
