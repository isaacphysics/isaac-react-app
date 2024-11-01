import React from "react";
import { ListGroup, ListGroupItem } from "reactstrap";
import { SITE_SUBJECT_TITLE, SOCIAL_LINKS } from "../../../services";
import { ExternalLink } from "../ExternalLink";

export const ListGroupSocial = () => {
  return (
    <div className="footer-links footer-links-social">
      <ListGroup className="mt-3 pb-4 py-lg-3 link-list d-flex flex-row">
        <h2 className="h5 pr-4">Social</h2>
        {Object.entries(SOCIAL_LINKS).map(([_, { name, href }]) => (
          <ListGroupItem key={name} className="border-0 px-2 py-0 pb-1 bg-transparent list-link-item">
            <ExternalLink href={href}>
              <img
                src={`/assets/${name.toLowerCase()}_icon.svg`}
                alt={`Isaac ${SITE_SUBJECT_TITLE} on ${name}`}
                className="logo-mr"
              />
            </ExternalLink>
          </ListGroupItem>
        ))}
      </ListGroup>
    </div>
  );
};
