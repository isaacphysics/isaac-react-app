import React from "react";
import {ContentDTO} from "../../../IsaacApiTypes";
import {IsaacContentValueOrChildren} from "./IsaacContentValueOrChildren";
import {Col, Row} from "reactstrap";
import classNames from "classnames";
import {siteSpecific} from "../../services/siteConstants";

const calloutStyle = siteSpecific({
        width: "50",
        height: "50",
        src: "/assets/phy/callout-speech-bubble-2.svg",
        style: {
            marginTop: -10,
            marginLeft: -5,
            marginRight: 18,
        },
        colour: "t-grey"
    },{
        width: "50",
        height: "50",
        src: "/assets/cs/callout-icon-puzzlebulb.svg",
        style: {
            marginTop: -13,
            marginRight: -15
        },
        colour: "hi-teal-25"
    });

export const IsaacCallout = ({doc}: {doc: ContentDTO}) =>
    <Row className={classNames("isaac-callout", calloutStyle.colour)}>
        <Col>
            <img className={siteSpecific("float-left", "float-right")} style={calloutStyle.style} width={calloutStyle.width} height={calloutStyle.height} src={calloutStyle.src} />
            <IsaacContentValueOrChildren encoding={doc.encoding} value={doc.value} children={doc.children} />
        </Col>
    </Row>;