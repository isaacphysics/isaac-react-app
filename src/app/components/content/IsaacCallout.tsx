import React from "react";
import {ContentDTO} from "../../../IsaacApiTypes";
import {IsaacContentValueOrChildren} from "./IsaacContentValueOrChildren";
import {Col, Row} from "reactstrap";
import classNames from "classnames";
import {siteSpecific} from "../../services/siteConstants";

const calloutStyle = siteSpecific({
        width: "52",
        height: "52",
        src: "/assets/phy/callout-icon-notepad.svg",
        style: {
            marginTop: -12,
            marginRight: -15
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
            <img className={"float-right"} style={calloutStyle.style} width={calloutStyle.width} height={calloutStyle.height} src={calloutStyle.src} />
            <IsaacContentValueOrChildren encoding={doc.encoding} value={doc.value} children={doc.children} />
        </Col>
    </Row>;