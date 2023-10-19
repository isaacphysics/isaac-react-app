import React from "react";
import { ListGroup, ListGroupItem } from "reactstrap";
import { ExternalLink } from "../ExternalLink";

export const ListGroupFooterBottom = () => (
  <div className="footer-links footer-bottom">
    <ListGroup className="d-flex flex-wrap flex-row">
      <ListGroupItem className="footer-bottom-info border-0 px-0 py-0 bg-transparent">
        <p className="pt-2 mb-lg-0">
          All teaching materials on this site are available under the&nbsp;
          <ExternalLink
            href="https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/"
            className="d-inline text-dark font-weight-bold"
          >
            Open Government Licence v3.0
          </ExternalLink>
          , except where otherwise stated.
        </p>
      </ListGroupItem>

      <ListGroupItem className="footer-bottom-logos border-0 px-0 py-0 pb-4 pb-md-1 bg-transparent d-flex justify-content-between d-print-none">
        <ExternalLink href="https://computingeducation.org.uk/">
          <img
            src="/assets/logos/ncce.svg"
            alt="National Centre for Computing Education website"
            className="logo-mr"
            height="57px"
          />
        </ExternalLink>
        <ExternalLink href="https://www.stem.org.uk/">
          <img src="/assets/logos/stem.svg" alt="STEM Learning" className="logo-mr" height="57px" />
        </ExternalLink>
        <ExternalLink href="https://www.gov.uk/government/organisations/department-for-education">
          <img src="/assets/logos/dfe.svg" alt="UK Department for Education" className="logo-mr" height="57px" />
        </ExternalLink>
      </ListGroupItem>
    </ListGroup>
  </div>
);
