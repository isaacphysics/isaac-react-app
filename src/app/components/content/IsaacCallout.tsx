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
    src: "/assets/phy/icons/callout-speech-bubble.svg",
    style: {
        marginTop: -7,
        marginLeft: -2,
        marginRight: 18
    },
    colour: "bg-neutral"
},{
    width: "50",
    height: "50",
    src: {
        regular: "/assets/cs/icons/callout/regular-callout.svg",
        testData: "/assets/cs/icons/callout/test-callout.svg",
        sampleRun: "/assets/cs/icons/callout/run-callout.svg",
        scenario: "/assets/cs/icons/callout/scenario-callout.svg",
        definition: "/assets/cs/icons/callout/definition-callout.svg",
        careers: "/assets/cs/icons/callout/careers-callout.svg",
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
        definition: "hi-cyan-50",
        careers: "hi-pink-50",
    }
});

export const Callout = ({className, children, style = "regular"}: {className?: string, children: React.ReactNode, style?: string}) => {
    const colourClass = typeof calloutStyle.colour === "string"
        ? calloutStyle.colour
        : calloutStyle.colour[style as keyof typeof calloutStyle.colour];
    const iconSrc = typeof calloutStyle.src === "string"
        ? calloutStyle.src
        : calloutStyle.src[style as keyof typeof calloutStyle.src];

    return <Row className={classNames("isaac-callout", colourClass, className)}>
        <Col>
            <img className={siteSpecific("float-start", "float-end ms-2")} style={calloutStyle.style}
                width={calloutStyle.width} height={calloutStyle.height} src={iconSrc} alt=""
            />
            <div>
                {children}
            </div>
        </Col>
    </Row>;
};

export const IsaacCallout = ({doc}: {doc: ContentDTO}) => {
    return <Callout style={doc.subtitle}>
        <IsaacContentValueOrChildren encoding={doc.encoding} value={doc.value}>
            {doc.children}
        </IsaacContentValueOrChildren>
    </Callout>;
};
