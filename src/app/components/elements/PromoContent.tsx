import React from "react";
import { IsaacPodDTO } from "../../../IsaacApiTypes";
import { apiHelper } from "../../services";
import { Col, Row } from "reactstrap";
import { IsaacContentValueOrChildren } from "../content/IsaacContentValueOrChildren";
import { Tabs } from "./Tabs";

export const PromoContent = ({ item }: { item: IsaacPodDTO }) => {
  const { title, subtitle, value, image, url, encoding } = item;
  const defaultImage = "/assets/ics_hero.svg";
  const path = image?.src
    ? apiHelper.determineImageUrl(image.src)
    : apiHelper.determineImageUrl(defaultImage);
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
                <a href={url}>
                  <b>{title}</b>
                </a>
              </h5>
              <div className="text-left">
                <IsaacContentValueOrChildren
                  encoding={encoding}
                  value={value}
                />
              </div>
              <div>
                <a href={url}>
                  <b>{subtitle}</b>
                </a>
              </div>
            </Col>
          </Row>
        ),
      }}
    </Tabs>
  );
};
