import React from "react";
import {ContentDTO} from "../../../IsaacApiTypes";
import {IsaacContentValueOrChildren} from "./IsaacContentValueOrChildren";
import {Col, Row} from "reactstrap";

export const IsaacCallout = ({doc}: {doc: ContentDTO}) => {
    return <Row className={"isaac-callout"}>
        <Col>
            <img className={"float-right m-1 mt-n2"} width="30" height="30" src="https://cdn-icons-png.flaticon.com/512/1827/1827370.png"/>
            <IsaacContentValueOrChildren encoding={doc.encoding} value={doc.value} children={doc.children}/>
        </Col>
    </Row>;
}