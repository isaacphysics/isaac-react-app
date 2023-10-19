import React from "react";
import { ContentDTO } from "../../../IsaacApiTypes";
import { IsaacContentValueOrChildren } from "./IsaacContentValueOrChildren";
import { Col, Row } from "reactstrap";
import classNames from "classnames";

const calloutStyle = {
  width: "50",
  height: "50",
  src: "/assets/cs/callout-icon-puzzlebulb.svg",
  style: {
    marginTop: -13,
    marginRight: -15,
  },
  colour: "hi-teal-25",
};

export const IsaacCallout = ({ doc }: { doc: ContentDTO }) => (
  <Row className={classNames("isaac-callout", calloutStyle.colour)}>
    <Col>
      <img
        className={"float-right"}
        style={calloutStyle.style}
        width={calloutStyle.width}
        height={calloutStyle.height}
        src={calloutStyle.src}
        alt="callout"
      />
      <IsaacContentValueOrChildren encoding={doc.encoding} value={doc.value}>
        {doc.children}
      </IsaacContentValueOrChildren>
    </Col>
  </Row>
);
