import React from "react";
import {ContentDTO} from "../../../IsaacApiTypes";
import {IsaacContentValueOrChildren} from "./IsaacContentValueOrChildren";
import {Col, Row} from "reactstrap";
import classNames from "classnames";
import {siteSpecific} from "../../services/miscUtils";

export const IsaacCallout = ({doc}: {doc: ContentDTO}) => {
    const calloutStyle = siteSpecific({
        width: "32",
        height: "32",
        src: "/assets/notepad-and-pencil.png",
        extraClasses: "mt-n1 mr-n2",
        colour: "t-grey"
    }, {
        width: "40",
        height: "40",
        src: "/assets/puzzle-lightbulb.png",
        extraClasses: "mt-n2 mr-n2",
        colour: "hi-teal-25"
    });

    return <Row className={classNames("isaac-callout", calloutStyle.colour)}>
        <Col>
            <img className={classNames("float-right m-1", calloutStyle.extraClasses)} width={calloutStyle.width} height={calloutStyle.height} src={calloutStyle.src} />
            <IsaacContentValueOrChildren encoding={doc.encoding} value={doc.value} children={doc.children} />
        </Col>
    </Row>;
}