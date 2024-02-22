import React from "react";
import {ContentDTO} from "../../../IsaacApiTypes";
import {IsaacContentValueOrChildren} from "./IsaacContentValueOrChildren";
import {Col, Row} from "reactstrap";
import classNames from "classnames";
import {siteSpecific} from "../../services";

const calloutStyle = siteSpecific({
        width: "43",
        height: "43",
        // SVG taken from https://www.svgrepo.com/svg/914/speech-bubble, no attribution needed
        src: "/assets/phy/callout-speech-bubble.svg",
        style: {
            marginTop: -7,
            marginLeft: -2,
            marginRight: 18
        },
        colour: "t-grey"
    },{
        width: "50",
        height: "50",
        src: {
            regular: "/assets/cs/icons/regular-callout.svg",
            testData: "/assets/cs/icons/test-callout.svg",
            sampleRun: "/assets/cs/icons/run-callout.svg",
            scenario: "/assets/cs/icons/scenario-callout.svg",
        },
        style: {
            marginTop: -15,
            marginRight: -15
        },
        colour: {
            regular: "hi-cyan-25",
            testData: "hi-yellow-25",
            sampleRun: "hi-pink-25",
            scenario: "hi-yellow-50",
        }
    });

const DEFAULT_CALLOUT_STYLE = "regular" as const;
export const IsaacCallout = ({doc}: {doc: ContentDTO}) => {
    const colourClass = typeof calloutStyle.colour === "string"
        ? calloutStyle.colour
        : calloutStyle.colour[(doc.subtitle || DEFAULT_CALLOUT_STYLE) as "regular" | "testData" | "sampleRun" | "scenario"];
    const iconSrc = typeof calloutStyle.src === "string"
        ? calloutStyle.src
        : calloutStyle.src[(doc.subtitle || DEFAULT_CALLOUT_STYLE) as "regular" | "testData" | "sampleRun" | "scenario"];
    return <Row
        className={classNames("isaac-callout", colourClass)}>
        <Col>
            <img className={siteSpecific("float-left", "float-right")} style={calloutStyle.style}
                 width={calloutStyle.width} height={calloutStyle.height} src={iconSrc} alt=""/>
            <IsaacContentValueOrChildren encoding={doc.encoding} value={doc.value}>
                {doc.children}
            </IsaacContentValueOrChildren>
        </Col>
    </Row>;
};