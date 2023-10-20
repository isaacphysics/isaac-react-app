import React from "react";
import { Card, CardBody, CardTitle, Col, Row } from "reactstrap";
import classNames from "classnames";
import { apiHelper, isAppLink } from "../../services";
import { Link } from "react-router-dom";
import { IsaacCardDTO } from "../../../IsaacApiTypes";

interface IsaacCardProps {
  doc: IsaacCardDTO;
  imageClassName?: string;
}

export const IsaacCard = ({ doc, imageClassName }: IsaacCardProps) => {
  const { title, subtitle, image, clickUrl, disabled, verticalContent } = doc;
  const classes = classNames({ "menu-card": true, disabled: disabled, "isaac-card-vertical": verticalContent });
  const imgSrc = image?.src && apiHelper.determineImageUrl(image.src);

  const link =
    clickUrl && isAppLink(clickUrl) ? (
      <Link to={clickUrl} className={classes + " stretched-link"} aria-disabled={disabled} />
    ) : (
      // eslint-disable-next-line jsx-a11y/anchor-has-content
      <a href={clickUrl} className={classes + " stretched-link"} aria-disabled={disabled} />
    );

  return verticalContent ? (
    <Card className={classes}>
      {image && (
        <Row className={imageClassName}>
          <Col className="justify-content-md-center">
            <img className={[classes, imageClassName].join(" ")} src={imgSrc} alt={image.altText} />
          </Col>
        </Row>
      )}
      <CardTitle className="px-3">
        <Row>
          <Col>{title}</Col>
        </Row>
      </CardTitle>
      <CardBody className="px-3">
        <Row>
          <Col>{subtitle}</Col>
        </Row>
      </CardBody>
      {clickUrl && link}
    </Card>
  ) : (
    <Card>
      <CardTitle className="px-3">
        <Row className="mb-sm-0 mb-lg-2">
          <Col>{title}</Col>
        </Row>
      </CardTitle>
      <CardBody>
        <Row className="mx-2">
          {image && (
            <Col xs={4} sm={12} lg={4} className="col-centered">
              <img className={classes} src={imgSrc} alt="" />
            </Col>
          )}
          <Col xs={image ? 8 : 12} sm={12} lg={image ? 8 : 12}>
            <aside>{subtitle}</aside>
          </Col>
        </Row>
      </CardBody>
      {clickUrl && link}
    </Card>
  );
};
