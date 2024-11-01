import React from "react";
import { ListGroup, ListGroupItem } from "reactstrap";
import { ExternalLink } from "../ExternalLink";
import { Link } from "react-router-dom";
interface FooterLinkProps {
  linkTo: string;
  children?: React.ReactNode | string;
}

const FooterLink = ({ linkTo, children }: FooterLinkProps) => {
  return (
    <ListGroupItem className="border-0 px-0 py-0 bg-transparent align-items-stretch">
      <Link className="footerLink" to={linkTo}>
        {children}
      </Link>
    </ListGroupItem>
  );
};

const footerLinks = {
  right: [
    <FooterLink key="accessibility-footer-link" linkTo="/accessibility">
      Accessibility
    </FooterLink>,
    <FooterLink key="cookie-policy-footer-link" linkTo="/cookies">
      Cookie policy
    </FooterLink>,
    <FooterLink key="privacy-policy-footer-link" linkTo="/privacy">
      Privacy policy
    </FooterLink>,
    <FooterLink key="terms-of-use-footer-link" linkTo="/terms">
      Terms of use
    </FooterLink>,
  ],
};

export const ListGroupFooterBottom = () => (
  <div className="footer-links footer-bottom">
    <ListGroup className="d-flex flex-wrap flex-row link-group">
      <ListGroupItem className="footer-bottom-links d-md-flex flex-md-row bg-transparent link-group w-100">
        <h2 className="h5 mb-3 mb-md-0 mr-md-4">Links</h2>
        <ListGroup className="d-md-flex flex-md-row">{footerLinks.right}</ListGroup>
      </ListGroupItem>
      <ListGroupItem className="footer-bottom-info border-0 px-0 py-0 bg-transparent">
        <p className="pl-3 pt-2 mb-lg-0 pb-2 pb-sm-0">
          All teaching materials on this site are available under the{" "}
          <ExternalLink
            href="https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/"
            className="d-inline fw-bold print-font"
          >
            Open Government Licence v3.0
          </ExternalLink>
          , except where otherwise stated.
        </p>
      </ListGroupItem>

      <ListGroupItem className="footer-bottom-logos border-0 px-0 py-0 bg-transparent d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center d-print-none">
        <ExternalLink href="https://computingeducation.org.uk/" className="mb-3 mb-md-0">
          <img
            src="/assets/logos/ncce.svg"
            alt="National Centre for Computing Education website"
            className="img-fluid"
          />
        </ExternalLink>
        <ExternalLink href="https://www.gov.uk/government/organisations/department-for-education">
          <img src="/assets/logos/dfe.svg" alt="UK Department for Education" className="img-fluid" />
        </ExternalLink>
      </ListGroupItem>
    </ListGroup>
  </div>
);
