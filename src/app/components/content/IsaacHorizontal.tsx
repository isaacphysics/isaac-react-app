import React from "react";
import {ContentDTO} from "../../../IsaacApiTypes";
import {IsaacContent} from "./IsaacContent";
import {Col, Row} from "reactstrap";

export const IsaacHorizontal = ({doc: {children}}: {doc: ContentDTO}) => {
    return children ? <div className={"content-value"}>
        <Row className="p-0 m-0 dynamic-x-padding">
            {children.map((child, index) => (
                <Col key={index} lg={Math.floor(12/(children.length))}  className="pad">
                    <IsaacContent key={index} doc={child} />
                </Col>
            ))}
        </Row>
    </div> : null;
};
