import React from "react";
import {ContentDTO} from "../../../IsaacApiTypes";
import {IsaacContentValueOrChildren} from "./IsaacContentValueOrChildren";
import {Col, Row} from "reactstrap";
import classNames from "classnames";
import {useDemoValue} from "../../services/demoTools";

export const IsaacCallout = ({doc}: {doc: ContentDTO}) => {
    const colourClass = useDemoValue(["t-green", "t-grey", "hi-teal-25", "hi-mustard-25", "hi-navy-25"]);
    const bellIcon = useDemoValue([
        "https://cdn-icons-png.flaticon.com/512/3602/3602156.png", // black border no vibrations
        "https://cdn-icons-png.flaticon.com/512/1827/1827370.png", // coloured with notification circle (no number)
        "https://cdn-icons.flaticon.com/png/512/2326/premium/2326010.png?token=exp=1652103124~hmac=fdd4a111ea2e1712fb27a20a54c74d23" // black border vibrations
    ], "w");

    return <Row className={classNames("isaac-callout", colourClass)}>
        <Col>
            <img className={"float-right m-1 mt-n2"} width="30" height="30" src={bellIcon}/>
            <IsaacContentValueOrChildren encoding={doc.encoding} value={doc.value} children={doc.children}/>
        </Col>
    </Row>;
}