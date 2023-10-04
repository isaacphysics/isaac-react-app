import React from "react";
import { IsaacPodDTO } from "../../../IsaacApiTypes";
import { apiHelper } from "../../services";
import { Col, Row } from "reactstrap";
import { IsaacContentValueOrChildren } from "../content/IsaacContentValueOrChildren";
import { Tabs } from "./Tabs";
import { Link } from "react-router-dom";

export const PromoContent = ({ item }: { item: IsaacPodDTO }) => {
  const { title, subtitle, value, image, url, encoding } = item;
  const defaultImage = "/assets/ics_hero.svg";
  const path = image?.src
    ? apiHelper.determineImageUrl(image.src)
    : apiHelper.determineImageUrl(defaultImage);

  interface LinkOrAnchorProps {
    url: string | undefined;
    internalLink: boolean;
    children: React.ReactNode;
  }

  const LinkOrAnchor = ({ url, internalLink, children }: LinkOrAnchorProps) => {
    if (internalLink && url) {
      return <Link to={url}>{children}</Link>;
    } else if (url) {
      return (
        <a href={url} target="_blank" rel="noopener noreferrer">
          {children}
        </a>
      );
    } else {
      return <>{children}</>;
    }
  };

  const internalLink = url ? url.startsWith("/") : false;

  return (
    <Tabs tabContentClass="mt-3 mt-md-5" activeTabOverride={1}>
      {{
        "I Belong in Computer Science": (
          <Row className="d-flex align-items-center justify-content-center">
            <Col
              xs={12}
              md={6}
              lg={5}
              xl={4}
              className="d-flex align-items-center justify-content-center"
            >
              <img src={path} alt={image?.altText || "promo image"} />
            </Col>
            <Col xs={12} md className="pt-3 pl-3">
              <h5>
                <LinkOrAnchor url={url} internalLink={internalLink}>
                  <b>{title}</b>
                </LinkOrAnchor>
              </h5>
              <div className="text-left">
                <IsaacContentValueOrChildren
                  encoding={encoding}
                  value={value}
                />
              </div>
              <div>
                <LinkOrAnchor url={url} internalLink={internalLink}>
                  <b>{subtitle}</b>
                </LinkOrAnchor>
              </div>
            </Col>
          </Row>
        ),
      }}
    </Tabs>
  );
};
